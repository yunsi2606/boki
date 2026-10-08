'use client';

import type { ScheduleTabFilter } from '@/types/schedule';
import styles from './scheduleFilterBar.module.css';

interface ScheduleFilterBarProps {
  activeTab: ScheduleTabFilter;
  onSelectTab: (tab: ScheduleTabFilter) => void;
  publishers: string[];
  selectedPublisher: string | null;
  onSelectPublisher: (pub: string | null) => void;
  selectedMonth: number | null;
  onSelectMonth: (month: number | null) => void;
  counts: { all: number; linked: number; special: number };
}

export default function ScheduleFilterBar({
  activeTab,
  onSelectTab,
  publishers,
  selectedPublisher,
  onSelectPublisher,
  selectedMonth,
  onSelectMonth,
  counts,
}: ScheduleFilterBarProps) {
  const monthOptions = [
    { label: 'Tất cả tháng', value: null },
    { label: 'Tháng 10/2026', value: 10 },
    { label: 'Tháng 11/2026', value: 11 },
    { label: 'Tháng 12/2026', value: 12 },
  ];

  return (
    <div className={styles.filterContainer}>
      {/* Category Tabs & Month selector Row */}
      <div className={styles.topControlRow}>
        <div className={styles.typeTabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.tabBtnActive : ''}`}
            onClick={() => onSelectTab('ALL')}
          >
            Tất cả lịch ({counts.all})
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'LINKED' ? styles.tabBtnActive : ''}`}
            onClick={() => onSelectTab('LINKED')}
          >
            Đã có link trên Boki ({counts.linked})
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'SPECIAL' ? styles.tabBtnActive : ''}`}
            onClick={() => onSelectTab('SPECIAL')}
          >
            Bản đặc biệt / Giới hạn ({counts.special})
          </button>
        </div>

        {/* Month Filter Selector */}
        <div className={styles.monthSelector}>
          <span className={styles.monthLabel}>Kỳ phát hành:</span>
          <select
            className={styles.monthSelectInput}
            value={selectedMonth ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null;
              onSelectMonth(val);
            }}
          >
            {monthOptions.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Publisher Badges Filter */}
      {publishers.length > 0 && (
        <div className={styles.publishersRow}>
          <span className={styles.pubLabel}>Nhà xuất bản:</span>
          <button
            type="button"
            className={`${styles.pubChip} ${selectedPublisher === null ? styles.pubChipActive : ''}`}
            onClick={() => onSelectPublisher(null)}
          >
            Tất cả đơn vị
          </button>
          {publishers.map((pub) => (
            <button
              key={pub}
              type="button"
              className={`${styles.pubChip} ${selectedPublisher === pub ? styles.pubChipActive : ''}`}
              onClick={() => onSelectPublisher(selectedPublisher === pub ? null : pub)}
            >
              {pub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
