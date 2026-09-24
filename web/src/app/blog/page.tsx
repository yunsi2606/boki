'use client';

import { useState, useEffect, useCallback } from 'react';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import BlogCard from '@/components/features/blog/BlogCard';
import BlogHero from '@/components/features/blog/BlogHero';
import styles from '@/components/features/blog/blog.module.css';

const DEFAULT_CATEGORIES = ['Tất cả', 'Review', 'Tin tức', 'Hướng dẫn', 'Chung'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  // Load dynamic categories
  useEffect(() => {
    blogService.getCategories()
      .then((data) => {
        if (!data || data.length === 0) return;
        setCategories((prev) => {
          const names = data.map((c) => c.name);
          return Array.from(new Set(['Tất cả', ...names, ...prev]));
        });
      })
      .catch((err) => {
        console.warn('Could not load dynamic blog categories for storefront:', err);
      });
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const category = activeCategory === 'Tất cả' ? undefined : activeCategory;
      const search = searchQuery.trim() || undefined;

      const [blogsData, featuredData] = await Promise.all([
        blogService.searchBlogs(category, search),
        blogService.getFeaturedBlogs(1),
      ]);

      // Set featured post (first featured, or null)
      const featured = featuredData.length > 0 ? featuredData[0] : null;
      setFeaturedPost(featured);

      // Filter out featured post from main list
      const filteredPosts = featured
        ? blogsData.filter((p) => p.id !== featured.id)
        : blogsData;
      setPosts(filteredPosts);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return (
    <div className={styles.blogPage}>
      {/* Header */}
      <div className={styles.blogHeader}>
        <h1 className={styles.blogHeaderTitle}>Bài Viết</h1>
        <p className={styles.blogHeaderSub}>
          Khám phá các bài viết về manga, light novel, review sách và mẹo đọc sách từ cộng đồng BokiStore
        </p>
      </div>

      {/* Hero featured post */}
      {featuredPost && !searchQuery && activeCategory === 'Tất cả' && (
        <BlogHero post={featuredPost} />
      )}

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchInputIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.categoryChips}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryChip} ${activeCategory === cat ? styles.activeChip : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog grid */}
      {loading ? (
        <div className={styles.loadingState}>Đang tải bài viết...</div>
      ) : (
        <div className={styles.blogGrid}>
          {posts.length > 0 ? (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          ) : (
            <div className={styles.emptyState}>
              <h3>Không tìm thấy bài viết</h3>
              <p>Thử thay đổi từ khóa hoặc danh mục tìm kiếm.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
