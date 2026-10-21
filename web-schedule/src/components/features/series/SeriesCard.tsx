'use client';

import React from 'react';
import Link from 'next/link';
import type { SeriesSummaryItem } from '@/services/scheduleService';
import styles from './seriesCard.module.css';

interface Props {
  item: SeriesSummaryItem;
}

export function SeriesCard({ item }: Props) {
  const cover = item.sampleCover || item.coverUrl;
  const volumes = item.totalVolumes || item.volumeCount || 1;
  const format = item.format || 'MANGA';
  const statusLabel = item.seriesStatus === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang ra';

  return (
    <Link href={`/tac-pham/${item.seriesSlug}`} className={styles.card}>
      <div className={styles.coverWrapper}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={item.seriesName} className={styles.coverImg} loading="lazy" />
        ) : (
          <div className={styles.placeholderCover}>Bìa tác phẩm</div>
        )}
        <span className={styles.formatBadge}>{format}</span>
        {item.publisher && (
          <span className={styles.publisherBadge}>{item.publisher}</span>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name} title={item.seriesName}>
          {item.seriesName}
        </h3>

        {item.author && (
          <div className={styles.author} title={item.author}>
            Tác giả: {item.author}
          </div>
        )}

        <div className={styles.footerRow}>
          <span className={styles.volumeCount}>{volumes} tập đã lên lịch</span>
          <span className={styles.statusText}>{statusLabel}</span>
        </div>
      </div>
    </Link>
  );
}
