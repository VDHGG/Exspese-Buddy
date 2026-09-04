'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  generateMockData,
  STORAGE_KEY,
  loadData,
  DEFAULT_CATEGORIES,
  DEFAULT_FAMILY_MEMBERS,
  loadSettingsLocal,
  saveSettingsLocal,
  getCategoryInfo,
  getMemberInfo,
} from './data';
import { isSupabaseConfigured, supabase } from './supabase';

const DEFAULT_BUDGET = 35000000;

function fromRow(row) {
  return { id: row.id, type: row.type, amount: Number(row.amount), category: row.category, member: row.member, note: row.note, date: row.occurred_at };
}

function toRow(transaction) {
  return { type: transaction.type, amount: transaction.amount, category: transaction.category, member: transaction.member, note: transaction.note || '', occurred_at: transaction.date || new Date().toISOString() };
}

function readLocalData() {
  const localData = loadData();
  return Array.isArray(localData?.transactions) ? localData : null;
}

export function useExpenseData() {
  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadCloudData = useCallback(async (currentUser) => {
    setSyncStatus('loading');
    setError('');
    const [
      { data: transactionRows, error: transactionError },
      { data: budgetRow, error: budgetError },
      { data: settingsRow, error: settingsError },
    ] = await Promise.all([
      supabase.from('transactions').select('*').order('occurred_at', { ascending: false }),
      supabase.from('budgets').select('monthly_budget').maybeSingle(),
      supabase.from('user_settings').select('categories, family_members').maybeSingle(),
    ]);

    // Log settings error as warning (table may not exist yet) — non-blocking
    if (settingsError) {
      console.warn('user_settings query notice (may not exist yet):', settingsError.message);
    }

    if (transactionError || budgetError) {
      setError(transactionError?.message || budgetError?.message || 'Không thể tải dữ liệu.');
      setSyncStatus('error');
      const localSettings = loadSettingsLocal();
      setData({
        transactions: [],
        monthlyBudget: DEFAULT_BUDGET,
        categories: localSettings?.categories || DEFAULT_CATEGORIES,
        familyMembers: localSettings?.familyMembers || DEFAULT_FAMILY_MEMBERS,
      });
      setIsLoaded(true);
      return;
    }

    let transactions = transactionRows.map(fromRow);
    const migrationKey = `expense-buddy-cloud-migrated-${currentUser.id}`;
    if (transactions.length === 0 && !localStorage.getItem(migrationKey)) {
      const localData = readLocalData();
      if (localData?.transactions.length > 0) {
        const { data: inserted, error: importError } = await supabase.from('transactions').insert(localData.transactions.map(toRow)).select();
        if (importError) {
          setError(`Chưa thể chuyển dữ liệu cũ: ${importError.message}`);
        } else {
          transactions = inserted.map(fromRow);
          localStorage.setItem(migrationKey, 'true');
        }
      } else {
        localStorage.setItem(migrationKey, 'true');
      }
    }

    // Load custom categories and family members from cloud or local fallback
    const localSettings = loadSettingsLocal();
    const categories = (settingsRow?.categories && Object.keys(settingsRow.categories).length > 0)
      ? settingsRow.categories
      : (localSettings?.categories || DEFAULT_CATEGORIES);

    const familyMembers = (Array.isArray(settingsRow?.family_members) && settingsRow.family_members.length > 0)
      ? settingsRow.family_members
      : (localSettings?.familyMembers || DEFAULT_FAMILY_MEMBERS);

    // Save cache locally
    saveSettingsLocal({ categories, familyMembers });

    setData({
      transactions,
      monthlyBudget: Number(budgetRow?.monthly_budget || DEFAULT_BUDGET),
      categories,
      familyMembers,
    });
    setSyncStatus('synced');
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const mock = generateMockData();
      const localSettings = loadSettingsLocal();
      setData({
        ...mock,
        categories: localSettings?.categories || DEFAULT_CATEGORIES,
        familyMembers: localSettings?.familyMembers || DEFAULT_FAMILY_MEMBERS,
      });
      setSyncStatus('setup');
      setIsLoaded(true);
      return;
    }
    let mounted = true;
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(session?.user || null);
      if (session?.user) await loadCloudData(session.user);
      else { setData(null); setSyncStatus('signed-out'); setIsLoaded(true); }
    };
    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
      if (session?.user) loadCloudData(session.user);
      else { setData(null); setSyncStatus('signed-out'); setIsLoaded(true); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [loadCloudData]);

  const signInWithEmail = useCallback(async (email) => {
    const { error: signInError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    return signInError?.message || null;
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const addTransaction = useCallback(async (transaction) => {
    const { data: row, error: insertError } = await supabase.from('transactions').insert(toRow(transaction)).select().single();
    if (insertError) throw new Error(insertError.message);
    const newTx = fromRow(row);

    let currentCategories = data?.categories;
    let currentMembers = data?.familyMembers;
    let currentBudget = data?.monthlyBudget;
    let currentTotalExpense = 0;

    // Current month key for filtering monthly expenses (matches computeStats)
    const VN_TZ = 'Asia/Ho_Chi_Minh';
    const [cyStr, cmStr] = new Date().toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
    const curMonthKey = `${cyStr}-${cmStr}`;

    setData(prev => {
      const updatedList = [newTx, ...prev.transactions];
      currentCategories = prev?.categories;
      currentMembers = prev?.familyMembers;
      currentBudget = prev?.monthlyBudget;
      // Only count current month expenses for accurate budget tracking in Telegram
      currentTotalExpense = updatedList
        .filter(t => {
          if (t.type !== 'expense' || !t.date) return false;
          try {
            const [y, m] = new Date(t.date).toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
            return `${y}-${m}` === curMonthKey;
          } catch { return false; }
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return { ...prev, transactions: updatedList };
    });

    // Auto-send Telegram notification outside React state updater (prevents duplicate triggers)
    try {
      const catInfo = getCategoryInfo(newTx.category, newTx.type, currentCategories);
      const memInfo = getMemberInfo(newTx.member, currentMembers);

      fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: {
            ...newTx,
            categoryName: catInfo.name,
            memberName: memInfo.name,
            memberAvatar: memInfo.avatar,
          },
          monthlyBudget: currentBudget,
          totalExpense: currentTotalExpense,
        }),
      }).catch(err => console.warn('Telegram notification silent failure:', err));
    } catch (e) {
      // silent
    }

    return newTx;
  }, [data?.categories, data?.familyMembers, data?.monthlyBudget]);

  const updateTransaction = useCallback(async (id, transaction) => {
    const row = toRow(transaction);
    const { data: updatedRow, error: updateError } = await supabase
      .from('transactions')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw new Error(updateError.message);
    const updatedTx = fromRow(updatedRow);
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? updatedTx : t),
    }));
    return updatedTx;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  }, []);

  const updateBudget = useCallback(async (budget) => {
    const { error: budgetError } = await supabase.from('budgets').upsert({ user_id: user.id, monthly_budget: budget, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (budgetError) throw new Error(budgetError.message);
    setData(prev => ({ ...prev, monthlyBudget: budget }));
  }, [user]);

  const updateCategories = useCallback(async (newCategories) => {
    const currentMembers = data?.familyMembers || DEFAULT_FAMILY_MEMBERS;
    setData(prev => ({ ...prev, categories: newCategories }));
    saveSettingsLocal({
      categories: newCategories,
      familyMembers: currentMembers,
    });

    if (isSupabaseConfigured && user) {
      try {
        const { error: setErr } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          categories: newCategories,
          family_members: currentMembers,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (setErr) console.warn('Supabase user_settings update notice:', setErr.message);
      } catch (err) {
        console.warn('Failed to upsert user_settings:', err);
      }
    }
  }, [data?.familyMembers, isSupabaseConfigured, user]);

  const updateFamilyMembers = useCallback(async (newMembers) => {
    if (!Array.isArray(newMembers) || newMembers.length === 0) {
      throw new Error('Cần giữ lại ít nhất 1 thành viên gia đình.');
    }
    const currentCategories = data?.categories || DEFAULT_CATEGORIES;
    setData(prev => ({ ...prev, familyMembers: newMembers }));
    saveSettingsLocal({
      categories: currentCategories,
      familyMembers: newMembers,
    });

    if (isSupabaseConfigured && user) {
      try {
        const { error: setErr } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          categories: currentCategories,
          family_members: newMembers,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (setErr) console.warn('Supabase user_settings update notice:', setErr.message);
      } catch (err) {
        console.warn('Failed to upsert user_settings:', err);
      }
    }
  }, [data?.categories, isSupabaseConfigured, user]);

  const resetData = useCallback(async () => {
    const { error: resetError } = await supabase.from('transactions').delete().eq('user_id', user.id);
    if (resetError) throw new Error(resetError.message);
    const fresh = generateMockData();
    const { data: rows, error: seedError } = await supabase.from('transactions').insert(fresh.transactions.map(toRow)).select();
    if (seedError) throw new Error(seedError.message);
    await updateBudget(fresh.monthlyBudget);
    setData(prev => ({
      ...prev,
      transactions: rows.map(fromRow),
      monthlyBudget: fresh.monthlyBudget,
    }));
  }, [updateBudget, user]);

  const importData = useCallback(async (imported) => {
    if (!Array.isArray(imported?.transactions) || imported.transactions.length === 0) {
      throw new Error('File không có giao dịch hợp lệ.');
    }
    const { data: rows, error: importError } = await supabase
      .from('transactions')
      .insert(imported.transactions.map(toRow))
      .select();
    if (importError) throw new Error(importError.message);
    if (Number(imported.monthlyBudget) > 0) await updateBudget(Number(imported.monthlyBudget));

    if (imported?.categories && typeof imported.categories === 'object') {
      await updateCategories(imported.categories);
    }
    if (Array.isArray(imported?.familyMembers) && imported.familyMembers.length > 0) {
      await updateFamilyMembers(imported.familyMembers);
    }

    setData(prev => ({
      ...prev,
      transactions: [...rows.map(fromRow), ...prev.transactions],
      monthlyBudget: Number(imported.monthlyBudget) > 0 ? Number(imported.monthlyBudget) : prev.monthlyBudget,
    }));
    return rows.length;
  }, [updateBudget, updateCategories, updateFamilyMembers]);

  return {
    data,
    stats: isLoaded && data ? computeStats(data) : null,
    isLoaded,
    user,
    syncStatus,
    error,
    isSupabaseConfigured,
    signInWithEmail,
    signOut,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    resetData,
    importData,
    updateCategories,
    updateFamilyMembers,
  };
}

function computeStats(data) {
  const VN_TZ = 'Asia/Ho_Chi_Minh';
  const [yearStr, monthStr] = new Date().toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
  const currentMonth = parseInt(monthStr, 10) - 1;
  const currentYear = parseInt(yearStr, 10);
  const monthTransactions = data.transactions.filter(t => {
    const [y, m] = new Date(t.date).toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
    return parseInt(m, 10) - 1 === currentMonth && parseInt(y, 10) === currentYear;
  });
  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const byCategory = {};
  const byMember = {};
  monthTransactions.filter(t => t.type === 'expense').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    byMember[t.member] = (byMember[t.member] || 0) + t.amount;
  });
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense, budgetUsed: data.monthlyBudget > 0 ? (totalExpense / data.monthlyBudget) * 100 : 0, monthlyBudget: data.monthlyBudget, byCategory, byMember, recent: [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10), monthTransactions };
}
