'use client';

import { useState } from 'react';
import { useExpenseData } from './lib/useExpenseData';
import Sidebar from './components/Sidebar';
import KpiCards from './components/KpiCards';
import AddTransaction from './components/AddTransaction';
import Charts from './components/Charts';
import TransactionList from './components/TransactionList';
import RecentTransactions from './components/RecentTransactions';
import BuddyInsights from './components/BuddyInsights';
import SettingsView from './components/SettingsView';
import { formatMonthYear } from './lib/data';
import styles from './page.module.css';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const {
    data,
    stats,
    isLoaded,
    remainingTTL,
    addTransaction,
    deleteTransaction,
    updateBudget,
    resetData,
  } = useExpenseData();

  if (!isLoaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Đang tải Expense Buddy...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className={styles.dashboard}>
            {/* Welcome */}
            <div className={styles.welcomeHeader}>
              <div>
                <h1 className={styles.welcomeTitle}>
                  Xin chào! 👋
                </h1>
                <p className={styles.welcomeSub}>
                  Tổng quan chi tiêu gia đình {formatMonthYear(new Date())}
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setActiveView('add')}
              >
                + Thêm giao dịch
              </button>
            </div>

            {/* KPI Cards */}
            <KpiCards stats={stats} />

            {/* Bottom grid */}
            <div className={styles.bottomGrid}>
              <div className={styles.bottomLeft}>
                <RecentTransactions stats={stats} onViewAll={() => setActiveView('history')} />
              </div>
              <div className={styles.bottomRight}>
                <BuddyInsights stats={stats} />
              </div>
            </div>
          </div>
        );

      case 'add':
        return (
          <div className={styles.viewContainer}>
            <div className={`card ${styles.addCard}`}>
              <AddTransaction
                onAdd={(t) => {
                  addTransaction(t);
                }}
                onClose={() => setActiveView('dashboard')}
              />
            </div>
          </div>
        );

      case 'charts':
        return (
          <div className={styles.viewContainer}>
            <h2 className={styles.viewTitle}>Biểu đồ phân tích</h2>
            <Charts stats={stats} />
          </div>
        );

      case 'history':
        return (
          <div className={styles.viewContainer}>
            <TransactionList data={data} onDelete={deleteTransaction} />
          </div>
        );

      case 'settings':
        return (
          <div className={styles.viewContainer}>
            <SettingsView
              data={data}
              onUpdateBudget={updateBudget}
              onReset={resetData}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.appLayout}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} remainingTTL={remainingTTL} />
      <main className={styles.mainContent}>
        {renderView()}
      </main>
    </div>
  );
}
