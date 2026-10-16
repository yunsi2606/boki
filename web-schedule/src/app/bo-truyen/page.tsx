'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { scheduleService } from '@/services/scheduleService';
import styles from './boTruyenList.module.css';

interface SeriesSummary {
  seriesSlug: string;
  seriesName: string;
  totalVolumes: number;
  latestReleaseDate: string;
  sampleCover: string;
}

export function SeriesListPage() {
  const [seriesList, setSeriesList] = useState<SeriesSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'VOLUMES' | 'NAME'>('NEWEST');

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

  const filteredList = useMemo(() => {
    let list = seriesList.filter((s) =>
      s.seriesName.toLowerCase().includes(search.trim().toLowerCase())
    );
    if (sortBy === 'VOLUMES') {
      list = [...list].sort((a, b) => b.totalVolumes - a.totalVolumes);
    } else if (sortBy === 'NAME') {
      list = [...list].sort((a, b) => a.seriesName.localeCompare(b.seriesName));
    }
    return list;
  }, [seriesList, search, sortBy]);

  return (
    <main className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Tác phẩm bản quyền</h1>
        <p className={styles.subtitle}>
          Khám phá và tra cứu thông tin chi tiết các tựa manga, light novel bản quyền tại Việt Nam.
        </p>

        {/* Search bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Nhập tên bộ truyện cần tìm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Sort row & count */}
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
        <div className={styles.emptyBox}>Không tìm thấy tác phẩm nào phù hợp.</div>
      ) : (
        <div className={styles.grid}>
          {filteredList.map((item) => (
            <Link
              key={item.seriesSlug}
              href={`/bo-truyen/${item.seriesSlug}`}
              className={styles.seriesCard}
            >
              <div className={styles.coverWrapper}>
                {item.sampleCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.sampleCover} alt={item.seriesName} className={styles.seriesCover} />
                ) : (
                  <div className={styles.placeholderCover}>Bìa</div>
                )}
                <span className={styles.formatBadge}>MANGA</span>
              </div>
              <div className={styles.seriesInfo}>
                <h3 className={styles.seriesName} title={item.seriesName}>
                  {item.seriesName}
                </h3>
                <div className={styles.volumeCount}>{item.totalVolumes} tập đã lên lịch</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default SeriesListPage;
