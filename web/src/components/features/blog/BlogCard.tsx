'use client';

import Link from 'next/link';
import type { BlogPost } from '@/types/blog';
import styles from './blog.module.css';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={styles.card}
      scroll={true}
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }}
    >
      <div className={styles.cardImageWrapper}>
        <img
          src={post.effectiveCoverImage}
          alt={post.title}
          className={styles.cardImage}
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-blog-cover.jpg'; }}
        />
        <span className={styles.cardCategory}>{post.category}</span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
        <div className={styles.cardMeta}>
          <span className={styles.cardAuthor}>{post.authorName}</span>
          <span className={styles.cardDot}>·</span>
          <span>{post.readingTimeMinutes} phút đọc</span>
          <span className={styles.cardDot}>·</span>
          <span>{formattedDate}</span>
        </div>
        <div className={styles.cardStats}>
          <span>{post.viewsCount.toLocaleString()} lượt xem</span>
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.cardTag}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
