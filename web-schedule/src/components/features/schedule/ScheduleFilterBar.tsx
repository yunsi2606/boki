'use client';

import styles from './scheduleFilterBar.module.css';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPublisher: string;
  onSelectPublisher: (pub: string) => void;
  publishers: string[];
}

export function ScheduleFilterBar({
  searchQuery,
  onSearchChange,
  selectedPublisher,
  onSelectPublisher,
  publishers,
}: Props) {
  const allPublishers = ['ALL', ...publishers.filter((p) => p !== 'ALL')];

  return (
    <div className={styles.filterContainer}>
      <div className={styles.topRow}>
        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm tên truyện, tác giả..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.publisherRow}>
        {allPublishers.map((pub) => {
          const isActive = selectedPublisher === pub;
          const label = pub === 'ALL' ? 'Tất cả đơn vị' : pub;
          return (
            <button
              key={pub}
              type="button"
              className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ''}`}
              onClick={() => onSelectPublisher(pub)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
