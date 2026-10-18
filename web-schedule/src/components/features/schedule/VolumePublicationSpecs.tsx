'use client';

import React from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './volumePublicationSpecs.module.css';

interface Props {
  schedule: ReleaseScheduleItem;
}

export function VolumePublicationSpecs({ schedule }: Props) {
  // Parse dynamic specs if present
  let dynamicSpecs: Array<{ key: string; value: string }> = [];
  if (schedule.specs) {
    try {
      const parsed = JSON.parse(schedule.specs);
      if (parsed && typeof parsed === 'object') {
        dynamicSpecs = Object.entries(parsed).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      }
    } catch {
      // ignore JSON parse errors
    }
  }

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
    <section className={styles.container} aria-label="Thông số xuất bản chi tiết">
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>Hệ sinh thái bản quyền</span>
          <h2 className={styles.title}>Thông tin tác phẩm & Bản quyền xuất bản</h2>
        </div>
      </div>

      <div className={styles.specsGrid}>
        {/* Publisher */}
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

        {/* Author */}
        <div className={styles.specRow}>
          <span className={styles.label}>Tác giả / Kịch bản:</span>
          <span className={styles.value}>
            {schedule.author ? (
              <Link
                href={`/bo-truyen?author=${encodeURIComponent(schedule.author)}`}
                className={styles.interactiveLink}
                title={`Xem tác phẩm của ${schedule.author}`}
              >
                {schedule.author} ↗
              </Link>
            ) : (
              'Chưa cập nhật'
            )}
          </span>
        </div>

        {/* Artist / Illustrator */}
        {schedule.artist && (
          <div className={styles.specRow}>
            <span className={styles.label}>Họa sĩ / Minh họa:</span>
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

        {/* Imprint */}
        {schedule.imprint && (
          <div className={styles.specRow}>
            <span className={styles.label}>Nhãn phát hành (Imprint):</span>
            <span className={styles.value}>{schedule.imprint}</span>
          </div>
        )}

        {/* Format */}
        <div className={styles.specRow}>
          <span className={styles.label}>Định dạng xuất bản:</span>
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

        {/* Series Status */}
        <div className={styles.specRow}>
          <span className={styles.label}>Tình trạng tác phẩm:</span>
          <span className={styles.value}>
            <Link
              href={`/bo-truyen?status=${encodeURIComponent(schedule.seriesStatus || 'ONGOING')}`}
              className={styles.interactiveLink}
            >
              {statusText} ↗
            </Link>
          </span>
        </div>

        {/* Age Rating */}
        <div className={styles.specRow}>
          <span className={styles.label}>Độ tuổi khuyến nghị:</span>
          <span className={styles.value}>
            <span className={styles.badgePill}>{schedule.ageRating || '13+'}</span>
          </span>
        </div>

        {/* Original Title */}
        {schedule.originalTitle && (
          <div className={styles.specRow}>
            <span className={styles.label}>Tên gốc:</span>
            <span className={styles.value}>{schedule.originalTitle}</span>
          </div>
        )}
      </div>

      {/* Genres clickable list */}
      {genresList.length > 0 && (
        <div className={styles.genresContainer}>
          <div className={styles.genresLabel}>Thể loại liên quan (Bấm để xem danh sách):</div>
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

      {/* Dynamic Specs (Khổ sách, số trang, dịch giả, loại giấy...) */}
      {dynamicSpecs.length > 0 && (
        <div className={styles.dynamicSpecsBlock}>
          <div className={styles.dynamicSpecsTitle}>Quy cách in ấn & Thông số kỹ thuật:</div>
          <div className={styles.dynamicGrid}>
            {dynamicSpecs.map((spec, idx) => (
              <div key={idx} className={styles.dynamicItem}>
                <span className={styles.dynamicKey}>{spec.key}</span>
                <span className={styles.dynamicVal}>{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
