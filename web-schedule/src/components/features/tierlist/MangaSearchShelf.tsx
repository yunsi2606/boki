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
  onDragStart: (item: ReleaseScheduleItem | TierRankedMangaItem, source: 'shelf') => void;
}

export function MangaSearchShelf({
  shelfItems,
  searchQuery,
  setSearchQuery,
  onDragStart,
}: MangaSearchShelfProps) {
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <aside className={styles.sidebar} aria-label="Tìm kiếm truyện">
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>Kho Truyện</h3>
        <p className={styles.sidebarSubtitle}>Tìm truyện và kéo thả sang bậc xếp hạng</p>

        {/* Search Input Box */}
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm tên truyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {hasQuery && (
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
      </div>

      {/* Results / Empty Search Guidance */}
      <div className={styles.resultsArea}>
        {!hasQuery ? (
          <div className={styles.idleState}>
            <div className={styles.idleIconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className={styles.idleText}>Nhập tên truyện vào thanh tìm kiếm ở trên để bắt đầu thêm vào bảng xếp hạng</p>
          </div>
        ) : shelfItems.length === 0 ? (
          <div className={styles.noResults}>
            Không tìm thấy truyện nào khớp với &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <>
            <div className={styles.resultCount}>
              Tìm thấy {shelfItems.length} tác phẩm
            </div>
            <div className={styles.mangaGrid}>
              {shelfItems.map((manga) => (
                <TierItemCard
                  key={manga.id}
                  item={manga}
                  source="shelf"
                  onDragStart={(item) => onDragStart(item, 'shelf')}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
