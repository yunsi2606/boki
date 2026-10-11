'use client';

import React from 'react';
import type { AdminUserDetail } from '@/types/adminUser';
import styles from './userDrawerTabs.module.css';

interface UserDrawerProfileTabProps {
  detail: AdminUserDetail;
  formatDate: (iso?: string) => string;
}

export const UserDrawerProfileTab: React.FC<UserDrawerProfileTabProps> = ({ detail, formatDate }) => {
  return (
    <div className={styles.profileSection}>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Số điện thoại</span>
          <span className={styles.infoVal}>
            {detail.phoneNumber || 'Chưa cung cấp'}
            {detail.phoneNumber && (
              <span className={detail.phoneVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                {detail.phoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
              </span>
            )}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Xác thực Email</span>
          <span className={styles.infoVal}>
            {detail.emailVerified ? 'Đã xác thực email' : 'Chưa xác thực email'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Ngày đăng ký</span>
          <span className={styles.infoVal}>{formatDate(detail.createdAt)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Điểm thưởng tích lũy</span>
          <span className={styles.infoVal}>{detail.loyaltyPoints} Boki Points</span>
        </div>
      </div>

      <h4 className={styles.sectionHeading}>Địa Chỉ Giao Hàng Mặc Định</h4>
      {detail.shippingStreetAddress ? (
        <div className={styles.addressBox}>
          <p className={styles.addressName}>
            <strong>{detail.shippingFullName || detail.displayName}</strong> - {detail.shippingPhone || detail.phoneNumber}
          </p>
          <p className={styles.addressText}>
            {[detail.shippingStreetAddress, detail.shippingWard, detail.shippingDistrict, detail.shippingProvince].filter(Boolean).join(', ')}
          </p>
          {detail.shippingDeliveryNote && (
            <p className={styles.deliveryNote}>Ghi chú: {detail.shippingDeliveryNote}</p>
          )}
        </div>
      ) : (
        <p className={styles.emptyNote}>Người dùng chưa lưu sổ địa chỉ giao hàng.</p>
      )}
    </div>
  );
};
