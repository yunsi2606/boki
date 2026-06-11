'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types';
import Button from '@/components/ui/Button';
import styles from './history.module.css';

const getStatusClassAndText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { className: styles.statusPending, text: 'Chờ xác nhận' };
    case 'CONFIRMED':
      return { className: styles.statusConfirmed, text: 'Đã xác nhận' };
    case 'SHIPPED':
      return { className: styles.statusShipped, text: 'Đang vận chuyển' };
    case 'DELIVERED':
      return { className: styles.statusDelivered, text: 'Đã giao hàng' };
    case 'CANCELLED':
      return { className: styles.statusCancelled, text: 'Đã hủy đơn' };
    default:
      return { className: '', text: status };
  }
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate user check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/orders/history');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadOrders() {
      try {
        const data = await orderService.getBuyerOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [isAuthenticated]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang kiểm tra tài khoản...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>Lịch sử mua hàng</h1>
        <p className={styles.pageSubtitle}>
          Theo dõi các đơn hàng và trạng thái vận chuyển của bạn.
        </p>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải lịch sử mua hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyContainer}>
          <svg className={styles.emptyIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 12H8"></path>
            <path d="M12 8v8"></path>
          </svg>
          <h3 className={styles.emptyTitle}>Bạn chưa mua đơn hàng nào</h3>
          <p>Khám phá sách và tạo đơn hàng đầu tiên của bạn ngay hôm nay!</p>
          <Button onClick={() => router.push('/books')} style={{ marginTop: '16px' }}>
            Đi mua sắm
          </Button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => {
            const statusInfo = getStatusClassAndText(order.status);
            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Order Header */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderIdInfo}>
                    <span className={styles.orderId}>Mã đơn hàng: #{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={styles.orderDate}>Ngày đặt: {formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`${styles.statusTag} ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* Items List */}
                <div className={styles.itemsList}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <img src={item.bookCover} alt={item.bookTitle} className={styles.itemCover} />
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemTitle}>{item.bookTitle}</h4>
                        <span className={styles.itemMeta}>
                          Số lượng: {item.quantity} x {formatPrice(item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className={styles.orderFooter}>
                  <div className={styles.shippingDetails}>
                    <span className={styles.shippingLabel}>Địa chỉ giao hàng</span>
                    <span className={styles.shippingAddress}>{order.shippingAddress}</span>
                  </div>
                  <div className={styles.totalSummary}>
                    <span className={styles.totalLabel}>Tổng tiền</span>
                    <span className={styles.totalAmount}>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
