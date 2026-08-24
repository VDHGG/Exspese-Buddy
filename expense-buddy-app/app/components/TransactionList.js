'use client';

import { useState, useMemo } from 'react';
import { Trash2, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getCategoryInfo, getMemberInfo, formatCurrency, formatDate, formatFullDate, FAMILY_MEMBERS, CATEGORIES } from '../lib/data';
import styles from './TransactionList.module.css';

export default function TransactionList({ data, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const transactions = data?.transactions || [];

  const filtered = useMemo(() => {
    let result = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t =>
        t.note?.toLowerCase().includes(s) ||
        getCategoryInfo(t.category, t.type).name.toLowerCase().includes(s)
      );
    }
    if (filterMember !== 'all') {
      result = result.filter(t => t.member === filterMember);
    }
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }
    return result;
  }, [transactions, search, filterMember, filterCategory, filterType]);

  const allCategories = [...CATEGORIES.expense, ...CATEGORIES.income];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Lịch sử giao dịch</h2>
        <span className={styles.count}>{filtered.length} giao dịch</span>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={`input ${styles.searchInput}`}
            placeholder="Tìm giao dịch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterRow}>
          <select className="select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Tất cả loại</option>
            <option value="expense">Chi tiền</option>
            <option value="income">Thu tiền</option>
          </select>
          <select className="select" value={filterMember} onChange={(e) => setFilterMember(e.target.value)}>
            <option value="all">Tất cả thành viên</option>
            {FAMILY_MEMBERS.map(m => (
              <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
            ))}
          </select>
          <select className="select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {allCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <Filter size={40} strokeWidth={1.2} color="#D4B896" />
            <p>Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          filtered.map((t, i) => {
            const catInfo = getCategoryInfo(t.category, t.type);
            const memberInfo = getMemberInfo(t.member);
            const isExpense = t.type === 'expense';

            return (
              <div
                key={t.id}
                className={styles.item}
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <div className={styles.itemLeft}>
                  <div
                    className={styles.catIcon}
                    style={{ background: catInfo.color + '15', color: catInfo.color }}
                  >
                    {isExpense ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemNote}>{t.note || catInfo.name}</span>
                    <div className={styles.itemMeta}>
                      <span className={`badge ${isExpense ? 'badge-expense' : 'badge-income'}`}>
                        {catInfo.name}
                      </span>
                      <span className={styles.itemMember}>{memberInfo.avatar} {memberInfo.name}</span>
                      <span className={styles.itemDate}>{formatDate(t.date)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <span className={`${styles.itemAmount} ${isExpense ? styles.amountExpense : styles.amountIncome}`}>
                    {isExpense ? '-' : '+'}{formatCurrency(t.amount)}
                  </span>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(t.id)}
                    aria-label="Xóa giao dịch"
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
