'use client';

import React from 'react';
import Link from 'next/link';
import type { MangaTierListSummary } from '@/types/tierList';
import { MangaTrioAvatar } from '@/components/features/home/MangaTrioAvatar';
import styles from './tierListCard.module.css';

interface TierListCardProps {
  item: MangaTierListSummary;
  rankBadge?: number;
}

export function TierListCard({ item, rankBadge }: TierListCardProps) {
  return (
    <Link href={`/tier-list/${item.id}`} className={styles.card}>
      {rankBadge && (
        <div className={styles.rankBadge} aria-label={`Hạng ${rankBadge}`}>
          #{rankBadge}
        </div>
      )}

      <div className={styles.avatarCol}>
        <MangaTrioAvatar
          covers={item.topCovers}
          size={56}
          title={item.title}
        />
      </div>

      <div className={styles.infoCol}>
        <h3 className={styles.title}>{item.title}</h3>
        {item.description && <p className={styles.desc}>{item.description}</p>}

        <div className={styles.metaRow}>
          <span className={styles.author}>{item.authorHandle}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.itemCount}>{item.totalItems} truyện</span>
        </div>

        <div className={styles.statsRow}>
          <span className={styles.statItem} title="Lượt xem">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{item.viewsCount || 0}</span>
          </span>

          <span className={styles.statItem} title="Lượt thích">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={styles.heartIcon}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{item.likesCount || 0}</span>
          </span>

          <span className={styles.timeAgo}>{item.timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}
