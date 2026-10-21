'use client';

import Link from 'next/link';
import styles from './genreMarqueeSlider.module.css';

interface GenreItem {
  id: string;
  name: string;
  count: number;
  theme: 'action' | 'fantasy' | 'romance' | 'comedy' | 'sports' | 'scifi' | 'mystery' | 'slice' | 'adventure' | 'drama' | 'supernatural' | 'seinen';
}

const ROW_1_GENRES: GenreItem[] = [
  { id: 'shounen', name: 'Shounen', count: 185, theme: 'action' },
  { id: 'fantasy', name: 'Giả Tưởng', count: 120, theme: 'fantasy' },
  { id: 'sports', name: 'Thể Thao', count: 48, theme: 'sports' },
  { id: 'romance', name: 'Lãng Mạn', count: 115, theme: 'romance' },
  { id: 'mystery', name: 'Trinh Thám', count: 64, theme: 'mystery' },
  { id: 'comedy', name: 'Hài Hước', count: 110, theme: 'comedy' },
  { id: 'supernatural', name: 'Siêu Nhiên', count: 75, theme: 'supernatural' },
  { id: 'action', name: 'Hành Động', count: 142, theme: 'action' },
];

const ROW_2_GENRES: GenreItem[] = [
  { id: 'slice-of-life', name: 'Đời Thường', count: 130, theme: 'slice' },
  { id: 'isekai', name: 'Dị Giới / Isekai', count: 96, theme: 'fantasy' },
  { id: 'adventure', name: 'Phiêu Lưu', count: 104, theme: 'adventure' },
  { id: 'sci-fi', name: 'Khoa Học Viễn Tưởng', count: 68, theme: 'scifi' },
  { id: 'drama', name: 'Kịch Tính', count: 92, theme: 'drama' },
  { id: 'seinen', name: 'Seinen', count: 98, theme: 'seinen' },
  { id: 'school', name: 'Học Đường', count: 85, theme: 'romance' },
  { id: 'psychological', name: 'Tâm Lý', count: 52, theme: 'mystery' },
];

export function GenreMarqueeSlider() {
  const row1Duplicated = [...ROW_1_GENRES, ...ROW_1_GENRES];
  const row2Duplicated = [...ROW_2_GENRES, ...ROW_2_GENRES];

  return (
    <section className={styles.sectionContainer} aria-label="Khám phá theo thể loại truyện">
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.kicker}>DANH MỤC KHÁM PHÁ</div>
          <h2 className={styles.title}>Thể Loại Truyện Đa Dạng</h2>
        </div>
        <Link href="/tac-pham" className={styles.viewAllLink}>
          <span>Tất cả thể loại</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div className={styles.marqueeWrapper}>
        {/* Row 1: Leftward moving track */}
        <div className={`${styles.marqueeRow} ${styles.trackLeft}`}>
          {row1Duplicated.map((g, idx) => (
            <Link
              key={`r1-${g.id}-${idx}`}
              href={`/tac-pham?genre=${encodeURIComponent(g.name)}`}
              className={`${styles.genrePill} ${styles[`pill_${g.theme}`]}`}
            >
              <span className={styles.pillDot} />
              <span className={styles.genreName}>{g.name}</span>
              <span className={styles.genreCount}>{g.count} bộ</span>
            </Link>
          ))}
        </div>

        {/* Row 2: Rightward moving track */}
        <div className={`${styles.marqueeRow} ${styles.trackRight}`}>
          {row2Duplicated.map((g, idx) => (
            <Link
              key={`r2-${g.id}-${idx}`}
              href={`/tac-pham?genre=${encodeURIComponent(g.name)}`}
              className={`${styles.genrePill} ${styles[`pill_${g.theme}`]}`}
            >
              <span className={styles.pillDot} />
              <span className={styles.genreName}>{g.name}</span>
              <span className={styles.genreCount}>{g.count} bộ</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
