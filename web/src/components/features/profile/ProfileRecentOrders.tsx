'use client';

import React from 'react';
import Link from 'next/link';
import type { Order } from '@/types';
import { PackageIcon, ChevronRightIcon } from '@/components/ui/LineIcons';
import styles from './profile.module.css';

interface ProfileRecentOrdersProps {
  orders: Order[];
}

export default function ProfileRecentOrders({ orders }: ProfileRecentOrdersProps) {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'SHIPPED':
        return 'Đang vận chuyển';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'RETURNED':
        return 'Hoàn hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className={styles.recentOrdersWrapper}>
      <div className={styles.cardSectionHeader}>
        <h2 className={styles.cardSectionTitle}>
          <PackageIcon size={22} color="#ff4d4f" />
          <span>Đơn Hàng Gần Đây</span>
        </h2>

        <Link href="/orders/history" className={styles.viewAllOrdersBtn}>
          <span>Xem tất cả đơn hàng</span>
          <ChevronRightIcon size={16} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <PackageIcon size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <p>Bạn chưa đặt đơn hàng nào tại Boki Store.</p>
          <Link href="/books" style={{ color: '#ff4d4f', fontWeight: 600, textDecoration: 'underline' }}>
            Khám phá sách ngay &rarr;
          </Link>
        </div>
      ) : (
        <div className={styles.orderTableWrapper}>
          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Ngày Đặt</th>
                <th>Sản Phẩm</th>
                <th>Phương Thức</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <span className={styles.orderIdBadge}>
                      #{ord.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {formatDate(ord.createdAt)}
                  </td>
                  <td>
                    {ord.items?.length || 1} cuốn sách
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      {ord.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    {formatPrice(ord.totalAmount)}
                  </td>
                  <td>
                    <span className={`${styles.orderStatusBadge} ${styles[`status_${ord.status}`] || styles.status_PENDING}`}>
                      {getStatusLabel(ord.status)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/orders/history`}
                      style={{ color: '#2563eb', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                    >
                      Xem &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
