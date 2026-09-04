'use client';

import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Calendar, PieChart as PieIcon, Users, Clock } from 'lucide-react';
import {
  getCategoryInfo,
  getMemberInfo,
  formatCurrency,
  DEFAULT_FAMILY_MEMBERS
} from '../lib/data';
import styles from './Charts.module.css';

const RADIAN = Math.PI / 180;
const VN_TZ = 'Asia/Ho_Chi_Minh';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipHeader}>
          {item.avatar && <span className={styles.tooltipAvatar}>{item.avatar}</span>}
          <span className={styles.tooltipName}>{item.name}</span>
        </div>
        <div className={styles.tooltipValue}>{formatCurrency(item.value)}</div>
      </div>
    );
  }
  return null;
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export default function Charts({ stats, categories, familyMembers, transactions }) {
  // Determine current month key
  const [nowYear, nowMonth] = useMemo(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
  }, []);
  const currentMonthKey = `${nowYear}-${nowMonth}`;

  // Build available period options from actual transactions
  const periods = useMemo(() => {
    const monthMap = new Map();

    // Always include current month
    monthMap.set(currentMonthKey, `Tháng ${parseInt(nowMonth, 10)}/${nowYear} (Tháng này)`);

    // Scan all transactions for other months
    (transactions || []).forEach(t => {
      if (!t.date) return;
      try {
        const [y, m] = new Date(t.date).toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
        if (y && m) {
          const key = `${y}-${m}`;
          if (!monthMap.has(key)) {
            monthMap.set(key, `Tháng ${parseInt(m, 10)}/${y}`);
          }
        }
      } catch {
        // ignore
      }
    });

    // Sort month keys descending (newest first)
    const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));

    const list = sortedKeys.map(key => ({
      id: key,
      label: monthMap.get(key),
      isCurrent: key === currentMonthKey,
    }));

    // Add 'all' option
    list.push({
      id: 'all',
      label: 'Toàn bộ thời gian',
      isCurrent: false,
    });

    return list;
  }, [transactions, currentMonthKey, nowMonth, nowYear]);

  // Initial selected period: default to current month if it has data, or to latest month that has expenses
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const hasCurrentExpenses = (transactions || []).some(t => {
      if (t.type !== 'expense' || !t.date) return false;
      try {
        const [y, m] = new Date(t.date).toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
        return `${y}-${m}` === currentMonthKey;
      } catch {
        return false;
      }
    });

    if (hasCurrentExpenses) return currentMonthKey;

    // If current month is empty, find latest month with expense
    const otherExpense = (transactions || []).find(t => t.type === 'expense' && t.date);
    if (otherExpense) {
      try {
        const [y, m] = new Date(otherExpense.date).toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
        return `${y}-${m}`;
      } catch {
        // ignore
      }
    }

    return currentMonthKey;
  });

  // Filter transactions for the selected period
  const periodExpenses = useMemo(() => {
    return (transactions || []).filter(t => {
      if (t.type !== 'expense' || !t.date) return false;
      if (selectedPeriod === 'all') return true;
      try {
        const [y, m] = new Date(t.date).toLocaleDateString('en-CA', { timeZone: VN_TZ }).split('-');
        return `${y}-${m}` === selectedPeriod;
      } catch {
        return false;
      }
    });
  }, [transactions, selectedPeriod]);

  // Compute total expense in period
  const totalExpense = useMemo(() => {
    return periodExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [periodExpenses]);

  // Aggregate by Category
  const categoryData = useMemo(() => {
    const byCategory = {};
    periodExpenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    return Object.entries(byCategory)
      .map(([catId, value]) => {
        const info = getCategoryInfo(catId, 'expense', categories);
        return { name: info.name, value, color: info.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [periodExpenses, categories]);

  // Aggregate by Member (ensure all active family members are represented)
  const memberData = useMemo(() => {
    const byMember = {};
    periodExpenses.forEach(t => {
      byMember[t.member] = (byMember[t.member] || 0) + t.amount;
    });

    const activeMembers = familyMembers && familyMembers.length > 0 ? familyMembers : DEFAULT_FAMILY_MEMBERS;
    const memberMap = new Map();

    activeMembers.forEach(m => {
      memberMap.set(m.id, {
        id: m.id,
        name: m.name,
        value: byMember[m.id] || 0,
        color: m.color || '#10B981',
        avatar: m.avatar || '👤',
      });
    });

    // If there are transactions for a member not in active list, still include them
    Object.entries(byMember).forEach(([mId, val]) => {
      if (!memberMap.has(mId)) {
        const info = getMemberInfo(mId, familyMembers);
        memberMap.set(mId, {
          id: mId,
          name: info.name,
          value: val,
          color: info.color || '#64748B',
          avatar: info.avatar || '👤',
        });
      }
    });

    return Array.from(memberMap.values()).sort((a, b) => b.value - a.value);
  }, [periodExpenses, familyMembers]);

  const activePeriodObj = periods.find(p => p.id === selectedPeriod) || periods[0];

  return (
    <div className={styles.container}>
      {/* Time Period Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <span className={styles.filterIcon}>
            <Calendar size={18} />
          </span>
          <span className={styles.filterLabel}>Kỳ phân tích:</span>
        </div>
        <div className={styles.periodPills}>
          {periods.map(p => (
            <button
              key={p.id}
              type="button"
              className={`${styles.periodPill} ${selectedPeriod === p.id ? styles.activePill : ''}`}
              onClick={() => setSelectedPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Card 1: Donut Chart - By Category */}
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.woodAccent} />
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.chartTitle}>Chi tiêu theo danh mục</h3>
            <span className={styles.chartSubBadge}>{activePeriodObj?.label}</span>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className={styles.donutContainer}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className={styles.donutCenter}>
                  <span className={styles.donutCenterLabel}>Tổng chi</span>
                  <span className={styles.donutCenterValue}>{formatCurrency(totalExpense)}</span>
                </div>
              </div>

              {/* Legend */}
              <div className={styles.legend}>
                {categoryData.map((item, i) => (
                  <div key={i} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: item.color }} />
                    <span className={styles.legendName}>{item.name}</span>
                    <span className={styles.legendValue}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyStateWrap}>
              <div className={styles.emptyStateCircle}>
                <PieIcon size={34} />
              </div>
              <div className={styles.emptyStateTitle}>Chưa có chi tiêu trong kỳ này</div>
              <div className={styles.emptyStateSub}>
                Hãy chọn khoảng thời gian khác ở phía trên hoặc ghi chép thêm giao dịch mới.
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Bar Chart - By Member */}
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.woodAccent} />
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.chartTitle}>Chi tiêu theo thành viên</h3>
            <span className={styles.chartSubBadge}>{activePeriodObj?.label}</span>
          </div>

          {totalExpense > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={memberData}
                margin={{ top: 15, right: 10, left: 0, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B8" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#7D6340', fontWeight: 600 }}
                  axisLine={{ stroke: '#E8D5B8' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9A7B4F' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? (v / 1000000).toFixed(0) + 'tr' : (v / 1000).toFixed(0) + 'k'}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212, 184, 150, 0.1)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800} animationBegin={300}>
                  {memberData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyStateWrap}>
              <div className={styles.emptyStateCircle}>
                <Users size={34} />
              </div>
              <div className={styles.emptyStateTitle}>Chưa có chi tiêu theo thành viên</div>
              <div className={styles.emptyStateSub}>
                Tất cả các thành viên đều chưa phát sinh khoản chi nào trong thời gian này.
              </div>
            </div>
          )}

          {/* Member Summary Cards (Always visible, showing who spent what or 0đ) */}
          <div className={styles.memberSummary}>
            {memberData.map((m, i) => (
              <div
                key={m.id || i}
                className={`${styles.memberCard} ${m.value === 0 ? styles.memberZero : ''}`}
              >
                <span className={styles.memberAvatar}>{m.avatar}</span>
                <div>
                  <span className={styles.memberName}>{m.name}</span>
                  <span className={styles.memberAmount}>{formatCurrency(m.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
