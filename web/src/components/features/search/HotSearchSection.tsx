'use client';

import React from 'react';
import styles from './smartSearch.module.css';

interface HotSearchSectionProps {
  keywords: string[];
  onSelectKeyword: (keyword: string) => void;
}

export default function HotSearchSection({
  keywords,
  onSelectKeyword,
}: HotSearchSectionProps) {
  if (keywords.length === 0) {
    return null;
  }

  const getRankClass = (idx: number) => {
    if (idx === 0) return styles.rankTop1;
    if (idx === 1) return styles.rankTop2;
    if (idx === 2) return styles.rankTop3;
    return styles.rankOther;
  };

  return (
    <div className={styles.hotSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Xu hướng tìm kiếm</span>
      </div>

      <div className={styles.hotGrid}>
        {keywords.map((kw, idx) => (
          <button
            key={kw}
            type="button"
            className={styles.hotItem}
            onClick={() => onSelectKeyword(kw)}
          >
            <span className={`${styles.rankBadge} ${getRankClass(idx)}`}>
              {idx + 1}
            </span>
            <span className={styles.hotLabel} title={kw}>
              {kw}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
