'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './volumeCoverflowSlider.module.css';

interface Props {
  seriesSlug: string;
  seriesName?: string;
  currentScheduleId: string;
  currentVolumeSlug?: string;
  currentTitle: string;
}

export function VolumeCoverflowSlider({
  seriesSlug,
  seriesName,
  currentScheduleId,
  currentVolumeSlug,
  currentTitle,
}: Props) {
  const [volumes, setVolumes] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seriesSlug) return;
    async function fetchSeries() {
      try {
        setLoading(true);
        const list = await scheduleService.getSeriesVolumes(seriesSlug);
        setVolumes(list || []);
      } catch (err) {
        console.error('Failed to load series volumes for coverflow', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSeries();
  }, [seriesSlug]);

  const displayVolumes =
    volumes.length > 0
      ? volumes
      : [
          {
            id: currentScheduleId,
            slug: currentVolumeSlug,
            title: currentTitle,
          } as ReleaseScheduleItem,
        ];

  const currentIndex = displayVolumes.findIndex(
    (v) => v.id === currentScheduleId || (currentVolumeSlug && v.slug === currentVolumeSlug)
  );
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  // Show window of volumes around activeIdx (e.g. up to 2 before and 2 after)
  const prevVol = activeIdx > 0 ? displayVolumes[activeIdx - 1] : null;
  const nextVol = activeIdx < displayVolumes.length - 1 ? displayVolumes[activeIdx + 1] : null;
  const currentVol = displayVolumes[activeIdx];

  const getCover = (vol: ReleaseScheduleItem) =>
    vol.coverUrl || vol.editions?.[0]?.coverUrl;

  return (
    <div className={styles.coverflowSection}>
      <div className={styles.headerInfo}>
        <div className={styles.seriesKicker}>{seriesName || 'BỘ TRUYỆN'}</div>
        <h1 className={styles.currentVolTitle}>{currentTitle}</h1>
      </div>

      <div className={styles.stageContainer}>
        {/* Cinematic Background Volume Watermark */}
        <div className={styles.volumeWatermark} aria-hidden="true">
          {currentVol.volumeNumber
            ? String(currentVol.volumeNumber).padStart(2, '0')
            : '01'}
        </div>

        {/* Previous Volumes */}
        {prevVol && (
          <Link
            href={`/tap-truyen/${prevVol.slug || prevVol.id}`}
            className={`${styles.cardSide} ${styles.cardLeft}`}
            title={prevVol.title}
          >
            <div className={styles.coverWrapper}>
              {getCover(prevVol) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getCover(prevVol)} alt={prevVol.title} className={styles.sideImg} />
              ) : (
                <div className={styles.placeholderSide}>Bìa</div>
              )}
              <span className={styles.sideBadge}>
                {prevVol.volumeNumber ? `Tập ${prevVol.volumeNumber}` : 'Trước'}
              </span>
            </div>
          </Link>
        )}

        {/* Active Center Volume */}
        <div className={styles.cardCenter}>
          <div className={styles.activeCoverWrapper}>
            {getCover(currentVol) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getCover(currentVol)} alt={currentVol.title} className={styles.centerImg} />
            ) : (
              <div className={styles.placeholderCenter}>Bìa dự kiến</div>
            )}
            <div className={styles.activePillBadge}>
              <span className={styles.goldDot} />
              <span>
                {currentVol.volumeNumber ? `TẬP ${currentVol.volumeNumber}` : 'TẬP HIỆN TẠI'}
              </span>
            </div>
          </div>
        </div>

        {/* Next Volumes */}
        {nextVol && (
          <Link
            href={`/tap-truyen/${nextVol.slug || nextVol.id}`}
            className={`${styles.cardSide} ${styles.cardRight}`}
            title={nextVol.title}
          >
            <div className={styles.coverWrapper}>
              {getCover(nextVol) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getCover(nextVol)} alt={nextVol.title} className={styles.sideImg} />
              ) : (
                <div className={styles.placeholderSide}>Bìa</div>
              )}
              <span className={styles.sideBadge}>
                {nextVol.volumeNumber ? `Tập ${nextVol.volumeNumber}` : 'Sau'}
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Quick Vol Nav Bar */}
      {volumes.length > 1 && (
        <div className={styles.volumePillsTrack}>
          {volumes.map((v, i) => {
            const isActive = i === activeIdx;
            return (
              <Link
                key={v.id}
                href={`/tap-truyen/${v.slug || v.id}`}
                className={`${styles.volPill} ${isActive ? styles.activeVolPill : ''}`}
              >
                {v.volumeNumber ? `Tập ${v.volumeNumber}` : `Tập ${i + 1}`}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
