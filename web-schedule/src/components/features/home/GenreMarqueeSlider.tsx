'use client';

import Link from 'next/link';
import styles from './genreMarqueeSlider.module.css';

interface GenreItem {
  id: string;
  name: string;
  count: number;
}

const ROW_1_GENRES: GenreItem[] = [
  { id: 'shounen', name: 'Shounen', count: 185 },
  { id: 'action', name: 'Hành Động', count: 142 },
  { id: 'isekai', name: 'Isekai / Dị Giới', count: 96 },
  { id: 'fantasy', name: 'Giả Tưởng', count: 120 },
  { id: 'mystery', name: 'Trinh Thám', count: 64 },
  { id: 'comedy', name: 'Hài Hước', count: 110 },
  { id: 'sports', name: 'Thể Thao', count: 48 },
  { id: 'supernatural', name: 'Siêu Nhiên', count: 75 },
];

const ROW_2_GENRES: GenreItem[] = [
  { id: 'slice-of-life', name: 'Đời Thường', count: 130 },
  { id: 'romance', name: 'Lãng Mạn', count: 115 },
  { id: 'seinen', name: 'Seinen', count: 98 },
  { id: 'school', name: 'Học Đường', count: 85 },
  { id: 'drama', name: 'Kịch Tính', count: 92 },
  { id: 'adventure', name: 'Phiêu Lưu', count: 104 },
  { id: 'psychological', name: 'Tâm Lý', count: 52 },
  { id: 'sci-fi', name: 'Khoa Học Viễn Tưởng', count: 68 },
];

export function GenreMarqueeSlider() {
  // Duplicate array items for seamless infinite loop
  const row1Duplicated = [...ROW_1_GENRES, ...ROW_1_GENRES];
  const row2Duplicated = [...ROW_2_GENRES, ...ROW_2_GENRES];

  return (
    <section className={styles.sectionContainer} aria-label="Khám phá theo thể loại">
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.kicker}>DANH MỤC TRUYỆN TRANH</div>
          <h2 className={styles.title}>Khám Phá Theo Thể Loại Yêu Thích</h2>
        </div>
      </div>

      <div className={styles.marqueeWrapper}>
        {/* Row 1: Leftward infinite track */}
        <div className={`${styles.marqueeRow} ${styles.trackLeft}`}>
          {row1Duplicated.map((g, idx) => (
            <Link
              key={`r1-${g.id}-${idx}`}
              href={`/bo-truyen?genre=${encodeURIComponent(g.name)}`}
              className={styles.genrePill}
            >
              <span className={styles.genreName}>{g.name}</span>
              <span className={styles.genreCount}>{g.count}</span>
            </Link>
          ))}
        </div>

        {/* Row 2: Rightward infinite track */}
        <div className={`${styles.marqueeRow} ${styles.trackRight}`}>
          {row2Duplicated.map((g, idx) => (
            <Link
              key={`r2-${g.id}-${idx}`}
              href={`/bo-truyen?genre=${encodeURIComponent(g.name)}`}
              className={styles.genrePill}
            >
              <span className={styles.genreName}>{g.name}</span>
              <span className={styles.genreCount}>{g.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
