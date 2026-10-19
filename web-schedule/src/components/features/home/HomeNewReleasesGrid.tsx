'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { scheduleService } from '@/services/scheduleService';
import { ScheduleBookCard } from '@/components/features/schedule/ScheduleBookCard';
import { HomeGridSkeleton } from '@/components/features/schedule/ScheduleSkeleton';
import styles from './homeNewReleasesGrid.module.css';

type FeaturedTab = 'SMART' | 'UPCOMING' | 'RECENTLY_ADDED' | 'SPECIAL';

interface Props {
  totalCount?: number;
  schedules?: ReleaseScheduleItem[];
}

const TABS_CONFIG: Array<{ id: FeaturedTab; label: string }> = [
  { id: 'SMART', label: 'Đề xuất thông minh' },
  { id: 'UPCOMING', label: 'Sắp ra mắt' },
  { id: 'RECENTLY_ADDED', label: 'Vừa lên lịch' },
  { id: 'SPECIAL', label: 'Bản đặc biệt' },
];

export function HomeNewReleasesGrid({ totalCount, schedules }: Props) {
  const [activeTab, setActiveTab] = useState<FeaturedTab>('SMART');
  const [items, setItems] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchFeatured() {
      try {
        setLoading(true);
        const data = await scheduleService.getFeaturedSchedules(activeTab, 15);
        if (!isCancelled) {
          setItems(data || []);
        }
      } catch (err) {
        console.error('Failed to load featured schedules', err);
        if (!isCancelled) {
          setItems([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchFeatured();

    return () => {
      isCancelled = true;
    };
  }, [activeTab]);

  const countDisplay = totalCount ?? schedules?.length ?? 0;

  return (
    <section className={styles.sectionContainer} aria-label="Truyện mới phát hành">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.kicker}>XUẤT BẢN MỚI & SẮP RA MẮT</span>
          <h2 className={styles.sectionTitle}>Truyện Mới Cập Nhật</h2>
          <p className={styles.sectionSubtitle}>
            Tổng hợp 15 ấn bản truyện tranh & light novel nổi bật nhất vừa lên lịch phát hành
          </p>

          <div className={styles.filterTabsRow} role="tablist" aria-label="Bộ lọc truyện mới">
            {TABS_CONFIG.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`${styles.filterTabBtn} ${activeTab === tab.id ? styles.filterTabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Link href="/lich-phat-hanh" className={styles.viewAllLink}>
          <span>Xem trọn vẹn lịch tháng</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <HomeGridSkeleton count={15} />
      ) : items.length === 0 ? (
        <div className={styles.emptyBox}>Chưa có dữ liệu truyện cho mục này.</div>
      ) : (
        <div className={styles.booksGrid}>
          {items.map((schedule) => (
            <ScheduleBookCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}

      {/* Bottom Navigation CTA */}
      <div className={styles.bottomCtaRow}>
        <Link href="/lich-phat-hanh" className={styles.bottomCtaBtn}>
          Khám phá toàn bộ {countDisplay > 0 ? `${countDisplay}+` : ''} lịch phát hành tháng này
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
