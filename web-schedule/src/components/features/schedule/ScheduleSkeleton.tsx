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

export function VolumeDetailSkeleton() {
  return (
    <div className={styles.detailContainer} aria-label="Đang tải chi tiết tập truyện" aria-busy="true">
      {/* Breadcrumb Shimmer */}
      <div className={`${styles.detailBreadcrumbShimmer} ${styles.shimmerBox}`} />

      {/* Coverflow Banner Slider Shimmer */}
      <div className={`${styles.detailHeroSliderShimmer} ${styles.shimmerBox}`} />

      {/* 2-Column Detail Grid */}
      <div className={styles.detailGridSkeleton}>
        {/* Main Column */}
        <div className={styles.mainCol}>
          {/* Synopsis Shimmer Card */}
          <div className={styles.detailCardShimmer}>
            <div className={`${styles.detailTitleShimmer} ${styles.shimmerBox}`} />
            <div className={`${styles.detailLineShimmer} ${styles.shimmerBox}`} />
            <div className={`${styles.detailLineShimmer} ${styles.shimmerBox}`} />
            <div className={`${styles.detailLineShimmer} ${styles.detailLineShort} ${styles.shimmerBox}`} />
          </div>

          {/* Publication Specs Shimmer Card */}
          <div className={styles.detailCardShimmer}>
            <div className={`${styles.detailTitleShimmer} ${styles.shimmerBox}`} style={{ width: '40%' }} />
            <div className={styles.detailSpecsGrid}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className={`${styles.detailSpecCell} ${styles.shimmerBox}`} />
              ))}
            </div>
          </div>

          {/* Editions Shimmer Card */}
          <div className={styles.detailCardShimmer}>
            <div className={`${styles.detailTitleShimmer} ${styles.shimmerBox}`} style={{ width: '50%' }} />
            <div className={`${styles.detailLineShimmer} ${styles.shimmerBox}`} />
            <div className={`${styles.detailLineShimmer} ${styles.shimmerBox}`} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className={styles.sidebarCol}>
          <div className={styles.sidebarCardShimmer}>
            <div className={`${styles.sidebarCoverShimmer} ${styles.shimmerBox}`} />
            <div className={`${styles.detailLineShimmer} ${styles.shimmerBox}`} style={{ width: '70%' }} />
            <div className={`${styles.detailLineShimmer} ${styles.shimmerBox}`} style={{ width: '50%' }} />
            <div className={`${styles.sidebarBtnShimmer} ${styles.shimmerBox}`} />
            <div className={`${styles.sidebarBtnShimmer} ${styles.shimmerBox}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
