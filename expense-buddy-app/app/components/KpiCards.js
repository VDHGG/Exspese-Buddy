'use client';

import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { formatCurrency } from '../lib/data';
import styles from './KpiCards.module.css';

export default function KpiCards({ stats }) {
  if (!stats) return null;

  const budgetPercent = Math.min(stats.budgetUsed, 100);
  const budgetStatus = budgetPercent >= 90 ? 'danger' : budgetPercent >= 70 ? 'warning' : 'safe';

  const cards = [
    {
      id: 'income',
      label: 'Thu nhập tháng',
      value: stats.totalIncome,
      icon: TrendingUp,
      color: 'emerald',
      gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
      iconBg: '#10B981',
    },
    {
      id: 'expense',
      label: 'Chi tiêu tháng',
      value: stats.totalExpense,
      icon: TrendingDown,
      color: 'red',
      gradient: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)',
      iconBg: '#F43F5E',
    },
    {
      id: 'balance',
      label: 'Số dư thực tế',
      value: stats.balance,
      icon: Wallet,
      color: 'indigo',
      gradient: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
      iconBg: '#8B5CF6',
    },
  ];

  return (
    <div className={`${styles.grid} stagger-children`}>
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={styles.card} style={{ background: card.gradient }}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrap} style={{ background: card.iconBg }}>
                <Icon size={18} color="white" />
              </div>
              <span className={styles.label}>{card.label}</span>
            </div>
            <div className={styles.value}>
              {card.id === 'balance' && stats.balance < 0 ? '-' : ''}
              {formatCurrency(Math.abs(card.value))}
            </div>
          </div>
        );
      })}

      {/* Budget card */}
      <div className={styles.card} style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrap} style={{ background: '#F59E0B' }}>
            <Target size={18} color="white" />
          </div>
          <span className={styles.label}>Ngân sách tháng</span>
        </div>
        <div className={styles.value}>{formatCurrency(stats.monthlyBudget)}</div>
        <div className={styles.progressContainer}>
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressBar} ${styles[budgetStatus]}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <span className={`${styles.progressLabel} ${styles[budgetStatus + 'Text']}`}>
            {budgetPercent.toFixed(0)}% đã dùng
          </span>
        </div>
      </div>
    </div>
  );
}
