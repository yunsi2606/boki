'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  TrendingUp,
  Atom,
  Cpu,
  Landmark,
  Sparkles,
  Brain,
  GraduationCap,
  Palette,
  HeartPulse,
  Layers,
  BookMarked,
  Heart,
  Backpack,
  Wand2,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types';
import styles from './CategoryCircles.module.css';

interface CategoryTheme {
  icon: LucideIcon;
  color: string;
  bg: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'truyen-tranh': { icon: Layers, color: '#ee4d2d', bg: '#fff1f0' },
  'tieu-thuyet': { icon: BookMarked, color: '#7c3aed', bg: '#f5f3ff' },
  'dam-my': { icon: Heart, color: '#ec4899', bg: '#fdf2f8' },
  'hoc-duong': { icon: Backpack, color: '#059669', bg: '#ecfdf5' },
  'chuyen-sinh': { icon: Wand2, color: '#0284c7', bg: '#f0f9ff' },
  'van-hoc': { icon: BookOpen, color: '#d97706', bg: '#fffbeb' },
  'kinh-te': { icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
  'khoa-hoc': { icon: Atom, color: '#0891b2', bg: '#ecfeff' },
  'cong-nghe': { icon: Cpu, color: '#4f46e5', bg: '#eef2ff' },
  'lich-su': { icon: Landmark, color: '#b45309', bg: '#fef3c7' },
  'thieu-nhi': { icon: Sparkles, color: '#f59e0b', bg: '#fffbeb' },
  'tam-ly-hoc': { icon: Brain, color: '#9333ea', bg: '#faf5ff' },
  'giao-duc': { icon: GraduationCap, color: '#16a34a', bg: '#f0fdf4' },
  'nghe-thuat': { icon: Palette, color: '#e11d48', bg: '#fff1f2' },
  'suc-khoe': { icon: HeartPulse, color: '#10b981', bg: '#ecfdf5' },
};

function getTheme(slug?: string): CategoryTheme {
  if (slug && CATEGORY_THEMES[slug]) return CATEGORY_THEMES[slug];
  return { icon: Compass, color: '#64748b', bg: '#f8fafc' };
}

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
    const offset = direction === 'left' ? -360 : 360;
    sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className={styles.categoriesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.titleGroup}>
            <h2 className={styles.sectionTitle}>Danh Mục Sản Phẩm</h2>
            <span className={styles.subtitle}>
              {categories.length > 0
                ? `${categories.length} thể loại sách phong phú`
                : 'Khám phá theo thể loại'}
            </span>
          </div>

          <div className={styles.sliderControls}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Cuộn danh mục sang trái"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Cuộn danh mục sang phải"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className={styles.sliderGrid} ref={sliderRef}>
          {loading ? (
            Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className={styles.skeletonCard} />
            ))
          ) : (
            categories.map((cat) => {
              const theme = getTheme(cat.slug);
              const IconComponent = theme.icon;

              return (
                <Link
                  key={cat.id}
                  href={`/books?category=${cat.id}`}
                  className={styles.categoryCard}
                  title={cat.description || cat.name}
                >
                  <div
                    className={styles.iconContainer}
                    style={{ backgroundColor: theme.bg, color: theme.color }}
                  >
                    <IconComponent size={22} strokeWidth={2} />
                  </div>
                  <span className={styles.categoryName}>{cat.name}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
