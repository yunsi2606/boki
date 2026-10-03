'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';
import { getCategoryTheme } from './categoryThemes';
import styles from './CategoryCircles.module.css';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const theme = getCategoryTheme(category.slug, category.id);
  const [frontCover, backCover] = theme.covers;

  return (
    <Link
      href={`/books?category=${category.id}`}
      className={styles.categoryCard}
      title={category.description || category.name}
    >
      <div className={styles.cardVisual} style={{ backgroundColor: theme.blobBg }}>
        {/* Soft Organic Blob Background Decorator */}
        <div className={styles.organicBlob} />

        {/* 3D Overlapping Books */}
        <div className={styles.bookStack}>
          {/* Back Book */}
          <div className={`${styles.bookItem} ${styles.bookBack}`}>
            <img
              src={backCover}
              alt={`${category.name} cover`}
              className={styles.bookCoverImage}
              loading="lazy"
            />
          </div>

          {/* Front Book */}
          <div className={`${styles.bookItem} ${styles.bookFront}`}>
            <img
              src={frontCover}
              alt={`${category.name} cover`}
              className={styles.bookCoverImage}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.infoCol}>
          <h3 className={styles.categoryName}>{category.name}</h3>
          <span className={styles.categoryCount}>{theme.countText}</span>
        </div>

        <div
          className={styles.arrowBadge}
          style={{ backgroundColor: theme.arrowBg, color: theme.arrowColor }}
        >
          <ArrowRight size={13} strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}
