'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';
import { SeriesVolumeSlider } from '@/components/features/schedule/SeriesVolumeSlider';
import { VolumeEditionsList } from '@/components/features/schedule/VolumeEditionsList';
import { VolumeVaultAction } from '@/components/features/schedule/VolumeVaultAction';
import { VolumeStoreLinks } from '@/components/features/schedule/VolumeStoreLinks';
import { VolumeChangelogTimeline } from '@/components/features/schedule/VolumeChangelogTimeline';
import styles from './tapTruyen.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function TapTruyenDetailPage({ params }: Props) {
  const { slug } = use(params);
  const [schedule, setSchedule] = useState<ReleaseScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEditionIdx, setActiveEditionIdx] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setActiveEditionIdx(0);
        let data: ReleaseScheduleItem | null = null;
        try {
          data = await scheduleService.getScheduleBySlug(slug);
        } catch {
          data = await scheduleService.getScheduleDetail(slug).catch(() => null);
        }
        setSchedule(data);
      } catch (err) {
        console.error('Failed to load volume detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingBox}>Đang tải thông tin tập truyện...</div>
      </main>
    );
  }

  if (!schedule) {
    return (
      <main className={styles.container}>
        <div className={styles.errorBox}>
          <h2>Không tìm thấy tập truyện</h2>
          <Link href="/" className={styles.backLink}>Quay lại Lịch phát hành</Link>
        </div>
      </main>
    );
  }

  const editions = schedule.editions && schedule.editions.length > 0 ? schedule.editions : [];
  const currentEdition: ReleaseScheduleEditionItem =
    editions[activeEditionIdx] || editions[0] || {
      editionName: 'Bản phổ thông',
      editionType: 'STANDARD',
      status: schedule.status,
    };

  const cover = currentEdition.coverUrl || schedule.coverUrl;
  const seriesSlug = schedule.seriesSlug || (schedule.seriesName ? schedule.seriesName.toLowerCase().replace(/\s+/g, '-') : '');

  return (
    <main className={styles.container}>
      <nav className={styles.breadcrumbRow}>
        <Link href="/" className={styles.breadcrumbLink}>Lịch phát hành</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        {seriesSlug && (
          <>
            <Link href={`/bo-truyen/${seriesSlug}`} className={styles.breadcrumbLink}>
              {schedule.seriesName || 'Bộ truyện'}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
          </>
        )}
        <span>{schedule.title}</span>
      </nav>

      {/* Series Volume Carousel */}
      {seriesSlug && (
        <SeriesVolumeSlider
          seriesSlug={seriesSlug}
          seriesName={schedule.seriesName}
          currentScheduleId={schedule.id}
          currentVolumeSlug={schedule.slug}
        />
      )}

      <div className={styles.mainGrid}>
        {/* Cover Column */}
        <div className={styles.coverSide}>
          <div className={styles.coverBox}>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={schedule.title} className={styles.coverImg} />
            ) : (
              <div className={styles.placeholderCover}>Bìa dự kiến</div>
            )}
          </div>

          <VolumeVaultAction
            scheduleId={schedule.id}
            editionId={currentEdition.id}
          />
        </div>

        {/* Info Column */}
        <div className={styles.infoSide}>
          <div className={styles.badgeRow}>
            <span className={styles.publisherBadge}>{schedule.publisher}</span>
            {schedule.volumeNumber !== undefined && schedule.volumeNumber !== null && (
              <span className={styles.volumeBadge}>Tập {schedule.volumeNumber}</span>
            )}
            <span className={styles.editionBadge}>{currentEdition.editionName}</span>
          </div>

          <h1 className={styles.bookTitle}>{schedule.title}</h1>
          {schedule.originalTitle && <p className={styles.originalTitle}>{schedule.originalTitle}</p>}

          <div className={styles.metaGrid}>
            <div>
              <div className={styles.metaItemLabel}>Tác giả</div>
              <div className={styles.metaItemValue}>{schedule.author || 'Đang cập nhật'}</div>
            </div>
            <div>
              <div className={styles.metaItemLabel}>Ngày phát hành</div>
              <div className={styles.metaItemValue}>
                {currentEdition.releaseDate || schedule.releaseDate || 'Đang cập nhật'}
              </div>
            </div>
            <div>
              <div className={styles.metaItemLabel}>Nhà xuất bản</div>
              <div className={styles.metaItemValue}>{schedule.publisher}</div>
            </div>
            <div>
              <div className={styles.metaItemLabel}>Thuộc bộ truyện</div>
              <div className={styles.metaItemValue}>
                {seriesSlug ? (
                  <Link href={`/bo-truyen/${seriesSlug}`} className={styles.seriesLink}>
                    {schedule.seriesName || 'Xem bộ truyện'}
                  </Link>
                ) : (
                  <span>Tập truyện đơn lẻ</span>
                )}
              </div>
            </div>
          </div>

          {/* Editions Breakdown */}
          <VolumeEditionsList
            editions={editions}
            selectedEditionIdx={activeEditionIdx}
            onSelectEdition={setActiveEditionIdx}
          />

          <h3 className={styles.sectionHeader}>Nơi mua sách chính hãng & Sàn thương mại</h3>
          <VolumeStoreLinks
            bookTitle={schedule.title}
            linkedBook={currentEdition.linkedBook}
            storeLinks={schedule.storeLinks}
          />

          {schedule.changelogs && schedule.changelogs.length > 0 && (
            <>
              <h3 className={styles.sectionHeader}>Lịch sử thay đổi ngày & giá</h3>
              <VolumeChangelogTimeline changelogs={schedule.changelogs} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
