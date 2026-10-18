'use client';

import React from 'react';
import type { TierRankedMangaItem } from '@/types/tierList';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './tierItemCard.module.css';

interface TierItemCardProps {
  item: TierRankedMangaItem | ReleaseScheduleItem;
  source: 'shelf' | string;
  onDragStart: (item: TierRankedMangaItem | ReleaseScheduleItem, source: 'shelf' | string) => void;
  onRemove?: (scheduleId: string) => void;
}

export function TierItemCard({
  item,
  source,
  onDragStart,
  onRemove,
}: TierItemCardProps) {
  const scheduleId = 'scheduleId' in item ? item.scheduleId : item.id;
  const coverUrl = item.coverUrl || '/brand/logo.png';

  const handleDrag = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', scheduleId);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(item, source);
  };

  return (
    <div
      className={styles.card}
      draggable
      onDragStart={handleDrag}
      title={item.title}
    >
      <div className={styles.coverWrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt={item.title} className={styles.coverImg} loading="lazy" />

        {onRemove && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(scheduleId);
            }}
            title="Xóa khỏi bậc"
            aria-label="Xóa"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.titleText}>{item.title}</div>
    </div>
  );
}
