'use client';

import type { ScheduleViewMode } from '@/types/schedule';
import styles from './scheduleViewModeToggle.module.css';

interface ScheduleViewModeToggleProps {
  viewMode: ScheduleViewMode;
  onChangeViewMode: (mode: ScheduleViewMode) => void;
}

export default function ScheduleViewModeToggle({
  viewMode,
  onChangeViewMode,
}: ScheduleViewModeToggleProps) {
  return (
    <div className={styles.toggleContainer} role="group" aria-label="Chế độ xem lịch phát hành">
      <button
        type="button"
        className={`${styles.toggleBtn} ${viewMode === 'DAY' ? styles.toggleBtnActive : ''}`}
        onClick={() => onChangeViewMode('DAY')}
      >
        Theo ngày
      </button>
      <button
        type="button"
        className={`${styles.toggleBtn} ${viewMode === 'MONTH' ? styles.toggleBtnActive : ''}`}
        onClick={() => onChangeViewMode('MONTH')}
      >
        Theo tháng
      </button>
    </div>
  );
}
