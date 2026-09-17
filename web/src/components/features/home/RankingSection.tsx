'use client';

import styles from './RankingSection.module.css';

export interface RankingBookItem {
  id: string;
  title: string;
  cover: string;
}

const defaultRankings: RankingBookItem[] = [
  {
    id: 'r1',
    title: 'Đại Chúa Tể - Tập 1',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=550',
  },
  {
    id: 'r2',
    title: 'Sword Art Online - Vol 25',
    cover: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=400&h=550',
  },
  {
    id: 'r3',
    title: 'One Piece - Tập 102',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400&h=550',
  },
  {
    id: 'r4',
    title: 'Re:Zero - Volume 18',
    cover: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=400&h=550',
  },
  {
    id: 'r5',
    title: 'Solo Leveling - Tập 3',
    cover: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400&h=550',
  },
];

export default function RankingSection({ items = defaultRankings }: { items?: RankingBookItem[] }) {
  return (
    <section className={styles.rankingSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🏆 Bảng Xếp Hạng Top Đọc Nhiều</h2>
        </div>

        <div className={styles.rankingCarousel}>
          {items.slice(0, 5).map((book, idx) => (
            <div key={book.id} className={styles.rankingCard}>
              <span className={styles.rankNumber}>{idx + 1}</span>
              <div className={styles.rankingCoverWrapper}>
                <img
                  src={book.cover}
                  alt={book.title}
                  className={styles.rankingCover}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
