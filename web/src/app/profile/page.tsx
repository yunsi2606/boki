'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { customerProfileService } from '@/services/customerProfileService';
import type { CustomerProfileSummary } from '@/types/profile';
import type { User } from '@/types';
import ProfileHeaderCard from '@/components/features/profile/ProfileHeaderCard';
import RankingMembershipCard from '@/components/features/profile/RankingMembershipCard';
import SpendingStatsGrid from '@/components/features/profile/SpendingStatsGrid';
import DefaultShippingAddressCard from '@/components/features/profile/DefaultShippingAddressCard';
import ProfileRecentOrders from '@/components/features/profile/ProfileRecentOrders';
import styles from '@/components/features/profile/profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const [summary, setSummary] = useState<CustomerProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load profile summary data
  const loadProfileSummary = async () => {
    try {
      setLoading(true);
      const data = await customerProfileService.getProfileSummary();
      setSummary(data);
      if (data.user) {
        updateUser(data.user);
      }
    } catch (err: any) {
      console.error('Failed to load profile summary:', err);
      setError(err?.message || 'Không thể tải thông tin hồ sơ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileSummary();
    }
  }, [isAuthenticated]);

  const handleUserUpdated = (updatedUser: User) => {
    updateUser(updatedUser);
    if (summary) {
      setSummary({ ...summary, user: updatedUser });
    }
  };

  if (authLoading || (!isAuthenticated && !error)) {
    return (
      <div className={styles.pageContainer} style={{ textAlign: 'center', padding: '100px 20px' }}>
        <p style={{ color: '#64748b' }}>Đang xác thực tài khoản...</p>
      </div>
    );
  }

  if (loading && !summary) {
    return (
      <div className={styles.pageContainer}>
        {/* Breadcrumb Skeleton */}
        <div style={{ width: '180px', height: '18px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '24px' }} />
        {/* Header Skeleton */}
        <div style={{ height: '140px', background: '#f8fafc', borderRadius: '20px', marginBottom: '32px' }} />
        {/* KPI Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ height: '90px', background: '#f8fafc', borderRadius: '16px' }} />
          <div style={{ height: '90px', background: '#f8fafc', borderRadius: '16px' }} />
          <div style={{ height: '90px', background: '#f8fafc', borderRadius: '16px' }} />
          <div style={{ height: '90px', background: '#f8fafc', borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  const currentUser = summary?.user || user;

  if (!currentUser) {
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Trang chủ
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Hồ sơ cá nhân & Xếp hạng</span>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Header Profile Card */}
      <ProfileHeaderCard
        user={currentUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* Spending Statistics KPI Grid */}
      {summary?.stats && (
        <SpendingStatsGrid stats={summary.stats} />
      )}

      {/* Two-Column Grid: Ranking & Shipping Address */}
      <div className={styles.mainGrid}>
        {/* Left Column: Ranking Membership & Roadmap */}
        {summary?.ranking && (
          <RankingMembershipCard
            ranking={summary.ranking}
            userName={currentUser.displayName}
          />
        )}

        {/* Right Column: Default Shipping Address */}
        <DefaultShippingAddressCard
          user={currentUser}
          onAddressSaved={handleUserUpdated}
        />
      </div>

      {/* Bottom Section: Recent Orders */}
      {summary?.recentOrders && (
        <ProfileRecentOrders orders={summary.recentOrders} />
      )}
    </div>
  );
}
