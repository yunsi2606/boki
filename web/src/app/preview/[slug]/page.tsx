'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, Eye, Calendar, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { blogService } from '@/services/blogService';
import StickyReadingBar from '@/components/features/preview/StickyReadingBar';
import PreviewLinkedProducts from '@/components/features/preview/PreviewLinkedProducts';
import type { BlogPost } from '@/types/blog';
import styles from './previewReader.module.css';

export default function PreviewReaderPage() {
  const params = useParams();
  const slug = params?.slug as string;

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
        <BookOpen size={48} strokeWidth={1.5} color="#94a3b8" />
        <h2>Không tìm thấy bài đọc thử</h2>
        <p>Bài đọc thử này có thể đã bị gỡ hoặc đường dẫn không chính xác.</p>
        <Link href="/preview" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại Thư viện đọc thử
        </Link>
      </div>
    );
  }

  const primaryBook = post.linkedBooks && post.linkedBooks.length > 0 ? post.linkedBooks[0] : null;

  return (
    <article className={styles.pageContainer}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <Link href="/preview" className={styles.breadcrumbLink}>
          Thư viện đọc thử
        </Link>
        <ChevronRight size={14} />
        <span className={styles.breadcrumbCurrent}>{post.title}</span>
      </nav>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.badgeRow}>
          <span className={styles.previewBadge}>
            <BookOpen size={13} />
            Đọc thử miễn phí
          </span>
          <span className={styles.categoryTag}>{post.category}</span>
        </div>

        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <User size={14} />
            <span>{post.authorName}</span>
          </div>
          {post.publishedAt && (
            <div className={styles.metaItem}>
              <Calendar size={14} />
              <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          )}
          <div className={styles.metaItem}>
            <Clock size={14} />
            <span>{post.readingTimeMinutes} phút đọc</span>
          </div>
          <div className={styles.metaItem}>
            <Eye size={14} />
            <span>{post.viewsCount.toLocaleString()} lượt xem</span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.effectiveCoverImage && (
        <div className={styles.coverBox}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.effectiveCoverImage} alt={post.title} className={styles.coverImg} />
        </div>
      )}

      {/* Content */}
      <div
        className={styles.contentArea}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className={styles.tagsRow}>
          {post.tags.map((tag, idx) => (
            <span key={idx} className={styles.tagChip}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Linked Products Section */}
      {post.linkedBooks && post.linkedBooks.length > 0 && (
        <PreviewLinkedProducts books={post.linkedBooks} />
      )}

      {/* Sticky Conversion Bar */}
      {primaryBook && <StickyReadingBar book={primaryBook} />}
    </article>
  );
}
