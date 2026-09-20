'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService, type AdminStats, type AdminOrder } from '@/services/adminService';
import {
  BanknotesIcon,
  PackageIcon,
  BookOpenIcon,
  BoltIcon,
  LayoutTemplateIcon,
  TicketIcon,
  BarChartIcon,
  ClockIcon,
} from '@/components/ui/LineIcons';
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
          <div className={styles.metricIconBox} style={{ background: '#FFF0F3', color: '#EE4D2D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BanknotesIcon size={24} color="#EE4D2D" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng doanh thu</span>
            <h3 className={styles.metricValue}>{formatCurrency(stats?.totalRevenue || 0)}</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#EBF8FF', color: '#3182CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageIcon size={24} color="#3182CE" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng đơn hàng</span>
            <h3 className={styles.metricValue}>{stats?.totalOrders} đơn</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpenIcon size={24} color="#16A34A" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Số lượng sách</span>
            <h3 className={styles.metricValue}>{stats?.totalBooks} đầu sách</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClockIcon size={24} color="#D97706" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Sắp hết hàng</span>
            <h3 className={styles.metricValue}>{stats?.lowStockCount} sản phẩm</h3>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className={styles.contentGrid}>
        {/* Recent Orders Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.sectionTitle}>Đơn Hàng Gần Đây</h2>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              Xem tất cả đơn ➔
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
                {recentOrders.slice(0, 5).map((order) => (
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
                {recentOrders.length === 0 && (
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

        {/* Quick Actions & Store Settings */}
        <div className={styles.sideCard}>
          <h3 className={styles.sideCardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BoltIcon size={18} color="#f59e0b" />
            <span>Thao Tác Nhanh</span>
          </h3>
          <div className={styles.quickLinks}>
            <Link href="/admin/config" className={styles.quickBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutTemplateIcon size={16} color="#475569" />
              <span>Đổi Banner Trang Chủ</span>
            </Link>
            <Link href="/admin/vouchers" className={styles.quickBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TicketIcon size={16} color="#475569" />
              <span>Tạo Mã Giảm Giá Mới</span>
            </Link>
            <Link href="/admin/books" className={styles.quickBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChartIcon size={16} color="#475569" />
              <span>Kiểm Tra Kho Hàng</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
