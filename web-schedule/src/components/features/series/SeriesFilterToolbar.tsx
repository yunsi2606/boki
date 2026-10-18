'use client';

import React from 'react';
import styles from './seriesFilterToolbar.module.css';

interface Props {
  selectedPublisher: string;
  onSelectPublisher: (pub: string) => void;
  selectedFormat: string;
  onSelectFormat: (fmt: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  authorFilter?: string;
  onClearAuthor: () => void;
  availablePublishers: string[];
  onClearAll: () => void;
}

const FORMAT_PRESETS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'MANGA', label: 'Manga' },
  { key: 'LIGHT_NOVEL', label: 'Light Novel' },
  { key: 'COMIC', label: 'Comic' },
  { key: 'ARTBOOK', label: 'Artbook' },
];

const GENRE_PRESETS = [
  'Shonen', 'Seinen', 'Hành động', 'Isekai', 'Romance', 'Thể thao', 'Trinh thám', 'Kỳ ảo'
];

export function SeriesFilterToolbar({
  selectedPublisher,
  onSelectPublisher,
  selectedFormat,
  onSelectFormat,
  selectedGenre,
  onSelectGenre,
  authorFilter,
  onClearAuthor,
  availablePublishers,
  onClearAll,
}: Props) {
  const hasActiveFilters =
    (selectedPublisher && selectedPublisher !== 'ALL') ||
    (selectedFormat && selectedFormat !== 'ALL') ||
    (selectedGenre && selectedGenre !== 'ALL') ||
    Boolean(authorFilter);

  return (
    <div className={styles.toolbar}>
      {/* Format Filter Row */}
      <div className={styles.filterRow}>
        <span className={styles.rowLabel}>Định dạng:</span>
        <div className={styles.chipsContainer}>
          {FORMAT_PRESETS.map((fmt) => {
            const active = selectedFormat === fmt.key;
            return (
              <button
                key={fmt.key}
                type="button"
                className={`${styles.chipBtn} ${active ? styles.activeChip : ''}`}
                onClick={() => onSelectFormat(fmt.key)}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Publisher Filter Row */}
      <div className={styles.filterRow}>
        <span className={styles.rowLabel}>Nhà xuất bản:</span>
        <div className={styles.chipsContainer}>
          <button
            type="button"
            className={`${styles.chipBtn} ${selectedPublisher === 'ALL' ? styles.activeChip : ''}`}
            onClick={() => onSelectPublisher('ALL')}
          >
            Tất cả NXB
          </button>
          {availablePublishers.map((pub) => {
            const active = selectedPublisher === pub;
            return (
              <button
                key={pub}
                type="button"
                className={`${styles.chipBtn} ${active ? styles.activeChip : ''}`}
                onClick={() => onSelectPublisher(pub)}
              >
                {pub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre Filter Row */}
      <div className={styles.filterRow}>
        <span className={styles.rowLabel}>Thể loại:</span>
        <div className={styles.chipsContainer}>
          <button
            type="button"
            className={`${styles.chipBtn} ${selectedGenre === 'ALL' ? styles.activeChip : ''}`}
            onClick={() => onSelectGenre('ALL')}
          >
            Tất cả
          </button>
          {GENRE_PRESETS.map((g) => {
            const active = selectedGenre === g;
            return (
              <button
                key={g}
                type="button"
                className={`${styles.chipBtn} ${active ? styles.activeChip : ''}`}
                onClick={() => onSelectGenre(g)}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className={styles.activeFiltersBar}>
          <div className={styles.activeTagsGroup}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#868e96' }}>
              Đang lọc theo:
            </span>
            {selectedFormat !== 'ALL' && (
              <span className={styles.activeFilterBadge}>
                Định dạng: {selectedFormat}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => onSelectFormat('ALL')}
                >
                  ✕
                </button>
              </span>
            )}
            {selectedPublisher !== 'ALL' && (
              <span className={styles.activeFilterBadge}>
                NXB: {selectedPublisher}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => onSelectPublisher('ALL')}
                >
                  ✕
                </button>
              </span>
            )}
            {selectedGenre !== 'ALL' && (
              <span className={styles.activeFilterBadge}>
                Thể loại: {selectedGenre}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => onSelectGenre('ALL')}
                >
                  ✕
                </button>
              </span>
            )}
            {authorFilter && (
              <span className={styles.activeFilterBadge}>
                Tác giả: {authorFilter}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={onClearAuthor}
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <button type="button" className={styles.clearAllBtn} onClick={onClearAll}>
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
