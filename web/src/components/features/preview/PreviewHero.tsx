'use client';

import { BookOpen, Search, X, Sparkles } from 'lucide-react';
import styles from './previewHero.module.css';

interface PreviewHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export default function PreviewHero({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: PreviewHeroProps) {
  const allCategories = ['Tất cả', ...categories];

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.badge}>
          <Sparkles size={14} />
          <span>Trải nghiệm trước khi mua</span>
        </div>

        <h1 className={styles.title}>Thư Viện Đọc Thử Sách & Truyện</h1>

        <p className={styles.subtitle}>
          Khám phá những chương truyện hấp dẫn, trích đoạn đặc sắc hoàn toàn miễn phí.
          Đọc thử để tìm thấy cuốn sách chạm đến tâm hồn bạn trước khi đặt mua!
        </p>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm bài đọc thử theo tên sách, tác giả hoặc tiêu đề..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => onSearchChange('')}
              aria-label="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className={styles.categoriesRow}>
          {allCategories.map((cat) => {
            const isActive =
              (cat === 'Tất cả' && (!selectedCategory || selectedCategory === 'Tất cả')) ||
              selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryChip} ${isActive ? styles.categoryChipActive : ''}`}
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
