'use client';

import { useState, useEffect } from 'react';
import { Search, X, Check, BookOpen } from 'lucide-react';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import type { BookSummary } from '@/types/blog';
import styles from './linkedBookPickerModal.module.css';

interface LinkedBookPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBooks: BookSummary[];
  onConfirm: (books: BookSummary[]) => void;
}

export default function LinkedBookPickerModal({
  isOpen,
  onClose,
  selectedBooks,
  onConfirm,
}: LinkedBookPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogBooks, setCatalogBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<BookSummary[]>([]);

  // Sync tempSelected whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedBooks);
      setSearchTerm('');
    }
  }, [isOpen, selectedBooks]);

  // Search books
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(() => {
      bookService
        .getAdminBooks(searchTerm.trim() || undefined)
        .then((res) => {
          if (isMounted) {
            setCatalogBooks(res || []);
          }
        })
        .catch((err) => {
          console.warn('Failed to load books:', err);
          if (isMounted) setCatalogBooks([]);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  const isBookSelected = (bookId: string) => {
    return tempSelected.some((b) => b.id === bookId);
  };

  const toggleBook = (book: Book) => {
    if (isBookSelected(book.id)) {
      setTempSelected((prev) => prev.filter((b) => b.id !== book.id));
    } else {
      const summary: BookSummary = {
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author,
        price: book.price,
        originalPrice: book.originalPrice,
        rating: book.rating,
        viewsCount: book.viewsCount,
        coverImage: book.imageUrls?.[0] || undefined,
        categoryId: book.categoryId ?? undefined,
      };
      setTempSelected((prev) => [...prev, summary]);
    }
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <BookOpen size={20} color="#2563eb" />
            <span>Chọn sách liên kết đọc thử</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên sách, tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Book List */}
        <div className={styles.bookList}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <span>Đang tải danh sách sách...</span>
            </div>
          ) : catalogBooks.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={36} strokeWidth={1.5} />
              <span>Không tìm thấy sách nào phù hợp</span>
            </div>
          ) : (
            catalogBooks.map((book) => {
              const selected = isBookSelected(book.id);
              const cover = book.imageUrls?.[0];
              return (
                <div
                  key={book.id}
                  className={`${styles.bookItem} ${selected ? styles.bookItemSelected : ''}`}
                  onClick={() => toggleBook(book)}
                >
                  <div className={styles.checkboxBox}>
                    {selected && <Check size={14} strokeWidth={2.5} />}
                  </div>

                  {cover ? (
                    <img src={cover} alt={book.title} className={styles.bookThumb} />
                  ) : (
                    <div className={styles.bookThumbPlaceholder}>
                      <BookOpen size={16} />
                    </div>
                  )}

                  <div className={styles.bookInfo}>
                    <div className={styles.bookTitle} title={book.title}>
                      {book.title}
                    </div>
                    <div className={styles.bookMeta}>
                      <span>{book.author}</span>
                      <span className={styles.bookPrice}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.selectedCount}>
            Đã chọn: <span className={styles.selectedCountHighlight}>{tempSelected.length}</span> sách
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
              Xác nhận ({tempSelected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
