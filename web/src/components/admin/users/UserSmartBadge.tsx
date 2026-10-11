'use client';

import React from 'react';
import styles from './userBadges.module.css';

interface UserSmartBadgeProps {
  type: 'tier' | 'tag' | 'role';
  value: string;
  color?: string;
}

export const UserSmartBadge: React.FC<UserSmartBadgeProps> = ({ type, value, color }) => {
  if (type === 'tier') {
    const tier = value.toUpperCase();
    return (
      <span className={`${styles.tierBadge} ${styles['tier' + tier] || styles.tierSTANDARD}`}>
        {tier}
      </span>
    );
  }

  if (type === 'role') {
    return (
      <span
        className={styles.roleBadge}
        style={{
          backgroundColor: color ? `${color}18` : 'rgba(238, 77, 45, 0.1)',
          color: color || '#EE4D2D',
          borderColor: color ? `${color}40` : 'rgba(238, 77, 45, 0.25)',
        }}
      >
        {value}
      </span>
    );
  }

  // Smart tag rendering
  const getTagInfo = (tag: string) => {
    switch (tag) {
      case 'VIP':
        return { label: 'Khách VIP', className: styles.tagVip };
      case 'RISK_CANCEL':
        return { label: 'Tỷ Lệ Hủy Cao', className: styles.tagRisk };
      case 'NEW_USER':
        return { label: 'Mới Đăng Ký', className: styles.tagNew };
      case 'UNVERIFIED_PHONE':
        return { label: 'Chưa Xác Thực SĐT', className: styles.tagUnverified };
      default:
        return { label: tag, className: styles.tagDefault };
    }
  };

  const info = getTagInfo(value);
  return <span className={`${styles.smartTag} ${info.className}`}>{info.label}</span>;
};
