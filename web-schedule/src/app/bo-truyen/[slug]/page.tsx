'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { ScheduleBookCard } from '@/components/features/schedule/ScheduleBookCard';
import styles from './boTruyen.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function SeriesDetailPage({ params }: Props) {
  const { slug } = use(params);
  const [volumes, setVolumes] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeries() {
      try {
        setLoading(true);
        const data = await scheduleService.getSeriesVolumes(slug);
        setVolumes(data || []);
      } catch (err) {
        console.error('Failed to load series volumes', err);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, [slug]);

  if (loading) {
    return (
      <main className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Đang tải danh sách tập truyện...
        </div>
      </main>
    );
  }

  const seriesName = volumes[0]?.seriesName || 'Bộ truyện';

  return (
    <main className={styles.container}>
      <nav className={styles.breadcrumbRow}>
        <Link href="/" className={styles.breadcrumbLink}>Lịch phát hành</Link>
        <span>/</span>
        <Link href="/bo-truyen" className={styles.breadcrumbLink}>Bộ truyện</Link>
        <span>/</span>
        <span>{seriesName}</span>
      </nav>

      <div className={styles.seriesHeader}>
        <h1 className={styles.seriesTitle}>{seriesName}</h1>
        <p className={styles.seriesMeta}>
          Hiện có <strong>{volumes.length}</strong> tập trong hệ thống lịch phát hành.
        </p>
      </div>

      <div className={styles.volumesGrid}>
        {volumes.map((vol) => (
          <ScheduleBookCard key={vol.id} schedule={vol} />
        ))}
      </div>
    </main>
  );
}
