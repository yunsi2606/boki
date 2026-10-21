'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { WorkHeroHeader } from '@/components/features/work/WorkHeroHeader';
import { WorkSynopsisBox } from '@/components/features/work/WorkSynopsisBox';
import { WorkVolumesShelf } from '@/components/features/work/WorkVolumesShelf';
import { WorkReviewSection } from '@/components/features/work/WorkReviewSection';
import styles from './tacPhamDetail.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function WorkDetailPage({ params }: Props) {
  const { slug } = use(params);
  const [volumes, setVolumes] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeriesData() {
      try {
        setLoading(true);
        const data = await scheduleService.getSeriesVolumes(slug);
        setVolumes(data || []);
      } catch (err) {
        console.error('Failed to load work details', err);
      } finally {
        setLoading(false);
      }
    }
    loadSeriesData();
  }, [slug]);

  const handleScrollToReviews = () => {
    document.getElementById('danh-gia')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingSkeleton}>
          <div className={styles.spinner} />
          <span>Đang tải thông tin tác phẩm...</span>
        </div>
      </main>
    );
  }

  if (volumes.length === 0) {
    return (
      <main className={styles.container}>
        <div className={styles.emptyState}>
          <h2>Không tìm thấy tác phẩm</h2>
          <p>Tác phẩm này chưa có lịch phát hành hoặc đã được cập nhật đường dẫn mới.</p>
          <Link href="/tac-pham" className={styles.backBtn}>
            Quay lại danh sách tác phẩm
          </Link>
        </div>
      </main>
    );
  }

  const primary = volumes[0];
  const seriesName = primary.seriesName || primary.title || 'Tác phẩm';
  const coverUrl = primary.coverUrl || volumes.find((v) => v.coverUrl)?.coverUrl;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BookSeries',
    name: seriesName,
    alternateName: primary.originalTitle,
    author: {
      '@type': 'Person',
      name: primary.author || 'Tác giả',
    },
    publisher: {
      '@type': 'Organization',
      name: primary.publisher || 'Nhà xuất bản',
    },
    genre: primary.genres,
    image: coverUrl,
    numberOfItems: volumes.length,
    description: primary.description,
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbRow} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Trang chủ
        </Link>
        <span className={styles.breadcrumbDivider}>/</span>
        <Link href="/tac-pham" className={styles.breadcrumbLink}>
          Tác phẩm
        </Link>
        <span className={styles.breadcrumbDivider}>/</span>
        <span className={styles.breadcrumbCurrent}>{seriesName}</span>
      </nav>

      {/* Hero Header */}
      <WorkHeroHeader
        seriesName={seriesName}
        originalTitle={primary.originalTitle}
        coverUrl={coverUrl}
        publisher={primary.publisher}
        format={primary.format}
        seriesStatus={primary.seriesStatus}
        ageRating={primary.ageRating}
        viewsCount={primary.viewsCount || 1280}
        rating={primary.rating || 4.9}
        totalReviews={primary.reviewsCount || 0}
        volumeCount={volumes.length}
        seriesSlug={slug}
        onScrollToReviews={handleScrollToReviews}
      />

      {/* Synopsis & Meta Information */}
      <WorkSynopsisBox
        seriesName={seriesName}
        description={primary.description}
        author={primary.author}
        artist={primary.artist}
        publisher={primary.publisher}
        format={primary.format}
        specs={primary.specs}
        genres={primary.genres}
      />

      {/* Shelf of all volumes */}
      <WorkVolumesShelf
        seriesName={seriesName}
        seriesSlug={slug}
        volumes={volumes}
      />

      {/* Ratings & Community Reviews */}
      <WorkReviewSection seriesSlug={slug} seriesName={seriesName} />
    </main>
  );
}
