'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './homeHeroSearch.module.css';

interface Props {
  totalSchedules: number;
  totalSeries: number;
}

export function HomeHeroSearch({ totalSchedules, totalSeries }: Props) {
  const [keyword, setKeyword] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/tac-pham?search=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <div className={styles.heroWrapper}>
      <div className={styles.badge}>BOKI MANGA SCHEDULE</div>
      <h1 className={styles.title}>Cổng Thông Tin & Lịch Phát Hành Manga Bản Quyền</h1>
      <p className={styles.subtitle}>
        Tra cứu lịch xuất bản chính thức, theo dõi các bộ manga & light novel từ NXB Kim Đồng, Trẻ, IPM, Wings Books... Đặt trước ấn bản đặc biệt và lưu vào tủ sách cá nhân.
      </p>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên truyện, tác giả, tập phát hành (VD: Gachiakuta, Solo Leveling...)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.searchBtn}>
          Tìm kiếm
        </button>
      </form>

      {/* Quick stats pills */}
      <div className={styles.statsRow}>
        <div className={styles.statPill}>
          <span className={styles.statNum}>{totalSeries || '100+'}</span>
          <span className={styles.statLabel}>Bộ truyện bản quyền</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statNum}>{totalSchedules || '120+'}</span>
          <span className={styles.statLabel}>Tập truyện đã lên lịch</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statNum}>100%</span>
          <span className={styles.statLabel}>Nguồn tin chính thức</span>
        </div>
      </div>
    </div>
  );
}
