'use client';

import React from 'react';
import Link from 'next/link';
import type { RecommendationBook } from '@/types/recommendation';
import { Sparkles, TrendingUp, Layers, BookOpen, Flame, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { recommendationService } from '@/services/recommendationService';
import { activityTracker } from '@/services/activityTracker';
import { getBookUrl } from '@/lib/slug';
import PreOrderBadge from '@/components/features/books/PreOrderBadge';
import { getBookPriceDisplay, formatCurrency } from '@/utils/bookPrice';
import styles from './recommendationCard.module.css';

interface Props {
  item: RecommendationBook;
  widgetType: string;
  positionIndex?: number;
  onAddedNotification?: (msg: string) => void;
}

export default function RecommendationCard({
  item,
  widgetType,
  positionIndex = 0,
  onAddedNotification,
}: Props) {
  const { addToCart } = useCart();
  const book = item.book;
  const linkHref = getBookUrl(book);

  const priceInfo = getBookPriceDisplay(book);
  const priceText = priceInfo.displayPrice;
  const originalPriceText = priceInfo.originalPrice ? formatCurrency(priceInfo.originalPrice) : '';
  const isDiscount = priceInfo.hasDiscount;
  const discountPercent = priceInfo.discountPercent;

  const ratingVal =
    book.rating !== undefined && book.rating !== null ? Number(book.rating).toFixed(1) : '5.0';
  const viewsVal = book.viewsCount ?? 0;
  const formattedViews = viewsVal >= 1000 ? `${(viewsVal / 1000).toFixed(1)}k` : `${viewsVal}`;

  const handleClick = () => {
    recommendationService.trackInteraction({
      sessionId: activityTracker.getSessionId(),
      bookId: book.id,
      widgetType,
      eventAction: 'CLICK',
      positionIndex,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedVar = book.variants && book.variants.length > 0 ? book.variants[0] : undefined;
    addToCart(book, 1, selectedVar);

    recommendationService.trackInteraction({
      sessionId: activityTracker.getSessionId(),
      bookId: book.id,
      widgetType,
      eventAction: 'ADD_TO_CART',
      positionIndex,
    });

    if (onAddedNotification) {
      onAddedNotification(`Đã thêm "${book.title}" vào giỏ hàng`);
    }
  };

  const renderReasonIcon = () => {
    if (item.reasonCode === 'SAME_AUTHOR') return <Layers size={11} />;
    if (item.reasonCode === 'TRENDING') return <Flame size={11} />;
    return <Sparkles size={11} />;
  };

  const coverUrl = book.imageUrls?.[0];

  return (
    <div className={styles.bookCard}>
      <div className={styles.coverWrapper}>
        <Link href={linkHref} onClick={handleClick}>
          {coverUrl ? (
            <img src={coverUrl} alt={book.title} className={styles.coverImage} loading="lazy" />
          ) : (
            <div className={styles.placeholder}>
              <BookOpen size={28} />
            </div>
          )}
        </Link>

        {/* Explainability Badge */}
        <span className={styles.reasonBadge}>
          {renderReasonIcon()}
          <span>{item.reasonLabel}</span>
        </span>

        {book.isPreOrder ? (
          <PreOrderBadge isPreOrder={book.isPreOrder} preOrderDays={book.preOrderDays} size="sm" floating />
        ) : (
          <span className={styles.cardTag}>
            {book.condition === 'NEW' ? 'Chính Hãng' : 'Sách Cũ'}
          </span>
        )}

        {discountPercent > 0 && (
          <span className={styles.discountBadge}>-{discountPercent}%</span>
        )}
      </div>

      <div className={styles.infoWrapper}>
        <span className={styles.publisherName}>
          {book.publisher || book.sellerName || 'Boki Store'}
        </span>

        <Link href={linkHref} onClick={handleClick} style={{ textDecoration: 'none' }}>
          <h3 className={styles.bookTitle} title={book.title}>
            {book.title}
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

          <button
            type="button"
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
