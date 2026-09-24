'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { AuditLogItem } from './AuditLogDetailModal';
import styles from '../chatAnalytics.module.css';

interface AuditLogTableProps {
  logs: AuditLogItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSelectLog: (log: AuditLogItem) => void;
}

export default function AuditLogTable({
  logs,
  loading,
  page,
  totalPages,
  onPageChange,
  onSelectLog,
}: AuditLogTableProps) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: '140px' }}>Thời gian</th>
              <th>Câu hỏi người dùng</th>
              <th>Công cụ (Tools)</th>
              <th style={{ width: '110px' }}>Trạng thái</th>
              <th style={{ width: '90px' }}>Độ trễ</th>
              <th style={{ width: '90px' }}>Phản hồi</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  Đang tải nhật ký hội thoại...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  Chưa có dữ liệu nhật ký hội thoại nào được ghi nhận.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className={styles.clickableRow}
                  onClick={() => onSelectLog(log)}
                >
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748b' }}>
                    #{log.id}
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(log.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 500 }}>{log.userMessage}</span>
                  </td>
                  <td>
                    {log.toolsCalled && log.toolsCalled.length > 0 ? (
                      log.toolsCalled.map((tool, idx) => (
                        <span key={idx} className={`${styles.badge} ${styles.badgeTool}`}>
                          {tool}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td>
                    {log.fallback ? (
                      <span className={`${styles.badge} ${styles.badgeWarning}`}>Fallback</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}>Thành công</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {log.latencyMs} ms
                  </td>
                  <td>
                    {log.feedback === 'LIKE' && (
                      <span title="Người dùng thích phản hồi" style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                        <ThumbsUp size={14} />
                      </span>
                    )}
                    {log.feedback === 'DISLIKE' && (
                      <span title="Người dùng không thích phản hồi" style={{ color: '#dc2626', display: 'flex', alignItems: 'center' }}>
                        <ThumbsDown size={14} />
                      </span>
                    )}
                    {!log.feedback && (
                      <span style={{ color: '#cbd5e1' }}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                      title="Xem chi tiết"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLog(log);
                      }}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.paginationText}>
          Trang {page + 1} / {Math.max(1, totalPages)}
        </div>
        <div className={styles.paginationBtns}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0 || loading}
          >
            <ChevronLeft size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> Trước
          </button>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1 || loading}
          >
            Sau <ChevronRight size={13} style={{ display: 'inline', verticalAlign: '-1px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
