'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, BookOpen, ExternalLink, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { BookSummary } from '@/types/blog';
import type { Book } from '@/types';
import styles from './stickyReadingBar.module.css';

interface StickyReadingBarProps {
  book: BookSummary;
}

export default function StickyReadingBar({ book }: StickyReadingBarProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleAddToCart = () => {
    const bookObj: Book = {
      id: book.id,
      sellerId: '',
      sellerName: 'Boki Store',
      categoryId: book.categoryId ?? null,
      title: book.title,
      slug: book.slug,
      author: book.author,
      isbn: null,
      description: '',
      price: book.price,
      originalPrice: book.originalPrice,
      currency: 'VND',
      condition: 'NEW',
      status: 'ACTIVE',
      stockQuantity: 99,
      imageUrls: book.coverImage ? [book.coverImage] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToCart(bookObj, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const bookUrl = book.slug ? `/books/${book.slug}` : `/books/${book.id}`;

  return (
    <div className={styles.barWrapper}>
      <div className={styles.leftInfo}>
        {book.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverImage} alt={book.title} className={styles.thumb} />
        ) : (
          <div className={styles.thumbPlaceholder}>
            <BookOpen size={16} />
          </div>
        )}

        <div className={styles.details}>
          <div className={styles.label}>Bạn đang đọc thử ấn phẩm:</div>
          <div className={styles.bookTitle} title={book.title}>
            {book.title}
          </div>
          <span className={styles.price}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
          </span>
        </div>
      </div>

      <div className={styles.rightActions}>
        <Link href={bookUrl} className={styles.viewBtn}>
          <span>Xem sách</span>
          <ExternalLink size={13} />
        </Link>

        <button
          type="button"
          className={`${styles.cartBtn} ${isAdded ? styles.cartBtnAdded : ''}`}
          onClick={handleAddToCart}
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Đã thêm</span>
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              <span>Thêm vào giỏ</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={styles.dismissBtn}
          onClick={() => setIsDismissed(true)}
          title="Ẩn thanh mua hàng"
          aria-label="Ẩn"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
