'use client';

import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { getMemberInfo, getCategoryInfo, formatCurrency } from '../lib/data';
import styles from './BuddyInsights.module.css';

function generateInsights(stats, categories, familyMembers) {
  if (!stats) return [];
  const insights = [];

  // Who spent the most
  const memberEntries = Object.entries(stats.byMember);
  if (memberEntries.length > 0) {
    const topSpender = [...memberEntries].sort((a, b) => b[1] - a[1])[0];
    const info = getMemberInfo(topSpender[0], familyMembers);
    insights.push({
      text: `${info.avatar} ${info.name} chi nhiều nhất tháng này: ${formatCurrency(topSpender[1])}`,
      type: 'info',
    });
  }

  // Top category
  const catEntries = Object.entries(stats.byCategory);
  if (catEntries.length > 0) {
    const topCat = [...catEntries].sort((a, b) => b[1] - a[1])[0];
    const info = getCategoryInfo(topCat[0], 'expense', categories);
    insights.push({
      text: `Danh mục "${info.name}" chiếm phần lớn chi tiêu (${formatCurrency(topCat[1])})`,
      type: 'warning',
    });
  }

  // Budget status
  if (stats.budgetUsed > 80) {
    insights.push({
      text: `Cẩn thận! Đã dùng ${stats.budgetUsed.toFixed(0)}% ngân sách tháng rồi nè.`,
      type: 'danger',
    });
  } else if (stats.budgetUsed < 50) {
    insights.push({
      text: `Tuyệt vời! Gia đình mới dùng ${stats.budgetUsed.toFixed(0)}% ngân sách, rất tiết kiệm!`,
      type: 'success',
    });
  }

  // Balance
  if (stats.balance > 0) {
    insights.push({
      text: `Tháng này gia đình còn dư ${formatCurrency(stats.balance)}. Hãy cân nhắc tiết kiệm thêm nhé!`,
      type: 'success',
    });
  } else if (stats.balance < 0) {
    insights.push({
      text: `Tháng này chi vượt thu ${formatCurrency(Math.abs(stats.balance))}. Cần xem lại chi tiêu!`,
      type: 'danger',
    });
  }

  return insights;
}

export default function BuddyInsights({ stats, categories, familyMembers }) {
  const insights = useMemo(
    () => generateInsights(stats, categories, familyMembers),
    [stats, categories, familyMembers]
  );

  if (insights.length === 0) return null;

  return (
    <div className={`card ${styles.container}`}>
      <div className={styles.woodAccent} />
      <div className={styles.header}>
        <Lightbulb size={18} color="#F59E0B" />
        <h3>Buddy AI nhận xét</h3>
      </div>
      <div className={styles.list}>
        {insights.map((insight, i) => (
          <div key={i} className={`${styles.insight} ${styles[insight.type]}`}>
            <span className={styles.dot} />
            <p>{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
