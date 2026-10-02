'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { useCart } from '@/hooks/useCart';
import type { Book, BookVariant } from '@/types';
import BookCard from '@/components/features/books/BookCard';
import QuickVariantSelectModal from '@/components/features/books/QuickVariantSelectModal';
import CollectionFilterHeader from '@/components/features/books/CollectionFilterHeader';
import BooksSidebarFilter, { categoriesList } from '@/components/features/books/BooksSidebarFilter';
import { matchMultiValue } from '@/utils/entityMatch';
import { BookGridSkeleton } from '@/components/ui/Skeleton';
import styles from './books.module.css';

function BooksPageContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const authorParam = searchParams.get('author') || '';
  const seriesParam = searchParams.get('series') || '';
  const publisherParam = searchParams.get('publisher') || '';
  const supplierParam = searchParams.get('supplier') || '';
  const audienceParam = searchParams.get('audience') || '';
  const translatorParam = searchParams.get('translator') || '';
  const formatParam = searchParams.get('format') || '';
  const categoryParam = searchParams.get('category');

  const { addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quickSelectBook, setQuickSelectBook] = useState<Book | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categoryParam ? parseInt(categoryParam, 10) : null
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

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
    showNotification(`Đã thêm "${titleText}" vào giỏ hàng`);
  };

  const handleConfirmVariantAddToCart = (book: Book, variant: BookVariant) => {
    addToCart(book, 1, variant);
    showNotification(`Đã thêm "${book.title} (${variant.name})" vào giỏ hàng`);
  };

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const catId = selectedCategory || (categoryParam ? parseInt(categoryParam, 10) : undefined);
        const data = await bookService.searchBooks(catId || undefined, search || undefined);
        let filtered = data || [];

        if (authorParam) filtered = filtered.filter((b) => matchMultiValue(b.author, authorParam));
        if (seriesParam) filtered = filtered.filter((b) => matchMultiValue(b.publicationDetails?.['Bộ sách'], seriesParam));
        if (publisherParam) filtered = filtered.filter((b) => matchMultiValue(b.publicationDetails?.['Nhà xuất bản'] || b.publisher, publisherParam));
        if (supplierParam) filtered = filtered.filter((b) => matchMultiValue(b.publicationDetails?.['Công ty phát hành'] || b.supplier, supplierParam));
        if (audienceParam) filtered = filtered.filter((b) => matchMultiValue(b.publicationDetails?.['Đối tượng'], audienceParam));
        if (translatorParam) filtered = filtered.filter((b) => matchMultiValue(b.publicationDetails?.['Dịch giả'] || b.translator, translatorParam));
        if (formatParam) filtered = filtered.filter((b) => matchMultiValue(b.publicationDetails?.['Hình thức bìa'] || b.format, formatParam));
        if (selectedConditions.length > 0) filtered = filtered.filter((b) => selectedConditions.includes(b.condition));

        setBooks(filtered);
      } catch (err) {
        console.error('Backend API fetch error:', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [search, selectedCategory, categoryParam, authorParam, seriesParam, publisherParam, supplierParam, audienceParam, translatorParam, formatParam, selectedConditions]);

  const handleToggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const currentCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    return categoriesList.find((c) => c.id === selectedCategory)?.name || null;
  }, [selectedCategory]);

  return (
    <div className={styles.container}>
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <ShoppingBag size={18} color="#4ade80" />
          <span>{notification}</span>
        </div>
      )}

      <CollectionFilterHeader
        totalCount={books.length}
        categoryName={currentCategoryName}
      />

      <div className={styles.catalogLayout}>
        <BooksSidebarFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedConditions={selectedConditions}
          onToggleCondition={handleToggleCondition}
        />

        <main className={styles.resultsSection}>
          {loading ? (
            <BookGridSkeleton count={8} />
          ) : books.length === 0 ? (
            <div className={styles.emptyContainer}>
              <svg className={styles.emptyIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <h3 className={styles.emptyTitle}>Không tìm thấy sách nào</h3>
              <p>Thử tìm kiếm với từ khóa khác hoặc xóa bớt các bộ lọc để có thêm kết quả.</p>
            </div>
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
        </main>
      </div>

      <QuickVariantSelectModal
        isOpen={!!quickSelectBook}
        onClose={() => setQuickSelectBook(null)}
        book={quickSelectBook}
        onConfirmAddToCart={handleConfirmVariantAddToCart}
      />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <BookGridSkeleton count={8} />
      </div>
    }>
      <BooksPageContent />
    </Suspense>
  );
}
