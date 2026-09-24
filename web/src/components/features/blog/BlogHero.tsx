'use client';

import Link from 'next/link';
import type { BlogPost } from '@/types/blog';
import styles from './blog.module.css';

interface BlogHeroProps {
  post: BlogPost;
}

export default function BlogHero({ post }: BlogHeroProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={styles.hero}
      scroll={true}
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }}
    >
      <div className={styles.heroImageWrapper}>
        <img
          src={post.effectiveCoverImage}
          alt={post.title}
          className={styles.heroImage}
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-blog-cover.jpg'; }}
        />
        <div className={styles.heroOverlay} />
      </div>
      <div className={styles.heroContent}>
        <div className={styles.heroBadgeRow}>
          <span className={styles.heroBadge}>Nổi bật</span>
          <span className={styles.heroCategory}>{post.category}</span>
        </div>
        <h2 className={styles.heroTitle}>{post.title}</h2>
        {post.excerpt && <p className={styles.heroExcerpt}>{post.excerpt}</p>}
        <div className={styles.heroMeta}>
          <span className={styles.heroAuthor}>{post.authorName}</span>
          <span className={styles.heroDot}>·</span>
          <span>{post.readingTimeMinutes} phút đọc</span>
          <span className={styles.heroDot}>·</span>
          <span>{formattedDate}</span>
          <span className={styles.heroDot}>·</span>
          <span>{post.viewsCount.toLocaleString()} lượt xem</span>
        </div>
      </div>
    </Link>
  );
}
