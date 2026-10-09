'use client';

import { useState } from 'react';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import styles from './bookSearchSelector.module.css';

interface BookSearchSelectorProps {
  selectedBookId: string | null;
  selectedBookTitle: string | null;
  selectedBookCover?: string | null;
  selectedBookPrice?: number | null;
  onSelectBook: (book: Book) => void;
  onUnlinkBook: () => void;
}

export default function BookSearchSelector({
  selectedBookId,
  selectedBookTitle,
  selectedBookCover,
  selectedBookPrice,
  onSelectBook,
  onUnlinkBook,
}: BookSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const res = await bookService.searchBooks(undefined, term.trim());
      setResults(res?.slice(0, 6) || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const formatPrice = (val?: number | null) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.container}>
      <label className={styles.fieldLabel}>Liên kết sản phẩm trên sàn Boki (Tùy chọn)</label>

      {selectedBookId ? (
        <div className={styles.linkedCard}>
          <div className={styles.linkedThumb}>
            {selectedBookCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedBookCover} alt="" className={styles.coverImg} />
            ) : (
              <span className={styles.thumbPlaceholder}>Sách</span>
            )}
          </div>
          <div className={styles.linkedInfo}>
            <span className={styles.linkedBadge}>Đã chọn liên kết</span>
            <strong className={styles.linkedTitle}>{selectedBookTitle || 'Sách trên Boki'}</strong>
            {selectedBookPrice && (
              <span className={styles.linkedPrice}>Giá bán: {formatPrice(selectedBookPrice)}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.unlinkBtn}
            onClick={onUnlinkBook}
            title="Hủy liên kết sách này"
          >
            Gỡ liên kết
          </button>
        </div>
      ) : (
        <div className={styles.searchWrapper}>
          <div className={styles.inputBox}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#868E96"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Nhập tên sách, truyện trên Boki để tìm kiếm..."
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => {
                  setSearchTerm('');
                  setResults([]);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {searching && (
            <div className={styles.statusTip}>Đang tìm kiếm sách trong kho...</div>
          )}

          {results.length > 0 && (
            <div className={styles.dropdownResults}>
              {results.map((book) => {
                const cover = book.imageUrls?.[0] || '';
                return (
                  <div
                    key={book.id}
                    className={styles.resultItem}
                    onClick={() => {
                      onSelectBook(book);
                      setSearchTerm('');
                      setResults([]);
                    }}
                  >
                    <div className={styles.resultThumb}>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" className={styles.coverImg} />
                      ) : (
                        <span className={styles.thumbPlaceholder}>N/A</span>
                      )}
                    </div>
                    <div className={styles.resultDetails}>
                      <strong className={styles.resultTitle}>{book.title}</strong>
                      <div className={styles.resultMeta}>
                        <span className={styles.resultPrice}>{formatPrice(book.price)}</span>
                        {book.isPreOrder && (
                          <span className={styles.preOrderBadge}>Pre-order</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
