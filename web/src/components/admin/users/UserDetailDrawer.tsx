'use client';

import React, { useState, useEffect } from 'react';
import type { AdminUserDetail } from '@/types/adminUser';
import { adminUserService } from '@/services/adminUserService';
import { UserSmartBadge } from './UserSmartBadge';
import { UserDrawerProfileTab } from './UserDrawerProfileTab';
import styles from './userDetailDrawer.module.css';
import tabStyles from './userDrawerTabs.module.css';

interface UserDetailDrawerProps {
  userId: string | null;
  onClose: () => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ userId, onClose }) => {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'rbac' | 'activities'>('profile');

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    adminUserService.getUserDetail(userId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => console.error('Failed to load user detail:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  if (!userId) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div className={styles.headerTitleBox}>
            <h2>Hồ Sơ Người Dùng 360°</h2>
            <span className={styles.userIdText}>ID: {userId}</span>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading || !detail ? (
          <div className={styles.drawerLoading}>
            <div className={styles.spinner} />
            <p>Đang tải dữ liệu hồ sơ 360°...</p>
          </div>
        ) : (
          <div className={styles.drawerBody}>
            <div className={styles.identityBanner}>
              <div className={styles.avatarLarge}>
                {detail.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={detail.avatarUrl} alt={detail.displayName} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarInitialLarge}>
                    {(detail.displayName || detail.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.identityDetails}>
                <h3 className={styles.detailName}>{detail.displayName || 'Khách hàng'}</h3>
                <span className={styles.detailEmail}>{detail.email}</span>
                <div className={styles.identityTags}>
                  <UserSmartBadge type="tier" value={detail.memberTier} />
                  <span className={`${styles.statusPill} ${detail.active ? styles.pillActive : styles.pillBlocked}`}>
                    {detail.active ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                  {detail.smartTags?.map((tag) => (
                    <UserSmartBadge key={tag} type="tag" value={tag} />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tabNav}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Tổng quan & Địa chỉ
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Đơn hàng ({detail.totalOrders})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'rbac' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('rbac')}
              >
                Quyền hạn ({detail.permissionCodes.length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'activities' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('activities')}
              >
                Hành vi gần đây
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'profile' && (
                <UserDrawerProfileTab detail={detail} formatDate={formatDate} />
              )}

              {activeTab === 'orders' && (
                <div className={tabStyles.ordersSection}>
                  <div className={tabStyles.orderStatsGrid}>
                    <div className={tabStyles.orderStatCard}>
                      <span className={tabStyles.orderStatNum}>{detail.totalOrders}</span>
                      <span className={tabStyles.orderStatLbl}>Tổng đơn đã đặt</span>
                    </div>
                    <div className={tabStyles.orderStatCard}>
                      <span className={tabStyles.orderStatNum} style={{ color: '#059669' }}>{detail.completedOrders}</span>
                      <span className={tabStyles.orderStatLbl}>Đơn giao thành công</span>
                    </div>
                    <div className={tabStyles.orderStatCard}>
                      <span className={tabStyles.orderStatNum} style={{ color: '#DC2626' }}>{detail.cancelledOrders}</span>
                      <span className={tabStyles.orderStatLbl}>Đơn đã hủy</span>
                    </div>
                    <div className={tabStyles.orderStatCard}>
                      <span className={tabStyles.orderStatNum} style={{ color: 'var(--color-primary-500)' }}>
                        {formatCurrency(detail.totalSpent)}
                      </span>
                      <span className={tabStyles.orderStatLbl}>Tổng doanh số tích lũy</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rbac' && (
                <div className={tabStyles.rbacSection}>
                  <h4 className={tabStyles.sectionHeading}>Vai Trò Đang Sở Hữu</h4>
                  <div className={tabStyles.roleChips}>
                    {detail.roleCodes.map((r) => (
                      <UserSmartBadge key={r} type="role" value={r} />
                    ))}
                  </div>

                  <h4 className={tabStyles.sectionHeading} style={{ marginTop: '1.25rem' }}>
                    Quyền Hạn Hạt Nhân Được Cấp ({detail.permissionCodes.length})
                  </h4>
                  <div className={tabStyles.permissionChips}>
                    {detail.permissionCodes.map((p) => (
                      <span key={p} className={tabStyles.permChip}>{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'activities' && (
                <div className={tabStyles.activitiesSection}>
                  {detail.recentActivities && detail.recentActivities.length > 0 ? (
                    <div className={tabStyles.activityTimeline}>
                      {detail.recentActivities.map((act, i) => (
                        <div key={i} className={tabStyles.timelineItem}>
                          <div className={tabStyles.timelineDot} />
                          <div className={tabStyles.timelineBody}>
                            <span className={tabStyles.activityType}>{act.actionType}</span>
                            <p className={tabStyles.activityDesc}>{act.description}</p>
                            <span className={tabStyles.activityTime}>{formatDate(act.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={tabStyles.emptyNote}>Chưa có lịch sử hoạt động ghi nhận.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
