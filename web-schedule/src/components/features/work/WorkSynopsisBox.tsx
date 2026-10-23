'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './workSynopsisBox.module.css';

interface Props {
  seriesName: string;
  description?: string;
  author?: string;
  artist?: string;
  publisher?: string;
  imprint?: string;
  format?: string;
  specs?: string;
  genres?: string;
}

export function WorkSynopsisBox({
  seriesName,
  description,
  author,
  artist,
  publisher,
  imprint,
  format,
  specs,
  genres,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const dynamicSpecs = useMemo(() => {
    if (!specs) return [];
    try {
      const parsed = JSON.parse(specs);
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed)
          .filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
          .map(([key, value]) => ({
            key,
            value: String(value),
          }));
      }
    } catch {
      return [{ key: 'Quy cách ấn bản', value: specs }];
    }
    return [{ key: 'Quy cách ấn bản', value: specs }];
  }, [specs]);

  const genreList = genres
    ? genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

  const defaultDescription =
    description && description.trim().length > 0
      ? description
      : `Tác phẩm "${seriesName}" là bộ truyện được mua bản quyền và phát hành chính thức tại Việt Nam bởi ${
          imprint || publisher || 'đơn vị xuất bản'
        }. Nội dung truyện được chuyển ngữ bám sát nguyên tác ${
          author ? `tác giả ${author}` : ''
        }, chất lượng in ấn tiêu chuẩn cao cấp cùng các ấn bản giới hạn kèm phụ kiện độc quyền dành cho độc giả.`;

  const isLongText = defaultDescription.length > 280;

  return (
    <div className={styles.container}>
      <h2 className={styles.sectionTitle}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.titleIcon}
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
        Tóm tắt & Giới thiệu tác phẩm
      </h2>

      {/* Description Text */}
      <div className={styles.synopsisWrapper}>
        <p className={`${styles.synopsisText} ${!isExpanded && isLongText ? styles.clamped : ''}`}>
          {defaultDescription}
        </p>

        {isLongText && (
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Thu gọn' : 'Xem toàn bộ tóm tắt'}
            <svg
              className={`${styles.chevron} ${isExpanded ? styles.chevronRotated : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Genres Tag Cloud */}
      {genreList.length > 0 && (
        <div className={styles.genreSection}>
          <span className={styles.genreLabel}>Thể loại:</span>
          <div className={styles.genreList}>
            {genreList.map((g) => (
              <Link
                key={g}
                href={`/tac-pham?genre=${encodeURIComponent(g)}`}
                className={styles.genreTag}
                title={`Khám phá các tác phẩm thể loại ${g}`}
              >
                {g}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Specs / Production Info Grid */}
      <div className={styles.specsGrid}>
        {author && (
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Tác giả (Story)</span>
            <Link
              href={`/tac-pham?author=${encodeURIComponent(author)}`}
              className={styles.specValueLink}
            >
              {author}
            </Link>
          </div>
        )}

        {artist && artist !== author && (
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Họa sĩ (Art)</span>
            <span className={styles.specValue}>{artist}</span>
          </div>
        )}

        {imprint && (
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Công ty phát hành</span>
            <Link
              href={`/tac-pham?publisher=${encodeURIComponent(imprint)}`}
              className={styles.specValueLink}
            >
              {imprint}
            </Link>
          </div>
        )}

        {publisher && (!imprint || imprint.trim().toLowerCase() !== publisher.trim().toLowerCase()) && (
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Nhà xuất bản</span>
            <Link
              href={`/tac-pham?publisher=${encodeURIComponent(publisher)}`}
              className={styles.specValueLink}
            >
              {publisher}
            </Link>
          </div>
        )}

        {format && (
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Định dạng</span>
            <span className={styles.specValue}>{format}</span>
          </div>
        )}

        {dynamicSpecs.map((item) => (
          <div key={item.key} className={styles.specItem}>
            <span className={styles.specLabel}>{item.key}</span>
            <span className={styles.specValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
