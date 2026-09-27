'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { bookService } from '@/services/bookService';
import { useCart } from '@/hooks/useCart';
import type { Book, BookVariant } from '@/types';
import type { HomepageSectionConfig } from '@/config/homepageConfig';
import BookCard from '@/components/features/books/BookCard';
import QuickVariantSelectModal from '@/components/features/books/QuickVariantSelectModal';
import BestSellersSection from '@/components/features/home/BestSellersSection';
import { BookGridSkeleton } from '@/components/ui/Skeleton';
import styles from './DynamicBookSection.module.css';

interface DynamicBookSectionProps {
  section: HomepageSectionConfig;
  onShowNotification?: (msg: string) => void;
}

export default function DynamicBookSection({ section, onShowNotification }: DynamicBookSectionProps) {
  const { addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quickSelectBook, setQuickSelectBook] = useState<Book | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let result: Book[] = [];

        // 1. Fetch by data source condition
        if (section.dataSource === 'CATEGORY' && section.categoryId) {
          result = await bookService.searchBooks(section.categoryId);
        } else {
          result = await bookService.searchBooks();
        }

        let filtered = [...(result || [])];

        // 2. Filter rules
        if (section.dataSource === 'CATEGORY' && section.categoryName && filtered.length === 0) {
          const lowerCat = section.categoryName.toLowerCase();
          const all = await bookService.searchBooks();
          filtered = (all || []).filter(
            (b) =>
              (b.title && b.title.toLowerCase().includes(lowerCat)) ||
              (b.author && b.author.toLowerCase().includes(lowerCat))
          );
        } else if (section.dataSource === 'DISCOUNTED') {
          filtered = filtered.filter((b) => b.originalPrice && b.originalPrice > b.price);
        } else if (section.dataSource === 'VIP_MEMBERS') {
          // VIP or special promo books (e.g. price <= 50.000 or preOrder or high rating)
          filtered = filtered.filter((b) => b.price <= 50000 || (b.rating !== undefined && b.rating >= 4.8));
          if (filtered.length < 4) {
            filtered = result.slice(0, 8);
          }
        } else if (section.dataSource === 'CUSTOM_KEYWORD' && section.keyword) {
          const kw = section.keyword.toLowerCase();
          filtered = filtered.filter(
            (b) =>
              b.title.toLowerCase().includes(kw) ||
              b.author.toLowerCase().includes(kw) ||
              (b.publisher && b.publisher.toLowerCase().includes(kw))
          );
        }

        // 3. Sort rules
        if (section.sortBy === 'VIEWS_DESC' || section.dataSource === 'BEST_SELLING') {
          filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
        } else if (section.sortBy === 'PRICE_ASC') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (section.sortBy === 'PRICE_DESC') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (section.sortBy === 'DISCOUNT_DESC') {
          filtered.sort((a, b) => {
            const discA = a.originalPrice ? a.originalPrice - a.price : 0;
            const discB = b.originalPrice ? b.originalPrice - b.price : 0;
            return discB - discA;
          });
        }

        setBooks(filtered.slice(0, section.itemLimit || 8));
      } catch (err) {
        console.error('Failed to load dynamic section books', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    section.dataSource,
    section.categoryId,
    section.categoryName,
    section.keyword,
    section.sortBy,
    section.itemLimit,
  ]);

  const toggleFavorite = (favKey: string) => {
    setFavorites((prev) =>
      prev.includes(favKey) ? prev.filter((item) => item !== favKey) : [...prev, favKey]
    );
  };

  const handleAddToCart = (book: Book, variant?: BookVariant) => {
    if (!variant && book.variants && book.variants.length > 0) {
      setQuickSelectBook(book);
      return;
    }
    addToCart(book, 1, variant);
    const titleText = variant ? `${book.title} (${variant.name})` : book.title;
    if (onShowNotification) {
      onShowNotification(`Đã thêm "${titleText}" vào giỏ hàng!`);
    }
  };

  const handleConfirmVariantAddToCart = (book: Book, variant: BookVariant) => {
    addToCart(book, 1, variant);
    if (onShowNotification) {
      onShowNotification(`Đã thêm "${book.title} (${variant.name})" vào giỏ hàng!`);
    }
  };

  const handleScrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const amount = 540;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // If Ranking display style: render BestSellersSection
  if (section.displayStyle === 'RANKING') {
    return (
      <BestSellersSection
        title={section.title}
        subtitle={section.subtitle}
        itemLimit={section.itemLimit || 10}
      />
    );
  }

  if (!loading && books.length === 0) {
    return null;
  }

  const viewUrl =
    section.viewAllUrl ||
    (section.categoryId ? `/books?category=${section.categoryId}` : '/books');

  return (
    <section className={styles.sectionWrapper}>
      <div className="container">
        {/* Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h2 className={styles.sectionTitle}>
              {section.dataSource === 'VIP_MEMBERS' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
              ) : section.dataSource === 'BEST_SELLING' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ) : section.dataSource === 'CATEGORY' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ) : null}
              {section.title}
            </h2>
            {section.subtitle && <p className={styles.sectionSubtitle}>{section.subtitle}</p>}
          </div>

          <div className={styles.headerControls}>
            {/* Slider arrows if SLIDER mode */}
            {section.displayStyle === 'SLIDER' && (
              <div className={styles.sliderArrows}>
                <button
                  type="button"
                  onClick={() => handleScrollSlider('left')}
                  className={styles.arrowBtn}
                  aria-label="Cuộn trái"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollSlider('right')}
                  className={styles.arrowBtn}
                  aria-label="Cuộn phải"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* View all link if enabled */}
            {section.showViewAll !== false && (
              <Link href={viewUrl} className={styles.viewAllLink}>
                Xem tất cả
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Content Rendering based on Display Style */}
        {loading ? (
          <BookGridSkeleton count={section.itemLimit > 4 ? 4 : section.itemLimit} />
        ) : section.displayStyle === 'SLIDER' ? (
          /* Slider / Horizontal Carousel (Like Image 1) */
          <div ref={sliderRef} className={styles.sliderContainer}>
            {books.map((book) => (
              <div key={book.id} className={styles.sliderCardItem}>
                <BookCard
                  book={book}
                  isFavorite={favorites.includes(book.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Grid View (Like Image 3) */
          <>
            <div className={styles.bookGrid}>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={favorites.includes(book.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Bottom "Xem thêm" Button like Image 3 */}
            {section.showViewAll !== false && (
              <div className={styles.bottomActionRow}>
                <Link href={viewUrl} className={styles.loadMoreBtn}>
                  Xem thêm
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <QuickVariantSelectModal
        isOpen={!!quickSelectBook}
        onClose={() => setQuickSelectBook(null)}
        book={quickSelectBook}
        onConfirmAddToCart={handleConfirmVariantAddToCart}
      />
    </section>
  );
}
