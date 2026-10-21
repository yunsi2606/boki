'use client';

import Link from 'next/link';
import styles from './homeFeaturedSeries.module.css';

interface SeriesSummary {
  seriesSlug: string;
  seriesName: string;
  totalVolumes: number;
  sampleCover?: string;
}

interface Props {
  series: SeriesSummary[];
}

export function HomeFeaturedSeries({ series }: Props) {
  if (!series || series.length === 0) return null;

  const displayList = series.slice(0, 6);

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>BỘ TRUYỆN HOT</div>
          <h2 className={styles.title}>Tác Phẩm Bản Quyền Nổi Bật</h2>
        </div>
        <Link href="/tac-pham" className={styles.viewAllLink}>
          <span>Xem tất cả ({series.length})</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
        {displayList.map((item) => (
          <Link
            key={item.seriesSlug}
            href={`/tac-pham/${item.seriesSlug}`}
            className={styles.card}
          >
            <div className={styles.coverWrapper}>
              {item.sampleCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.sampleCover} alt={item.seriesName} className={styles.coverImg} />
              ) : (
                <div className={styles.placeholderCover}>Bìa truyện</div>
              )}
              <span className={styles.formatBadge}>MANGA</span>
            </div>
            <div className={styles.info}>
              <h3 className={styles.seriesName} title={item.seriesName}>
                {item.seriesName}
              </h3>
              <div className={styles.volCount}>{item.totalVolumes} tập đã lên lịch</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
