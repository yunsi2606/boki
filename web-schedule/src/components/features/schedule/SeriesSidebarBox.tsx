'use client';

import Link from 'next/link';
import styles from './seriesSidebarBox.module.css';

interface Props {
  seriesSlug: string;
  seriesName: string;
  coverUrl?: string;
  author?: string;
  publisher?: string;
  totalVolumes?: number;
}

export function SeriesSidebarBox({
  seriesSlug,
  seriesName,
  coverUrl,
  author,
  publisher,
  totalVolumes,
}: Props) {
  return (
    <div className={styles.boxContainer}>
      <div className={styles.boxHeader}>THUỘC BỘ TRUYỆN</div>

      <div className={styles.coverWrapper}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={seriesName} className={styles.coverImg} />
        ) : (
          <div className={styles.coverPlaceholder}>Bìa bộ truyện</div>
        )}
      </div>

      <div className={styles.content}>
        <h4 className={styles.seriesTitle}>{seriesName}</h4>
        <div className={styles.statusBadge}>Đang xuất bản</div>

        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Tác giả:</span>
          {author ? (
            <Link
              href={`/bo-truyen?author=${encodeURIComponent(author)}`}
              className={styles.metaLink}
              title={`Xem tác phẩm của ${author}`}
            >
              {author}
            </Link>
          ) : (
            <span className={styles.metaVal}>Đang cập nhật</span>
          )}
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>NXB:</span>
          {publisher ? (
            <Link
              href={`/bo-truyen?publisher=${encodeURIComponent(publisher)}`}
              className={styles.metaLink}
              title={`Xem tác phẩm của ${publisher}`}
            >
              {publisher}
            </Link>
          ) : (
            <span className={styles.metaVal}>Đang cập nhật</span>
          )}
        </div>

        {totalVolumes !== undefined && totalVolumes > 0 && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Số tập:</span>
            <span className={styles.metaVal}>{totalVolumes} tập</span>
          </div>
        )}

        <Link href={`/bo-truyen/${seriesSlug}`} className={styles.detailBtn}>
          Xem toàn bộ truyện
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
