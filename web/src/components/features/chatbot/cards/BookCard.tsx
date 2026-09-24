'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ExternalLink, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { BookCardData } from '@/types/chat';
import styles from '../styles/cards.module.css';

interface BookCardProps {
  books: BookCardData[];
}

export default function BookCard({ books }: BookCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  if (!books || books.length === 0) return null;

  const handleAddToCart = (b: BookCardData) => {
    const dummyBook = {
      id: b.id,
      title: b.title,
      price: b.price,
      originalPrice: b.originalPrice,
      stockQuantity: b.stock || 99,
      images: b.coverUrl ? [{ imageUrl: b.coverUrl, isPrimary: true }] : [],
      sellerId: 'system',
      author: b.author,
      condition: 'NEW' as const,
      status: 'ACTIVE' as const,
      currency: 'VND',
      viewsCount: 0,
      rating: b.rating || 5,
      reviewsCount: 0,
      isPreOrder: b.isPreOrder || false
    };
    addToCart(dummyBook as any, 1);
  };

  const handleView = (b: BookCardData) => {
    const target = b.slug ? `/books/${b.slug}` : `/books/${b.id}`;
    router.push(target);
  };

  return (
    <div className={styles.bookGrid}>
      {books.map((b) => (
        <div key={b.id} className={styles.bookCard}>
          {b.coverUrl ? (
            <img
              src={b.coverUrl}
              alt={b.title}
              className={styles.bookCover}
              onError={(e) => {
                // Fallback nếu ảnh lỗi
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={styles.bookCoverPlaceholder}>Boki</div>
          )}

          <div className={styles.bookContent}>
            <div>
              <div className={styles.bookTitle} title={b.title}>
                {b.title}
              </div>
              <div className={styles.bookAuthor}>Tác giả: {b.author}</div>
              <div className={styles.bookPriceRow}>
                <span className={styles.bookPrice}>
                  {Number(b.price).toLocaleString('vi-VN')} ₫
                </span>
                {b.originalPrice && b.originalPrice > b.price && (
                  <span className={styles.bookOriginalPrice}>
                    {Number(b.originalPrice).toLocaleString('vi-VN')} ₫
                  </span>
                )}
              </div>
            </div>

            <div className={styles.bookActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => handleAddToCart(b)}
              >
                <ShoppingCart size={13} />
                Thêm giỏ
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => handleView(b)}
              >
                <ExternalLink size={13} />
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
