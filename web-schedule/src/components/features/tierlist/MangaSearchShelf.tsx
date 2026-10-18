'use client';

import React from 'react';
import { TierItemCard } from './TierItemCard';
import type { ReleaseScheduleItem } from '@/types/schedule';
import type { TierRankedMangaItem } from '@/types/tierList';
import styles from './mangaSearchShelf.module.css';

interface MangaSearchShelfProps {
  shelfItems: ReleaseScheduleItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableTiers: string[];
  onDragStart: (item: ReleaseScheduleItem | TierRankedMangaItem, source: 'shelf') => void;
  onAssignToTier: (item: ReleaseScheduleItem, tierName: string) => void;
}

export function MangaSearchShelf({
  shelfItems,
  searchQuery,
  setSearchQuery,
  availableTiers,
  onDragStart,
  onAssignToTier,
}: MangaSearchShelfProps) {
  return (
    <section className={styles.shelfContainer} aria-label="Kho truyện chờ xếp bậc">
      {/* Search Header Bar */}
      <div className={styles.searchHeader}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm tên truyện để kéo thả vào bậc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSearchQuery('')}
              aria-label="Xóa tìm kiếm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.countBadge}>
          {shelfItems.length} tác phẩm
        </div>
      </div>

      <div className={styles.guideText}>
        <span>Gợi ý: Nhấp &amp; giữ ảnh bìa để kéo thả lên bậc xếp hạng, hoặc bấm nút chọn nhanh (S/A/B/C)</span>
      </div>

      {/* Scrollable manga list */}
      <div className={styles.shelfList}>
        {shelfItems.length === 0 ? (
          <div className={styles.noResults}>
            Không tìm thấy truyện nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          shelfItems.map((manga) => (
            <TierItemCard
              key={manga.id}
              item={manga}
              source="shelf"
              onDragStart={(item) => onDragStart(item, 'shelf')}
              onAssignToTier={(tierName) => onAssignToTier(manga, tierName)}
              availableTiers={availableTiers}
            />
          ))
        )}
      </div>
    </section>
  );
}
