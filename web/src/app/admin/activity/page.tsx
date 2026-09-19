'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type {
  UserActivity,
  ActivityAnalytics,
  ActivityFilterParams,
  PaginatedActivitiesResponse,
} from '@/types/activity';
import { activityService } from '@/services/activityService';
import ActivityStatCards from '@/components/features/admin/activity/ActivityStatCards';
import ActivityFunnelCard from '@/components/features/admin/activity/ActivityFunnelCard';
import ActivityFilterBar from '@/components/features/admin/activity/ActivityFilterBar';
import ActivityTable from '@/components/features/admin/activity/ActivityTable';
import ActivityDetailModal from '@/components/features/admin/activity/ActivityDetailModal';
import { ActivityIcon } from '@/components/ui/LineIcons';
import styles from '@/components/features/admin/activity/adminActivity.module.css';

export default function AdminActivityPage() {
  const [analytics, setAnalytics] = useState<ActivityAnalytics | null>(null);
  const [activitiesData, setActivitiesData] = useState<PaginatedActivitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);

  const [filters, setFilters] = useState<ActivityFilterParams>({
    eventType: 'ALL',
    eventCategory: 'ALL',
    search: '',
    page: 0,
    size: 20,
  });

  const loadAnalytics = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await activityService.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.warn('Failed to load activity analytics:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityService.getActivities(filters);
      setActivitiesData(res);
    } catch (err) {
      console.warn('Failed to load activities list:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleFilterChange = (updated: Partial<ActivityFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      eventType: 'ALL',
      eventCategory: 'ALL',
      search: '',
      page: 0,
      size: 20,
    });
  };

  const handleRefreshAll = () => {
    loadAnalytics();
    loadActivities();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ActivityIcon size={24} color="#2563eb" />
            <span>Theo Dõi Hành Vi & Nhật Ký Kiểm Toán</span>
          </h1>
          <p className={styles.subtitle}>
            Giám sát thời gian thực toàn bộ hành trình người dùng, phễu chuyển đổi và lịch sử kiểm toán hệ thống.
          </p>
        </div>

        <button type="button" onClick={handleRefreshAll} className={styles.refreshBtn}>
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <ActivityStatCards analytics={analytics} loading={loadingStats} />

      {/* Conversion Funnel & Top Trends */}
      <ActivityFunnelCard analytics={analytics} />

      {/* Filter Bar */}
      <ActivityFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Activity Timeline Table */}
      <ActivityTable
        activities={activitiesData?.content || []}
        totalElements={activitiesData?.totalElements || 0}
        totalPages={activitiesData?.totalPages || 0}
        currentPage={filters.page || 0}
        loading={loading}
        onPageChange={(page) => handleFilterChange({ page })}
        onSelectActivity={(activity) => setSelectedActivity(activity)}
      />

      {/* Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}
