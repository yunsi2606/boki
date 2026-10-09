'use client';

import React from 'react';
import styles from '@/app/books/[slug]/page.module.css';

interface BookDetailGalleryProps {
  cover: string;
  title: string;
  imageUrls?: string[];
  activeImageIdx: number;
  setActiveImageIdx: (idx: number) => void;
}

export default function BookDetailGallery({
  cover,
  title,
  imageUrls,
  activeImageIdx,
  setActiveImageIdx,
}: BookDetailGalleryProps) {
  return (
    <div className={styles.gallerySection}>
      <div className={styles.mainCoverWrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={title} className={styles.mainCover} />
      </div>
      {imageUrls && imageUrls.length > 1 && (
        <div className={styles.thumbnailsRow}>
          {imageUrls.map((url, idx) => (
            <div
              key={idx}
              className={`${styles.thumbnailWrapper} ${
                activeImageIdx === idx ? styles.activeThumbnail : ''
              }`}
              onClick={() => setActiveImageIdx(idx)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${title} thumb ${idx}`} className={styles.thumbnailImg} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
