'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getCategoryInfo, getMemberInfo, formatCurrency, formatDate } from '../lib/data';
import styles from './RecentTransactions.module.css';

export default function RecentTransactions({ stats, categories, familyMembers, onViewAll }) {
  if (!stats || !stats.recent) return null;

  return (
    <div className={`card ${styles.container}`}>
      <div className={styles.woodAccent} />
      <div className={styles.header}>
        <h3>Giao dịch gần đây</h3>
        <button className={styles.viewAll} onClick={onViewAll}>
          Xem tất cả
        </button>
      </div>
      <div className={styles.list}>
        {stats.recent.slice(0, 7).map((t, i) => {
          const catInfo = getCategoryInfo(t.category, t.type, categories);
          const memberInfo = getMemberInfo(t.member, familyMembers);
          const isExpense = t.type === 'expense';

          return (
            <div
              key={t.id}
              className={styles.item}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={styles.icon}
                style={{ background: catInfo.color + '12', color: catInfo.color }}
              >
                {isExpense ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className={styles.info}>
                <span className={styles.note}>{t.note || catInfo.name}</span>
                <span className={styles.meta}>
                  {memberInfo.avatar} {memberInfo.name} · {formatDate(t.date)}
                </span>
              </div>
              <span className={`${styles.amount} ${isExpense ? styles.expense : styles.income}`}>
                {isExpense ? '-' : '+'}{formatCurrency(t.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
