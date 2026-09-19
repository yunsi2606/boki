import React, { useEffect, useState } from 'react';
import type { UserActivity } from '@/types/activity';
import { activityService } from '@/services/activityService';
import styles from './adminActivity.module.css';

interface ActivityDetailModalProps {
  activity: UserActivity | null;
  onClose: () => void;
}

export default function ActivityDetailModal({ activity, onClose }: ActivityDetailModalProps) {
  const [journey, setJourney] = useState<UserActivity[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(false);

  useEffect(() => {
    if (activity && activity.sessionId) {
      setLoadingJourney(true);
      activityService
        .getSessionJourney(activity.sessionId)
        .then(setJourney)
        .catch(() => setJourney([]))
        .finally(() => setLoadingJourney(false));
    }
  }, [activity]);

  if (!activity) return null;

  let prettyJson = '{}';
  try {
    if (activity.metadataJson) {
      const parsed = JSON.parse(activity.metadataJson);
      prettyJson = JSON.stringify(parsed, null, 2);
    }
  } catch {
    prettyJson = activity.metadataJson || '{}';
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔍</span>
            <h3 className={styles.modalTitle}>
              Chi Tiết Sự Kiện: {activity.eventType}
            </h3>
          </div>
          <button type="button" onClick={onClose} className={styles.modalClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Metadata Grid */}
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <div className={styles.metaKey}>ID Sự Kiện</div>
              <div className={styles.metaVal}>{activity.id}</div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaKey}>Thời Gian</div>
              <div className={styles.metaVal}>
                {new Date(activity.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaKey}>Mã Phiên (Session ID)</div>
              <div className={styles.metaVal}>{activity.sessionId}</div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaKey}>Người Dùng (User / Role)</div>
              <div className={styles.metaVal}>
                {activity.userEmail ? `${activity.userEmail} (${activity.userRole || 'USER'})` : 'Khách Vãng Lai (GUEST)'}
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaKey}>Đường Dẫn Trang (Path)</div>
              <div className={styles.metaVal}>{activity.pagePath || '-'}</div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaKey}>Mục Tiêu (Target ID / Name)</div>
              <div className={styles.metaVal}>
                {activity.targetName || activity.targetId || '-'}
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaKey}>Địa Chỉ IP</div>
              <div className={styles.metaVal}>{activity.ipAddress || '127.0.0.1'}</div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaKey}>Thiết Bị & Môi Trường</div>
              <div className={styles.metaVal}>
                {activity.deviceType} • {activity.browser || 'Unknown Browser'} • {activity.os || 'Unknown OS'}
              </div>
            </div>
          </div>

          {/* User Agent */}
          {activity.userAgent && (
            <div>
              <div className={styles.metaKey} style={{ marginBottom: '6px' }}>User Agent String:</div>
              <div style={{ fontSize: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', color: '#475569', wordBreak: 'break-all' }}>
                {activity.userAgent}
              </div>
            </div>
          )}

          {/* Raw Metadata JSON */}
          <div>
            <div className={styles.metaKey} style={{ marginBottom: '6px' }}>Dữ Liệu Mở Rộng (Metadata JSON):</div>
            <pre className={styles.jsonBlock}>{prettyJson}</pre>
          </div>

          {/* Chronological Session Journey */}
          <div>
            <div className={styles.metaKey} style={{ marginBottom: '10px' }}>
              Toàn Bộ Hành Trình Trong Phiên Này ({journey.length} bước):
            </div>
            {loadingJourney ? (
              <div style={{ fontSize: '13px', color: '#64748b' }}>Đang tải hành trình phiên...</div>
            ) : journey.length > 0 ? (
              <div className={styles.journeyTimeline}>
                {journey.map((step) => (
                  <div key={step.id} className={styles.journeyItem}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                      {step.eventType}: {step.targetName || step.pagePath || '-'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(step.createdAt).toLocaleTimeString('vi-VN')} • {step.pagePath}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Chỉ có 1 sự kiện trong phiên.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
