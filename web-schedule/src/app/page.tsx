'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { HomeHeroSlider } from '@/components/features/home/HomeHeroSlider';
import { HomeNewReleasesGrid } from '@/components/features/home/HomeNewReleasesGrid';
import { HomeMangaComments } from '@/components/features/home/HomeMangaComments';
import { HomeMangaTierList } from '@/components/features/home/HomeMangaTierList';
import { HomeTopWatchlist } from '@/components/features/home/HomeTopWatchlist';
import { HomeCustomRanking } from '@/components/features/home/HomeCustomRanking';
import { HomeReaderReviews } from '@/components/features/home/HomeReaderReviews';
import { GenreMarqueeSlider } from '@/components/features/home/GenreMarqueeSlider';
import { ScheduleCalendarMatrix } from '@/components/features/schedule/ScheduleCalendarMatrix';
import { HomeVaultCta } from '@/components/features/home/HomeVaultCta';
import styles from './homePortal.module.css';

export default function ScheduleHomePage() {
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    async function loadPortalData() {
      try {
        setLoading(true);
        const items = await scheduleService.getSchedules();
        setSchedules(items || []);
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

  return (
    <main className={styles.container}>
      {/* 1. Cinematic Full-bleed Hero Slide Banner */}
      <HomeHeroSlider items={schedules} />

      {/* 2. Asymmetric 2-Column Grid Layout: 1 Wide Main Column + 1 Narrow Sidebar */}
      <div className={styles.twoColLayout}>
        {/* Left Wide Column: New Releases + Real Comments + Tier List */}
        <div className={styles.mainCol}>
          <HomeNewReleasesGrid schedules={schedules} loading={loading} />
          <HomeMangaComments />
          <HomeMangaTierList />
        </div>

        {/* Right Narrow Column: Top 5 Watchlist + Custom Community Ranking + Reader Reviews */}
        <aside className={styles.sideCol} aria-label="Bảng tin cộng đồng & Xếp hạng">
          <HomeTopWatchlist items={schedules} />
          <HomeCustomRanking />
          <HomeReaderReviews />
        </aside>
      </div>

      {/* 3. 2-Row Infinite Horizontal Scrolling Genre Marquee (Standalone Full-width) */}
      <GenreMarqueeSlider />

      {/* 4. Monthly Release Calendar Matrix (Standalone Full-width) */}
      <section className={styles.calendarSection} aria-label="Bản đồ lịch phát hành tháng">
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.kicker}>THEO DÕI THEO NGÀY</div>
            <h2 className={styles.sectionTitle}>
              Lịch Phát Hành Tháng {String(currentMonth).padStart(2, '0')}/{currentYear}
            </h2>
            <div className={styles.releaseBadge}>
              Bản đồ trực quan các ngày phát hành truyện trong tháng
            </div>
          </div>

          <Link href="/lich-phat-hanh" className={styles.fullScheduleLink}>
            <span>Xem chi tiết dòng thời gian</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <ScheduleCalendarMatrix
          year={currentYear}
          month={currentMonth}
          schedules={schedules}
          onSelectDate={handleSelectDateFromCalendar}
        />
      </section>

      {/* 5. Reader Vault CTA (Crisp Light Theme) */}
      <HomeVaultCta />
    </main>
  );
}
