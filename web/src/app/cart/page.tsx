'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import CheckoutModal from '@/components/features/order/CheckoutModal';
import { getBookUrl } from '@/lib/slug';
import { checkoutNavigationService } from '@/services/checkoutNavigationService';
import { activityTracker } from '@/services/activityTracker';
import { ShoppingCartIcon } from '@/components/ui/LineIcons';
import PreOrderBadge from '@/components/features/books/PreOrderBadge';
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
    activityTracker.trackCheckoutStep('Bắt đầu thanh toán từ Giỏ hàng', {
      totalItems: cartItems.reduce((acc, i) => acc + i.quantity, 0),
      cartTotal,
    });

    if (!isAuthenticated) {
      checkoutNavigationService.navigateToCheckout(router, cartItems, { source: 'cart' });
      router.push('/login?redirectTo=/checkout');
      return;
    }
    // Smooth state navigation without exposing order data on URL bar
    checkoutNavigationService.navigateToCheckout(router, cartItems, { source: 'cart' });
  };

  const handleRemoveItem = (bookId: string, title: string, variantId?: string, price?: number) => {
    removeFromCart(bookId, variantId);
    activityTracker.trackCartAction('REMOVE_FROM_CART', bookId, title, price);
  };

  const handleUpdateQty = (
    bookId: string,
    title: string,
    newQty: number,
    variantId?: string,
    price?: number
  ) => {
    updateQuantity(bookId, newQty, variantId);
    activityTracker.trackCartAction('UPDATE_CART_QTY', bookId, title, price, newQty);
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <ShoppingCartIcon size={56} color="#94a3b8" />
          </div>
          <h2 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
          <p className={styles.emptySubtitle}>
            Hãy chọn những cuốn sách hay và tác phẩm bản quyền thú vị để lấp đầy giỏ hàng nhé!
          </p>
          <Link href="/books">
            <Button size="lg" className={styles.shopBtn}>Tiếp tục mua sắm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Giỏ hàng của bạn</h1>
        <span className={styles.cartBadge}>({cartItems.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm)</span>
      </div>

      <div className={styles.cartLayout}>
        {/* Left: Cart Items List */}
        <div className={styles.itemsSection}>
          {cartItems.map(({ book, quantity, selectedVariant }) => {
            const itemKey = selectedVariant ? `${book.id}_${selectedVariant.id}` : book.id;
            const cover = selectedVariant?.imageUrl || book.imageUrls?.[0] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200';
            const unitPrice = selectedVariant ? selectedVariant.price : book.price;
            const linkHref = getBookUrl(book, selectedVariant?.id);

            return (
              <div key={itemKey} className={styles.cartItemCard}>
                <Link href={linkHref}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt={book.title} className={styles.itemCover} />
                </Link>

                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h3 className={styles.itemTitle} style={{ margin: 0 }}>
                          <Link href={linkHref}>
                            {book.title} {selectedVariant ? `(${selectedVariant.name})` : ''}
                          </Link>
                        </h3>
                        {book.isPreOrder && (
                          <PreOrderBadge isPreOrder={book.isPreOrder} preOrderDays={book.preOrderDays} />
                        )}
                      </div>
                      <p className={styles.itemAuthor}>Tác giả: {book.author}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(book.id, book.title, selectedVariant?.id, unitPrice)}
                      className={styles.removeBtn}
                      title="Xóa khỏi giỏ hàng"
                      aria-label="Xóa sản phẩm"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>

                  <div className={styles.itemMeta}>
                    <span className={styles.sellerName}>Đơn vị: {book.publisher || 'Boki Store'}</span>
                    {selectedVariant ? (
                      <span className={styles.variantBadge}>{selectedVariant.name}</span>
                    ) : (
                      <span className={styles.conditionBadge}>
                        {book.condition === 'NEW' ? 'Chính Hãng' : 'Sách Cũ'}
                      </span>
                    )}
                  </div>

                  <div className={styles.itemFooter}>
                    <div className={styles.qtyContainer}>
                      <button
                        onClick={() => handleUpdateQty(book.id, book.title, quantity - 1, selectedVariant?.id, unitPrice)}
                        className={styles.qtyBtn}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(book.id, book.title, quantity + 1, selectedVariant?.id, unitPrice)}
                        className={styles.qtyBtn}
                        disabled={!book.isPreOrder && quantity >= (selectedVariant ? selectedVariant.stockQuantity : book.stockQuantity)}
                      >
                        +
                      </button>
                    </div>

                    <div className={styles.priceCol}>
                      <span className={styles.unitPrice}>{formatPrice(unitPrice)} / cuốn</span>
                      <span className={styles.itemPrice}>{formatPrice(unitPrice * quantity)}</span>
                    </div>
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

            <Button size="lg" fullWidth onClick={handleCheckoutClick} className={styles.checkoutBtn}>
              Tiến hành thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
