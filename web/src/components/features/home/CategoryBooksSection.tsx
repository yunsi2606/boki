'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bookService } from '@/services/bookService';
import { useCart } from '@/hooks/useCart';
import type { Book, BookVariant } from '@/types';
import BookCard from '@/components/features/books/BookCard';
import QuickVariantSelectModal from '@/components/features/books/QuickVariantSelectModal';
import { BookGridSkeleton } from '@/components/ui/Skeleton';
import styles from './CategoryBooksSection.module.css';

interface CategoryBooksSectionProps {
  title: string;
  subtitle?: string;
  categoryId?: number;
  categoryName?: string;
  itemLimit?: number;
  onShowNotification?: (msg: string) => void;
}

export default function CategoryBooksSection({
  title,
  subtitle,
  categoryId,
  categoryName,
  itemLimit = 8,
  onShowNotification,
}: CategoryBooksSectionProps) {
  const { addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quickSelectBook, setQuickSelectBook] = useState<Book | null>(null);

  useEffect(() => {
    async function loadCategoryBooks() {
      setLoading(true);
      try {
        const data = await bookService.searchBooks(categoryId);
        let list = data || [];

        // If categoryId is not set or yielded few results, filter by name keyword if possible
        if (list.length === 0 && categoryName) {
          const allData = await bookService.searchBooks();
          const lowerName = categoryName.toLowerCase();
          list = (allData || []).filter(
            (b) =>
              (categoryId !== undefined &&
                (b.categoryId === categoryId || b.categoryIds?.includes(categoryId))) ||
              b.title.toLowerCase().includes(lowerName)
          );
        }

        setBooks(list.slice(0, itemLimit));
      } catch (err) {
        console.error('Failed to load category books', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryBooks();
  }, [categoryId, categoryName, itemLimit]);

  const toggleFavorite = (favKey: string) => {
    setFavorites((prev) =>
      prev.includes(favKey) ? prev.filter((item) => item !== favKey) : [...prev, favKey]
    );
  };

  const handleAddToCart = (book: Book, variant?: BookVariant) => {
    if (!variant && book.variants && book.variants.length > 0) {
      setQuickSelectBook(book);
      return;
    }

    addToCart(book, 1, variant);
    const titleText = variant ? `${book.title} (${variant.name})` : book.title;
    if (onShowNotification) {
      onShowNotification(`🛒 Đã thêm "${titleText}" vào giỏ hàng!`);
    }
  };

  const handleConfirmVariantAddToCart = (book: Book, variant: BookVariant) => {
    addToCart(book, 1, variant);
    if (onShowNotification) {
      onShowNotification(`🛒 Đã thêm "${book.title} (${variant.name})" vào giỏ hàng!`);
    }
  };

  if (!loading && books.length === 0) {
    return null;
  }

  const viewAllHref = categoryId ? `/books?category=${categoryId}` : '/books';

  return (
    <section className={styles.categorySection}>
      <div className="container">
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
          </div>

          <Link href={viewAllHref} className={styles.viewAllLink}>
            Xem tất cả
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <BookGridSkeleton count={itemLimit > 4 ? 4 : itemLimit} />
        ) : (
          <div className={styles.bookGrid}>
            {books.map((book) => (
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
