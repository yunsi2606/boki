'use client';

import React from 'react';
import type { SpendingStats } from '@/types/profile';
import { CreditCardIcon, PackageIcon, CheckCircleIcon, SparklesIcon } from '@/components/ui/LineIcons';
import styles from './profile.module.css';

interface SpendingStatsGridProps {
  stats: SpendingStats;
}

export default function SpendingStatsGrid({ stats }: SpendingStatsGridProps) {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.kpiGrid}>
      {/* Total Lifetime Spent */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <span className={styles.kpiLabel}>Tổng Chi Tiêu</span>
          <CreditCardIcon size={18} className={styles.kpiIcon} />
        </div>
        <div className={styles.kpiValue}>{formatPrice(stats.lifetimeSpent)}</div>
        <div className={styles.kpiSub}>Tích lũy trọn đời</div>
      </div>

      {/* Total Orders */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <span className={styles.kpiLabel}>Tổng Đơn Hàng</span>
          <PackageIcon size={18} className={styles.kpiIcon} />
        </div>
        <div className={styles.kpiValue}>{stats.totalOrders}</div>
        <div className={styles.kpiSub}>Đã đặt tại Boki</div>
      </div>

      {/* Completed Orders */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <span className={styles.kpiLabel}>Giao Thành Công</span>
          <CheckCircleIcon size={18} className={styles.kpiIcon} color="#16a34a" />
        </div>
        <div className={styles.kpiValue} style={{ color: '#16a34a' }}>
          {stats.completedOrders}
        </div>
        <div className={styles.kpiSub} style={{ color: '#64748b' }}>
          Đơn hoàn tất
        </div>
      </div>

      {/* Active Orders */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <span className={styles.kpiLabel}>Đang Xử Lý</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className={styles.kpiValue} style={{ color: '#ca8a04' }}>
          {stats.activeOrders}
        </div>
        <div className={styles.kpiSub} style={{ color: '#64748b' }}>
          Đang giao / chờ duyệt
        </div>
      </div>

      {/* Loyalty Points */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <span className={styles.kpiLabel}>Điểm Tích Lũy</span>
          <SparklesIcon size={18} className={styles.kpiIcon} color="#f59e0b" />
        </div>
        <div className={styles.kpiValue} style={{ color: '#d97706' }}>
          {stats.loyaltyPoints}
        </div>
        <div className={styles.kpiSub} style={{ color: '#64748b' }}>
          1 điểm = 10.000đ mua hàng
        </div>
      </div>

      {/* Discount Saved */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <span className={styles.kpiLabel}>Tiết Kiệm Được</span>
          <SparklesIcon size={18} className={styles.kpiIcon} color="#10b981" />
        </div>
        <div className={styles.kpiValue} style={{ color: '#059669' }}>
          {formatPrice(stats.totalDiscountSaved)}
        </div>
        <div className={styles.kpiSub} style={{ color: '#059669' }}>
          Ưu đãi thứ hạng VIP
        </div>
      </div>
    </div>
  );
}
