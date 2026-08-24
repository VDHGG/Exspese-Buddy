'use client';

import { Home, PlusCircle, BarChart3, List, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home },
  { id: 'add', label: 'Thêm giao dịch', icon: PlusCircle },
  { id: 'charts', label: 'Biểu đồ', icon: BarChart3 },
  { id: 'history', label: 'Lịch sử', icon: List },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export default function Sidebar({ activeView, onViewChange, remainingTTL }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (id) => {
    onViewChange(id);
    setIsOpen(false);
  };

  // Format remaining TTL
  const formatTTL = (ms) => {
    if (ms == null) return null;
    const totalMin = Math.ceil(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `${h}h ${m}p`;
    return `${m}p`;
  };

  const ttlText = formatTTL(remainingTTL);

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
            <div className={styles.familyMember} title="Bố">👨</div>
            <div className={styles.familyMember} title="Mẹ">👩</div>
            <div className={styles.familyMember} title="Bé Bo">👦</div>
            <div className={styles.familyMember} title="Quỹ chung">🏠</div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Dữ liệu lưu trên trình duyệt</p>
          {ttlText && (
            <p className={styles.ttlInfo}>Tự động xóa sau {ttlText}</p>
          )}
        </div>
      </aside>
    </>
  );
}
