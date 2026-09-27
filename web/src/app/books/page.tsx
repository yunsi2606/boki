'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { bookService } from '@/services/bookService';
import { useCart } from '@/hooks/useCart';
import type { Book, BookVariant } from '@/types';
import BookCard from '@/components/features/books/BookCard';
import QuickVariantSelectModal from '@/components/features/books/QuickVariantSelectModal';
import styles from './books.module.css';
import { BookGridSkeleton } from '@/components/ui/Skeleton';

// Standard static category listing matching homepage circle list
const categoriesList = [
  { id: 1, name: 'Sách Văn học' },
  { id: 2, name: 'Sách Thiếu nhi' },
  { id: 3, name: 'Sách Kinh tế' },
  { id: 4, name: 'Sách Giáo khoa' },
  { id: 5, name: 'Kỹ Năng' },
  { id: 6, name: 'Phát triển bản thân' },
  { id: 7, name: 'Sổ tay các loại' }
];

const conditionsList = [
  { value: 'NEW', label: 'Mới (NEW)' },
  { value: 'LIKE_NEW', label: 'Như mới (LIKE NEW)' },
  { value: 'GOOD', label: 'Tốt (GOOD)' },
  { value: 'FAIR', label: 'Chấp nhận được (FAIR)' },
  { value: 'POOR', label: 'Cũ/Yếu (POOR)' }
];

function BooksPageContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  const { addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quickSelectBook, setQuickSelectBook] = useState<Book | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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
    showNotification(`🛒 Đã thêm "${titleText}" vào giỏ hàng!`);
  };

  const handleConfirmVariantAddToCart = (book: Book, variant: BookVariant) => {
    addToCart(book, 1, variant);
    showNotification(`🛒 Đã thêm "${book.title} (${variant.name})" vào giỏ hàng!`);
  };

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const data = await bookService.searchBooks(selectedCategory || undefined, search || undefined);
        let filteredData = data || [];

        // Filter by conditions on client side if selected
        if (selectedConditions.length > 0) {
          filteredData = filteredData.filter(book => selectedConditions.includes(book.condition));
        }

        setBooks(filteredData);
      } catch (err) {
        console.error('Backend API fetch error:', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [search, selectedCategory, selectedConditions]);

  const handleConditionChange = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

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
          gap: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {notification}
        </div>
      )}

      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>Cửa hàng sách Boki</h1>
        <p className={styles.searchSummary}>
          {search ? `Kết quả tìm kiếm cho "${search}"` : 'Khám phá hàng ngàn tựa sách từ các người bán uy tín'}
        </p>
      </div>

      <div className={styles.catalogLayout}>
        {/* Sidebar Filter Panel */}
        <aside className={styles.filterSidebar}>
          {/* Categories */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Thể loại sách</h3>
            <div className={styles.filterList}>
              <label 
                className={`${styles.filterLabel} ${selectedCategory === null ? styles.activeFilterLabel : ''}`}
                onClick={() => handleCategorySelect(null)}
              >
                <input 
                  type="radio" 
                  name="category" 
                  checked={selectedCategory === null} 
                  onChange={() => {}} 
                  className={styles.radioInput} 
                />
                Tất cả thể loại
              </label>
              {categoriesList.map(cat => (
                <label 
                  key={cat.id} 
                  className={`${styles.filterLabel} ${selectedCategory === cat.id ? styles.activeFilterLabel : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === cat.id} 
                    onChange={() => {}} 
                    className={styles.radioInput} 
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Tình trạng sách</h3>
            <div className={styles.filterList}>
              {conditionsList.map(cond => (
                <label key={cond.value} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(cond.value)}
                    onChange={() => handleConditionChange(cond.value)}
                    className={styles.checkboxInput}
                  />
                  {cond.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid View */}
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
              {books.map((book) => {
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    isFavorite={favorites.includes(book.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
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
