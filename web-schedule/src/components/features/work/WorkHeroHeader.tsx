'use client';

import React from 'react';
import Link from 'next/link';
import styles from './workHeroHeader.module.css';

interface Props {
  seriesName: string;
  originalTitle?: string;
  coverUrl?: string;
  publisher?: string;
  format?: string;
  seriesStatus?: string;
  ageRating?: string;
  viewsCount?: number;
  rating?: number;
  totalReviews?: number;
  volumeCount: number;
  seriesSlug: string;
  onScrollToReviews: () => void;
}

export function WorkHeroHeader({
  seriesName,
  originalTitle,
  coverUrl,
  publisher,
  format = 'MANGA',
  seriesStatus = 'ONGOING',
  ageRating,
  viewsCount = 1250,
  rating = 4.9,
  totalReviews = 0,
  volumeCount = 1,
  seriesSlug,
  onScrollToReviews,
}: Props) {
  const isCompleted = seriesStatus === 'COMPLETED';
  const statusLabel = isCompleted ? 'Đã hoàn thành' : 'Đang phát hành';

  return (
    <div className={styles.heroWrapper}>
      {/* Background ambient banner blur */}
      <div className={styles.backdropBlur}>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className={styles.backdropImg} aria-hidden="true" />
        )}
      </div>

      <div className={styles.heroContent}>
        {/* Cover Poster Box */}
        <div className={styles.posterColumn}>
          <div className={styles.posterFrame}>
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt={seriesName}
                className={styles.posterImg}
                loading="eager"
              />
            ) : (
              <div className={styles.posterPlaceholder}>Bìa tác phẩm</div>
            )}
            <span className={styles.formatBadge}>{format}</span>
          </div>
        </div>

        {/* Info Column */}
        <div className={styles.infoColumn}>
          {/* Status & Publisher Badges */}
          <div className={styles.badgeRow}>
            <span
              className={`${styles.statusBadge} ${isCompleted ? styles.statusCompleted : styles.statusOngoing
                }`}
            >
              {statusLabel}
            </span>

            {publisher && <span className={styles.publisherBadge}>{publisher}</span>}

            {ageRating && <span className={styles.ageBadge}>{ageRating}</span>}
          </div>

          <h1 className={styles.seriesTitle}>{seriesName}</h1>

          {originalTitle && (
            <p className={styles.originalTitle} title="Tên gốc / Tên tiếng Nhật">
              {originalTitle}
            </p>
          )}

          {/* Quick Metrics */}
          <div className={styles.metricsBar}>
            <div className={styles.metricItem}>
              <div className={styles.metricValue}>
                <svg
                  className={styles.starIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{rating.toFixed(1)}</span>
              </div>
              <span className={styles.metricLabel}>
                {totalReviews > 0 ? `${totalReviews} đánh giá` : 'Độc giả chấm'}
              </span>
            </div>

            <div className={styles.metricDivider} />

            <div className={styles.metricItem}>
              <div className={styles.metricValue}>
                <svg
                  className={styles.metaIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{viewsCount.toLocaleString()}</span>
              </div>
              <span className={styles.metricLabel}>Lượt tra cứu</span>
            </div>

            <div className={styles.metricDivider} />

            <div className={styles.metricItem}>
              <div className={styles.metricValue}>
                <svg
                  className={styles.metaIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
                <span>{volumeCount} tập</span>
              </div>
              <span className={styles.metricLabel}>Đã có lịch</span>
            </div>
          </div>

          {/* Action Row */}
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={onScrollToReviews}
              className={styles.primaryActionBtn}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Đánh giá bộ truyện</span>
            </button>

            <a
              href="#danh-sach-tap"
              className={styles.secondaryActionBtn}
              title="Xem danh sách các tập đã lên lịch phát hành"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Xem danh sách tập</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
