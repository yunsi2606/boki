import React from 'react';
import type { ActivityAnalytics } from '@/types/activity';
import { UserGroupIcon, ActivityIcon, ShoppingCartIcon, CheckCircleIcon } from '@/components/ui/LineIcons';
import styles from './adminActivity.module.css';

interface ActivityStatCardsProps {
  analytics: ActivityAnalytics | null;
  loading: boolean;
}

export default function ActivityStatCards({ analytics, loading }: ActivityStatCardsProps) {
  const cards = [
    {
      label: 'Phiên Hoạt Động (30m)',
      val: analytics ? `${analytics.activeSessions30m} phiên` : '0',
      icon: <UserGroupIcon size={24} color="#0284c7" />,
      bg: '#e0f2fe',
    },
    {
      label: 'Tổng Sự Kiện Hôm Nay',
      val: analytics ? analytics.totalEventsToday.toLocaleString('vi-VN') : '0',
      icon: <ActivityIcon size={24} color="#6366f1" />,
      bg: '#ede9fe',
    },
    {
      label: 'Tỷ Lệ Thêm Giỏ Hàng',
      val: analytics ? `${analytics.cartConversionRate}%` : '0%',
      icon: <ShoppingCartIcon size={24} color="#d97706" />,
      bg: '#fef3c7',
    },
    {
      label: 'Tỷ Lệ Chốt Đơn Hàng',
      val: analytics ? `${analytics.orderConversionRate}%` : '0%',
      icon: <CheckCircleIcon size={24} color="#16a34a" />,
      bg: '#dcfce7',
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {cards.map((c, i) => (
        <div key={i} className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: c.bg }}>
            {c.icon}
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{c.label}</span>
            <h3 className={styles.statVal}>{loading ? '...' : c.val}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
