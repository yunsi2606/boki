'use client';

import { useState, useEffect } from 'react';
import { communityService, type TierManga } from '@/services/communityService';
import styles from './homeMangaTierList.module.css';

export function HomeMangaTierList() {
  const [tiers, setTiers] = useState<TierManga[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    const data = communityService.getTierList();
    setTiers(data.tiers);
    setIsPublic(data.isPublic);
  }, []);

  const handleTogglePrivacy = () => {
    const nextVal = !isPublic;
    setIsPublic(nextVal);
    communityService.updateTierVisibility(nextVal);
  };

  const handleChangeRank = (id: string, newRank: 'S' | 'A' | 'B' | 'C') => {
    const updated = communityService.updateMangaRank(id, newRank);
    setTiers(updated);
  };

  const tierRanks: Array<{ rank: 'S' | 'A' | 'B' | 'C'; labelClass: string }> = [
    { rank: 'S', labelClass: styles.tierS },
    { rank: 'A', labelClass: styles.tierA },
    { rank: 'B', labelClass: styles.tierB },
    { rank: 'C', labelClass: styles.tierC },
  ];

  return (
    <div className={styles.tierBox} aria-label="Bảng xếp hạng Manga Tier List">
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>TÍNH NĂNG CỘNG ĐỒNG</div>
          <h2 className={styles.title}>Manga Tier List Độc Giả</h2>
        </div>

        <button
          type="button"
          onClick={handleTogglePrivacy}
          className={styles.visibilityToggle}
          title="Chuyển chế độ hiển thị"
        >
          {isPublic ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2B8A3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Chế độ: <strong className={styles.publicBadge}>Công khai</strong></span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#495057" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Chế độ: <strong className={styles.privateBadge}>Riêng tư</strong></span>
            </>
          )}
        </button>
      </div>

      <div className={styles.tierTable}>
        {tierRanks.map(({ rank, labelClass }) => {
          const items = tiers.filter((t) => t.rank === rank);
          return (
            <div key={rank} className={styles.tierRow}>
              <div className={`${styles.tierLabel} ${labelClass}`}>{rank}</div>
              <div className={styles.tierContent}>
                {items.length === 0 ? (
                  <span style={{ fontSize: '12px', color: '#868e96' }}>Chưa có tác phẩm ở bậc này</span>
                ) : (
                  items.map((m) => (
                    <div key={m.id} className={styles.mangaChip}>
                      <span>{m.title}</span>
                      <select
                        aria-label={`Chuyển bậc cho ${m.title}`}
                        className={styles.chipRankSelect}
                        value={m.rank}
                        onChange={(e) => handleChangeRank(m.id, e.target.value as 'S' | 'A' | 'B' | 'C')}
                      >
                        <option value="S">S</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
