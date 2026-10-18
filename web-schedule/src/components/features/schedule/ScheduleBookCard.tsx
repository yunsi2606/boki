'use client';

import React from 'react';
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

  // Format date: e.g. "2026-10-25" -> "25/10" & full "25/10/2026"
  let formattedDate = rawDate;
  let fullDate = rawDate;
  if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const parts = rawDate.split('-');
    formattedDate = `${parts[2]}/${parts[1]}`;
    fullDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const specialEdition = editions.find(
    (e) => e.editionType === 'SPECIAL' || e.editionType === 'LIMITED' || e.editionType === 'BOXSET'
  );

  const synopsis = schedule.description?.trim() ||
    (primaryEdition?.gifts ? `Tặng kèm: ${primaryEdition.gifts}` : 'Xem thông tin ngày phát hành, các phiên bản và đặt mua tại Boki.');

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

        {/* Interactive Hover Overlay Panel */}
        <div className={styles.hoverOverlay}>
          <div className={styles.hoverBody}>
            <p className={styles.hoverSynopsis}>{synopsis}</p>
            {fullDate && (
              <div className={styles.hoverDateRow}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{fullDate}</span>
              </div>
            )}
            <div className={styles.hoverActionRow}>
              <span className={styles.hoverCtaBtn}>CHI TIẾT</span>
              <span className={styles.hoverBookmarkIcon} title="Xem chi tiết tập truyện">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.title} title={schedule.title}>
          {schedule.title}
        </h3>
      </div>
    </Link>
  );
}
