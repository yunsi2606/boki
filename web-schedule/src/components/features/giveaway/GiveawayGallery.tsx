'use client';

import { useState } from 'react';
import styles from './giveawayGallery.module.css';

interface Props {
  images: string[];
  title: string;
}

export function GiveawayGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const activeUrl = images[activeIndex] || images[0];

  return (
    <div className={styles.galleryCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>Hình ảnh thực tế phần quà</h2>
        <span className={styles.verifiedBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Ảnh chụp thật 100%
        </span>
      </div>

      <div className={styles.previewContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeUrl} alt="" className={styles.previewBackdrop} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeUrl} alt={`${title} - Ảnh ${activeIndex + 1}`} className={styles.previewImg} />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnailRow}>
          {images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`${styles.thumbBtn} ${idx === activeIndex ? styles.thumbBtnActive : ''}`}
              title={`Xem ảnh ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Thumbnail ${idx + 1}`} className={styles.thumbImg} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
