'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import PreviewHero from '@/components/features/preview/PreviewHero';
import PreviewCard from '@/components/features/preview/PreviewCard';
import { blogService } from '@/services/blogService';
import type { BlogPost, BlogCategory } from '@/types/blog';
import styles from './previewPage.module.css';

export default function PreviewLibraryPage() {
  const [previews, setPreviews] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load categories
  useEffect(() => {
    blogService
      .getCategories()
      .then((cats: BlogCategory[]) => {
        if (cats && cats.length > 0) {
          setCategories(cats.map((c) => c.name));
        }
      })
      .catch((err) => console.warn('Could not load categories:', err));
  }, []);

  // Fetch previews
  const fetchPreviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await blogService.getPreviews({
        category: selectedCategory !== 'Tất cả' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        page: 0,
        size: 24,
      });
      setPreviews(data || []);
    } catch (err) {
      console.error('Failed to load previews:', err);
      setPreviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPreviews();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPreviews]);

  return (
    <main className={styles.pageContainer}>
      <PreviewHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <div className={styles.toolbar}>
        <div className={styles.resultsCount}>
          Tìm thấy <strong>{previews.length}</strong> bài đọc thử
          {selectedCategory !== 'Tất cả' && ` trong "${selectedCategory}"`}
          {searchQuery && ` cho "${searchQuery}"`}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : previews.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen size={48} strokeWidth={1.5} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Chưa có bài đọc thử phù hợp</h2>
          <p className={styles.emptyDesc}>
            Hãy thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác để khám phá các bài đọc thử sách bản quyền.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {previews.map((post) => (
            <PreviewCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
