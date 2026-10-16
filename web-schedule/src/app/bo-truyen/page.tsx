'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import styles from './boTruyenList.module.css';

interface SeriesSummary {
  seriesSlug: string;
  seriesName: string;
  totalVolumes: number;
  latestReleaseDate: string;
  sampleCover: string;
}

export function SeriesListPage() {
  const [seriesList, setSeriesList] = useState<SeriesSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await scheduleService.getSeriesSummaries();
        setSeriesList(data || []);
      } catch (err) {
        console.error('Failed to load series list', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Danh Sách Bộ Truyện (Series)</h1>
        <p className={styles.subtitle}>
          Tổng hợp toàn bộ các bộ truyện tranh, light novel đang phát hành kèm tiến độ các tập.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Đang tải danh sách bộ truyện...
        </div>
      ) : seriesList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Chưa có dữ liệu bộ truyện.
        </div>
      ) : (
        <div className={styles.grid}>
          {seriesList.map((item) => (
            <Link key={item.seriesSlug} href={`/bo-truyen/${item.seriesSlug}`} className={styles.seriesCard}>
              {item.sampleCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.sampleCover} alt={item.seriesName} className={styles.seriesCover} />
              ) : (
                <div className={styles.seriesCover} />
              )}
              <div className={styles.seriesInfo}>
                <div className={styles.seriesName}>{item.seriesName}</div>
                <div className={styles.volumeCount}>{item.totalVolumes} tập đã lên lịch</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default SeriesListPage;
