'use client';

import styles from './genrePillsBar.module.css';

interface Props {
  selectedGenre?: string;
  onSelectGenre?: (genre: string) => void;
}

const POPULAR_GENRES = [
  { name: 'ACTION', label: 'Hành Động', count: '142 bộ' },
  { name: 'COMEDY', label: 'Hài Hước', count: '118 bộ' },
  { name: 'ROMANCE', label: 'Lãng Mạn', count: '96 bộ' },
  { name: 'FANTASY', label: 'Kỳ Ảo', count: '89 bộ' },
  { name: 'SLICE OF LIFE', label: 'Đời Thường', count: '74 bộ' },
  { name: 'DRAMA', label: 'Kịch Tính', count: '68 bộ' },
  { name: 'MYSTERY', label: 'Bí Ẩn', count: '52 bộ' },
  { name: 'ISEKAI', label: 'Chuyển Sinh', count: '45 bộ' },
];

export function GenrePillsBar({ selectedGenre, onSelectGenre }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.kicker}>KHÁM PHÁ</div>
        <h2 className={styles.sectionTitle}>Thể loại phổ biến</h2>
      </div>

      <div className={styles.grid}>
        {POPULAR_GENRES.map((g) => {
          const isSelected = selectedGenre === g.name;
          return (
            <button
              key={g.name}
              type="button"
              className={`${styles.genreCard} ${isSelected ? styles.selectedCard : ''}`}
              onClick={() => onSelectGenre && onSelectGenre(isSelected ? '' : g.name)}
            >
              <div className={styles.genreName}>{g.name}</div>
              <div className={styles.genreCount}>{g.count}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
