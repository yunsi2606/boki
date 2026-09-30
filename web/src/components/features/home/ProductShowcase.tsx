'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { bookService } from '@/services/bookService';
import type { Book, BookVariant } from '@/types';
import BookCard from '@/components/features/books/BookCard';
import styles from './ProductShowcase.module.css';
import QuickVariantSelectModal from '@/components/features/books/QuickVariantSelectModal';
import { BookGridSkeleton } from '@/components/ui/Skeleton';

interface ProductShowcaseProps {
  title?: string;
  subtitle?: string;
  onShowNotification: (msg: string) => void;
}

export default function ProductShowcase({
  title = 'Gợi Ý Sách & Truyện Hot',
  subtitle = 'Khám phá các phiên bản đặc biệt, boxset giới hạn & bản thường mới nhất',
  onShowNotification,
}: ProductShowcaseProps) {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickSelectBook, setQuickSelectBook] = useState<Book | null>(null);

  useEffect(() => {
    async function loadRealBooks() {
      setLoading(true);
      try {
        const realData = await bookService.searchBooks();
        setBooks(realData || []);
      } catch (err) {
        console.error('Failed to fetch homepage books:', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    loadRealBooks();
  }, []);

  const toggleFavorite = (bookId: string) => {
    setFavorites((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleAddToCart = (book: Book) => {
    if (book.variants && book.variants.length > 0) {
      setQuickSelectBook(book);
      return;
    }

    addToCart(book, 1);
    onShowNotification(`Đã thêm "${book.title}" vào giỏ hàng!`);
  };

  const handleConfirmVariantAddToCart = (book: Book, variant: BookVariant) => {
    addToCart(book, 1, variant);
    onShowNotification(`Đã thêm "${book.title} (${variant.name})" vào giỏ hàng!`);
  };

  const filteredBooks = books.filter((book) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'dac-biet') {
      return (
        book.title.includes('Đặc Biệt') ||
        book.title.includes('Boxset') ||
        Boolean(book.variants && book.variants.some((v) => v.name.includes('Đặc Biệt')))
      );
    }
    if (activeTab === 'manga') {
      return (
        book.categoryId === 3 ||
        Boolean(book.categoryIds && book.categoryIds.includes(3)) ||
        book.title.toLowerCase().includes('manga') ||
        book.title.includes('One Piece')
      );
    }
    if (activeTab === 'light-novel') {
      return (
        book.categoryId === 2 ||
        Boolean(book.categoryIds && book.categoryIds.includes(2)) ||
        book.title.toLowerCase().includes('light novel') ||
        book.title.includes('Sword Art')
      );
    }
    return true;
  });

  return (
    <section className={styles.productsSection}>
      <div className="container">
        <div className={styles.productsHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
          </div>

          {/* Interactive Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tất Cả
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'dac-biet' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('dac-biet')}
            >
              Bản Đặc Biệt & Boxset
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'manga' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('manga')}
            >
              Manga - Comic
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'light-novel' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('light-novel')}
            >
              Light Novel
            </button>
          </div>
        </div>

        {loading ? (
          <BookGridSkeleton count={8} />
        ) : filteredBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary, #64748b)' }}>
            Chưa có sách nào trên hệ thống.
          </div>
        ) : (
          <div className={styles.bookGrid}>
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={favorites.includes(book.id)}
                onToggleFavorite={toggleFavorite}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      <QuickVariantSelectModal
        isOpen={!!quickSelectBook}
        onClose={() => setQuickSelectBook(null)}
        book={quickSelectBook}
        onConfirmAddToCart={handleConfirmVariantAddToCart}
      />
    </section>
  );
}
