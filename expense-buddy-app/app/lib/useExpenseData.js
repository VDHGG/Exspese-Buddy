'use client';

import { useState, useEffect, useCallback } from 'react';
import { initializeData, saveData, generateId, STORAGE_KEY, getRemainingTTL } from './data';

export function useExpenseData() {
  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [remainingTTL, setRemainingTTL] = useState(null);

  useEffect(() => {
    const loaded = initializeData();
    setData(loaded);
    setIsLoaded(true);
    setRemainingTTL(getRemainingTTL());

    // Update TTL countdown every minute
    const timer = setInterval(() => {
      const ttl = getRemainingTTL();
      setRemainingTTL(ttl);

      // If expired, auto-refresh with mock data
      if (ttl !== null && ttl <= 0) {
        localStorage.removeItem(STORAGE_KEY);
        const fresh = initializeData();
        setData(fresh);
        setRemainingTTL(getRemainingTTL());
      }
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const addTransaction = useCallback((transaction) => {
    setData(prev => {
      const newTransaction = {
        ...transaction,
        id: generateId(),
        date: transaction.date || new Date().toISOString(),
      };
      const updated = {
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
      };
      saveData(updated);
      setRemainingTTL(getRemainingTTL());
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id) => {
    setData(prev => {
      const updated = {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
      };
      saveData(updated);
      return updated;
    });
  }, []);

  const editTransaction = useCallback((id, updates) => {
    setData(prev => {
      const updated = {
        ...prev,
        transactions: prev.transactions.map(t =>
          t.id === id ? { ...t, ...updates } : t
        ),
      };
      saveData(updated);
      return updated;
    });
  }, []);

  const updateBudget = useCallback((budget) => {
    setData(prev => {
      const updated = { ...prev, monthlyBudget: budget };
      saveData(updated);
      return updated;
    });
  }, []);

  const resetData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    const fresh = initializeData();
    setData(fresh);
    setRemainingTTL(getRemainingTTL());
  }, []);

  // Computed stats
  const stats = isLoaded && data ? computeStats(data) : null;

  return {
    data,
    stats,
    isLoaded,
    remainingTTL,
    addTransaction,
    deleteTransaction,
    editTransaction,
    updateBudget,
    resetData,
  };
}

function computeStats(data) {
  // Pin to Vietnam timezone for month comparison
  const VN_TZ = 'Asia/Ho_Chi_Minh';
  const nowInVN = new Date().toLocaleDateString('en-CA', { timeZone: VN_TZ }); // YYYY-MM-DD
  const [yearStr, monthStr] = nowInVN.split('-');
  const currentMonth = parseInt(monthStr, 10) - 1; // 0-indexed
  const currentYear = parseInt(yearStr, 10);

  const monthTransactions = data.transactions.filter(t => {
    const dateInVN = new Date(t.date).toLocaleDateString('en-CA', { timeZone: VN_TZ });
    const [y, m] = dateInVN.split('-');
    return parseInt(m, 10) - 1 === currentMonth && parseInt(y, 10) === currentYear;
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const budgetUsed = data.monthlyBudget > 0 ? (totalExpense / data.monthlyBudget) * 100 : 0;

  // By category
  const byCategory = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      byCategory[t.category] += t.amount;
    });

  // By member
  const byMember = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!byMember[t.member]) {
        byMember[t.member] = 0;
      }
      byMember[t.member] += t.amount;
    });

  // Recent transactions (last 10)
  const recent = [...data.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return {
    totalIncome,
    totalExpense,
    balance,
    budgetUsed,
    monthlyBudget: data.monthlyBudget,
    byCategory,
    byMember,
    recent,
    monthTransactions,
  };
}
