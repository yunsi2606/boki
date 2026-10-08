'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { AdminOrder } from '@/services/adminService';
import styles from './recentOrdersTable.module.css';

interface RecentOrdersTableProps {
  orders: AdminOrder[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getStatusBadge = (status: AdminOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className={`${styles.statusBadge} ${styles.badgePending}`}>Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className={`${styles.statusBadge} ${styles.badgeConfirmed}`}>Đã xác nhận</span>;
      case 'SHIPPED':
        return <span className={`${styles.statusBadge} ${styles.badgeShipped}`}>Đang giao</span>;
      case 'DELIVERED':
        return <span className={`${styles.statusBadge} ${styles.badgeDelivered}`}>Hoàn thành</span>;
      case 'CANCELLED':
        return <span className={`${styles.statusBadge} ${styles.badgeCancelled}`}>Đã hủy</span>;
    }
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <h2 className={styles.sectionTitle}>Đơn Hàng Gần Đây</h2>
        <Link href="/admin/orders" className={styles.viewAllLink}>
          <span>Xem tất cả đơn</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Ngày Tạo</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((order) => (
              <tr key={order.id}>
                <td className={styles.orderIdCell}>#{order.id.slice(0, 8)}</td>
                <td>{order.buyerId?.slice(0, 8) || 'Khách vãng lai'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className={styles.amountCell}>{formatCurrency(order.totalAmount)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <Link href={`/admin/orders?highlight=${order.id}`} className={styles.actionBtn}>
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  Chưa có đơn hàng nào phát sinh
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
