'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import styles from '@/components/features/blog/blog.module.css';

interface BlogDetailClientProps {
  slug: string;
}

export default function BlogDetailClient({ slug }: BlogDetailClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const raf = requestAnimationFrame(scrollToTop);
    const timer = setTimeout(scrollToTop, 60);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [slug, loading]);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await blogService.getBlogBySlug(slug);
        setPost(data);

        blogService.incrementViews(slug).catch(() => {});

        const related = await blogService.searchBlogs(data.category, undefined, 0, 4);
        setRelatedPosts(related.filter((p) => p.id !== data.id).slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Không tìm thấy bài viết</h2>
        <p>Bài viết này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link href="/blog" className={styles.backButton}>
          Quay lại trang Blog
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Trang chủ</Link>
        <span>/</span>
        <Link href="/blog">Blog</Link>
        <span>/</span>
        <span>{post.category}</span>
      </div>

      <article className={styles.article}>
        <div className={styles.articleHeader}>
          <span className={styles.categoryBadge}>{post.category}</span>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <div className={styles.articleMeta}>
            <span>Tác giả: {post.authorName || 'Boki Biên Tập'}</span>
            <span>•</span>
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}</span>
            <span>•</span>
            <span>{post.readingTimeMinutes || 3} phút đọc</span>
            <span>•</span>
            <span>{post.viewsCount || 0} lượt xem</span>
          </div>
        </div>

        {(post.coverImage || post.effectiveCoverImage) && (
          <div className={styles.featuredImageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage || post.effectiveCoverImage} alt={post.title} className={styles.featuredImage} />
          </div>
        )}

        <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags && post.tags.length > 0 && (
          <div className={styles.tagsWrapper}>
            <span className={styles.tagsLabel}>Tags:</span>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tagBadge}>#{tag}</span>
            ))}
          </div>
        )}
      </article>

      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Bài viết cùng chuyên mục</h3>
          <div className={styles.relatedGrid}>
            {relatedPosts.map((related) => (
              <Link href={`/blog/${related.slug}`} key={related.id} className={styles.relatedCard}>
                {(related.coverImage || related.effectiveCoverImage) && (
                  <div className={styles.relatedThumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={related.coverImage || related.effectiveCoverImage} alt={related.title} />
                  </div>
                )}
                <div className={styles.relatedInfo}>
                  <h4>{related.title}</h4>
                  <p>{related.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
