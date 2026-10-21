'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';
import type { SeriesSummaryItem } from '@/services/scheduleService';
import { SeriesCard } from '@/components/features/series/SeriesCard';
import { SeriesFilterToolbar } from '@/components/features/series/SeriesFilterToolbar';
import { BookCardSkeleton } from '@/components/features/schedule/ScheduleSkeleton';
import styles from './boTruyenList.module.css';

function SeriesListContent() {
  const searchParams = useSearchParams();
  const initialPublisher = searchParams.get('publisher') || 'ALL';
  const initialGenre = searchParams.get('genre') || 'ALL';
  const initialFormat = searchParams.get('format') || 'ALL';
  const initialAuthor = searchParams.get('author') || '';

  const [seriesList, setSeriesList] = useState<SeriesSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'VOLUMES' | 'NAME'>('NEWEST');

  const [selectedPublisher, setSelectedPublisher] = useState(initialPublisher);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [authorFilter, setAuthorFilter] = useState(initialAuthor);

  useEffect(() => {
    setSelectedPublisher(searchParams.get('publisher') || 'ALL');
    setSelectedGenre(searchParams.get('genre') || 'ALL');
    setSelectedFormat(searchParams.get('format') || 'ALL');
    setAuthorFilter(searchParams.get('author') || '');
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await scheduleService.getSeriesSummaries();
        setSeriesList(data || []);
      } catch (err) {
        console.error('Failed to load series list', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const availablePublishers = useMemo(() => {
    const set = new Set<string>();
    seriesList.forEach((s) => {
      if (s.publisher && s.publisher.trim()) set.add(s.publisher.trim());
    });
    return Array.from(set).sort();
  }, [seriesList]);

  const totalVolumesCount = useMemo(() => {
    return seriesList.reduce((acc, s) => acc + (s.totalVolumes || s.volumeCount || 1), 0);
  }, [seriesList]);

  const handleClearAll = () => {
    setSelectedPublisher('ALL');
    setSelectedGenre('ALL');
    setSelectedFormat('ALL');
    setAuthorFilter('');
    setSearch('');
  };

  const filteredList = useMemo(() => {
    let list = seriesList.filter((s) => {
      const matchSearch =
        !search.trim() ||
        s.seriesName.toLowerCase().includes(search.trim().toLowerCase()) ||
        (s.author && s.author.toLowerCase().includes(search.trim().toLowerCase()));

      const matchPublisher =
        selectedPublisher === 'ALL' ||
        (s.publisher && s.publisher.toLowerCase() === selectedPublisher.toLowerCase());

      const matchFormat =
        selectedFormat === 'ALL' ||
        (s.format && s.format.toUpperCase() === selectedFormat.toUpperCase());

      const matchGenre =
        selectedGenre === 'ALL' ||
        (s.genres && s.genres.toLowerCase().includes(selectedGenre.toLowerCase()));

      const matchAuthor =
        !authorFilter ||
        (s.author && s.author.toLowerCase().includes(authorFilter.toLowerCase()));

      return matchSearch && matchPublisher && matchFormat && matchGenre && matchAuthor;
    });

    // Prioritize series with actual covers first, then sort by selected criteria
    list = [...list].sort((a, b) => {
      const hasCoverA = Boolean(a.coverUrl || a.sampleCover);
      const hasCoverB = Boolean(b.coverUrl || b.sampleCover);
      if (hasCoverA !== hasCoverB) {
        return hasCoverB ? 1 : -1;
      }

      if (sortBy === 'VOLUMES') {
        return (b.totalVolumes || b.volumeCount || 0) - (a.totalVolumes || a.volumeCount || 0);
      } else if (sortBy === 'NAME') {
        return a.seriesName.localeCompare(b.seriesName);
      } else {
        if (a.latestReleaseDate && b.latestReleaseDate) {
          return b.latestReleaseDate.localeCompare(a.latestReleaseDate);
        }
        return a.seriesName.localeCompare(b.seriesName);
      }
    });

    return list;
  }, [seriesList, search, sortBy, selectedPublisher, selectedFormat, selectedGenre, authorFilter]);

  return (
    <main className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroMain}>
          <h1 className={styles.title}>Tác phẩm bản quyền</h1>
          <p className={styles.subtitle}>
            Khám phá và tra cứu thông tin chi tiết các tựa manga, light novel bản quyền tại Việt Nam.
          </p>

          <div className={styles.searchBar}>
            <svg
              className={styles.searchIcon}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Nhập tên bộ truyện hoặc tác giả cần tìm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.heroStats} aria-label="Thống kê tác phẩm">
          <div className={styles.statItem}>
            <span className={styles.statValue}>{seriesList.length > 0 ? `${seriesList.length}+` : '--'}</span>
            <span className={styles.statLabel}>Bộ truyện bản quyền</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalVolumesCount > 0 ? `${totalVolumesCount}+` : '--'}</span>
            <span className={styles.statLabel}>Tập đã lên lịch</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{availablePublishers.length > 0 ? `${availablePublishers.length}` : '5+'}</span>
            <span className={styles.statLabel}>Nhà xuất bản</span>
          </div>
        </div>
      </div>

      <SeriesFilterToolbar
        selectedPublisher={selectedPublisher}
        onSelectPublisher={setSelectedPublisher}
        selectedFormat={selectedFormat}
        onSelectFormat={setSelectedFormat}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        authorFilter={authorFilter}
        onClearAuthor={() => setAuthorFilter('')}
        availablePublishers={availablePublishers}
        onClearAll={handleClearAll}
      />

      <div className={styles.toolbarRow}>
        <div className={styles.foundCount}>
          Tìm thấy <strong>{filteredList.length}</strong> bộ truyện
        </div>
        <div className={styles.sortGroup}>
          <button
            type="button"
            className={`${styles.sortBtn} ${sortBy === 'NEWEST' ? styles.activeSort : ''}`}
            onClick={() => setSortBy('NEWEST')}
          >
            Mới cập nhật
          </button>
          <button
            type="button"
            className={`${styles.sortBtn} ${sortBy === 'VOLUMES' ? styles.activeSort : ''}`}
            onClick={() => setSortBy('VOLUMES')}
          >
            Nhiều tập nhất
          </button>
          <button
            type="button"
            className={`${styles.sortBtn} ${sortBy === 'NAME' ? styles.activeSort : ''}`}
            onClick={() => setSortBy('NAME')}
          >
            Tên A-Z
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid} aria-label="Đang tải danh sách tác phẩm" aria-busy="true">
          {Array.from({ length: 12 }).map((_, idx) => (
            <BookCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className={styles.emptyBox}>Không tìm thấy tác phẩm nào phù hợp với bộ lọc.</div>
      ) : (
        <div className={styles.grid}>
          {filteredList.map((item) => (
            <SeriesCard key={item.seriesSlug} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SeriesListPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Đang tải...</div>}>
      <SeriesListContent />
    </Suspense>
  );
}
