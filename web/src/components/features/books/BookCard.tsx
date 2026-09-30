'use client';

import React from 'react';
import Link from 'next/link';
import type { Book, BookVariant } from '@/types';
import { ShoppingCart } from 'lucide-react';
import styles from './BookCard.module.css';
import { getBookUrl } from '@/lib/slug';
import PreOrderBadge from './PreOrderBadge';
import { getBookPriceDisplay, formatCurrency } from '@/utils/bookPrice';

interface BookCardProps {
  book: Book;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onAddToCart?: (book: Book, variant?: BookVariant) => void;
}

export default function BookCard({
  book,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
}: BookCardProps) {
  const displayTitle = book.title;
  const displayCover =
    book.imageUrls?.[0] ||
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400';

  const linkHref = getBookUrl(book);

  const priceInfo = getBookPriceDisplay(book);
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

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(book.id)}
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
              onClick={() => onAddToCart(book)}
              className={styles.addToCartBtn}
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
