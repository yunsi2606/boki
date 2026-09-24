'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import styles from '@/components/features/blog/blog.module.css';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  // Automatically scroll to the top when navigating to blog detail or changing article
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

        // Increment views
        blogService.incrementViews(slug).catch(() => {});

        // Fetch related posts by same category
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
    return <div className={styles.loadingState}>Đang tải bài viết...</div>;
  }

  if (!post) {
    return (
      <div className={styles.loadingState}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Không tìm thấy bài viết</h2>
          <Link href="/blog" className={styles.detailBack}>← Quay lại trang Blog</Link>
        </div>
      </div>
    );
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  const authorInitial = post.authorName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'A';

  return (
    <div className={styles.detailPage}>
      <Link href="/blog" className={styles.detailBack} scroll={true}>← Quay lại trang Blog</Link>

      <span className={styles.detailCategory}>{post.category}</span>
      <h1 className={styles.detailTitle}>{post.title}</h1>

      <div className={styles.detailMeta}>
        <span className={styles.detailAuthor}>{post.authorName}</span>
        <span className={styles.detailMetaDot}>·</span>
        <span>{formattedDate}</span>
        <span className={styles.detailMetaDot}>·</span>
        <span>{post.readingTimeMinutes} phút đọc</span>
        <span className={styles.detailMetaDot}>·</span>
        <span>{post.viewsCount.toLocaleString()} lượt xem</span>
      </div>

      <div
        className={styles.detailContent}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
        <div className={styles.detailTags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.detailTag}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Author Block */}
      <div className={styles.authorBlock}>
        <div className={styles.authorAvatar}>{authorInitial}</div>
        <div className={styles.authorInfo}>
          <h4>{post.authorName}</h4>
          <p>Tác giả tại BokiStore</p>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Bài viết liên quan</h2>
          <div className={styles.blogGrid}>
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/blog/${rp.slug}`}
                className={styles.card}
                scroll={true}
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                }}
              >
                <div className={styles.cardImageWrapper}>
                  <img src={rp.effectiveCoverImage} alt={rp.title} className={styles.cardImage} />
                  <span className={styles.cardCategory}>{rp.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{rp.title}</h3>
                  <div className={styles.cardMeta}>
                    <span>{rp.readingTimeMinutes} phút đọc</span>
                    <span className={styles.cardDot}>·</span>
                    <span>{rp.viewsCount.toLocaleString()} lượt xem</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
