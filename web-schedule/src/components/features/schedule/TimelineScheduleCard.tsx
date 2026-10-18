'use client';

import React from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './timelineScheduleCard.module.css';

interface Props {
  schedule: ReleaseScheduleItem;
  highlightDate?: string;
}

export function TimelineScheduleCard({ schedule, highlightDate }: Props) {
  const editions = schedule.editions && schedule.editions.length > 0 ? schedule.editions : [];
  const primaryEdition = editions[0];
  const cover = primaryEdition?.coverUrl || schedule.coverUrl;
  const targetSlug = schedule.slug || schedule.id;
  const rawDate = highlightDate || primaryEdition?.releaseDate || schedule.releaseDate;

  // Format date: e.g. "2026-10-25" -> "25/10/2026"
  let formattedDate = rawDate;
  if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const parts = rawDate.split('-');
    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

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
              const isSpecial =
                ed.editionType === 'SPECIAL' ||
                ed.editionType === 'LIMITED' ||
                ed.editionType === 'BOXSET';
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
          <div className={styles.date}>{formattedDate}</div>
        </div>
      </div>
    </Link>
  );
}
