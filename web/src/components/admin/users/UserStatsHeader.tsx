'use client';

import React from 'react';
import type { AdminUserStats } from '@/types/adminUser';
import styles from './userStatsHeader.module.css';

interface UserStatsHeaderProps {
  stats: AdminUserStats | null;
  loading: boolean;
}

export const UserStatsHeader: React.FC<UserStatsHeaderProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`${styles.statCard} ${styles.statSkeleton}`} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers.toLocaleString('vi-VN'),
      subtext: 'Tài khoản hệ thống',
      accent: 'var(--color-primary-500)',
    },
    {
      label: 'Đang hoạt động',
      value: stats.activeUsers.toLocaleString('vi-VN'),
      subtext: `${((stats.activeUsers / (stats.totalUsers || 1)) * 100).toFixed(0)}% tổng số`,
      accent: '#059669',
    },
    {
      label: 'Đã xác thực SĐT',
      value: stats.phoneVerifiedUsers.toLocaleString('vi-VN'),
      subtext: 'Đủ điều kiện ship COD',
      accent: '#2563EB',
    },
    {
      label: 'Khách hàng VIP',
      value: stats.vipUsers.toLocaleString('vi-VN'),
      subtext: 'Gold/Diamond hoặc chi tiêu lớn',
      accent: 'var(--color-secondary-500)',
    },
    {
      label: 'Tài khoản bị khóa',
      value: stats.blockedUsers.toLocaleString('vi-VN'),
      subtext: 'Tạm ngưng quyền truy cập',
      accent: '#DC2626',
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {cards.map((c, idx) => (
        <div key={idx} className={styles.statCard} style={{ borderTopColor: c.accent }}>
          <span className={styles.statLabel}>{c.label}</span>
          <span className={styles.statValue}>{c.value}</span>
          <span className={styles.statSub}>{c.subtext}</span>
        </div>
      ))}
    </div>
  );
};
