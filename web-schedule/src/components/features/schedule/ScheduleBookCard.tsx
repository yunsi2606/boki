'use client';

import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './scheduleBookCard.module.css';

interface Props {
  schedule: ReleaseScheduleItem;
  highlightDate?: string;
}

export function ScheduleBookCard({ schedule, highlightDate }: Props) {
  const editions = schedule.editions && schedule.editions.length > 0 ? schedule.editions : [];
  const primaryEdition = editions[0];
  const cover = primaryEdition?.coverUrl || schedule.coverUrl;
  const targetSlug = schedule.slug || schedule.id;
  const rawDate = highlightDate || primaryEdition?.releaseDate || schedule.releaseDate;

  // Format date compactly: e.g. "2026-10-25" -> "25/10"
  let formattedDate = rawDate;
  if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const parts = rawDate.split('-');
    formattedDate = `${parts[2]}/${parts[1]}`;
  }

  // Calculate price range across editions
  const prices = editions
    .map((e) => e.linkedBook?.price || e.estimatedPrice)
    .filter((p): p is number => typeof p === 'number' && p > 0);

  let priceText = 'Đang cập nhật';
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const fmt = (n: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    priceText = minPrice === maxPrice ? fmt(minPrice) : `${fmt(minPrice)} - ${fmt(maxPrice)}`;
  }

  const specialEdition = editions.find(
    (e) => e.editionType === 'SPECIAL' || e.editionType === 'LIMITED' || e.editionType === 'BOXSET'
  );

  return (
    <Link href={`/tap-truyen/${targetSlug}`} className={styles.card}>
      <div className={styles.posterWrapper}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={schedule.title} className={styles.posterImg} loading="lazy" />
        ) : (
          <div className={styles.posterPlaceholder}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span className={styles.placeholderTitle}>{schedule.title}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className={styles.topBadgeRow}>
          {schedule.publisher && (
            <span className={styles.publisherBadge}>{schedule.publisher}</span>
          )}
          {formattedDate && (
            <span className={styles.dateBadge}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formattedDate}
            </span>
          )}
        </div>

        {/* Bottom Overlay over Cover */}
        <div className={styles.bottomCoverOverlay}>
          {schedule.volumeNumber !== undefined && schedule.volumeNumber !== null && (
            <span className={styles.volumeBadge}>Tập {schedule.volumeNumber}</span>
          )}
          {specialEdition && (
            <span className={styles.specialBadge}>
              {specialEdition.editionName || 'Bản ĐB'}
            </span>
          )}
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.title} title={schedule.title}>
          {schedule.title}
        </h3>

        <div className={styles.metaRow}>
          <span className={styles.price}>{priceText}</span>
          <span className={styles.actionPrompt}>
            Chi tiết
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
