'use client';

import styles from './scheduleSkeleton.module.css';

export function BookCardSkeleton() {
  return (
    <div className={styles.cardSkeleton} aria-hidden="true">
      <div className={`${styles.coverShimmer} ${styles.shimmerBox}`} />
      <div className={`${styles.titleShimmer} ${styles.shimmerBox}`} />
      <div className={`${styles.tagShimmer} ${styles.shimmerBox}`} />
      <div className={styles.priceRowShimmer}>
        <div className={`${styles.priceShimmer} ${styles.shimmerBox}`} />
        <div className={`${styles.dateShimmer} ${styles.shimmerBox}`} />
      </div>
    </div>
  );
}

export function HomeGridSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div className={styles.homeGridSkeleton} aria-label="Đang tải danh sách truyện">
      {Array.from({ length: count }).map((_, idx) => (
        <BookCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function TimelineGroupSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div aria-label="Đang tải dòng thời gian">
      {Array.from({ length: count }).map((_, gIdx) => (
        <div key={gIdx} className={styles.timelineSkeletonRow} aria-hidden="true">
          <div className={`${styles.dateBlockShimmer} ${styles.shimmerBox}`} />
          <div className={styles.timelineCardsGrid}>
            {Array.from({ length: 4 }).map((_, cIdx) => (
              <BookCardSkeleton key={cIdx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
