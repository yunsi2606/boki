'use client';

import React from 'react';
import styles from '@/app/books/books.module.css';

export const categoriesList = [
  { id: 1, name: 'Sách Văn học' },
  { id: 2, name: 'Sách Thiếu nhi' },
  { id: 3, name: 'Sách Kinh tế' },
  { id: 4, name: 'Sách Giáo khoa' },
  { id: 5, name: 'Kỹ Năng' },
  { id: 6, name: 'Phát triển bản thân' },
  { id: 7, name: 'Sổ tay các loại' },
];

export const conditionsList = [
  { value: 'NEW', label: 'Mới (NEW)' },
  { value: 'LIKE_NEW', label: 'Như mới (LIKE NEW)' },
  { value: 'GOOD', label: 'Tốt (GOOD)' },
  { value: 'FAIR', label: 'Chấp nhận được (FAIR)' },
  { value: 'POOR', label: 'Cũ/Yếu (POOR)' },
];

interface BooksSidebarFilterProps {
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
  selectedConditions: string[];
  onToggleCondition: (condition: string) => void;
}

export default function BooksSidebarFilter({
  selectedCategory,
  onSelectCategory,
  selectedConditions,
  onToggleCondition,
}: BooksSidebarFilterProps) {
  return (
    <aside className={styles.filterSidebar}>
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Thể loại sách</h3>
        <div className={styles.filterList}>
          <label
            className={`${styles.filterLabel} ${selectedCategory === null ? styles.activeFilterLabel : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            <input
              type="radio"
              name="category"
              checked={selectedCategory === null}
              onChange={() => {}}
              className={styles.radioInput}
            />
            Tất cả thể loại
          </label>
          {categoriesList.map((cat) => (
            <label
              key={cat.id}
              className={`${styles.filterLabel} ${selectedCategory === cat.id ? styles.activeFilterLabel : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.id}
                onChange={() => {}}
                className={styles.radioInput}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Tình trạng sách</h3>
        <div className={styles.filterList}>
          {conditionsList.map((cond) => (
            <label key={cond.value} className={styles.filterLabel}>
              <input
                type="checkbox"
                checked={selectedConditions.includes(cond.value)}
                onChange={() => onToggleCondition(cond.value)}
                className={styles.checkboxInput}
              />
              {cond.label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
