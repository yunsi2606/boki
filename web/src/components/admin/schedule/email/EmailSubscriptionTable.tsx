'use client';

import React from 'react';
import type { SubscriptionItem } from '@/services/adminScheduleEmailService';
import styles from './emailSubscriptionTable.module.css';

interface Props {
  items: SubscriptionItem[];
  totalElements: number;
}

export function EmailSubscriptionTable({ items, totalElements }: Props) {
  const renderTypeLabel = (type: string) => {
    switch (type) {
      case 'SERIES':
        return 'Tác phẩm (Series)';
      case 'VOLUME':
        return 'Tập truyện (Volume)';
      case 'DELAY_ALERT':
        return 'Báo hoãn/đổi lịch';
      case 'WEEKLY_DIGEST':
        return 'Bản tin tuần';
      default:
        return type;
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef', fontSize: 13, color: '#495057' }}>
        Tổng số bản ghi đăng ký: <strong>{totalElements}</strong>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Địa chỉ Email</th>
              <th>Loại đăng ký</th>
              <th>Mục theo dõi</th>
              <th>Trạng thái</th>
              <th>Ngày đăng ký</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyBox}>
                  Chưa có người dùng nào đăng ký nhận thông báo.
                </td>
              </tr>
            ) : (
              items.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <strong>{sub.email}</strong>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>{renderTypeLabel(sub.subscriptionType)}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {sub.targetName || sub.targetId || 'Toàn sàn'}
                    </div>
                    {sub.targetId && (
                      <div style={{ fontSize: 11, color: '#868e96' }}>ID: {sub.targetId}</div>
                    )}
                  </td>
                  <td>
                    {sub.active ? (
                      <span className={styles.activeBadge}>Đang hoạt động</span>
                    ) : (
                      <span className={styles.inactiveBadge}>Đã hủy</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: '#6c757d' }}>
                    {new Date(sub.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
