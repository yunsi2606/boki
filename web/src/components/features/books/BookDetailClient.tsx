'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { bookService } from '@/services/bookService';
import { categoryService } from '@/services/categoryService';
import type { Book, BookVariant, Category } from '@/types';
import Button from '@/components/ui/Button';
import VariantSelector from '@/components/features/books/VariantSelector';
import { extractBookId } from '@/lib/slug';
import { getEffectiveMaxOrderQuantity } from '@/utils/orderLimits';
import { BookDetailSkeleton } from '@/components/ui/Skeleton';
import { checkoutNavigationService } from '@/services/checkoutNavigationService';
import { activityTracker } from '@/services/activityTracker';
import PreOrderBadge from '@/components/features/books/PreOrderBadge';
import BookPreviewLink from '@/components/features/preview/BookPreviewLink';
import ComboProductsList from '@/components/features/books/ComboProductsList';
import RelatedCombosSection from '@/components/features/books/RelatedCombosSection';
import FrequentlyBoughtTogether from '@/components/features/recommendations/FrequentlyBoughtTogether';
import SimilarBooksSection from '@/components/features/recommendations/SimilarBooksSection';
import { Package, Eye } from 'lucide-react';
import { getBookPriceDisplay } from '@/utils/bookPrice';
import { getConditionLabel, getBookDisplaySpecs } from '@/utils/bookSpecs';
import ClickableMetadata from '@/components/features/books/ClickableMetadata';
import BookDetailGallery from './BookDetailGallery';
import BookDetailPriceCard from './BookDetailPriceCard';
import BookDetailSpecsTable from './BookDetailSpecsTable';
import styles from '@/app/books/[slug]/page.module.css';

export default function BookDetailClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, cartItems } = useCart();

  const rawParam = (params.slug || params.id) as string;
  const id = extractBookId(rawParam);
  const initialVariantId = searchParams.get('variant');

  const [categories, setCategories] = useState<Category[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<BookVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    categoryService.getCategories().then((data) => setCategories(data || [])).catch(() => {});
  }, []);

  const getCategoryName = (catId: number | null) => {
    if (!catId) return 'Khác';
    return categories.find((c) => c.id === catId)?.name || 'Khác';
  };

  const displaySpecs = useMemo(() => getBookDisplaySpecs(book), [book]);

  useEffect(() => {
    if (!id) return;

    async function loadBook() {
      try {
        const data = await bookService.getBook(id);
        setBook(data);
        if (data.variants && data.variants.length > 0) {
          const match = data.variants.find((v) => v.id === initialVariantId);
          if (match) setSelectedVariant(match);
          else if (data.variants.length === 1) setSelectedVariant(data.variants[0]);
        }
        if (!hasIncrementedRef.current) {
          hasIncrementedRef.current = true;
          bookService.incrementViews(id).catch(() => {});
          activityTracker.trackBookView(data.id, data.title, data.price, getCategoryName(data.categoryIds?.[0] || data.categoryId));
        }
      } catch (err) {
        console.error('Failed to load book detail:', err);
        setBook(null);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id, initialVariantId]);

  const handleBuyNow = () => {
    if (!book) return;
    if (book.variants && book.variants.length > 0 && !selectedVariant) {
      setLimitNotice('Vui lòng chọn một phân loại hàng trước khi Mua ngay.');
      setTimeout(() => setLimitNotice(null), 3500);
      return;
    }
    const effectiveLimit = getEffectiveMaxOrderQuantity(book, selectedVariant);
    const currentInCart = cartItems.find((item) => item.book.id === book.id && item.selectedVariant?.id === selectedVariant?.id)?.quantity || 0;
    if (effectiveLimit && currentInCart >= effectiveLimit) {
      setLimitNotice(`Bạn đã có ${currentInCart} sản phẩm trong giỏ hàng. Giới hạn mua tối đa là ${effectiveLimit} sản phẩm/đơn hàng.`);
      setTimeout(() => setLimitNotice(null), 4000);
      return;
    }
    const checkoutItem = { book, quantity: 1, selectedVariant: selectedVariant || undefined };
    activityTracker.trackCartAction('ADD_TO_CART', book.id, book.title, selectedVariant ? selectedVariant.price : book.price, 1);
    if (!isAuthenticated) {
      checkoutNavigationService.navigateToCheckout(router, [checkoutItem], { source: 'buy_now' });
      router.push(`/login?redirectTo=/checkout`);
      return;
    }
    addToCart(book, 1, selectedVariant || undefined);
    checkoutNavigationService.navigateToCheckout(router, [checkoutItem], { source: 'buy_now' });
  };

  const handleAddToCart = () => {
    if (!book) return;
    if (book.variants && book.variants.length > 0 && !selectedVariant) {
      setLimitNotice('Vui lòng chọn một phân loại hàng trước khi Thêm vào giỏ.');
      setTimeout(() => setLimitNotice(null), 3500);
      return;
    }
    const effectiveLimit = getEffectiveMaxOrderQuantity(book, selectedVariant);
    const currentInCart = cartItems.find((item) => item.book.id === book.id && item.selectedVariant?.id === selectedVariant?.id)?.quantity || 0;
    if (effectiveLimit && currentInCart >= effectiveLimit) {
      setLimitNotice(`Bạn đã có ${currentInCart} sản phẩm trong giỏ hàng. Giới hạn mua tối đa là ${effectiveLimit} sản phẩm/đơn hàng.`);
      setTimeout(() => setLimitNotice(null), 4000);
      return;
    }
    addToCart(book, 1, selectedVariant || undefined);
    activityTracker.trackCartAction('ADD_TO_CART', book.id, book.title, selectedVariant ? selectedVariant.price : book.price, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <BookDetailSkeleton />;
  if (!book) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Sách không tồn tại</h2>
        <p style={{ color: 'var(--color-neutral-400)', marginBottom: '24px' }}>Tựa sách này có thể đã bị xóa hoặc đường dẫn không đúng.</p>
        <Link href="/books"><Button>Quay lại cửa hàng</Button></Link>
      </div>
    );
  }

  const cover = selectedVariant?.imageUrl || (book.imageUrls && book.imageUrls.length > 0 ? book.imageUrls[activeImageIdx] : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300');
  const priceInfo = getBookPriceDisplay(book, selectedVariant);
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : (book.variants && book.variants.length > 0 ? book.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0) : (book.stockQuantity || 0));
  const effectiveLimit = getEffectiveMaxOrderQuantity(book, selectedVariant);
  const rating = book.rating !== undefined && book.rating !== null ? Number(book.rating).toFixed(1) : '5.0';
  const reviewsCount = book.reviewsCount ?? 14;
  const viewsVal = book.viewsCount ?? 0;
  const formattedViews = viewsVal >= 1000 ? `${(viewsVal / 1000).toFixed(1)}k` : `${viewsVal}`;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Trang chủ</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/books" className={styles.breadcrumbLink}>Cửa hàng</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{getCategoryName(book.categoryIds?.[0] || book.categoryId)}</span>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrentTitle}>{book.title}</span>
      </div>

      <div className={styles.detailsLayout}>
        <BookDetailGallery cover={cover} title={book.title} imageUrls={book.imageUrls} activeImageIdx={activeImageIdx} setActiveImageIdx={setActiveImageIdx} />

        <div className={styles.infoSection}>
          <div className={styles.categoryTagsWrapper}>
            {(book.categoryIds && book.categoryIds.length > 0 ? book.categoryIds : (book.categoryId ? [book.categoryId] : [])).map((catId) => (
              <span key={catId} className={styles.categoryTag}>{getCategoryName(catId)}</span>
            ))}
          </div>
          <h1 className={styles.bookTitle}>{book.title} {selectedVariant ? `(${selectedVariant.name})` : ''}</h1>
          <p className={styles.bookAuthor}>Tác giả: <ClickableMetadata value={book.author} paramName="author" linkClassName={styles.metaLink} /></p>

          <div className={styles.ratingRow}>
            <div className={styles.starsGroup}>
              <span className={styles.starIcon}>★</span>
              <span className={styles.ratingValue}>{rating}</span>
              <span className={styles.reviewsText}>({reviewsCount} đánh giá)</span>
            </div>
            <span className={styles.metaDivider}>•</span>
            <div className={styles.viewsGroup}>
              <Eye size={15} className={styles.eyeIcon} />
              <span className={styles.viewsText}>{formattedViews} lượt xem</span>
            </div>
          </div>

          <div className={styles.metaRow}>
            {book.isCombo && (
              <span className={styles.badge} style={{ background: '#ede9fe', color: '#6d28d9', borderColor: '#ddd6fe', fontWeight: 700 }}>
                <Package size={14} style={{ display: 'inline', marginRight: 4 }} /> Combo Tiết Kiệm
              </span>
            )}
            {book.isPreOrder && <PreOrderBadge isPreOrder={book.isPreOrder} preOrderDays={book.preOrderDays} size="md" />}
            <span className={`${styles.badge} ${styles.badgeVip}`}>✓ Chính hãng</span>
            <span className={`${styles.badge} ${styles.badgeCondition}`}>Tình trạng: {getConditionLabel(book.condition)}</span>
            {book.isbn && <span className={`${styles.badge} ${styles.badgeIsbn}`}>ISBN: {book.isbn}</span>}
          </div>

          {book.variants && book.variants.length > 0 && (
            <VariantSelector variants={book.variants} selectedVariantId={selectedVariant?.id || null} onSelectVariant={(variant) => setSelectedVariant(variant)} />
          )}

          <BookDetailPriceCard
            book={book} selectedVariant={selectedVariant} priceInfo={priceInfo}
            currentStock={currentStock} effectiveLimit={effectiveLimit} formatPrice={formatPrice}
          />

          {limitNotice && <div className={styles.limitAlertNotice}>{limitNotice}</div>}

          <BookPreviewLink bookIdOrSlug={book.slug || book.id} />

          <div className={styles.actionsRow}>
            <Button size="lg" variant="secondary" onClick={handleAddToCart} disabled={!book.isPreOrder && currentStock === 0} className={styles.cartButton}>
              {added ? 'Đã thêm vào giỏ' : (book.isPreOrder ? 'Thêm vào giỏ (Đặt trước)' : 'Thêm vào giỏ')}
            </Button>
            <Button size="lg" onClick={handleBuyNow} disabled={!book.isPreOrder && currentStock === 0} className={styles.buyButton}>
              {book.isPreOrder ? 'Đặt trước ngay' : (currentStock === 0 ? 'Đã hết hàng' : 'Mua ngay')}
            </Button>
          </div>

          <BookDetailSpecsTable displaySpecs={displaySpecs} />

          {book.description && (
            <div className={styles.descriptionSection}>
              <h3 className={styles.descriptionTitle}>Thông tin chi tiết & Mô tả sản phẩm</h3>
              <p className={styles.descriptionText}>{book.description}</p>
            </div>
          )}
        </div>
      </div>

      {book.isCombo ? <ComboProductsList comboItems={book.comboItems} /> : <RelatedCombosSection bookIdOrSlug={book.slug || book.id} />}
      <FrequentlyBoughtTogether bookIdOrSlug={book.slug || book.id} onShowNotification={setLimitNotice} />
      <SimilarBooksSection bookIdOrSlug={book.slug || book.id} onShowNotification={setLimitNotice} />
    </div>
  );
}
