'use client';

import React from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './volumePublicationSpecs.module.css';

interface Props {
  schedule: ReleaseScheduleItem;
}

export function VolumePublicationSpecs({ schedule }: Props) {
  // Parse dynamic specs if present (matching Book Entity attributes)
  let dynamicSpecs: Array<{ key: string; value: string }> = [];
  if (schedule.specs) {
    try {
      const parsed = JSON.parse(schedule.specs);
      if (parsed && typeof parsed === 'object') {
        dynamicSpecs = Object.entries(parsed)
          .filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
          .map(([key, value]) => ({
            key,
            value: String(value),
          }));
      }
    } catch {
      // ignore parse errors
    }
  }

  // Parse multi-author list separated by comma, slash, or ampersand
  const authorList = schedule.author
    ? schedule.author
        .split(/[,/&]/)
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  // Parse genres list
  const genresList = schedule.genres
    ? schedule.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

  const formatText =
    schedule.format === 'LIGHT_NOVEL'
      ? 'Light Novel'
      : schedule.format === 'COMIC'
      ? 'Comic / Manhwa'
      : schedule.format === 'ARTBOOK'
      ? 'Artbook / Sách tranh'
      : 'Manga';

  const statusText =
    schedule.seriesStatus === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang phát hành';

  return (
    <section className={styles.container} aria-label="Thông tin xuất bản">
      <div className={styles.header}>
        <h2 className={styles.title}>Thông tin xuất bản</h2>
      </div>

      <div className={styles.specsGrid}>
        {/* Nhà xuất bản */}
        <div className={styles.specRow}>
          <span className={styles.label}>Nhà xuất bản:</span>
          <span className={styles.value}>
            <Link
              href={`/bo-truyen?publisher=${encodeURIComponent(schedule.publisher)}`}
              className={styles.interactiveLink}
              title={`Xem tất cả tác phẩm từ ${schedule.publisher}`}
            >
              {schedule.publisher} ↗
            </Link>
          </span>
        </div>

        {/* Công ty phát hành */}
        {schedule.imprint && (
          <div className={styles.specRow}>
            <span className={styles.label}>Công ty phát hành:</span>
            <span className={styles.value}>{schedule.imprint}</span>
          </div>
        )}

        {/* Tác giả (hỗ trợ nhiều tác giả tách link riêng) */}
        <div className={styles.specRow}>
          <span className={styles.label}>Tác giả:</span>
          <span className={styles.value}>
            {authorList.length > 0 ? (
              authorList.map((authorName, idx) => (
                <React.Fragment key={authorName}>
                  <Link
                    href={`/bo-truyen?author=${encodeURIComponent(authorName)}`}
                    className={styles.interactiveLink}
                    title={`Xem tác phẩm của ${authorName}`}
                  >
                    {authorName} ↗
                  </Link>
                  {idx < authorList.length - 1 && ', '}
                </React.Fragment>
              ))
            ) : (
              'Chưa cập nhật'
            )}
          </span>
        </div>

        {/* Họa sĩ */}
        {schedule.artist && (
          <div className={styles.specRow}>
            <span className={styles.label}>Họa sĩ:</span>
            <span className={styles.value}>
              <Link
                href={`/bo-truyen?author=${encodeURIComponent(schedule.artist)}`}
                className={styles.interactiveLink}
                title={`Xem tác phẩm của ${schedule.artist}`}
              >
                {schedule.artist} ↗
              </Link>
            </span>
          </div>
        )}

        {/* Định dạng */}
        <div className={styles.specRow}>
          <span className={styles.label}>Định dạng:</span>
          <span className={styles.value}>
            <Link
              href={`/bo-truyen?format=${encodeURIComponent(schedule.format || 'MANGA')}`}
              className={styles.interactiveLink}
              title={`Xem các tác phẩm định dạng ${formatText}`}
            >
              {formatText} ↗
            </Link>
          </span>
        </div>

        {/* Tình trạng */}
        <div className={styles.specRow}>
          <span className={styles.label}>Tình trạng:</span>
          <span className={styles.value}>
            <Link
              href={`/bo-truyen?status=${encodeURIComponent(schedule.seriesStatus || 'ONGOING')}`}
              className={styles.interactiveLink}
            >
              {statusText} ↗
            </Link>
          </span>
        </div>

        {/* Độ tuổi */}
        <div className={styles.specRow}>
          <span className={styles.label}>Độ tuổi:</span>
          <span className={styles.value}>
            <span className={styles.badgePill}>{schedule.ageRating || '13+'}</span>
          </span>
        </div>

        {/* Tên gốc */}
        {schedule.originalTitle && (
          <div className={styles.specRow}>
            <span className={styles.label}>Tên gốc:</span>
            <span className={styles.value}>{schedule.originalTitle}</span>
          </div>
        )}

        {/* Các thuộc tính động (Khổ sách, Số trang, Dịch giả, Ngôn ngữ, Hình thức bìa...) */}
        {dynamicSpecs.map((spec, idx) => (
          <div key={idx} className={styles.specRow}>
            <span className={styles.label}>{spec.key}:</span>
            <span className={styles.value}>{spec.value}</span>
          </div>
        ))}
      </div>

      {/* Thể loại */}
      {genresList.length > 0 && (
        <div className={styles.genresContainer}>
          <div className={styles.genresLabel}>Thể loại:</div>
          <div className={styles.genresRow}>
            {genresList.map((genre) => (
              <Link
                key={genre}
                href={`/bo-truyen?genre=${encodeURIComponent(genre)}`}
                className={styles.genreTag}
                title={`Xem tác phẩm thể loại ${genre}`}
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
