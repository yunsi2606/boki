'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react';
import type { BlogPost } from '@/types/blog';
import styles from './previewCard.module.css';

interface PreviewCardProps {
  post: BlogPost;
}

export default function PreviewCard({ post }: PreviewCardProps) {
  const [aspectType, setAspectType] = useState<'portrait' | 'landscape' | 'square'>('portrait');
  const coverUrl = post.effectiveCoverImage || '/images/default-blog-cover.png';

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      if (ratio >= 1.25) {
        setAspectType('landscape');
      } else if (ratio <= 0.85) {
        setAspectType('portrait');
      } else {
        setAspectType('square');
      }
    }
  };

  const aspectClass =
    aspectType === 'landscape'
      ? styles.landscape
      : aspectType === 'square'
      ? styles.square
      : styles.portrait;

  return (
    <article className={`${styles.cardItem} ${aspectClass}`}>
      <Link href={`/preview/${post.slug}`} className={styles.cardLink} title={post.title}>
        <div className={styles.imageWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={post.title}
            className={styles.coverImg}
            loading="lazy"
            onLoad={handleImageLoad}
          />

          {/* Hover Overlay with Title */}
          <div className={styles.overlay}>
            <div className={styles.topRow}>
              {post.category && (
                <span className={styles.categoryBadge}>
                  <Sparkles size={11} />
                  <span>{post.category}</span>
                </span>
              )}
            </div>

            <div className={styles.bottomContent}>
              <h3 className={styles.title}>{post.title}</h3>
              <div className={styles.ctaRow}>
                <span className={styles.ctaButton}>
                  <BookOpen size={13} />
                  <span>Đọc thử ngay</span>
                </span>
                {post.readingTimeMinutes > 0 && (
                  <span className={styles.readingTime}>{post.readingTimeMinutes} phút đọc</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
