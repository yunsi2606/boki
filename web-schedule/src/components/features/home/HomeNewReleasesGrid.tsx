'use client';

import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { ScheduleBookCard } from '@/components/features/schedule/ScheduleBookCard';
import { HomeGridSkeleton } from '@/components/features/schedule/ScheduleSkeleton';
import styles from './homeNewReleasesGrid.module.css';

interface Props {
  schedules: ReleaseScheduleItem[];
  loading?: boolean;
}

export function HomeNewReleasesGrid({ schedules, loading }: Props) {
  // Take exactly 15 newest release items (3 rows x 5 columns)
  const newReleases = schedules && schedules.length > 0 ? schedules.slice(0, 15) : [];

  return (
    <section className={styles.sectionContainer} aria-label="Truyện mới phát hành">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.kicker}>XUẤT BẢN MỚI & SẮP RA MẮT</span>
          <h2 className={styles.sectionTitle}>Truyện Mới Cập Nhật</h2>
          <p className={styles.sectionSubtitle}>
            Tổng hợp 15 ấn bản truyện tranh & light novel nổi bật nhất vừa lên lịch phát hành
          </p>
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
      ) : newReleases.length === 0 ? (
        <div className={styles.emptyBox}>Chưa có dữ liệu truyện mới.</div>
      ) : (
        <div className={styles.booksGrid}>
          {newReleases.map((schedule) => (
            <ScheduleBookCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}

      {/* Bottom Navigation CTA */}
      <div className={styles.bottomCtaRow}>
        <Link href="/lich-phat-hanh" className={styles.bottomCtaBtn}>
          Khám phá toàn bộ {schedules.length > 0 ? `${schedules.length}+` : ''} lịch phát hành tháng này
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
