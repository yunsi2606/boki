'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { HomeHeroSlider } from '@/components/features/home/HomeHeroSlider';
import { HomeNewReleasesGrid } from '@/components/features/home/HomeNewReleasesGrid';
import { HomeReaderReviews } from '@/components/features/home/HomeReaderReviews';
import { GenrePillsBar } from '@/components/features/schedule/GenrePillsBar';
import { HomeVaultCta } from '@/components/features/home/HomeVaultCta';
import styles from './homePortal.module.css';

export default function ScheduleHomePage() {
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleSelectGenre = (genre: string) => {
    if (genre) {
      router.push(`/bo-truyen?genre=${encodeURIComponent(genre)}`);
    }
  };

  return (
    <main className={styles.container}>
      {/* 1. Cinematic Slide Banner for 3 Featured Manga */}
      <HomeHeroSlider items={schedules} />

      {/* 2. Single Unified Section for 15 New Releases (3 rows x 5 columns) */}
      <HomeNewReleasesGrid schedules={schedules} loading={loading} />

      {/* 3. Community Reader & Buyer Reviews */}
      <HomeReaderReviews />

      {/* 4. Quick Genre Exploration */}
      <GenrePillsBar onSelectGenre={handleSelectGenre} />

      {/* 5. Reader Vault CTA */}
      <HomeVaultCta />
    </main>
  );
}
