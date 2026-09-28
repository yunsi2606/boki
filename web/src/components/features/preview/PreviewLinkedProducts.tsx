'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { BookSummary } from '@/types/blog';
import type { Book } from '@/types';
import styles from './previewLinkedProducts.module.css';

interface PreviewLinkedProductsProps {
  books: BookSummary[];
}

export default function PreviewLinkedProducts({ books }: PreviewLinkedProductsProps) {
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  if (!books || books.length === 0) return null;

  const handleAddToCart = (book: BookSummary) => {
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
    setAddedIds((prev) => ({ ...prev, [book.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [book.id]: false }));
    }, 2000);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <BookOpen size={22} color="#EE4D2D" />
          <h2 className={styles.title}>Sách Được Giới Thiệu Trong Bài Đọc Thử</h2>
        </div>
        <span className={styles.badge}>{books.length} tác phẩm</span>
      </div>

      <div className={styles.banner}>
        <Sparkles size={18} style={{ flexShrink: 0 }} />
        <span>
          Bạn yêu thích câu chuyện này? Hãy đặt mua ngay sách bản quyền chính hãng tại Boki để tiếp tục
          thưởng thức trọn vẹn và ủng hộ tác giả cùng nhà xuất bản!
        </span>
      </div>

      <div className={styles.grid}>
        {books.map((book) => {
          const isAdded = !!addedIds[book.id];
          const bookUrl = book.slug ? `/books/${book.slug}` : `/books/${book.id}`;

          return (
            <div key={book.id} className={styles.productCard}>
              <div className={styles.cardTop}>
                {book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverImage} alt={book.title} className={styles.thumb} />
                ) : (
                  <div className={styles.thumbPlaceholder}>
                    <BookOpen size={24} />
                  </div>
                )}

                <div className={styles.productInfo}>
                  <div className={styles.productTitle} title={book.title}>
                    {book.title}
                  </div>
                  <div className={styles.productAuthor}>{book.author}</div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                    </span>
                    {book.originalPrice && book.originalPrice > book.price && (
                      <span className={styles.originalPrice}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.cardBottom}>
                <Link href={bookUrl} className={styles.viewBtn}>
                  <span>Xem sách</span>
                  <ExternalLink size={13} />
                </Link>

                <button
                  type="button"
                  className={`${styles.addBtn} ${isAdded ? styles.addBtnAdded : ''}`}
                  onClick={() => handleAddToCart(book)}
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
