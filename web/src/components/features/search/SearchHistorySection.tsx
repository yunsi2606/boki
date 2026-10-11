'use client';

import React from 'react';
import styles from './searchHistory.module.css';

interface SearchHistorySectionProps {
  history: string[];
  onSelectKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onClearAll: () => void;
}

export default function SearchHistorySection({
  history,
  onSelectKeyword,
  onRemoveKeyword,
  onClearAll,
}: SearchHistorySectionProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className={styles.historySection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Lịch sử tìm kiếm</span>
        <button
          type="button"
          className={styles.clearAllBtn}
          onClick={onClearAll}
          aria-label="Xóa tất cả lịch sử"
        >
          Xóa tất cả
        </button>
      </div>

      <div className={styles.historyChipsContainer}>
        {history.map((kw) => (
          <div
            key={kw}
            className={styles.historyChip}
            onClick={() => onSelectKeyword(kw)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectKeyword(kw);
            }}
          >
            <span className={styles.chipText}>{kw}</span>
            <button
              type="button"
              className={styles.deleteChipBtn}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveKeyword(kw);
              }}
              aria-label={`Xóa ${kw}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
