'use client';

import React from 'react';
import type { RecommendationMetrics } from '@/types/recommendation';
import { Eye, MousePointerClick, TrendingUp, ShoppingBag } from 'lucide-react';
import styles from './RecommendationKpiCards.module.css';

interface Props {
  metrics: RecommendationMetrics;
}

export default function RecommendationKpiCards({ metrics }: Props) {
  const cards = [
    {
      label: 'Tổng Lượt Hiển Thị',
      value: (metrics.totalImpressions || 0).toLocaleString('vi-VN'),
      subtext: 'Lượt gợi ý đến người dùng',
      icon: <Eye size={24} color="#0284c7" />,
      bg: '#e0f2fe',
    },
    {
      label: 'Tổng Lượt Nhấp',
      value: (metrics.totalClicks || 0).toLocaleString('vi-VN'),
      subtext: 'Tương tác trực tiếp',
      icon: <MousePointerClick size={24} color="#7c3aed" />,
      bg: '#ede9fe',
    },
    {
      label: 'CTR Trung Bình',
      value: `${(metrics.overallCtr || 0).toFixed(2)}%`,
      subtext: 'Tỷ lệ nhấp chuột',
      icon: <TrendingUp size={24} color="#16a34a" />,
      bg: '#dcfce7',
    },
    {
      label: 'Chuyển Đổi Mua / Giỏ',
      value: `${(metrics.overallConversionRate || 0).toFixed(2)}%`,
      subtext: `${metrics.totalCartConversions || 0} giỏ / ${metrics.totalOrderConversions || 0} đơn`,
      icon: <ShoppingBag size={24} color="#ea580c" />,
      bg: '#ffedd5',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((c, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.iconBox} style={{ background: c.bg }}>
            {c.icon}
          </div>
          <div className={styles.info}>
            <span className={styles.label}>{c.label}</span>
            <span className={styles.value}>{c.value}</span>
            <span className={styles.subtext}>{c.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
