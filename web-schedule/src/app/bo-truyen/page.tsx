'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';
import type { SeriesSummaryItem } from '@/services/scheduleService';
import { SeriesCard } from '@/components/features/series/SeriesCard';
import { SeriesFilterToolbar } from '@/components/features/series/SeriesFilterToolbar';
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

  // Sync state if query params change
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

    if (sortBy === 'VOLUMES') {
      list = [...list].sort(
        (a, b) => (b.totalVolumes || b.volumeCount || 0) - (a.totalVolumes || a.volumeCount || 0)
      );
    } else if (sortBy === 'NAME') {
      list = [...list].sort((a, b) => a.seriesName.localeCompare(b.seriesName));
    }
    return list;
  }, [seriesList, search, sortBy, selectedPublisher, selectedFormat, selectedGenre, authorFilter]);

  return (
    <main className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Tác phẩm bản quyền</h1>
        <p className={styles.subtitle}>
          Khám phá và tra cứu thông tin chi tiết các tựa manga, light novel bản quyền tại Việt Nam.
        </p>

        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Nhập tên bộ truyện hoặc tác giả cần tìm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        <div className={styles.emptyBox}>Đang tải danh sách tác phẩm...</div>
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
