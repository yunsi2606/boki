'use client';

import Link from 'next/link';
import { BookOpen, Clock, Eye, Sparkles } from 'lucide-react';
import type { BlogPost } from '@/types/blog';
import styles from './previewCard.module.css';

interface PreviewCardProps {
  post: BlogPost;
}

export default function PreviewCard({ post }: PreviewCardProps) {
  const primaryBook = post.linkedBooks && post.linkedBooks.length > 0 ? post.linkedBooks[0] : null;

  return (
    <article className={styles.card}>
      <div className={styles.coverWrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.effectiveCoverImage || '/images/default-blog-cover.png'}
          alt={post.title}
          className={styles.coverImg}
          loading="lazy"
        />
        <div className={styles.coverBadge}>
          <Sparkles size={12} />
          <span>Đọc thử miễn phí</span>
        </div>
        <div className={styles.categoryBadge}>{post.category}</div>
      </div>

      <div className={styles.body}>
        <Link href={`/preview/${post.slug}`} className={styles.titleLink}>
          <h2 className={styles.title}>{post.title}</h2>
        </Link>

        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <Clock size={13} />
            <span>{post.readingTimeMinutes} phút đọc</span>
          </div>
          <span>•</span>
          <div className={styles.metaItem}>
            <Eye size={13} />
            <span>{post.viewsCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Linked Book Quick Box if available */}
        {primaryBook && (
          <div className={styles.linkedBookBar}>
            {primaryBook.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primaryBook.coverImage} alt={primaryBook.title} className={styles.bookThumb} />
            ) : (
              <div className={styles.bookThumbPlaceholder}>
                <BookOpen size={12} />
              </div>
            )}
            <div className={styles.bookInfo}>
              <div className={styles.bookTitle} title={primaryBook.title}>
                {primaryBook.title}
              </div>
              <div className={styles.bookPrice}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(primaryBook.price)}
              </div>
            </div>
          </div>
        )}

        <Link href={`/preview/${post.slug}`} className={styles.readBtn}>
          <BookOpen size={15} />
          <span>Đọc thử ngay</span>
        </Link>
      </div>
    </article>
  );
}
