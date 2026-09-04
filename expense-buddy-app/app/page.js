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
import AuthGate from './components/AuthGate';
import FloatingChatWidget from './components/FloatingChatWidget';
import TopUpModal from './components/TopUpModal';
import { QrCode } from 'lucide-react';
import { formatMonthYear } from './lib/data';
import styles from './page.module.css';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const {
    data,
    stats,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    resetData,
    reloadCloudData,
    user,
    syncStatus,
    error,
    isSupabaseConfigured,
    signInWithPassword,
    signOut,
    importData,
    updateCategories,
    updateFamilyMembers,
  } = useExpenseData();

  if (!isLoaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Đang tải Expense Buddy...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthGate configured={isSupabaseConfigured} onSignIn={signInWithPassword} />;
  }

  const categories = data?.categories;
  const familyMembers = data?.familyMembers;

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
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsTopUpOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1.5px solid #a7f3d0',
                    fontWeight: 600,
                  }}
                >
                  <QrCode size={18} /> Nạp Quỹ VietQR
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveView('add')}
                >
                  + Thêm giao dịch
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <KpiCards stats={stats} />

            {/* Bottom grid */}
            <div className={styles.bottomGrid}>
              <div className={styles.bottomLeft}>
                <RecentTransactions
                  stats={stats}
                  categories={categories}
                  familyMembers={familyMembers}
                  onViewAll={() => setActiveView('history')}
                />
              </div>
              <div className={styles.bottomRight}>
                <BuddyInsights
                  stats={stats}
                  categories={categories}
                  familyMembers={familyMembers}
                />
              </div>
            </div>
          </div>
        );

      case 'add':
        return (
          <div className={styles.viewContainer}>
            <div className={`card ${styles.addCard}`}>
              <AddTransaction
                onAdd={addTransaction}
                categories={categories}
                familyMembers={familyMembers}
                onClose={() => setActiveView('dashboard')}
              />
            </div>
          </div>
        );

      case 'charts':
        return (
          <div className={styles.viewContainer}>
            <h2 className={styles.viewTitle}>Biểu đồ phân tích</h2>
            <Charts
              stats={stats}
              categories={categories}
              familyMembers={familyMembers}
              transactions={data?.transactions}
            />
          </div>
        );

      case 'history':
        return (
          <div className={styles.viewContainer}>
            <TransactionList
              data={data}
              onDelete={deleteTransaction}
              onUpdate={updateTransaction}
            />
          </div>
        );

      case 'settings':
        return (
          <div className={styles.viewContainer}>
            <SettingsView
              data={data}
              onUpdateBudget={updateBudget}
              onReset={resetData}
              onImport={importData}
              onUpdateCategories={updateCategories}
              onUpdateFamilyMembers={updateFamilyMembers}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.appLayout}>
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        syncStatus={syncStatus}
        userEmail={user.email}
        familyMembers={familyMembers}
        onSignOut={signOut}
      />
      <main className={styles.mainContent}>
        {error && <p className={styles.syncError}>Lỗi đồng bộ: {error}</p>}
        {renderView()}
      </main>
      <FloatingChatWidget
        data={data}
        stats={stats}
        onAddTransaction={addTransaction}
      />
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        user={user}
        onPaymentSuccess={() => {
          reloadCloudData();
        }}
      />
    </div>
  );
}
