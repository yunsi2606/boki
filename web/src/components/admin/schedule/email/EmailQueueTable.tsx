'use client';

import React, { useState } from 'react';
import type { EmailJobItem } from '@/services/adminScheduleEmailService';
import { adminScheduleEmailService } from '@/services/adminScheduleEmailService';
import styles from './emailQueueTable.module.css';

interface Props {
  jobs: EmailJobItem[];
  statusFilter: string;
  typeFilter: string;
  onChangeStatusFilter: (st: string) => void;
  onChangeTypeFilter: (tp: string) => void;
  onRefresh: () => void;
}

export function EmailQueueTable({
  jobs,
  statusFilter,
  typeFilter,
  onChangeStatusFilter,
  onChangeTypeFilter,
  onRefresh,
}: Props) {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

  const handleRetry = async (jobId: string) => {
    try {
      setRetryingId(jobId);
      await adminScheduleEmailService.retryJob(jobId);
      onRefresh();
    } catch (err: any) {
      alert('Không thể thử lại job: ' + (err.message || 'Lỗi server'));
    } finally {
      setRetryingId(null);
    }
  };

  const renderBadge = (st: string) => {
    switch (st) {
      case 'PENDING':
        return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ gửi</span>;
      case 'SENDING':
        return <span className={`${styles.badge} ${styles.badgeSending}`}>Đang gửi...</span>;
      case 'SENT':
        return <span className={`${styles.badge} ${styles.badgeSent}`}>Thành công</span>;
      case 'FAILED':
        return <span className={`${styles.badge} ${styles.badgeFailed}`}>Lỗi</span>;
      case 'BOUNCED':
        return <span className={`${styles.badge} ${styles.badgeBounced}`}>Bounced</span>;
      default:
        return <span className={styles.badge}>{st}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => onChangeStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ gửi (PENDING)</option>
            <option value="SENDING">Đang gửi (SENDING)</option>
            <option value="SENT">Đã gửi (SENT)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
            <option value="BOUNCED">Bị trả về (BOUNCED)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => onChangeTypeFilter(e.target.value)}
            className={styles.select}
          >
            <option value="ALL">Tất cả loại thông báo</option>
            <option value="RELEASE_ALERT">Lịch phát hành tập mới</option>
            <option value="DELAY_ALERT">Hoãn / Đổi ngày lịch</option>
            <option value="ADMIN_BROADCAST">Tin thông báo Admin</option>
          </select>
        </div>

        <button type="button" onClick={onRefresh} className={styles.refreshBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          <span>Làm mới danh sách</span>
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Người nhận</th>
              <th>Tiêu đề & Loại</th>
              <th>Trạng thái</th>
              <th>Thử lại</th>
              <th>Thời gian tạo / gửi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyBox}>
                  Không có email nào trong hàng đợi phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <React.Fragment key={job.id}>
                  <tr>
                    <td>
                      <strong>{job.recipientEmail}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{job.subject}</div>
                      <div style={{ fontSize: 11, color: '#868e96' }}>{job.emailType}</div>
                    </td>
                    <td>{renderBadge(job.status)}</td>
                    <td>
                      {job.retryCount} / {job.maxRetries}
                    </td>
                    <td style={{ fontSize: 12, color: '#495057' }}>
                      <div>Tạo: {new Date(job.createdAt).toLocaleString('vi-VN')}</div>
                      {job.sentAt && <div>Gửi: {new Date(job.sentAt).toLocaleString('vi-VN')}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(job.status === 'FAILED' || job.status === 'BOUNCED') && (
                          <button
                            type="button"
                            onClick={() => handleRetry(job.id)}
                            disabled={retryingId === job.id}
                            className={styles.retryBtn}
                          >
                            {retryingId === job.id ? 'Đang thử...' : 'Gửi lại'}
                          </button>
                        )}
                        {job.errorMessage && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedErrorId(expandedErrorId === job.id ? null : job.id)
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#868e96',
                              cursor: 'pointer',
                              fontSize: 12,
                              textDecoration: 'underline',
                            }}
                          >
                            {expandedErrorId === job.id ? 'Ẩn lỗi' : 'Xem lỗi'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedErrorId === job.id && job.errorMessage && (
                    <tr>
                      <td colSpan={6} className={styles.errorRow}>
                        <strong>Chi tiết lỗi SMTP:</strong> {job.errorMessage}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
