'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';
import { VolumeCoverflowSlider } from '@/components/features/schedule/VolumeCoverflowSlider';
import { VolumeSynopsisBox } from '@/components/features/schedule/VolumeSynopsisBox';
import { VolumePublicationSpecs } from '@/components/features/schedule/VolumePublicationSpecs';
import { VolumeEditionsList } from '@/components/features/schedule/VolumeEditionsList';
import { SeriesSidebarBox } from '@/components/features/schedule/SeriesSidebarBox';
import { VolumeVaultAction } from '@/components/features/schedule/VolumeVaultAction';
import { VolumeChangelogTimeline } from '@/components/features/schedule/VolumeChangelogTimeline';
import { VolumeDiscussionSection } from '@/components/features/schedule/VolumeDiscussionSection';
import { VolumeDetailSkeleton } from '@/components/features/schedule/ScheduleSkeleton';
import styles from './tapTruyen.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function TapTruyenDetailPage({ params }: Props) {
  const { slug } = use(params);
  const decodedSlug = decodeURIComponent(slug);
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
          data = await scheduleService.getScheduleBySlug(decodedSlug);
        } catch {
          data = await scheduleService.getScheduleDetail(decodedSlug).catch(() => null);
        }
        setSchedule(data);
      } catch (err) {
        console.error('Failed to load volume detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [decodedSlug]);

  if (loading) {
    return <VolumeDetailSkeleton />;
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

  const seriesSlug =
    schedule.seriesSlug ||
    (schedule.seriesName ? schedule.seriesName.toLowerCase().replace(/\s+/g, '-') : '');

  return (
    <main className={styles.container}>
      <nav className={styles.breadcrumbRow}>
        <Link href="/" className={styles.breadcrumbLink}>Lịch phát hành</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        {seriesSlug && (
          <>
            <Link href={`/tac-pham/${seriesSlug}`} className={styles.breadcrumbLink}>
              {schedule.seriesName || 'Tác phẩm'}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
          </>
        )}
        <span>{schedule.title}</span>
      </nav>

      {/* 3D Coverflow Volume Slider */}
      <VolumeCoverflowSlider
        seriesSlug={seriesSlug}
        seriesName={schedule.seriesName}
        currentScheduleId={schedule.id}
        currentVolumeSlug={schedule.slug}
        currentTitle={schedule.title}
      />

      <div className={styles.detailGrid}>
        {/* Main Column */}
        <div className={styles.mainCol}>
          {/* Editorial Story Synopsis */}
          <VolumeSynopsisBox
            title={schedule.title}
            seriesName={schedule.seriesName}
            volumeNumber={schedule.volumeNumber}
            description={schedule.description}
            author={schedule.author}
            publisher={schedule.publisher}
            imprint={schedule.imprint}
          />

          <VolumePublicationSpecs schedule={schedule} />

          {/* Content-rich Product Catalog with Integrated Store/Affiliate Links */}
          <VolumeEditionsList
            editions={editions}
            selectedEditionIdx={activeEditionIdx}
            onSelectEdition={setActiveEditionIdx}
            bookTitle={schedule.title}
            publisher={schedule.publisher}
            imprint={schedule.imprint}
            author={schedule.author}
            scheduleReleaseDate={schedule.releaseDate}
            scheduleCoverUrl={schedule.coverUrl}
            storeLinks={schedule.storeLinks}
          />

          {schedule.changelogs && schedule.changelogs.length > 0 && (
            <>
              <h3 className={styles.sectionHeader}>Lịch sử thay đổi ngày & giá</h3>
              <VolumeChangelogTimeline changelogs={schedule.changelogs} />
            </>
          )}

          {/* Volume Discussions & Verified Reviews */}
          <VolumeDiscussionSection bookTitle={schedule.title} bookSlug={decodedSlug} />
        </div>

        {/* Sidebar Column */}
        <div className={styles.sidebarCol}>
          {seriesSlug && (
            <SeriesSidebarBox
              seriesSlug={seriesSlug}
              seriesName={schedule.seriesName || schedule.title}
              coverUrl={schedule.coverUrl || currentEdition.coverUrl}
              author={schedule.author}
              publisher={schedule.publisher}
              totalVolumes={schedule.totalVolumes}
            />
          )}

          <div style={{ marginTop: '20px' }}>
            <VolumeVaultAction
              scheduleId={schedule.id}
              editionId={currentEdition.id}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
