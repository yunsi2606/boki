'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './boTruyen.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function BoTruyenDetailPage({ params }: Props) {
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
          Đang tải thông tin bộ truyện...
        </div>
      </main>
    );
  }

  if (volumes.length === 0) {
    return (
      <main className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Chưa có thông tin bộ truyện này</h2>
          <Link href="/lich-phat-hanh" style={{ color: 'var(--color-primary-500)' }}>
            Quay lại Lịch phát hành
          </Link>
        </div>
      </main>
    );
  }

  const first = volumes[0];
  const seriesName = first.seriesName || first.title;
  const publisher = first.publisher;
  const author = first.author;
  const cover = first.coverUrl;

  return (
    <main className={styles.container}>
      {/* Header Info */}
      <div className={styles.headerCard}>
        <div className={styles.coverBox}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={seriesName} className={styles.coverImg} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-neutral-500)' }}>
              Bìa bộ truyện
            </div>
          )}
        </div>

        <div className={styles.headerInfo}>
          <span className={styles.publisherTag}>{publisher}</span>
          <h1 className={styles.seriesTitle}>{seriesName}</h1>
          {author && <p className={styles.authorText}>Tác giả: <strong>{author}</strong></p>}
          <div className={styles.statsRow}>
            <span>Đã cập nhật: <strong>{volumes.length} tập</strong></span>
          </div>
        </div>
      </div>

      {/* Volume Grid */}
      <h2 className={styles.sectionTitle}>Danh sách các tập phát hành</h2>
      <div className={styles.volumesGrid}>
        {volumes.map((vol) => {
          const volSlug = vol.slug || vol.id;
          const volCover = vol.coverUrl || cover;
          return (
            <Link key={vol.id} href={`/tap-truyen/${volSlug}`} className={styles.volumeCard}>
              <div className={styles.volumeCoverWrap}>
                {volCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={volCover} alt={vol.title} className={styles.coverImg} loading="lazy" />
                ) : null}
              </div>
              <div className={styles.volumeInfo}>
                <h4 className={styles.volumeTitle}>{vol.title}</h4>
                <div className={styles.volumeDate}>Ngày ra: {vol.releaseDate}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
