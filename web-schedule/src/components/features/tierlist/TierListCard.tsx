'use client';

import React from 'react';
import Link from 'next/link';
import type { MangaTierListSummary } from '@/types/tierList';
import styles from './tierListCard.module.css';

interface TierListCardProps {
  item: MangaTierListSummary;
  rankBadge?: number;
}

const AVATAR_COLORS = [
  '#00B4D8', // Teal
  '#10B981', // Emerald Green
  '#F59E0B', // Warm Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EE4D2D', // Boki Coral
  '#3B82F6', // Blue
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function TierListCard({ item }: TierListCardProps) {
  const covers = (item.topCovers || []).filter(Boolean).slice(0, 4);
  const initialLetter = (item.authorDisplayName || item.authorHandle || 'B')
    .replace(/^@/, '')
    .charAt(0)
    .toUpperCase();
  const avatarBg = getAvatarColor(item.authorDisplayName || item.authorHandle || 'B');

  return (
    <Link href={`/tier-list/${item.id}`} className={styles.card} title={item.title}>
      {/* Background Manga Covers Collage */}
      <div className={styles.coverCollage} aria-hidden="true">
        {covers.length > 0 ? (
          covers.map((c, idx) => (
            <div key={idx} className={styles.coverSlice}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c} alt="" className={styles.coverImg} loading="lazy" />
            </div>
          ))
        ) : (
          <div className={styles.emptyCollage}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Vignette & Light-Theme Bottom Gradient Overlay */}
      <div className={styles.gradientOverlay} />

      {/* Top Badges Row */}
      <div className={styles.topRow}>
        <span className={styles.tierTag}>TIER</span>
        <span className={styles.countBadge}>{item.totalItems} truyện</span>
      </div>

      {/* Bottom Author & Title Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.avatarWrapper}>
          {item.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.authorAvatarUrl} alt={item.authorDisplayName} className={styles.avatarImg} />
          ) : (
            <div className={styles.initialAvatar} style={{ backgroundColor: avatarBg }}>
              {initialLetter}
            </div>
          )}
        </div>

        <div className={styles.infoCol}>
          <h3 className={styles.title}>{item.title}</h3>
          <span className={styles.authorHandle}>{item.authorHandle}</span>
        </div>
      </div>
    </Link>
  );
}
