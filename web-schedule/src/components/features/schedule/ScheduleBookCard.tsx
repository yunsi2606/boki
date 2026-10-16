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
  const dateStr = highlightDate || primaryEdition?.releaseDate || schedule.releaseDate;

  // Calculate price range across all editions
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

  return (
    <Link href={`/tap-truyen/${targetSlug}`} className={styles.card}>
      <div className={styles.coverContainer}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={schedule.title} className={styles.coverImg} loading="lazy" />
        ) : (
          <div className={styles.coverPlaceholder}>Bìa dự kiến</div>
        )}
        <div className={styles.publisherTag}>{schedule.publisher}</div>
        {schedule.volumeNumber !== undefined && schedule.volumeNumber !== null && (
          <div className={styles.volBadge}>Tập {schedule.volumeNumber}</div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={schedule.title}>
          {schedule.title}
        </h3>

        {/* Edition badges container */}
        <div className={styles.editionList}>
          {editions.length > 0 ? (
            editions.map((ed, idx) => {
              const isSpecial = ed.editionType === 'SPECIAL' || ed.editionType === 'LIMITED';
              return (
                <span
                  key={ed.id || idx}
                  className={isSpecial ? styles.specialBadge : styles.standardBadge}
                >
                  {ed.editionName}
                </span>
              );
            })
          ) : (
            <span className={styles.standardBadge}>Bản phổ thông</span>
          )}
        </div>

        <div className={styles.priceRow}>
          <div className={styles.price}>{priceText}</div>
          <div className={styles.date}>{dateStr}</div>
        </div>
      </div>
    </Link>
  );
}
