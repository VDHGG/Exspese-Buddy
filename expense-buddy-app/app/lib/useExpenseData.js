'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateMockData, STORAGE_KEY, loadData } from './data';
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
    const [{ data: transactionRows, error: transactionError }, { data: budgetRow, error: budgetError }] = await Promise.all([
      supabase.from('transactions').select('*').order('occurred_at', { ascending: false }),
      supabase.from('budgets').select('monthly_budget').maybeSingle(),
    ]);
    if (transactionError || budgetError) {
      setError(transactionError?.message || budgetError?.message || 'Không thể tải dữ liệu.');
      setSyncStatus('error');
      setData({ transactions: [], monthlyBudget: DEFAULT_BUDGET });
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

    setData({ transactions, monthlyBudget: Number(budgetRow?.monthly_budget || DEFAULT_BUDGET) });
    setSyncStatus('synced');
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setData(generateMockData());
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
    setData(prev => ({ ...prev, transactions: [fromRow(row), ...prev.transactions] }));
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

  const resetData = useCallback(async () => {
    const { error: resetError } = await supabase.from('transactions').delete().eq('user_id', user.id);
    if (resetError) throw new Error(resetError.message);
    const fresh = generateMockData();
    const { data: rows, error: seedError } = await supabase.from('transactions').insert(fresh.transactions.map(toRow)).select();
    if (seedError) throw new Error(seedError.message);
    await updateBudget(fresh.monthlyBudget);
    setData({ transactions: rows.map(fromRow), monthlyBudget: fresh.monthlyBudget });
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
    setData(prev => ({
      ...prev,
      transactions: [...rows.map(fromRow), ...prev.transactions],
      monthlyBudget: Number(imported.monthlyBudget) > 0 ? Number(imported.monthlyBudget) : prev.monthlyBudget,
    }));
    return rows.length;
  }, [updateBudget]);

  return { data, stats: isLoaded && data ? computeStats(data) : null, isLoaded, user, syncStatus, error, isSupabaseConfigured, signInWithEmail, signOut, addTransaction, deleteTransaction, updateBudget, resetData, importData };
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
