'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { HomeHeroSearch } from '@/components/features/home/HomeHeroSearch';
import { HomeFeaturedSeries } from '@/components/features/home/HomeFeaturedSeries';
import { ScheduleCalendarMatrix } from '@/components/features/schedule/ScheduleCalendarMatrix';
import { GenrePillsBar } from '@/components/features/schedule/GenrePillsBar';
import { HomeUpcomingSpotlight } from '@/components/features/home/HomeUpcomingSpotlight';
import { HomeVaultCta } from '@/components/features/home/HomeVaultCta';
import styles from './homePortal.module.css';

interface SeriesSummary {
  seriesSlug: string;
  seriesName: string;
  totalVolumes: number;
  sampleCover?: string;
}

export default function ScheduleHomePage() {
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    async function loadPortalData() {
      try {
        setLoading(true);
        const [items, series] = await Promise.all([
          scheduleService.getSchedules(),
          scheduleService.getSeriesSummaries().catch(() => []),
        ]);
        setSchedules(items || []);
        setSeriesList(series || []);
      } catch (err) {
        console.error('Failed to load portal home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadPortalData();
  }, []);

  const handleSelectDateFromCalendar = (dateStr: string) => {
    router.push(`/lich-phat-hanh#date-${dateStr}`);
  };

  const handleSelectGenre = (genre: string) => {
    if (genre) {
      router.push(`/bo-truyen?genre=${encodeURIComponent(genre)}`);
    }
  };

  return (
    <main className={styles.container}>
      {/* 1. Hero Search */}
      <HomeHeroSearch
        totalSchedules={schedules.length}
        totalSeries={seriesList.length}
      />

      {/* 2. Featured Series */}
      {seriesList.length > 0 && (
        <HomeFeaturedSeries series={seriesList} />
      )}

      {/* 3. Monthly Release Calendar Spotlight */}
      <section className={styles.calendarSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.kicker}>LỊCH XUẤT BẢN THÁNG {currentMonth}/{currentYear}</div>
            <h2 className={styles.sectionTitle}>Lịch Phát Hành Manga & Sách</h2>
            <div className={styles.releaseBadge}>
              {schedules.length} TẬP TRUYỆN ĐÃ LÊN LỊCH
            </div>
          </div>
          <Link href="/lich-phat-hanh" className={styles.fullScheduleLink}>
            <span>Xem toàn bộ lịch phát hành</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className={styles.emptyBox}>Đang tải lịch phát hành tháng này...</div>
        ) : (
          <ScheduleCalendarMatrix
            year={currentYear}
            month={currentMonth}
            schedules={schedules}
            onSelectDate={handleSelectDateFromCalendar}
          />
        )}
      </section>

      {/* 4. Popular Genres */}
      <GenrePillsBar onSelectGenre={handleSelectGenre} />

      {/* 5. Upcoming Releases Spotlight */}
      {schedules.length > 0 && (
        <HomeUpcomingSpotlight schedules={schedules} />
      )}

      {/* 6. Vault CTA */}
      <HomeVaultCta />
    </main>
  );
}
