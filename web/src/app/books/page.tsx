'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { categoryService } from '@/services/categoryService';
import { useCart } from '@/hooks/useCart';
import type { Book, BookVariant, Category } from '@/types';
import BookCard from '@/components/features/books/BookCard';
import QuickVariantSelectModal from '@/components/features/books/QuickVariantSelectModal';
import CollectionFilterHeader from '@/components/features/books/CollectionFilterHeader';
import BooksSidebarFilter, {
  PRICE_RANGES,
  type ProductTypeFilter,
} from '@/components/features/books/BooksSidebarFilter';
import MobileFilterDrawer from '@/components/features/books/MobileFilterDrawer';
import MobileFilterBar from '@/components/features/books/MobileFilterBar';
import { filterBooksByCriteria } from '@/utils/entityMatch';
import { BookGridSkeleton } from '@/components/ui/Skeleton';
import styles from './books.module.css';

function BooksPageContent() {
  const router = useRouter();
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawBooks, setRawBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quickSelectBook, setQuickSelectBook] = useState<Book | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categoryParam ? parseInt(categoryParam, 10) : null
  );
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(supplierParam || null);
  const [productType, setProductType] = useState<ProductTypeFilter>('ALL');
  const [priceRange, setPriceRange] = useState<string | null>(null);

  useEffect(() => {
    categoryService.getCategories().then((data) => setCategories(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(parseInt(categoryParam, 10));
  }, [categoryParam]);

  useEffect(() => {
    if (supplierParam) setSelectedSupplier(supplierParam);
  }, [supplierParam]);

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

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const catId = selectedCategory || undefined;
        const data = await bookService.searchBooks(catId, search || undefined);
        setRawBooks(data || []);
      } catch (err) {
        console.error('Backend API fetch error:', err);
        setRawBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [search, selectedCategory]);

  const suppliers = useMemo(() => {
    const set = new Set<string>();
    rawBooks.forEach((b) => {
      if (b.supplier?.trim()) set.add(b.supplier.trim());
      if (b.publicationDetails?.['Công ty phát hành']?.trim()) {
        set.add(b.publicationDetails['Công ty phát hành'].trim());
      }
    });
    return Array.from(set).sort();
  }, [rawBooks]);

  const filteredBooks = useMemo(() => {
    const range = priceRange ? PRICE_RANGES.find((r) => r.id === priceRange) : null;
    return filterBooksByCriteria(rawBooks, {
      supplier: selectedSupplier || supplierParam,
      productType,
      priceRange: range ? { min: range.min, max: range.max } : null,
      author: authorParam,
      series: seriesParam,
      publisher: publisherParam,
      audience: audienceParam,
      translator: translatorParam,
      format: formatParam,
    });
  }, [
    rawBooks, selectedSupplier, supplierParam, productType, priceRange,
    authorParam, seriesParam, publisherParam, audienceParam, translatorParam, formatParam,
  ]);

  const activeFilterCount = [
    selectedCategory !== null, selectedSupplier !== null, productType !== 'ALL', priceRange !== null,
    !!authorParam, !!seriesParam, !!publisherParam, !!audienceParam, !!translatorParam, !!formatParam,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedSupplier(null);
    setProductType('ALL');
    setPriceRange(null);
    router.push('/books');
  };

  const currentCategoryName = useMemo(() => {
    const catId = selectedCategory || (categoryParam ? parseInt(categoryParam, 10) : null);
    if (!catId) return null;
    return categories.find((c) => c.id === catId)?.name || null;
  }, [selectedCategory, categoryParam, categories]);

  const renderSidebar = (isDrawer = false) => (
    <BooksSidebarFilter
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      suppliers={suppliers}
      selectedSupplier={selectedSupplier}
      onSelectSupplier={setSelectedSupplier}
      productType={productType}
      onSelectProductType={setProductType}
      priceRange={priceRange}
      onSelectPriceRange={setPriceRange}
      onResetFilters={handleResetFilters}
      hasActiveFilters={activeFilterCount > 0}
      isMobileDrawer={isDrawer}
    />
  );

  return (
    <div className={styles.container}>
      {notification && (
        <div className={styles.toastNotification}>
          <ShoppingBag size={18} color="#4ade80" />
          <span>{notification}</span>
        </div>
      )}

      <CollectionFilterHeader totalCount={filteredBooks.length} categoryName={currentCategoryName} />

      <MobileFilterBar
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
        productType={productType}
        onToggleProductType={(type) => setProductType((prev) => (prev === type ? 'ALL' : type))}
      />

      <div className={styles.catalogLayout}>
        <div className={styles.desktopSidebarWrapper}>{renderSidebar(false)}</div>

        <main className={styles.resultsSection}>
          {loading ? (
            <BookGridSkeleton count={8} />
          ) : filteredBooks.length === 0 ? (
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
        </main>
      </div>

      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        totalCount={filteredBooks.length}
      >
        {renderSidebar(true)}
      </MobileFilterDrawer>

      <QuickVariantSelectModal
        isOpen={!!quickSelectBook}
        onClose={() => setQuickSelectBook(null)}
        book={quickSelectBook}
        onConfirmAddToCart={(book, variant) => {
          addToCart(book, 1, variant);
          showNotification(`Đã thêm "${book.title} (${variant.name})" vào giỏ hàng`);
        }}
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
