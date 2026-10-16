'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseChangelogItem } from '@/types/schedule';
import styles from './lichSuThayDoi.module.css';

export default function LichSuThayDoiPage() {
  const [changelogs, setChangelogs] = useState<ReleaseChangelogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        // Load recent schedules with changelogs
        const schedules = await scheduleService.getSchedules();
        const logs: ReleaseChangelogItem[] = [];
        schedules.forEach((s) => {
          if (s.changelogs && s.changelogs.length > 0) {
            logs.push(...s.changelogs);
          }
        });
        setChangelogs(logs);
      } catch (err) {
        console.error('Failed to load changelogs', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <main className={styles.container}>
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <h1 className={styles.mainTitle}>Lịch Sử Thay Đổi & Dời Lịch Phát Hành</h1>
        <p className={styles.subtitle}>
          Theo dõi các thông báo chính thức về dời ngày xuất bản, biến động giá bìa hoặc thay đổi quà tặng từ NXB Kim Đồng, Trẻ, IPM...
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Đang tải lịch sử dời lịch...
        </div>
      ) : changelogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-300)' }}>
          <h3>Chưa có ghi nhận dời lịch nào gần đây</h3>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-neutral-500)' }}>
            Toàn bộ các tựa sách hiện tại đang giữ đúng tiến độ phát hành từ các nhà xuất bản.
          </p>
          <Link href="/lich-phat-hanh" style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>
            Quay lại Lịch phát hành
          </Link>
        </div>
      ) : (
        <div className={styles.timeline}>
          {changelogs.map((log, idx) => (
            <div key={log.id || idx} className={styles.timelineCard}>
              <div className={styles.cardHeader}>
                <span className={styles.changeTypeBadge}>
                  {log.changeType === 'DATE_DELAY' ? 'Dời ngày phát hành' : 'Cập nhật thông tin'}
                </span>
                {log.createdAt && (
                  <span className={styles.changeDate}>
                    {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
              <h3 className={styles.cardTitle}>{log.title}</h3>
              {log.reason && <p className={styles.reasonText}>{log.reason}</p>}
              {log.sourceUrl && (
                <a
                  href={log.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceLink}
                >
                  Xem bài viết nguồn từ NXB
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
