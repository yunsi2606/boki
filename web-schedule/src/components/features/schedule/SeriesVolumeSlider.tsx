'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './seriesVolumeSlider.module.css';

interface Props {
  seriesSlug: string;
  seriesName?: string;
  currentScheduleId?: string;
  currentVolumeSlug?: string;
}

export function SeriesVolumeSlider({
  seriesSlug,
  seriesName,
  currentScheduleId,
  currentVolumeSlug,
}: Props) {
  const [volumes, setVolumes] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seriesSlug) return;
    async function loadSeriesVolumes() {
      try {
        setLoading(true);
        const list = await scheduleService.getSeriesVolumes(seriesSlug);
        setVolumes(list || []);
      } catch (err) {
        console.error('Failed to load series volumes', err);
      } finally {
        setLoading(false);
      }
    }
    loadSeriesVolumes();
  }, [seriesSlug]);

  if (loading || volumes.length <= 1) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.headerLabel}>Các tập trong bộ:</span>
          <span className={styles.seriesName}>{seriesName || 'Bộ truyện'}</span>
        </div>
        <Link href={`/tac-pham/${seriesSlug}`} className={styles.viewAllLink}>
          Xem tất cả ({volumes.length} tập)
        </Link>
      </div>

      <div className={styles.sliderTrack}>
        {volumes.map((vol) => {
          const isActive =
            vol.id === currentScheduleId ||
            (currentVolumeSlug && vol.slug === currentVolumeSlug);
          const cover = vol.coverUrl || vol.editions?.[0]?.coverUrl;
          const targetSlug = vol.slug || vol.id;

          return (
            <Link
              key={vol.id}
              href={`/tap-truyen/${targetSlug}`}
              className={`${styles.volumeItem} ${isActive ? styles.activeItem : ''}`}
            >
              <div className={styles.thumbWrapper}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={vol.title} className={styles.thumbImg} loading="lazy" />
                ) : (
                  <div className={styles.placeholderThumb}>Bìa</div>
                )}
                {vol.volumeNumber !== undefined && vol.volumeNumber !== null ? (
                  <span className={styles.volBadge}>Tập {vol.volumeNumber}</span>
                ) : (
                  <span className={styles.volBadge}>Tập</span>
                )}
              </div>
              <div className={styles.volTitle} title={vol.title}>
                {vol.volumeNumber ? `Tập ${vol.volumeNumber}` : vol.title}
              </div>
              <div className={styles.volDate}>{vol.releaseDate}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
