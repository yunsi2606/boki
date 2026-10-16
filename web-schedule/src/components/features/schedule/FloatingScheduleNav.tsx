'use client';

import styles from './floatingScheduleNav.module.css';

interface Props {
  month: number;
  year: number;
  viewMode: 'TIMELINE' | 'CALENDAR';
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleView: () => void;
  onJumpToday?: () => void;
}

export function FloatingScheduleNav({
  month,
  year,
  viewMode,
  onPrevMonth,
  onNextMonth,
  onToggleView,
  onJumpToday,
}: Props) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className={styles.floatingBar}>
      {/* Month Prev */}
      <button type="button" className={styles.iconBtn} onClick={onPrevMonth} title="Tháng trước">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Month Label */}
      <div className={styles.monthBadge}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>
          {String(month).padStart(2, '0')}/{String(year).slice(-2)}
        </span>
      </div>

      {/* Month Next */}
      <button type="button" className={styles.iconBtn} onClick={onNextMonth} title="Tháng sau">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <span className={styles.divider} />

      {/* Scroll to Top */}
      <button type="button" className={styles.iconBtn} onClick={scrollToTop} title="Lên đầu trang">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>

      {/* Jump to Today */}
      {onJumpToday && (
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.todayBtn}`}
          onClick={onJumpToday}
          title="Nhảy đến hôm nay"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}

      {/* Scroll to Bottom */}
      <button type="button" className={styles.iconBtn} onClick={scrollToBottom} title="Xuống cuối trang">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </button>

      <span className={styles.divider} />

      {/* View Mode Toggle */}
      <button
        type="button"
        className={`${styles.viewToggleBtn} ${viewMode === 'CALENDAR' ? styles.activeView : ''}`}
        onClick={onToggleView}
        title="Chuyển chế độ xem"
      >
        {viewMode === 'CALENDAR' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>Dòng thời gian</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Lưới Tháng</span>
          </>
        )}
      </button>
    </div>
  );
}
