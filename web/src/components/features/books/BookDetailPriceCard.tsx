'use client';

import React from 'react';
import type { Book, BookVariant } from '@/types';
import { TrendingDown } from 'lucide-react';
import { PreOrderDeliveryEstimate } from '@/components/features/books/PreOrderBadge';
import styles from '@/app/books/[slug]/page.module.css';

interface BookDetailPriceCardProps {
  book: Book;
  selectedVariant: BookVariant | null;
  priceInfo: {
    displayPrice: string;
    originalPrice?: number;
    currentPrice: number;
    hasDiscount: boolean;
    discountPercent?: number;
    isRange: boolean;
  };
  currentStock: number;
  effectiveLimit?: number;
  formatPrice: (price: number) => string;
}

export default function BookDetailPriceCard({
  book,
  priceInfo,
  currentStock,
  effectiveLimit,
  formatPrice,
}: BookDetailPriceCardProps) {
  const currentPrice = priceInfo.currentPrice;

  return (
    <>
      <div className={styles.priceCard}>
        <div className={styles.priceHeaderRow}>
          <span className={styles.priceTitle}>
            {book.isCombo
              ? 'GIÁ COMBO ƯU ĐÃI'
              : (priceInfo.isRange ? 'KHOẢNG GIÁ THEO PHÂN LOẠI' : 'GIÁ BÁN HIỆN TẠI')}
          </span>
          {book.isCombo && book.savingsPercent && book.savingsPercent > 0 ? (
            <span className={styles.discountBadge} style={{ background: '#10b981' }}>
              Tiết kiệm -{book.savingsPercent}%
            </span>
          ) : priceInfo.hasDiscount ? (
            <span className={styles.discountBadge}>
              -{priceInfo.discountPercent}%
            </span>
          ) : null}
        </div>

        <div className={styles.priceValueRow}>
          <span className={styles.priceAmount}>{priceInfo.displayPrice}</span>
          {book.isCombo && book.originalTotalAmount && book.originalTotalAmount > currentPrice ? (
            <span className={styles.originalPriceAmount}>{formatPrice(book.originalTotalAmount)}</span>
          ) : !priceInfo.isRange && priceInfo.originalPrice && priceInfo.originalPrice > currentPrice ? (
            <span className={styles.originalPriceAmount}>{formatPrice(priceInfo.originalPrice)}</span>
          ) : null}
        </div>

        {book.isCombo && book.savingsAmount && book.savingsAmount > 0 && (
          <div style={{ marginTop: 8, padding: '6px 12px', background: '#dcfce7', borderRadius: 8, color: '#15803d', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <TrendingDown size={16} />
            Tiết kiệm {formatPrice(book.savingsAmount)} so với mua từng sản phẩm lẻ!
          </div>
        )}

        <div className={styles.stockBadgeContainer}>
          {book.isPreOrder ? (
            <span className={styles.inStockBadge} style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }}>
              <span className={styles.stockDot} style={{ background: '#ea580c' }}></span> Hàng đặt trước (Pre-order) {currentStock > 0 ? `• Còn ${currentStock} suất` : ''}
            </span>
          ) : currentStock === 0 ? (
            <span className={styles.outOfStockBadge}>Đã hết hàng</span>
          ) : (
            <span className={styles.inStockBadge}>
              <span className={styles.stockDot}></span> Còn lại <strong>{currentStock}</strong> cuốn trong kho
            </span>
          )}
          {effectiveLimit ? (
            <span className={styles.limitInfoBadge}>
              Giới hạn: Tối đa {effectiveLimit} sản phẩm/đơn
            </span>
          ) : null}
        </div>
      </div>

      {book.isPreOrder && (
        <PreOrderDeliveryEstimate isPreOrder={book.isPreOrder} preOrderDays={book.preOrderDays} />
      )}
    </>
  );
}
