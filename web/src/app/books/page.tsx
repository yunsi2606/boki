'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import styles from './books.module.css';

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
  const router = useRouter();
  const search = searchParams.get('search') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const data = await bookService.searchBooks(selectedCategory || undefined, search || undefined);
        
        // Filter by conditions on client side if selected
        let filteredData = data;
        if (selectedConditions.length > 0) {
          filteredData = data.filter(book => selectedConditions.includes(book.condition));
        }

        setBooks(filteredData);
      } catch (err) {
        console.error('Failed to search books', err);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className={styles.container}>
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
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Đang tìm kiếm sách...</p>
            </div>
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
                const cover = book.imageUrls && book.imageUrls.length > 0
                  ? book.imageUrls[0]
                  : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200';

                return (
                  <Link href={`/books/${book.id}`} key={book.id} className={styles.bookCard}>
                    <div className={styles.coverWrapper}>
                      <img
                        src={cover}
                        alt={book.title}
                        className={styles.coverImage}
                        loading="lazy"
                      />
                      <span className={styles.cardTag}>{book.sellerName}</span>
                      <span className={styles.conditionBadge}>{book.condition}</span>
                    </div>
                    <div className={styles.infoWrapper}>
                      <h3 className={styles.bookTitle}>{book.title}</h3>
                      <p className={styles.bookAuthor}>{book.author}</p>
                      <div className={styles.priceWrapper}>
                        <span className={styles.bookPrice}>{formatPrice(book.price)}</span>
                        {book.stockQuantity === 0 ? (
                          <span className={`${styles.stockStatus} ${styles.outOfStock}`}>Hết hàng</span>
                        ) : (
                          <span className={styles.stockStatus}>Còn {book.stockQuantity} cuốn</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải trang cửa hàng...</p>
      </div>
    }>
      <BooksPageContent />
    </Suspense>
  );
}
