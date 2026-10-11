'use client';

import React from 'react';
import type { Book } from '@/types';
import styles from './smartSearch.module.css';

interface SearchSuggestionsDropdownProps {
  query: string;
  books: Book[];
  isLoading: boolean;
  onSelectBook: (book: Book) => void;
  onViewAll: () => void;
}

export default function SearchSuggestionsDropdown({
  query,
  books,
  isLoading,
  onSelectBook,
  onViewAll,
}: SearchSuggestionsDropdownProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (isLoading) {
    return (
      <div className={styles.loadingSkeleton}>
        {[1, 2, 3].map((n) => (
          <div key={n} className={styles.skeletonRow}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} style={{ width: '70%' }} />
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
              <div className={styles.skeletonLine} style={{ width: '30%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Không tìm thấy sản phẩm phù hợp với <strong>&ldquo;{query}&rdquo;</strong></p>
      </div>
    );
  }

  return (
    <div className={styles.suggestionsList}>
      {books.map((book) => {
        const coverImg = (book.imageUrls && book.imageUrls[0]) || '/images/book-placeholder.jpg';
        return (
          <div
            key={book.id}
            className={styles.bookItem}
            onClick={() => onSelectBook(book)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectBook(book);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImg} alt={book.title} className={styles.bookThumb} />
            <div className={styles.bookInfo}>
              <span className={styles.bookTitle} title={book.title}>
                {book.title}
              </span>
              <span className={styles.bookMeta}>
                {book.author ? `Tác giả: ${book.author}` : (book.publisher ? `NXB: ${book.publisher}` : 'Sách chính hãng')}
              </span>
              <span className={styles.bookPrice}>
                {formatPrice(book.price)}
              </span>
            </div>
          </div>
        );
      })}

      <div
        className={styles.viewAllFooter}
        onClick={onViewAll}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onViewAll();
        }}
      >
        Xem tất cả kết quả cho &ldquo;{query}&rdquo; &rarr;
      </div>
    </div>
  );
}
