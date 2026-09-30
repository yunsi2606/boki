'use client';

import React from 'react';
import Link from 'next/link';
import type { Book, BookVariant } from '@/types';
import styles from './BookCard.module.css';
import { getBookUrl } from '@/lib/slug';
import PreOrderBadge from './PreOrderBadge';
import { getBookPriceDisplay, formatCurrency } from '@/utils/bookPrice';

interface BookCardProps {
  book: Book;
  standaloneVariant?: BookVariant;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onAddToCart?: (book: Book, variant?: BookVariant) => void;
}

export default function BookCard({
  book,
  standaloneVariant,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
}: BookCardProps) {
  const displayTitle = standaloneVariant
    ? `${book.title} - ${standaloneVariant.name}`
    : book.title;

  const displayCover =
    standaloneVariant?.imageUrl ||
    book.imageUrls?.[0] ||
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400';

  const linkHref = getBookUrl(book, standaloneVariant?.id);

  const priceInfo = getBookPriceDisplay(book, standaloneVariant);
  const priceText = priceInfo.displayPrice;
  const originalPriceText = priceInfo.originalPrice ? formatCurrency(priceInfo.originalPrice) : '';
  const isDiscount = priceInfo.hasDiscount;
  const discountPercent = priceInfo.discountPercent;

  // Real Rating and Views from backend (with fallbacks if undefined)
  const ratingVal = book.rating !== undefined && book.rating !== null ? Number(book.rating).toFixed(1) : '5.0';
  const viewsVal = book.viewsCount ?? 0;
  const formattedViews = viewsVal >= 1000 ? `${(viewsVal / 1000).toFixed(1)}k` : `${viewsVal}`;

  return (
    <div className={styles.bookCard}>
      <div className={styles.coverWrapper}>
        <Link href={linkHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayCover} alt={displayTitle} className={styles.coverImage} loading="lazy" />
        </Link>

        {standaloneVariant && (
          <span className={styles.variantBadge}>{standaloneVariant.name}</span>
        )}

        {onToggleFavorite && (
          <button
            onClick={() =>
              onToggleFavorite(standaloneVariant ? `${book.id}_${standaloneVariant.id}` : book.id)
            }
            className={`${styles.heartBtn} ${isFavorite ? styles.heartBtnActive : ''}`}
            aria-label="Yêu thích"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavorite ? '#FF4757' : 'none'}
              stroke={isFavorite ? '#FF4757' : '#212529'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        )}

        {book.isPreOrder ? (
          <PreOrderBadge isPreOrder={book.isPreOrder} preOrderDays={book.preOrderDays} size="sm" floating />
        ) : (
          <span className={styles.cardTag}>{book.condition === 'NEW' ? 'Chính Hãng' : 'Sách Cũ'}</span>
        )}
        {discountPercent > 0 && <span className={styles.discountBadge}>-{discountPercent}%</span>}
      </div>

      <div className={styles.infoWrapper}>
        <span className={styles.publisherName}>{book.publisher || book.sellerName || 'Boki Store'}</span>
        <Link href={linkHref} style={{ textDecoration: 'none' }}>
          <h3 className={styles.bookTitle} title={displayTitle}>
            {displayTitle}
          </h3>
        </Link>
        <p className={styles.bookAuthor}>{book.author}</p>

        <div className={styles.ratingWrapper}>
          <span className={styles.starIcon}>★</span>
          <span className={styles.ratingVal}>{ratingVal}</span>
          <span className={styles.dotDivider}>•</span>
          <span className={styles.viewText}>{formattedViews} xem</span>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceContainer}>
            <span className={styles.bookPrice}>{priceText}</span>
            {isDiscount && (
              <span className={styles.originalPrice}>{originalPriceText}</span>
            )}
          </div>

          {onAddToCart && (
            <button
              onClick={() => onAddToCart(book, standaloneVariant)}
              className={styles.addToCartBtn}
              title="Thêm vào giỏ hàng"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
