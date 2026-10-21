'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './workVolumesShelf.module.css';

interface Props {
  seriesName: string;
  seriesSlug: string;
  volumes: ReleaseScheduleItem[];
}

export function WorkVolumesShelf({ seriesName, seriesSlug, volumes }: Props) {
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const sortedVolumes = useMemo(() => {
    return [...volumes].sort((a, b) => {
      const volA = a.volumeNumber ?? 9999;
      const volB = b.volumeNumber ?? 9999;
      return sortOrder === 'ASC' ? volA - volB : volB - volA;
    });
  }, [volumes, sortOrder]);

  return (
    <div id="danh-sach-tap" className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.sectionTitle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.titleIcon}
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Danh sách các tập ({volumes.length})
          </h2>
          <span className={styles.subtitle}>
            Bấm vào từng tập để tra cứu chi tiết bản in, quà tặng kèm & link mua
          </span>
        </div>

        <div className={styles.controlGroup}>
          {/* Sort order toggle */}
          <button
            type="button"
            className={styles.sortToggleBtn}
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            title="Đảo chiều sắp xếp tập truyện"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 16 4 4 4-4" />
              <path d="M7 20V4" />
              <path d="m21 8-4-4-4 4" />
              <path d="M17 4v16" />
            </svg>
            <span>{sortOrder === 'ASC' ? 'Tập 1 → Mới nhất' : 'Mới nhất → Tập 1'}</span>
          </button>

          <Link
            href={`/lich-phat-hanh?q=${encodeURIComponent(seriesName)}`}
            className={styles.viewTimelineLink}
            title="Tra cứu lịch phát hành trên lịch tháng"
          >
            Xem trên lịch
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Grid of volumes */}
      <div className={styles.volumesGrid}>
        {sortedVolumes.map((vol) => {
          const detailUrl = vol.slug ? `/tap-truyen/${vol.slug}` : `/tac-pham/${seriesSlug}`;
          const isReleased = vol.status === 'RELEASED';
          const editionCount = vol.editions ? vol.editions.length : 1;

          return (
            <Link key={vol.id} href={detailUrl} className={styles.volumeCard}>
              <div className={styles.coverFrame}>
                {vol.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vol.coverUrl}
                    alt={vol.title}
                    className={styles.coverImg}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    Tập {vol.volumeNumber || ''}
                  </div>
                )}

                {vol.volumeNumber && (
                  <span className={styles.volBadge}>Tập {vol.volumeNumber}</span>
                )}
              </div>

              <div className={styles.volumeInfo}>
                <h3 className={styles.volumeTitle} title={vol.title}>
                  {vol.title}
                </h3>

                <div className={styles.metaRow}>
                  <span className={styles.releaseDate}>
                    {vol.releaseDate ? vol.releaseDate : 'Chưa định ngày'}
                  </span>

                  <span
                    className={`${styles.statusPill} ${isReleased ? styles.statusReleased : styles.statusScheduled
                      }`}
                  >
                    {isReleased ? 'Đã phát hành' : 'Lên lịch'}
                  </span>
                </div>

                {editionCount > 1 && (
                  <div className={styles.editionsHint}>
                    {editionCount} phiên bản ấn hành
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
