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
      <div className={styles.sliderViewport}>
        <div
          className={styles.sliderTrack}
          style={{ transform: `translateX(-${currentIdx * 100}%)` }}
        >
          {slides.map((item, idx) => {
            const targetSlug = item.slug || item.id;
            const seriesSlug =
              item.seriesSlug || (item.seriesName ? item.seriesName.toLowerCase().replace(/\s+/g, '-') : '');
            const cover = item.coverUrl || item.editions?.[0]?.coverUrl;
            const price = item.editions?.[0]?.estimatedPrice;
            const isActive = idx === currentIdx;

            return (
              <div
                key={item.id || idx}
                className={`${styles.slideItem} ${isActive ? styles.activeSlide : ''}`}
                aria-hidden={!isActive}
              >
                {/* Full-bleed Background Cover Layer */}
                <div className={styles.backdropWrap}>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" aria-hidden="true" className={styles.backdropImg} />
                  ) : (
                    <div className={styles.placeholderBackdrop} />
                  )}
                  <div className={styles.backdropOverlay} />
                </div>

                {/* Foreground Editorial Content with Fresh Key for Re-triggering Spring Animation */}
                <div
                  key={isActive ? `active-${idx}` : `idle-${idx}`}
                  className={styles.slideContent}
                >
                  <div className={styles.badgeRow}>
                    <div className={styles.kickerBadge}>
                      <span className={styles.dotIndicator} />
                      <span>TÁC PHẨM TIÊU ĐIỂM</span>
                    </div>
                    {item.volumeNumber && (
                      <span className={styles.volBadge}>TẬP {item.volumeNumber}</span>
                    )}
                  </div>

                  <h1 className={styles.slideTitle} title={item.title}>
                    {item.title}
                  </h1>

                  <div className={styles.metaRow}>
                    <span className={styles.publisherBadge}>{item.imprint || item.publisher}</span>
                    {item.author && <span className={styles.metaText}>Tác giả: {item.author}</span>}
                    <span className={styles.metaText}>
                      Phát hành: {new Date(item.releaseDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <p className={styles.description}>
                    {item.description ||
                      `Ấn bản mới nhất từ ${item.imprint || item.publisher} chính thức lên kệ với chất lượng in ấn tiêu chuẩn cao cấp, quà tặng kèm hấp dẫn cho độc giả và người sưu tầm.`}
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
                      <Link href={`/tac-pham/${seriesSlug}`} className={styles.secondaryBtn}>
                        Khám phá bộ truyện
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls Bar */}
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
