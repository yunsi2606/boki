'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import Button from '@/components/ui/Button';
import CheckoutModal from '@/components/features/order/CheckoutModal';
import styles from './page.module.css';

// Thể loại helper
const getCategoryName = (id: number | null) => {
  const categoriesList = [
    { id: 1, name: 'Sách Văn học' },
    { id: 2, name: 'Sách Thiếu nhi' },
    { id: 3, name: 'Sách Kinh tế' },
    { id: 4, name: 'Sách Giáo khoa' },
    { id: 5, name: 'Kỹ Năng' },
    { id: 6, name: 'Phát triển bản thân' },
    { id: 7, name: 'Sổ tay các loại' }
  ];
  return categoriesList.find(c => c.id === id)?.name || 'Khác';
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

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const id = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    async function loadBook() {
      try {
        const data = await bookService.getBook(id);
        setBook(data);
      } catch (err) {
        console.error('Failed to load book', err);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirectTo=/books/${id}`);
      return;
    }
    setCheckoutOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin sách...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Sách không tồn tại</h2>
        <p style={{ color: 'var(--color-neutral-400)', marginBottom: '24px' }}>
          Tựa sách này có thể đã bị xóa hoặc đường dẫn không đúng.
        </p>
        <Link href="/books">
          <Button>Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  const cover = book.imageUrls && book.imageUrls.length > 0
    ? book.imageUrls[activeImageIdx]
    : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300';

  const initials = book.sellerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'S';

  return (
    <div className={styles.container}>
      <Link href="/books" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Quay lại cửa hàng
      </Link>

      <div className={styles.detailsLayout}>
        {/* Left: Image Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.mainCoverWrapper}>
            <img src={cover} alt={book.title} className={styles.mainCover} />
          </div>
          {book.imageUrls && book.imageUrls.length > 1 && (
            <div className={styles.thumbnailsRow}>
              {book.imageUrls.map((url, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.thumbnailWrapper} ${activeImageIdx === idx ? styles.activeThumbnail : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <img src={url} alt={`${book.title} thumb ${idx}`} className={styles.thumbnailImg} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Section */}
        <div className={styles.infoSection}>
          <span className={styles.categoryTag}>{getCategoryName(book.categoryId)}</span>
          <h1 className={styles.bookTitle}>{book.title}</h1>
          <p className={styles.bookAuthor}>Tác giả: {book.author}</p>

          <div className={styles.metaRow}>
            <span className={`${styles.badge} ${styles.badgeVip}`}>Chính hãng</span>
            <span className={`${styles.badge} ${styles.badgeCondition}`}>
              Tình trạng: {getConditionLabel(book.condition)}
            </span>
            {book.isbn && <span className={styles.badge}>ISBN: {book.isbn}</span>}
          </div>

          <div className={styles.priceCard}>
            <span className={styles.priceTitle}>Giá bán hiện tại</span>
            <span className={styles.priceAmount}>{formatPrice(book.price)}</span>
            
            {book.stockQuantity === 0 ? (
              <span className={`${styles.stockInfo} ${styles.outOfStock}`}>Đã hết hàng</span>
            ) : (
              <span className={styles.stockInfo}>Còn lại {book.stockQuantity} cuốn trong kho</span>
            )}
          </div>

          {/* Seller Metadata Box */}
          <div className={styles.sellerCard}>
            <div className={styles.sellerAvatar}>{initials}</div>
            <div className={styles.sellerInfo}>
              <span className={styles.sellerLabel}>Người đăng bán</span>
              <span className={styles.sellerName}>{book.sellerName}</span>
            </div>
          </div>

          <Button 
            size="lg" 
            fullWidth 
            onClick={handleBuyNow} 
            disabled={book.stockQuantity === 0}
          >
            {book.stockQuantity === 0 ? 'Đã hết hàng' : 'Mua ngay'}
          </Button>

          {/* Description Block */}
          {book.description && (
            <div className={styles.descriptionSection}>
              <h3 className={styles.descriptionTitle}>Thông tin chi tiết</h3>
              <p className={styles.descriptionText}>{book.description}</p>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        book={book}
      />
    </div>
  );
}
