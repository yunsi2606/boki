'use client';

import { useEffect, useState } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseChangelogItem } from '@/types/schedule';
import styles from './lichSuThayDoi.module.css';

export default function ChangelogFeedPage() {
  const [changelogs, setChangelogs] = useState<ReleaseChangelogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChangelogs() {
      try {
        setLoading(true);
        const data = await scheduleService.getSchedules();
        const logs: ReleaseChangelogItem[] = [];
        data?.forEach((s) => {
          if (s.changelogs) {
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
    loadChangelogs();
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lịch Sử Thay Đổi & Dời Lịch Phát Hành</h1>
        <p className={styles.subtitle}>
          Thông báo chính thức cập nhật ngày dời lịch, bổ sung quà tặng hoặc biến động giá từ các NXB.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Đang tải lịch sử thay đổi...
        </div>
      ) : changelogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 10, border: '1px solid var(--color-neutral-300)' }}>
          Hiện chưa có thông báo dời lịch nào.
        </div>
      ) : (
        <div className={styles.feed}>
          {changelogs.map((item, idx) => (
            <div key={item.id || idx} className={styles.feedCard}>
              <div className={styles.feedTitle}>{item.title}</div>
              {item.reason && <div className={styles.feedReason}>{item.reason}</div>}
              {item.createdAt && (
                <div className={styles.feedMeta}>
                  Thời gian: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
