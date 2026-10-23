'use client';

import React from 'react';
import styles from './adminScheduleFilterBar.module.css';

export interface MonthPeriodOption {
  value: string; // 'ALL' or 'YYYY-MM'
  label: string;
}

interface Props {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedPeriod: string;
  onSelectPeriod: (val: string) => void;
  availablePeriods: MonthPeriodOption[];
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  selectedPublisher: string;
  onSelectPublisher: (val: string) => void;
  publishers: string[];
  linkFilter: 'ALL' | 'LINKED' | 'UNLINKED';
  onSelectLinkFilter: (val: 'ALL' | 'LINKED' | 'UNLINKED') => void;
}

export default function AdminScheduleFilterBar({
  searchTerm,
  onSearchChange,
  selectedPeriod,
  onSelectPeriod,
  availablePeriods,
  onPrevPeriod,
  onNextPeriod,
  selectedPublisher,
  onSelectPublisher,
  publishers,
  linkFilter,
  onSelectLinkFilter,
}: Props) {
  return (
    <div className={styles.filterCard}>
      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên truyện, tên gốc, tác giả, quà tặng..."
        />
      </div>

      <div className={styles.controlsGroup}>
        {/* Month - Year Stepper / Selector */}
        <div className={styles.periodControl}>
          <button
            type="button"
            className={styles.navArrowBtn}
            onClick={onPrevPeriod}
            title="Kỳ trước (Tháng trước)"
            aria-label="Kỳ trước"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <select
            className={styles.periodSelect}
            value={selectedPeriod}
            onChange={(e) => onSelectPeriod(e.target.value)}
            title="Chọn kỳ phát hành (Tháng/Năm)"
          >
            <option value="ALL">Tất cả kỳ phát hành</option>
            {availablePeriods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.navArrowBtn}
            onClick={onNextPeriod}
            title="Kỳ sau (Tháng sau)"
            aria-label="Kỳ sau"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Publisher / Imprint selector */}
        <select
          className={styles.standardSelect}
          value={selectedPublisher}
          onChange={(e) => onSelectPublisher(e.target.value)}
          title="Lọc theo đơn vị phát hành / nhà xuất bản"
        >
          <option value="ALL">Tất cả đơn vị phát hành</option>
          {publishers.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Linked store status */}
        <select
          className={styles.standardSelect}
          value={linkFilter}
          onChange={(e) => onSelectLinkFilter(e.target.value as 'ALL' | 'LINKED' | 'UNLINKED')}
          title="Lọc theo tình trạng liên kết sách"
        >
          <option value="ALL">Tất cả tình trạng link</option>
          <option value="LINKED">Đã có bản link sách Boki</option>
          <option value="UNLINKED">Chưa có bản nào link</option>
        </select>
      </div>
    </div>
  );
}
