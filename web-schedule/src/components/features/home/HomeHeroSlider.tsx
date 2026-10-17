'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './homeHeroSlider.module.css';

interface Props {
  items: ReleaseScheduleItem[];
}

export function HomeHeroSlider({ items }: Props) {
  const slides = items && items.length > 0 ? items.slice(0, 3) : [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused]);

  if (slides.length === 0) return null;

  const current = slides[currentIdx];
  const targetSlug = current.slug || current.id;
  const seriesSlug = current.seriesSlug || (current.seriesName ? current.seriesName.toLowerCase().replace(/\s+/g, '-') : '');
  const cover = current.coverUrl || current.editions?.[0]?.coverUrl;
  const price = current.editions?.[0]?.estimatedPrice;

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className={styles.sliderContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Tác phẩm tiêu điểm"
    >
      <div className={styles.slideContent}>
        {/* Left Column: Editorial Information */}
        <div className={styles.infoCol}>
          <div className={styles.kickerBadge}>
            <span className={styles.dotIndicator} />
            <span>TÁC PHẨM TIÊU ĐIỂM</span>
          </div>

          <h1 className={styles.slideTitle} title={current.title}>
            {current.title}
          </h1>

          <div className={styles.metaRow}>
            <span className={styles.publisherBadge}>{current.publisher}</span>
            {current.author && <span className={styles.metaText}>Tác giả: {current.author}</span>}
            <span className={styles.metaText}>
              Phát hành: {new Date(current.releaseDate).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <p className={styles.description}>
            {current.description ||
              `Ấn bản mới nhất từ ${current.publisher} chính thức lên kệ với chất lượng in ấn tiêu chuẩn cao cấp, quà tặng kèm hấp dẫn cho độc giả và người sưu tầm.`}
          </p>

          <div className={styles.actionRow}>
            <Link href={`/tap-truyen/${targetSlug}`} className={styles.primaryBtn}>
              Xem chi tiết tập
              {price && (
                <span className={styles.pricePill}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
              )}
            </Link>

            {seriesSlug && (
              <Link href={`/bo-truyen/${seriesSlug}`} className={styles.secondaryBtn}>
                Khám phá bộ truyện
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: 3D Visual Book Showcase */}
        <div className={styles.visualCol}>
          <Link href={`/tap-truyen/${targetSlug}`} className={styles.coverLink}>
            <div className={styles.coverFrame}>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={current.title} className={styles.coverImg} />
              ) : (
                <div className={styles.placeholderCover}>Bìa sách</div>
              )}
              {current.volumeNumber && (
                <div className={styles.volPill}>TẬP {current.volumeNumber}</div>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <div className={styles.controlsRow}>
          <div className={styles.dotsTrack}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dotBtn} ${i === currentIdx ? styles.activeDot : ''}`}
                onClick={() => setCurrentIdx(i)}
                aria-label={`Chuyển tới slide ${i + 1}`}
              />
            ))}
          </div>

          <div className={styles.arrowsGroup}>
            <button type="button" onClick={handlePrev} className={styles.arrowBtn} aria-label="Slide trước">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button type="button" onClick={handleNext} className={styles.arrowBtn} aria-label="Slide kế tiếp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
