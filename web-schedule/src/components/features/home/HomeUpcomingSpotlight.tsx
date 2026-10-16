'use client';

import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { ScheduleBookCard } from '../schedule/ScheduleBookCard';
import styles from './homeUpcomingSpotlight.module.css';

interface Props {
  schedules: ReleaseScheduleItem[];
}

export function HomeUpcomingSpotlight({ schedules }: Props) {
  if (!schedules || schedules.length === 0) return null;

  // Take first 6 items
  const displayItems = schedules.slice(0, 6);

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>SẮP LÊN KỆ</div>
          <h2 className={styles.title}>Tập Truyện Sắp Phát Hành</h2>
        </div>
        <Link href="/lich-phat-hanh" className={styles.viewAllLink}>
          <span>Xem toàn bộ lịch phát hành</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
        {displayItems.map((item) => (
          <ScheduleBookCard key={item.id} schedule={item} />
        ))}
      </div>
    </section>
  );
}
