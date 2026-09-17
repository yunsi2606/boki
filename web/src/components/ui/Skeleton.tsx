import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = '8px',
  className = '',
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

/* 1. Admin & Data Table Skeleton */
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={20} width={i === 1 ? '30%' : '12%'} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className={styles.tableRow}>
          <Skeleton width={48} height={64} borderRadius={8} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={14} />
          </div>
          <Skeleton width="15%" height={16} />
          <Skeleton width="12%" height={24} borderRadius={20} />
          <Skeleton width="15%" height={20} />
          <Skeleton width="10%" height={28} borderRadius={8} />
        </div>
      ))}
    </div>
  );
}

/* 2. Book Card Grid Skeleton */
export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.bookCard}>
          <div className={styles.skeleton} style={{ width: '100%', paddingBottom: '133%', borderRadius: '12px' }} />
          <Skeleton width="40%" height={14} borderRadius={12} />
          <Skeleton width="85%" height={18} />
          <Skeleton width="60%" height={14} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <Skeleton width="45%" height={22} />
            <Skeleton width="30%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* 3. Book Detail Page Skeleton */
export function BookDetailSkeleton() {
  return (
    <div className={styles.detailContainer}>
      <Skeleton width={160} height={20} style={{ marginBottom: 24 }} />
      <div className={styles.detailLayout}>
        <div>
          <div className={styles.skeleton} style={{ width: '100%', paddingBottom: '133%', borderRadius: '16px' }} />
        </div>
        <div className={styles.detailInfo}>
          <Skeleton width={110} height={24} borderRadius={20} />
          <Skeleton width="80%" height={32} />
          <Skeleton width="40%" height={18} />
          <Skeleton width="50%" height={20} />
          <div className={styles.skeleton} style={{ width: '100%', height: 110, borderRadius: 16 }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <Skeleton width="45%" height={48} borderRadius={12} />
            <Skeleton width="55%" height={48} borderRadius={12} />
          </div>
          <Skeleton width="100%" height={140} borderRadius={16} />
        </div>
      </div>
    </div>
  );
}

/* 4. Order History Skeleton */
export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.ordersList}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.orderCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <Skeleton width="35%" height={18} />
            <Skeleton width="20%" height={24} borderRadius={8} />
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Skeleton width={56} height={76} borderRadius={8} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton width="65%" height={18} />
              <Skeleton width="30%" height={14} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: 16, borderRadius: 12 }}>
            <Skeleton width="50%" height={16} />
            <Skeleton width="25%" height={22} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* 5. Vouchers Grid Skeleton */
export function VoucherGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.vouchersGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.voucherCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="30%" height={22} borderRadius={16} />
            <Skeleton width="25%" height={24} borderRadius={8} />
          </div>
          <Skeleton width="85%" height={20} />
          <Skeleton width="95%" height={14} />
          <Skeleton width="100%" height={8} borderRadius={10} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="30%" height={16} />
            <Skeleton width="25%" height={28} borderRadius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}
