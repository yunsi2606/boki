'use client';

import React from 'react';
import type { InheritedAttributes } from './scheduleLinkInheritHelper';
import styles from './scheduleMetadataFields.module.css';

interface Props {
  artist: string;
  setArtist: (val: string) => void;
  imprint: string;
  setImprint: (val: string) => void;
  genres: string;
  setGenres: (val: string) => void;
  format: string;
  setFormat: (val: string) => void;
  seriesStatus: string;
  setSeriesStatus: (val: string) => void;
  ageRating: string;
  setAgeRating: (val: string) => void;
  previousAttributes?: InheritedAttributes | null;
  onInheritAttributes?: () => void;
}

const GENRE_PRESETS = [
  'Shonen', 'Seinen', 'Hành động', 'Phiêu lưu', 'Giả tưởng',
  'Isekai', 'Romance', 'Học đường', 'Thể thao', 'Trinh thám', 'Kinh dị'
];

export default function ScheduleMetadataFields({
  artist,
  setArtist,
  imprint,
  setImprint,
  genres,
  setGenres,
  format,
  setFormat,
  seriesStatus,
  setSeriesStatus,
  ageRating,
  setAgeRating,
  previousAttributes,
  onInheritAttributes,
}: Props) {
  const handleToggleGenre = (g: string) => {
    const list = genres
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (list.includes(g)) {
      setGenres(list.filter((item) => item !== g).join(', '));
    } else {
      setGenres([...list, g].join(', '));
    }
  };

  const currentGenres = genres
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionHeader}>2. Phân loại & Xuất bản chuyên sâu</div>
        {onInheritAttributes && previousAttributes && (
          <button
            type="button"
            className={styles.inheritBtn}
            onClick={onInheritAttributes}
            title="Tải họa sĩ, thể loại, tình trạng, độ tuổi từ tập trước"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Tải thuộc tính từ tập trước</span>
          </button>
        )}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label>Họa sĩ</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="VD: Yusuke Nomura"
          />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label>Công ty phát hành</label>
          <input
            type="text"
            value={imprint}
            onChange={(e) => setImprint(e.target.value)}
            placeholder="VD: Wings Books, Amak, Hikari..."
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label>Định dạng xuất bản</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="MANGA">Manga (Truyện tranh Nhật)</option>
            <option value="LIGHT_NOVEL">Light Novel (Tiểu thuyết ngắn)</option>
            <option value="COMIC">Comic / Manhwa / Manhua</option>
            <option value="ARTBOOK">Artbook / Sách tranh</option>
            <option value="NOVEL">Tiểu thuyết văn học</option>
          </select>
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label>Tình trạng bộ truyện</label>
          <select value={seriesStatus} onChange={(e) => setSeriesStatus(e.target.value)}>
            <option value="ONGOING">Đang phát hành (Ongoing)</option>
            <option value="COMPLETED">Đã hoàn thành (Completed)</option>
            <option value="HIATUS">Tạm ngưng (Hiatus)</option>
          </select>
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label>Độ tuổi khuyến nghị</label>
          <select value={ageRating} onChange={(e) => setAgeRating(e.target.value)}>
            <option value="ALL">Mọi lứa tuổi (All ages)</option>
            <option value="13+">Dành cho lứa tuổi 13+</option>
            <option value="16+">Dành cho lứa tuổi 16+</option>
            <option value="18+">Dành cho lứa tuổi 18+</option>
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Thể loại (Ngăn cách bằng dấu phẩy)</label>
        <input
          type="text"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
          placeholder="VD: Shonen, Hành động, Phiêu lưu..."
        />
        <div className={styles.presetsRow}>
          {GENRE_PRESETS.map((g) => {
            const active = currentGenres.includes(g);
            return (
              <button
                key={g}
                type="button"
                className={`${styles.presetChip} ${active ? styles.activeChip : ''}`}
                onClick={() => handleToggleGenre(g)}
              >
                {active && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: '4px' }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                <span>{g}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
