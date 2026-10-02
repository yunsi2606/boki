'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import styles from './CollectionFilterHeader.module.css';

interface ActiveFilterItem {
  key: string;
  label: string;
  value: string;
}

interface CollectionFilterHeaderProps {
  totalCount: number;
  categoryName?: string | null;
}

const FILTER_LABELS: Record<string, string> = {
  author: 'Tác giả',
  series: 'Bộ sách',
  publisher: 'Nhà xuất bản',
  supplier: 'Đơn vị phát hành',
  audience: 'Đối tượng',
  translator: 'Dịch giả',
  format: 'Hình thức bìa',
  search: 'Từ khóa',
};

export default function CollectionFilterHeader({
  totalCount,
  categoryName,
}: CollectionFilterHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilters: ActiveFilterItem[] = [];
  FILTER_LABELS_ENTRIES: Object.entries(FILTER_LABELS).forEach(([paramKey, label]) => {
    const val = searchParams.get(paramKey);
    if (val && val.trim()) {
      activeFilters.push({ key: paramKey, label, value: val.trim() });
    }
  });

  const removeFilter = (keyToRemove: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete(keyToRemove);
    const queryString = nextParams.toString();
    router.push(`/books${queryString ? `?${queryString}` : ''}`);
  };

  const clearAllFilters = () => {
    router.push('/books');
  };

  // Determine main headline
  let mainTitle = 'Cửa hàng sách Boki';
  let highlightValue = '';

  const primaryFilter = activeFilters[0];
  if (primaryFilter) {
    mainTitle = `${primaryFilter.label}: `;
    highlightValue = primaryFilter.value;
  } else if (categoryName) {
    mainTitle = 'Thể loại: ';
    highlightValue = categoryName;
  }

  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.pageTitle}>
        {mainTitle}
        {highlightValue && <span className={styles.highlightText}>{highlightValue}</span>}
      </h1>

      <p className={styles.summaryText}>
        {activeFilters.length > 0 || categoryName
          ? `Tìm thấy ${totalCount} cuốn sách phù hợp với bộ sưu tập`
          : 'Khám phá hàng ngàn tựa sách từ các người bán uy tín'}
      </p>

      {activeFilters.length > 0 && (
        <div className={styles.activeChipsList}>
          {activeFilters.map((filter) => (
            <span key={filter.key} className={styles.filterChip}>
              <span>{filter.label}: {filter.value}</span>
              <button
                type="button"
                className={styles.chipCloseBtn}
                onClick={() => removeFilter(filter.key)}
                aria-label={`Xóa bộ lọc ${filter.label}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}

          {activeFilters.length > 1 && (
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={clearAllFilters}
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
