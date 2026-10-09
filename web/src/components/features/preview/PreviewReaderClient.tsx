'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Eye, Calendar, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { blogService } from '@/services/blogService';
import StickyReadingBar from '@/components/features/preview/StickyReadingBar';
import PreviewLinkedProducts from '@/components/features/preview/PreviewLinkedProducts';
import type { BlogPost } from '@/types/blog';
import styles from '@/app/preview/[slug]/previewReader.module.css';

interface PreviewReaderClientProps {
  slug: string;
}

export default function PreviewReaderClient({ slug }: PreviewReaderClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setIsLoading(true);
    setError(false);

    blogService
      .getBlogBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setPost(data);
          blogService.incrementViews(slug).catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Failed to load preview post:', err);
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className={styles.loadingBox}>
        <BookOpen size={36} strokeWidth={1.5} />
        <p>Đang tải nội dung đọc thử...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.notFoundBox}>
        <h2>Không tìm thấy chương đọc thử</h2>
        <p>Nội dung đọc thử này có thể đã bị gỡ hoặc đường dẫn không chính xác.</p>
        <Link href="/preview" className={styles.backBtn}>
          <ArrowLeft size={16} /> Quay lại danh sách đọc thử
        </Link>
      </div>
    );
  }

  const linkedBooks = post.linkedBooks || [];

  return (
    <div className={styles.readerContainer}>
      <div className={styles.breadcrumb}>
        <Link href="/">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link href="/preview">Đọc thử sách</Link>
        <ChevronRight size={14} />
        <span className={styles.breadcrumbCurrent}>{post.title}</span>
      </div>

      <header className={styles.articleHeader}>
        <div className={styles.badgeRow}>
          <span className={styles.previewBadge}>Đọc Thử Miễn Phí</span>
          {post.category && <span className={styles.categoryBadge}>{post.category}</span>}
        </div>
        <h1 className={styles.articleTitle}>{post.title}</h1>
        <div className={styles.metaRow}>
          {post.authorName && (
            <span className={styles.metaItem}>
              <User size={15} /> {post.authorName}
            </span>
          )}
          {post.publishedAt && (
            <span className={styles.metaItem}>
              <Calendar size={15} />
              {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
          {post.readingTimeMinutes && (
            <span className={styles.metaItem}>
              <Clock size={15} /> ~{post.readingTimeMinutes} phút đọc
            </span>
          )}
          <span className={styles.metaItem}>
            <Eye size={15} /> {post.viewsCount || 0} lượt đọc
          </span>
        </div>
      </header>

      {linkedBooks.length > 0 && (
        <PreviewLinkedProducts books={linkedBooks} />
      )}

      <main className={styles.readingBody}>
        {(post.coverImage || post.effectiveCoverImage) && (
          <div className={styles.coverBox}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage || post.effectiveCoverImage} alt={post.title} className={styles.coverImg} />
          </div>
        )}

        <div
          className={styles.htmlContent}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>

      {linkedBooks.length > 0 && (
        <section className={styles.footerProductsSection}>
          <h3 className={styles.footerProductsTitle}>
            Thích chương đọc thử này? Đặt mua ngay ấn bản chính hãng
          </h3>
          <PreviewLinkedProducts books={linkedBooks} />
        </section>
      )}

      {linkedBooks.length > 0 && linkedBooks[0] && (
        <StickyReadingBar book={linkedBooks[0]} />
      )}
    </div>
  );
}
