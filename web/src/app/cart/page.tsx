'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import CheckoutModal from '@/components/features/order/CheckoutModal';
import styles from './cart.module.css';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      router.push('/login?redirectTo=/cart');
      return;
    }
    setCheckoutOpen(true);
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
          <p className={styles.emptySubtitle}>
            Hãy khám phá các tác phẩm thú vị và thêm chúng vào giỏ hàng của bạn nhé!
          </p>
          <Link href="/books">
            <Button size="lg">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Giỏ hàng của bạn</h1>
      
      <div className={styles.cartLayout}>
        {/* Left: Cart Items List */}
        <div className={styles.itemsSection}>
          {cartItems.map(({ book, quantity }) => {
            const cover = book.imageUrls && book.imageUrls.length > 0
              ? book.imageUrls[0]
              : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200';
            
            return (
              <div key={book.id} className={styles.cartItemCard}>
                <img src={cover} alt={book.title} className={styles.itemCover} />
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <h3 className={styles.itemTitle}>
                        <Link href={`/books/${book.id}`}>{book.title}</Link>
                      </h3>
                      <p className={styles.itemAuthor}>Tác giả: {book.author}</p>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(book.id)} 
                      className={styles.removeBtn} 
                      aria-label="Xóa sản phẩm"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className={styles.itemMeta}>
                    <span className={styles.sellerName}>Người bán: {book.sellerName}</span>
                    <span className={styles.conditionBadge}>
                      {book.condition === 'NEW' ? 'Mới' : 'Đã qua sử dụng'}
                    </span>
                  </div>
                  
                  <div className={styles.itemFooter}>
                    <div className={styles.qtyContainer}>
                      <button 
                        onClick={() => updateQuantity(book.id, quantity - 1)}
                        className={styles.qtyBtn}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button 
                        onClick={() => updateQuantity(book.id, quantity + 1)}
                        className={styles.qtyBtn}
                        disabled={quantity >= book.stockQuantity}
                      >
                        +
                      </button>
                    </div>
                    
                    <span className={styles.itemPrice}>{formatPrice(book.price * quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Right: Summary sidebar */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
            
            <div className={styles.summaryRow}>
              <span>Tạm tính ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} cuốn)</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển</span>
              <span className={styles.freeBadge}>Miễn phí</span>
            </div>
            
            <div className={styles.totalRow}>
              <span>Tổng số tiền</span>
              <span className={styles.totalValue}>{formatPrice(cartTotal)}</span>
            </div>
            
            <Button size="lg" fullWidth onClick={handleCheckoutClick}>
              Tiến hành thanh toán
            </Button>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onSuccess={clearCart}
      />
    </div>
  );
}
