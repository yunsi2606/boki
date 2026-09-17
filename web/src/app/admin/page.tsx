'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService, type AdminStats, type AdminOrder } from '@/services/adminService';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sData, oData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getOrders(),
        ]);
        setStats(sData);
        setRecentOrders(oData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
        return <span className={`${styles.statusBadge} ${styles.badgeDelivered}`}>Đã giao</span>;
      case 'CANCELLED':
        return <span className={`${styles.statusBadge} ${styles.badgeCancelled}`}>Đã hủy</span>;
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu bảng điều khiển...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tổng Quan Bán Hàng</h1>
          <p className={styles.pageSubtitle}>Theo dõi hiệu suất cửa hàng & tình trạng đơn hàng thời gian thực</p>
        </div>
        <Link href="/admin/books" className={styles.primaryActionBtn}>
          + Thêm Sách Mới
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#FFF0F3', color: '#EE4D2D' }}>
            💰
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng doanh thu</span>
            <h3 className={styles.metricValue}>{formatCurrency(stats?.totalRevenue || 0)}</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#EBF8FF', color: '#3182CE' }}>
            📦
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng đơn hàng</span>
            <h3 className={styles.metricValue}>{stats?.totalOrders} đơn</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            📚
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Số lượng sách</span>
            <h3 className={styles.metricValue}>{stats?.totalBooks} đầu sách</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#FFFBEB', color: '#D97706' }}>
            ⚠️
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Sắp hết hàng</span>
            <h3 className={styles.metricValue}>{stats?.lowStockCount} sản phẩm</h3>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className={styles.contentGrid}>
        {/* Recent Orders Section */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3>📦 Đơn Hàng Mới Nhất</h3>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              Xem tất cả &rarr;
            </Link>
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số lượng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord.id}>
                  <td className={styles.orderId}>{ord.id}</td>
                  <td>
                    <div className={styles.customerBox}>
                      <span className={styles.customerName}>{ord.customerName}</span>
                      <span className={styles.customerPhone}>{ord.customerPhone}</span>
                    </div>
                  </td>
                  <td>{ord.itemCount} sản phẩm</td>
                  <td className={styles.orderAmount}>{formatCurrency(ord.totalAmount)}</td>
                  <td>{getStatusBadge(ord.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions & Store Settings */}
        <div className={styles.sideCard}>
          <h3 className={styles.sideCardTitle}>⚡ Thao Tác Nhanh</h3>
          <div className={styles.quickLinks}>
            <Link href="/admin/config" className={styles.quickBtn}>
              🖼️ Đổi Banner Trang Chủ
            </Link>
            <Link href="/admin/vouchers" className={styles.quickBtn}>
              🎟️ Tạo Mã Giảm Giá Mới
            </Link>
            <Link href="/admin/books" className={styles.quickBtn}>
              📊 Kiểm Tra Kho Hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
