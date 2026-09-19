import React from 'react';
import type { UserActivity } from '@/types/activity';
import { EyeIcon } from '@/components/ui/LineIcons';
import styles from './adminActivity.module.css';

interface ActivityTableProps {
  activities: UserActivity[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onSelectActivity: (activity: UserActivity) => void;
}

export default function ActivityTable({
  activities,
  totalElements,
  totalPages,
  currentPage,
  loading,
  onPageChange,
  onSelectActivity,
}: ActivityTableProps) {
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
    } catch {
      return ts;
    }
  };

  const getBadgeClass = (category: string) => {
    switch (category) {
      case 'NAVIGATION': return styles.badgeNavigation;
      case 'ENGAGEMENT': return styles.badgeEngagement;
      case 'ECOMMERCE': return styles.badgeEcommerce;
      case 'AUTH': return styles.badgeAuth;
      case 'ADMIN': return styles.badgeAdmin;
      default: return styles.badgeNavigation;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thời Gian</th>
              <th>Loại Sự Kiện</th>
              <th>Trang / Mục Tiêu</th>
              <th>Người Dùng / Phiên</th>
              <th>Thiết Bị</th>
              <th>Địa Chỉ IP</th>
              <th>Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Đang tải danh sách nhật ký hành vi...
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Không tìm thấy hoạt động nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              activities.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b' }}>
                    {formatTime(a.createdAt)}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getBadgeClass(a.eventCategory)}`}>
                      {a.eventType}
                    </span>
                  </td>
                  <td>
                    <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: '#0f172a' }}>{a.targetName || a.pageTitle || a.pagePath || '-'}</strong>
                      {a.pagePath && (
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.pagePath}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    {a.userEmail ? (
                      <span style={{ fontWeight: 600, color: '#1e40af' }}>{a.userEmail}</span>
                    ) : (
                      <span className={styles.userBadge} title={a.sessionId}>
                        Khách ({a.sessionId.slice(0, 10)}...)
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>
                    <span>{a.deviceType} • {a.browser || 'Unknown'}</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.os || 'Unknown OS'}</div>
                  </td>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>
                    {a.ipAddress || '127.0.0.1'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.viewBtn}
                      onClick={() => onSelectActivity(a)}
                      title="Xem toàn bộ metadata"
                    >
                      <EyeIcon size={14} color="#0284c7" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Hiển thị <strong>{activities.length}</strong> trên tổng số <strong>{totalElements.toLocaleString('vi-VN')}</strong> sự kiện
        </span>

        <div className={styles.pageButtons}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage <= 0 || loading}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &larr; Trang trước
          </button>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 8px', fontSize: '13px', color: '#475569' }}>
            Trang {currentPage + 1} / {Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage >= totalPages - 1 || loading}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Trang sau &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
