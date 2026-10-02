'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { ProductTypeFilter } from './BooksSidebarFilter';
import styles from '@/app/books/books.module.css';

interface MobileFilterBarProps {
  onOpenDrawer: () => void;
  activeFilterCount: number;
  productType: ProductTypeFilter;
  onToggleProductType: (type: 'PREORDER' | 'COMBO') => void;
}

export default function MobileFilterBar({
  onOpenDrawer,
  activeFilterCount,
  productType,
  onToggleProductType,
}: MobileFilterBarProps) {
  return (
    <div className={styles.mobileFilterBar}>
      <button
        type="button"
        className={`${styles.mobileFilterTriggerBtn} ${activeFilterCount > 0 ? styles.mobileFilterTriggerBtnActive : ''}`}
        onClick={onOpenDrawer}
      >
        <SlidersHorizontal size={15} />
        <span>Bộ lọc</span>
        {activeFilterCount > 0 && (
          <span className={styles.filterCountBadge}>{activeFilterCount}</span>
        )}
      </button>

      <button
        type="button"
        className={`${styles.mobileQuickChip} ${productType === 'PREORDER' ? styles.mobileQuickChipActive : ''}`}
        onClick={() => onToggleProductType('PREORDER')}
      >
        Hàng đặt trước
      </button>

      <button
        type="button"
        className={`${styles.mobileQuickChip} ${productType === 'COMBO' ? styles.mobileQuickChipActive : ''}`}
        onClick={() => onToggleProductType('COMBO')}
      >
        Combo tiết kiệm
      </button>
    </div>
  );
}
