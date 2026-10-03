'use client';

import React from 'react';
import { Layers, FolderTree, GitBranch } from 'lucide-react';
import type { Category } from '@/types';
import styles from './CategoryStatsCards.module.css';

interface CategoryStatsCardsProps {
  categories: Category[];
}

export default function CategoryStatsCards({ categories }: CategoryStatsCardsProps) {
  const totalCount = categories.length;
  const rootCount = categories.filter((c) => !c.parentId).length;
  const subCount = categories.filter((c) => Boolean(c.parentId)).length;

  return (
    <div className={styles.statsGrid}>
      <div className={styles.card}>
        <div className={`${styles.iconWrap} ${styles.blue}`}>
          <Layers size={22} />
        </div>
        <div className={styles.details}>
          <span className={styles.label}>Tổng danh mục</span>
          <span className={styles.value}>{totalCount}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.iconWrap} ${styles.emerald}`}>
          <FolderTree size={22} />
        </div>
        <div className={styles.details}>
          <span className={styles.label}>Danh mục gốc</span>
          <span className={styles.value}>{rootCount}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.iconWrap} ${styles.purple}`}>
          <GitBranch size={22} />
        </div>
        <div className={styles.details}>
          <span className={styles.label}>Danh mục con</span>
          <span className={styles.value}>{subCount}</span>
        </div>
      </div>
    </div>
  );
}
