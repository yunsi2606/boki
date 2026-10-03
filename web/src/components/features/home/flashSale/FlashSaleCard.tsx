'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { FlashSaleItem } from '@/types/flashSale';
import FlashSaleProgressBar from './FlashSaleProgressBar';
import styles from './FlashSaleCard.module.css';

interface FlashSaleCardProps {
  item: FlashSaleItem;
  onAddToCart?: (bookId: string) => void;
}

export default function FlashSaleCard({ item, onAddToCart }: FlashSaleCardProps) {
  const isSoldOut = item.isSoldOut || item.soldQuantity >= item.quantityLimit;
  const bookHref = item.bookSlug ? `/books/${item.bookSlug}` : `/books/${item.bookId}`;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  const handleBuy = (e: React.MouseEvent) => {
    if (isSoldOut) {
      e.preventDefault();
      return;
    }
    if (onAddToCart) {
      e.preventDefault();
      onAddToCart(item.bookId);
    }
  };

  return (
    <div className={styles.card}>
      <Link href={bookHref} className={styles.imageWrapper}>
        <Image
          src={item.bookImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
          alt={item.bookTitle}
          fill
          sizes="(max-width: 768px) 180px, 220px"
          className={styles.bookImage}
        />
        {item.discountPercent > 0 && (
          <div className={styles.discountBadge}>
            -{item.discountPercent}%
          </div>
        )}
      </Link>

      <div className={styles.content}>
        <Link href={bookHref} className={styles.title} title={item.bookTitle}>
          {item.bookTitle}
        </Link>
        {item.bookAuthor && (
          <p className={styles.author} title={item.bookAuthor}>
            {item.bookAuthor}
          </p>
        )}

        <div className={styles.priceRow}>
          <span className={styles.salePrice}>
            {formatPrice(item.flashSalePrice)}
          </span>
          {item.originalPrice > item.flashSalePrice && (
            <span className={styles.originalPrice}>
              {formatPrice(item.originalPrice)}
            </span>
          )}
        </div>

        <FlashSaleProgressBar
          soldQuantity={item.soldQuantity}
          quantityLimit={item.quantityLimit}
        />

        <div className={styles.actionRow}>
          {isSoldOut ? (
            <button type="button" className={`${styles.buyBtn} ${styles.buyBtnSoldOut}`} disabled>
              Hết Suất
            </button>
          ) : (
            <button
              type="button"
              className={styles.buyBtn}
              onClick={handleBuy}
            >
              <ShoppingCart size={15} strokeWidth={2.2} />
              Mua Ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
