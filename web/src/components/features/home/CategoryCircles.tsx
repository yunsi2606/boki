'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types';
import CategoryCard from './CategoryCard';
import styles from './CategoryCircles.module.css';

export default function CategoryCircles() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((data) => {
        setCategories(data || []);
      })
      .catch((err) => console.error('Error fetching homepage categories:', err))
      .finally(() => setLoading(false));
  }, []);

  const updateScrollState = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const offset = direction === 'left' ? -440 : 440;
    sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className={styles.categoriesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.titleCol}>
            <h2 className={styles.sectionTitle}>
              Khám phá <span className={styles.accentTitle}>theo thể loại</span>
            </h2>
            <span className={styles.subtitle}>
              Những cuốn sách phù hợp với sở thích của bạn
            </span>
          </div>

          <div className={styles.headerActions}>
            <Link href="/books" className={styles.viewAllLink}>
              <span>Xem tất cả</span>
              <ChevronRight size={14} />
            </Link>

            <div className={styles.sliderControls}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Cuộn danh mục sang trái"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Cuộn danh mục sang phải"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.sliderGrid} ref={sliderRef}>
          {loading ? (
            Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className={styles.skeletonCard} />
            ))
          ) : (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
