'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import { getBookUrl } from '@/lib/slug';
import styles from './BestSellersSection.module.css';
import { getBookPriceDisplay } from '@/utils/bookPrice';

interface BestSellersSectionProps {
  title?: string;
  subtitle?: string;
  itemLimit?: number;
}

export default function BestSellersSection({
  title = 'Top Sản Phẩm Bán Chạy',
  subtitle = 'Xếp hạng top 10 tựa sách & truyện tranh bán chạy nhất tuần qua',
  itemLimit = 10,
}: BestSellersSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadBestSellers() {
      try {
        const data = await bookService.searchBooks();
        if (data && data.length > 0) {
          // Sort by viewsCount / rating or natural order to determine best sellers
          const sorted = [...data].sort((a, b) => {
            const viewsA = a.viewsCount || 0;
            const viewsB = b.viewsCount || 0;
            if (viewsB !== viewsA) return viewsB - viewsA;
            return (b.rating || 0) - (a.rating || 0);
          });
          setBooks(sorted.slice(0, itemLimit));
        }
      } catch (err) {
        console.error('Failed to load best sellers', err);
      } finally {
        setLoading(false);
      }
    }
    loadBestSellers();
  }, [itemLimit]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 520;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getRankClass = (idx: number) => {
    if (idx === 0) return styles.rankTop1;
    if (idx === 1) return styles.rankTop2;
    if (idx === 2) return styles.rankTop3;
    return styles.rankOther;
  };

  const getBadgeClass = (idx: number) => {
    if (idx === 0) return styles.topBadge1;
    if (idx === 1) return styles.topBadge2;
    if (idx === 2) return styles.topBadge3;
    return styles.topBadgeOther;
  };

  if (!loading && books.length === 0) {
    return null;
  }

  return (
    <section className={styles.bestSellersSection}>
      <div className="container">
        {/* Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.titleArea}>
            <div className={styles.badgeRow}>
              <span className={styles.hotBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.07 2.71-7.51 6.5-8.59.39-.11.75.21.75.61v.24c0 .41-.27.76-.66.88-2.61.81-4.59 3.23-4.59 6.86 0 3.87 3.13 7 7 7s7-3.13 7-7c0-1.85-.72-3.53-1.89-4.78-.3-.32-.23-.83.15-1.04.38-.21.86-.07 1.09.29C19.78 10.3 21 12.51 21 15c0 4.97-4.03 9-9 9z" />
                </svg>
                Xu Hướng
              </span>
            </div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
          </div>

          {/* Navigation Scroll Buttons */}
          <div className={styles.navControls}>
            <button
              onClick={() => handleScroll('left')}
              className={styles.scrollBtn}
              aria-label="Cuộn sang trái"
              title="Cuộn sang trái"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleScroll('right')}
              className={styles.scrollBtn}
              aria-label="Cuộn sang phải"
              title="Cuộn sang phải"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Carousel (Hidden Scrollbar) */}
        <div className={styles.carouselWrapper}>
          <div ref={carouselRef} className={styles.carousel}>
            {books.map((book, idx) => {
              const cover =
                book.imageUrls && book.imageUrls.length > 0
                  ? book.imageUrls[0]
                  : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300';
              const rank = idx + 1;
              const priceInfo = getBookPriceDisplay(book);

              return (
                <Link
                  key={book.id}
                  href={getBookUrl(book)}
                  className={styles.rankingCard}
                >
                  <div className={styles.coverContainer}>
                    <img
                      src={cover}
                      alt={book.title}
                      className={styles.coverImage}
                      loading="lazy"
                    />
                    {/* Top Pill Badge */}
                    <span className={`${styles.topBadge} ${getBadgeClass(idx)}`}>
                      TOP #{rank}
                    </span>

                    {/* Giant Netflix/Shopee Rank Number */}
                    <span className={`${styles.rankNumber} ${getRankClass(idx)}`}>
                      {rank}
                    </span>
                  </div>

                  <div className={styles.cardContent}>
                    <div>
                      <h3 className={styles.bookTitle} title={book.title}>
                        {book.title}
                      </h3>
                      <p className={styles.bookAuthor}>{book.author}</p>
                    </div>

                    <div className={styles.metaRow}>
                      <div className={styles.priceWrapper}>
                        <span className={styles.currentPrice}>{priceInfo.displayPrice}</span>
                        {priceInfo.hasDiscount && priceInfo.originalPrice && (
                          <span className={styles.originalPrice}>
                            {formatPrice(priceInfo.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className={styles.salesBadge}>Bán chạy</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
