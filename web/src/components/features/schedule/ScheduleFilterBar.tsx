'use client';

import type { ScheduleFilterType } from '@/types/schedule';
import styles from './scheduleFilterBar.module.css';

interface ScheduleFilterBarProps {
  activeType: ScheduleFilterType;
  onSelectType: (type: ScheduleFilterType) => void;
  publishers: string[];
  selectedPublisher: string | null;
  onSelectPublisher: (pub: string | null) => void;
  counts: { all: number; preorder: number; recent: number };
}

export default function ScheduleFilterBar({
  activeType,
  onSelectType,
  publishers,
  selectedPublisher,
  onSelectPublisher,
  counts,
}: ScheduleFilterBarProps) {
  return (
    <div className={styles.filterContainer}>
      {/* Category Tabs */}
      <div className={styles.typeTabsRow}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeType === 'ALL' ? styles.tabBtnActive : ''}`}
          onClick={() => onSelectType('ALL')}
        >
          Tất cả lịch ({counts.all})
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeType === 'PREORDER' ? styles.tabBtnActive : ''}`}
          onClick={() => onSelectType('PREORDER')}
        >
          Đang mở đặt trước ({counts.preorder})
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeType === 'RECENT' ? styles.tabBtnActive : ''}`}
          onClick={() => onSelectType('RECENT')}
        >
          Mới lên kệ gần đây ({counts.recent})
        </button>
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
