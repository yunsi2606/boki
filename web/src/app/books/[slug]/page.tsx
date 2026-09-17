'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { bookService } from '@/services/bookService';
import type { Book, BookVariant } from '@/types';
import Button from '@/components/ui/Button';
import VariantSelector from '@/components/features/books/VariantSelector';
import styles from './page.module.css';
import { extractBookId } from '@/lib/slug';
import { BookDetailSkeleton } from '@/components/ui/Skeleton';

const getCategoryName = (id: number | null) => {
  const categoriesList = [
    { id: 1, name: 'Sách Văn học' },
    { id: 2, name: 'Sách Thiếu nhi' },
    { id: 3, name: 'Sách Kinh tế' },
    { id: 4, name: 'Sách Giáo khoa' },
    { id: 5, name: 'Kỹ Năng' },
    { id: 6, name: 'Phát triển bản thân' },
    { id: 7, name: 'Sổ tay các loại' },
  ];
  return categoriesList.find((c) => c.id === id)?.name || 'Khác';
};

const getConditionLabel = (condition: string) => {
  switch (condition) {
    case 'NEW': return 'Mới (NEW)';
    case 'LIKE_NEW': return 'Như mới (LIKE NEW)';
    case 'GOOD': return 'Tốt (GOOD)';
    case 'FAIR': return 'Chấp nhận được (FAIR)';
    case 'POOR': return 'Cũ/Yếu (POOR)';
    default: return condition;
  }
};

function getBookStats(bookId: string) {
  let hash = 0;
  for (let i = 0; i < (bookId || 'book').length; i++) {
    hash = (hash << 5) - hash + (bookId || 'book').charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const rating = (4.6 + (posHash % 5) / 10).toFixed(1);
  const reviewsCount = (posHash % 85) + 14;
  const rawViews = (posHash % 1800) + 420;
  const formattedViews = rawViews >= 1000 ? `${(rawViews / 1000).toFixed(1)}k` : `${rawViews}`;
  return { rating, reviewsCount, formattedViews };
}

function BookDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const rawParam = (params.slug || params.id) as string;
  const id = extractBookId(rawParam);
  const initialVariantId = searchParams.get('variant');

  const [book, setBook] = useState<Book | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<BookVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    async function loadBook() {
      try {
        const data = await bookService.getBook(id);

        setBook(data);

        // Pre-select variant from query param or first variant if available
        if (data.variants && data.variants.length > 0) {
          const match = data.variants.find((v) => v.id === initialVariantId);
          setSelectedVariant(match || data.variants[0]);
        }

        // Increment view count ONCE per page view session
        if (!hasIncrementedRef.current) {
          hasIncrementedRef.current = true;
          bookService.incrementViews(id).catch(() => {});
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
    if (!isAuthenticated) {
      router.push(`/login?redirectTo=/checkout`);
      return;
    }
    addToCart(book, 1, selectedVariant || undefined);
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book, 1, selectedVariant || undefined);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return <BookDetailSkeleton />;
  }

  if (!book) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Sách không tồn tại
        </h2>
        <p style={{ color: 'var(--color-neutral-400)', marginBottom: '24px' }}>
          Tựa sách này có thể đã bị xóa hoặc đường dẫn không đúng.
        </p>
        <Link href="/books">
          <Button>Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  // Display Variant-specific Image or Parent Cover
  const cover =
    selectedVariant?.imageUrl ||
    (book.imageUrls && book.imageUrls.length > 0
      ? book.imageUrls[activeImageIdx]
      : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300');

  const currentPrice = selectedVariant ? selectedVariant.price : book.price;
  const rawOriginal = selectedVariant ? selectedVariant.originalPrice : book.originalPrice;
  const currentOriginalPrice = rawOriginal && rawOriginal > currentPrice ? rawOriginal : 0;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : book.stockQuantity;

  const rating = book.rating !== undefined && book.rating !== null ? Number(book.rating).toFixed(1) : '5.0';
  const reviewsCount = book.reviewsCount ?? 14;
  const viewsVal = book.viewsCount ?? 0;
  const formattedViews = viewsVal >= 1000 ? `${(viewsVal / 1000).toFixed(1)}k` : `${viewsVal}`;

  return (
    <div className={styles.container}>
      {/* Breadcrumbs matching Checkout Page style */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Trang chủ
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/books" className={styles.breadcrumbLink}>
          Cửa hàng
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{getCategoryName(book.categoryId)}</span>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrentTitle}>{book.title}</span>
      </div>

      <div className={styles.topNavRow}>
        <Link href="/books" className={styles.backLink}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Quay lại sản phẩm
        </Link>
      </div>

      <div className={styles.detailsLayout}>
        {/* Left: Image Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.mainCoverWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={book.title} className={styles.mainCover} />
          </div>
          {book.imageUrls && book.imageUrls.length > 1 && (
            <div className={styles.thumbnailsRow}>
              {book.imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumbnailWrapper} ${
                    activeImageIdx === idx ? styles.activeThumbnail : ''
                  }`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${book.title} thumb ${idx}`} className={styles.thumbnailImg} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Section */}
        <div className={styles.infoSection}>
          <span className={styles.categoryTag}>{getCategoryName(book.categoryId)}</span>
          <h1 className={styles.bookTitle}>
            {book.title} {selectedVariant ? `(${selectedVariant.name})` : ''}
          </h1>
          <p className={styles.bookAuthor}>Tác giả: {book.author}</p>

          <div className={styles.ratingRow}>
            <div className={styles.starsGroup}>
              <span className={styles.starIcon}>★</span>
              <span className={styles.ratingValue}>{rating}</span>
              <span className={styles.reviewsText}>({reviewsCount} đánh giá)</span>
            </div>
            <span className={styles.metaDivider}>•</span>
            <div className={styles.viewsGroup}>
              <span className={styles.eyeIcon}>👁️</span>
              <span className={styles.viewsText}>{formattedViews} lượt xem</span>
            </div>
          </div>

          <div className={styles.metaRow}>
            <span className={`${styles.badge} ${styles.badgeVip}`}>✓ Chính hãng</span>
            <span className={`${styles.badge} ${styles.badgeCondition}`}>
              Tình trạng: {getConditionLabel(book.condition)}
            </span>
            {book.isbn && <span className={`${styles.badge} ${styles.badgeIsbn}`}>ISBN: {book.isbn}</span>}
          </div>

          {/* Dynamic Variant Selector Component */}
          {book.variants && book.variants.length > 0 && (
            <VariantSelector
              variants={book.variants}
              selectedVariantId={selectedVariant?.id || null}
              onSelectVariant={(variant) => setSelectedVariant(variant)}
            />
          )}

          <div className={styles.priceCard}>
            <div className={styles.priceHeaderRow}>
              <span className={styles.priceTitle}>GIÁ BÁN HIỆN TẠI</span>
              {currentOriginalPrice > currentPrice && (
                <span className={styles.discountBadge}>
                  -{Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}%
                </span>
              )}
            </div>

            <div className={styles.priceValueRow}>
              <span className={styles.priceAmount}>{formatPrice(currentPrice)}</span>
              {currentOriginalPrice > currentPrice && (
                <span className={styles.originalPriceAmount}>{formatPrice(currentOriginalPrice)}</span>
              )}
            </div>

            <div className={styles.stockBadgeContainer}>
              {currentStock === 0 ? (
                <span className={styles.outOfStockBadge}>🔴 Đã hết hàng</span>
              ) : (
                <span className={styles.inStockBadge}>
                  <span className={styles.stockDot}></span> Còn lại <strong>{currentStock}</strong> cuốn trong kho
                </span>
              )}
            </div>
          </div>

          <div className={styles.actionsRow}>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className={styles.cartButton}
            >
              {added ? 'Đã thêm! ✔' : 'Thêm vào giỏ'}
            </Button>
            <Button
              size="lg"
              onClick={handleBuyNow}
              disabled={currentStock === 0}
              className={styles.buyButton}
            >
              {currentStock === 0 ? 'Đã hết hàng' : 'Mua ngay'}
            </Button>
          </div>

          {/* Publishing Metadata Specifications Table */}
          {(book.publisher || book.supplier || book.publicationYear || book.language || book.format || book.numberOfPages || book.weightGrams || book.dimensions || book.translator) && (
            <div className={styles.specsSection}>
              <h3 className={styles.specsTitle}>
                <span>📊</span> Thông Số Xuất Bản Chi Tiết
              </h3>
              <div className={styles.specsGrid}>
                {book.publisher && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Nhà xuất bản:</span>
                    <strong className={styles.specValue}>{book.publisher}</strong>
                  </div>
                )}
                {book.supplier && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Công ty phát hành:</span>
                    <strong className={styles.specValue}>{book.supplier}</strong>
                  </div>
                )}
                {book.publicationYear && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Năm xuất bản:</span>
                    <strong className={styles.specValue}>{book.publicationYear}</strong>
                  </div>
                )}
                {book.language && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Ngôn ngữ:</span>
                    <strong className={styles.specValue}>{book.language}</strong>
                  </div>
                )}
                {book.format && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Hình thức bìa:</span>
                    <strong className={styles.specValue}>{book.format}</strong>
                  </div>
                )}
                {book.numberOfPages && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Số trang:</span>
                    <strong className={styles.specValue}>{book.numberOfPages} trang</strong>
                  </div>
                )}
                {book.weightGrams && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Trọng lượng:</span>
                    <strong className={styles.specValue}>{book.weightGrams} g</strong>
                  </div>
                )}
                {book.dimensions && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Kích thước:</span>
                    <strong className={styles.specValue}>{book.dimensions}</strong>
                  </div>
                )}
                {book.translator && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Dịch giả:</span>
                    <strong className={styles.specValue}>{book.translator}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description Block */}
          {book.description && (
            <div className={styles.descriptionSection}>
              <h3 className={styles.descriptionTitle}>📖 Thông tin chi tiết & Mô tả sản phẩm</h3>
              <p className={styles.descriptionText}>{book.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookDetailsPage() {
  return (
    <Suspense fallback={<BookDetailSkeleton />}>
      <BookDetailsContent />
    </Suspense>
  );
}
