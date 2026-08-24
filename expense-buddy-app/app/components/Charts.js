'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getCategoryInfo, getMemberInfo, formatCurrency, CATEGORIES } from '../lib/data';
import styles from './Charts.module.css';

const RADIAN = Math.PI / 180;

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipName}>{data.name}</p>
        <p className={styles.tooltipValue}>{formatCurrency(data.value)}</p>
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
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export default function Charts({ stats }) {
  if (!stats) return null;

  // Donut data - by category
  const categoryData = Object.entries(stats.byCategory)
    .map(([catId, value]) => {
      const info = getCategoryInfo(catId, 'expense');
      return { name: info.name, value, color: info.color };
    })
    .sort((a, b) => b.value - a.value);

  // Bar data - by member
  const memberData = Object.entries(stats.byMember)
    .map(([memberId, value]) => {
      const info = getMemberInfo(memberId);
      return { name: info.name, value, color: info.color, avatar: info.avatar };
    })
    .sort((a, b) => b.value - a.value);

  const totalExpense = stats.totalExpense;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Donut Chart */}
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.woodAccent} />
          <h3 className={styles.chartTitle}>Chi tiêu theo danh mục</h3>
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
        </div>

        {/* Bar Chart - By member */}
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.woodAccent} />
          <h3 className={styles.chartTitle}>Chi tiêu theo thành viên</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={memberData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B8" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#7D6340', fontWeight: 500 }}
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
          {/* Member summary */}
          <div className={styles.memberSummary}>
            {memberData.map((m, i) => (
              <div key={i} className={styles.memberCard}>
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
