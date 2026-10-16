'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';
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
  const [activeEditionIdx] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Đang tải thông tin tập truyện...
        </div>
      </main>
    );
  }

  if (!schedule) {
    return (
      <main className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Không tìm thấy tập truyện</h2>
          <Link href="/" style={{ color: 'var(--color-primary-500)' }}>
            Quay lại Lịch phát hành
          </Link>
        </div>
      </main>
    );
  }

  const currentEdition: ReleaseScheduleEditionItem =
    schedule.editions?.[activeEditionIdx] || schedule.editions?.[0] || {
      editionName: 'Bản phổ thông',
      editionType: 'STANDARD',
      status: schedule.status,
    };

  const cover = currentEdition.coverUrl || schedule.coverUrl;
  const price = currentEdition.linkedBook?.price || currentEdition.estimatedPrice;
  const seriesSlug = schedule.seriesSlug || 'truyen-tranh';

  return (
    <main className={styles.container}>
      <nav className={styles.breadcrumbRow}>
        <Link href="/" className={styles.breadcrumbLink}>Lịch phát hành</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        {schedule.seriesName && (
          <>
            <Link href={`/bo-truyen/${seriesSlug}`} className={styles.breadcrumbLink}>
              {schedule.seriesName}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
          </>
        )}
        <span>{schedule.title}</span>
      </nav>

      <div className={styles.mainGrid}>
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

        <div className={styles.infoSide}>
          <div className={styles.badgeRow}>
            <span className={styles.publisherBadge}>{schedule.publisher}</span>
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
              <div className={styles.metaItemValue}>{currentEdition.releaseDate || schedule.releaseDate}</div>
            </div>
            <div>
              <div className={styles.metaItemLabel}>Giá bìa niêm yết</div>
              <div className={styles.metaItemValue}>
                {price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : 'Đang cập nhật'}
              </div>
            </div>
            <div>
              <div className={styles.metaItemLabel}>Bộ truyện</div>
              <div className={styles.metaItemValue}>
                <Link href={`/bo-truyen/${seriesSlug}`} style={{ color: 'var(--color-primary-500)', textDecoration: 'none' }}>
                  {schedule.seriesName || 'Xem bộ truyện'}
                </Link>
              </div>
            </div>
          </div>

          {currentEdition.gifts && (
            <div className={styles.giftsCard}>
              <div className={styles.giftsTitle}>Quà tặng & Phụ kiện đi kèm:</div>
              <div>{currentEdition.gifts}</div>
            </div>
          )}

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
