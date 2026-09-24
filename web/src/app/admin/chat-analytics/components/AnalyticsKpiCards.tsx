'use client';

import React from 'react';
import { MessageSquare, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import styles from '../chatAnalytics.module.css';

interface AnalyticsData {
  totalConversations7d?: number;
  resolvedRate?: number;
  fallbackRate?: number;
  avgLatencyMs?: number;
}

interface AnalyticsKpiCardsProps {
  data: AnalyticsData | null;
  loading: boolean;
}

export default function AnalyticsKpiCards({ data, loading }: AnalyticsKpiCardsProps) {
  const cards = [
    {
      label: 'Tổng lượt hội thoại (7 ngày)',
      value: loading ? '...' : (data?.totalConversations7d ?? 0).toLocaleString('vi-VN'),
      description: 'Lượt tương tác khách hàng & quản trị',
      icon: <MessageSquare size={18} color="#2563eb" />,
      iconBg: '#eff6ff',
    },
    {
      label: 'Tỷ lệ giải quyết (Resolved)',
      value: loading ? '...' : `${data?.resolvedRate ?? 0}%`,
      description: 'Yêu cầu được AI/Tool xử lý trọn vẹn',
      icon: <CheckCircle2 size={18} color="#16a34a" />,
      iconBg: '#f0fdf4',
    },
    {
      label: 'Tỷ lệ Fallback',
      value: loading ? '...' : `${data?.fallbackRate ?? 0}%`,
      description: 'Yêu cầu chưa rõ ý định, gợi ý chip fallback',
      icon: <AlertCircle size={18} color="#d97706" />,
      iconBg: '#fffbeb',
    },
    {
      label: 'Độ trễ trung bình (Latency)',
      value: loading ? '...' : `${data?.avgLatencyMs ?? 0} ms`,
      description: 'Thời gian AI xử lý và gọi tool API',
      icon: <Zap size={18} color="#7c3aed" />,
      iconBg: '#f5f3ff',
    },
  ];

  return (
    <div className={styles.kpiGrid}>
      {cards.map((card, idx) => (
        <div key={idx} className={styles.kpiCard}>
          <div className={styles.kpiCardTop}>
            <span className={styles.kpiLabel}>{card.label}</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: card.iconBg }}>
              {card.icon}
            </div>
          </div>
          <div className={styles.kpiValue}>{card.value}</div>
          <div className={styles.kpiDescription}>{card.description}</div>
        </div>
      ))}
    </div>
  );
}
