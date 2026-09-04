'use client';

import { Home, PlusCircle, BarChart3, List, Settings, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home },
  { id: 'add', label: 'Thêm giao dịch', icon: PlusCircle },
  { id: 'charts', label: 'Biểu đồ', icon: BarChart3 },
  { id: 'history', label: 'Lịch sử', icon: List },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export default function Sidebar({ activeView, onViewChange, syncStatus, userEmail, familyMembers, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (id) => {
    onViewChange(id);
    setIsOpen(false);
  };

  const members = familyMembers && familyMembers.length > 0
    ? familyMembers
    : [
        { id: 'bo', name: 'Bố', avatar: '👨' },
        { id: 'me', name: 'Mẹ', avatar: '👩' },
        { id: 'bebo', name: 'Bé Bo', avatar: '👦' },
        { id: 'chung', name: 'Quỹ chung', avatar: '🏠' },
      ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logo-gradient)" />
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#10B981" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className={styles.logoTitle}>Expense Buddy</h1>
            <p className={styles.logoSub}>Quản lý chi tiêu gia đình</p>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleNav(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Family */}
        <div className={styles.familySection}>
          <p className={styles.familyLabel}>Thành viên</p>
          <div className={styles.familyAvatars}>
            {members.map(m => (
              <div
                key={m.id}
                className={styles.familyMember}
                title={m.name}
                style={m.color ? { borderColor: m.color } : {}}
              >
                {m.avatar}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.syncInfo}>{syncStatus === 'synced' ? '● Đã đồng bộ Supabase' : '● Đang đồng bộ dữ liệu'}</p>
          <p className={styles.userEmail}>{userEmail}</p>
          <button className={styles.signOut} onClick={onSignOut}><LogOut size={13} /> Đăng xuất</button>
        </div>
      </aside>
    </>
  );
}
