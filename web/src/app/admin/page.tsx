'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { adminService, type AdminStats, type AdminOrder } from '@/services/adminService';
import { adminAnalyticsService } from '@/services/adminAnalyticsService';
import type {
  RevenueTrendsResponse,
  CategoryRevenueShare,
  TopSellingBook,
} from '@/types/adminAnalytics';
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
import RevenueTrendChart from '@/components/features/admin/dashboard/RevenueTrendChart';
import CategoryDistributionChart from '@/components/features/admin/dashboard/CategoryDistributionChart';
import TopSellingBooksCard from '@/components/features/admin/dashboard/TopSellingBooksCard';
import RecentOrdersTable from '@/components/features/admin/dashboard/RecentOrdersTable';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrendsResponse | null>(null);
  const [categoryShare, setCategoryShare] = useState<CategoryRevenueShare[]>([]);
  const [topBooks, setTopBooks] = useState<TopSellingBook[]>([]);
  const [trendDays, setTrendDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [sData, oData, rData, cData, bData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getOrders(),
          adminAnalyticsService.getRevenueTrends(7),
          adminAnalyticsService.getCategoryDistribution(),
          adminAnalyticsService.getTopSellingBooks(5),
        ]);
        setStats(sData);
        setRecentOrders(oData);
        setRevenueTrends(rData);
        setCategoryShare(cData);
        setTopBooks(bData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleDaysChange = useCallback(async (days: number) => {
    setTrendDays(days);
    setLoadingTrends(true);
    try {
      const res = await adminAnalyticsService.getRevenueTrends(days);
      setRevenueTrends(res);
    } catch (err) {
      console.error('Failed to change trend days', err);
    } finally {
      setLoadingTrends(false);
    }
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
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
          <Plus size={16} />
          <span>Thêm Sách Mới</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#FFF0F3', color: '#EE4D2D' }}>
            <BanknotesIcon size={24} color="#EE4D2D" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng doanh thu</span>
            <h3 className={styles.metricValue}>{formatCurrency(stats?.totalRevenue || 0)}</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#EBF8FF', color: '#3182CE' }}>
            <PackageIcon size={24} color="#3182CE" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Tổng đơn hàng</span>
            <h3 className={styles.metricValue}>{stats?.totalOrders} đơn</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <BookOpenIcon size={24} color="#16A34A" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Số lượng sách</span>
            <h3 className={styles.metricValue}>{stats?.totalBooks} đầu sách</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconBox} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <ClockIcon size={24} color="#D97706" />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Sắp hết hàng</span>
            <h3 className={styles.metricValue}>{stats?.lowStockCount} sản phẩm</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className={styles.analyticsGrid}>
        <RevenueTrendChart
          timeline={revenueTrends?.timeline || []}
          totalRevenue={revenueTrends?.totalRevenuePeriod || 0}
          totalOrders={revenueTrends?.totalOrdersPeriod || 0}
          days={trendDays}
          onDaysChange={handleDaysChange}
          isLoading={loadingTrends}
        />
        <CategoryDistributionChart categories={categoryShare} />
      </div>

      {/* Operations Row: Recent Orders Table + Top Books & Quick Actions */}
      <div className={styles.operationsGrid}>
        <RecentOrdersTable orders={recentOrders} />

        <div className={styles.sideColumn}>
          <TopSellingBooksCard books={topBooks} />

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
    </div>
  );
}
