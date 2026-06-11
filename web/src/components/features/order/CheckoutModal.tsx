'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import type { Book, ApiError } from '@/types';
import Button from '@/components/ui/Button';
import styles from './CheckoutModal.module.css';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export default function CheckoutModal({ isOpen, onClose, book }: CheckoutModalProps) {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !book) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await orderService.createOrder({
        shippingAddress: shippingAddress.trim(),
        items: [
          {
            bookId: book.id,
            quantity: 1
          }
        ]
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/orders/history');
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const cover = book.imageUrls && book.imageUrls.length > 0
    ? book.imageUrls[0]
    : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Xác nhận mua sách</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {success ? (
          <div className={styles.body} style={{ textAlign: 'center', padding: '48px 24px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00C272" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Đặt hàng thành công!</h3>
            <p style={{ color: 'var(--color-neutral-400)', fontSize: '14px' }}>Đang chuyển hướng sang trang lịch sử đơn hàng của bạn...</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout}>
            <div className={styles.body}>
              {/* Product summary */}
              <div className={styles.summaryCard}>
                <img src={cover} alt={book.title} className={styles.bookCover} />
                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookAuthor}>{book.author}</p>
                  <span className={styles.bookPrice}>{formatPrice(book.price)}</span>
                </div>
              </div>

              {/* Shipping input */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Địa chỉ giao hàng</label>
                <textarea
                  placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)..."
                  className={styles.textarea}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {error && <div className={styles.errorBlock}>{error}</div>}

              {/* Order total */}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng số tiền thanh toán</span>
                <span className={styles.totalAmount}>{formatPrice(book.price)}</span>
              </div>
            </div>

            <div className={styles.footer}>
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
