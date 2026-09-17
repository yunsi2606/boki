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
  onShowNotification: (msg: string) => void;
}

export default function ProductShowcase({ onShowNotification }: ProductShowcaseProps) {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [unrollVariants, setUnrollVariants] = useState(true);
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

  const toggleFavorite = (favKey: string) => {
    setFavorites((prev) =>
      prev.includes(favKey) ? prev.filter((item) => item !== favKey) : [...prev, favKey]
    );
  };

  const handleAddToCart = (book: Book, variant?: BookVariant) => {
    if (!variant && book.variants && book.variants.length > 0) {
      // Prompt user to select variant!
      setQuickSelectBook(book);
      return;
    }

    addToCart(book, 1, variant);
    const titleText = variant ? `${book.title} (${variant.name})` : book.title;
    onShowNotification(`🛒 Đã thêm "${titleText}" vào giỏ hàng!`);
  };

  const handleConfirmVariantAddToCart = (book: Book, variant: BookVariant) => {
    addToCart(book, 1, variant);
    onShowNotification(`🛒 Đã thêm "${book.title} (${variant.name})" vào giỏ hàng!`);
  };

  // Build items array: unrolls standalone variants into individual items when unrollVariants is true!
  const showcaseItems: { book: Book; variant?: BookVariant }[] = [];

  books.forEach((b) => {
    if (unrollVariants && b.variants && b.variants.length > 0) {
      // Add parent book first
      showcaseItems.push({ book: b });
      // Unroll variants that are set to standalone display
      b.variants.forEach((v) => {
        if (v.isStandaloneDisplay) {
          showcaseItems.push({ book: b, variant: v });
        }
      });
    } else {
      showcaseItems.push({ book: b });
    }
  });

  const filteredItems = showcaseItems.filter(({ book, variant }) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'dac-biet') return variant || book.title.includes('Đặc Biệt');
    if (activeTab === 'manga') return book.categoryId === 3 || book.title.includes('One Piece');
    if (activeTab === 'light-novel') return book.categoryId === 2 || book.title.includes('Sword Art');
    return true;
  });

  return (
    <section className={styles.productsSection}>
      <div className="container">
        <div className={styles.productsHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Gợi Ý Sách & Truyện Hot</h2>
            <p className={styles.sectionSubtitle}>
              Khám phá các phiên bản đặc biệt, boxset giới hạn & bản thường mới nhất
            </p>
          </div>

          {/* Interactive Filter Tabs & Unroll Toggle */}
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

            <button
              onClick={() => setUnrollVariants(!unrollVariants)}
              className={`${styles.unrollToggleBtn} ${unrollVariants ? styles.unrollActive : ''}`}
              title="Bật/Tắt hiển thị phân loại thành các sản phẩm riêng"
            >
              {unrollVariants ? 'Đang hiện Phân Loại riêng' : 'Hiện Phân Loại thành SP riêng'}
            </button>
          </div>
        </div>

        {loading ? (
          <BookGridSkeleton count={8} />
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary, #64748b)' }}>
            Chưa có sách nào trên hệ thống.
          </div>
        ) : (
          <div className={styles.bookGrid}>
            {filteredItems.map(({ book, variant }) => {
              const favKey = variant ? `${book.id}_${variant.id}` : book.id;
              return (
                <BookCard
                  key={favKey}
                  book={book}
                  standaloneVariant={variant}
                  isFavorite={favorites.includes(favKey)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
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
