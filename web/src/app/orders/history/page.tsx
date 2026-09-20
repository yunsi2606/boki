'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import SePayQrModal from '@/components/features/checkout/SePayQrModal';
import type { Order, PaymentInitResponse } from '@/types';
import { TruckIcon, MapPinIcon } from '@/components/ui/LineIcons';
import styles from './history.module.css';
import { OrderListSkeleton } from '@/components/ui/Skeleton';

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
    case 'RETURNED':
      return { className: styles.statusReturned, text: 'Hoàn hàng' };
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
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [expandedTimelines, setExpandedTimelines] = useState<Record<string, boolean>>({});

  // QR Modal State for paying unpaid banking orders
  const [sepayData, setSepayData] = useState<PaymentInitResponse | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getBuyerOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  }, []);

  const toggleTimeline = (orderId: string) => {
    setExpandedTimelines((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

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
        setLoading(true);
        await fetchOrders();
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [isAuthenticated, fetchOrders]);

  const handlePayNow = async (order: Order) => {
    try {
      setPayingOrderId(order.id);
      const method = (order.paymentMethod as any) || 'BANKING';
      const res = await paymentService.initiatePayment({
        orderId: order.id,
        paymentMethod: method,
      });

      if (method === 'BANKING') {
        setSepayData(res);
      } else if (res.payUrl) {
        window.location.href = res.payUrl;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khởi tạo thanh toán thất bại';
      alert(msg);
    } finally {
      setPayingOrderId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    return order.status === activeTab;
  });

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
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Trang chủ
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>Đơn hàng của tôi</span>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>Lịch sử mua hàng</h1>
        <p className={styles.pageSubtitle}>
          Theo dõi thông tin chi tiết, mã vận đơn và hành trình giao hàng của bạn tại Boki.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterBtn} ${activeTab === 'ALL' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          Tất cả ({orders.length})
        </button>
        <button
          className={`${styles.filterBtn} ${activeTab === 'PENDING' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Chờ xác nhận ({orders.filter((o) => o.status === 'PENDING').length})
        </button>
        <button
          className={`${styles.filterBtn} ${activeTab === 'CONFIRMED' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveTab('CONFIRMED')}
        >
          Đã xác nhận ({orders.filter((o) => o.status === 'CONFIRMED').length})
        </button>
        <button
          className={`${styles.filterBtn} ${activeTab === 'SHIPPED' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveTab('SHIPPED')}
        >
          Đang vận chuyển ({orders.filter((o) => o.status === 'SHIPPED').length})
        </button>
        <button
          className={`${styles.filterBtn} ${activeTab === 'DELIVERED' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveTab('DELIVERED')}
        >
          Đã giao hàng ({orders.filter((o) => o.status === 'DELIVERED').length})
        </button>
        <button
          className={`${styles.filterBtn} ${activeTab === 'RETURNED' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveTab('RETURNED')}
        >
          Hoàn hàng ({orders.filter((o) => o.status === 'RETURNED').length})
        </button>
        <button
          className={`${styles.filterBtn} ${activeTab === 'CANCELLED' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveTab('CANCELLED')}
        >
          Đã hủy ({orders.filter((o) => o.status === 'CANCELLED').length})
        </button>
      </div>

      {loading ? (
        <OrderListSkeleton count={3} />
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyContainer}>
          <svg className={styles.emptyIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 12H8"></path>
            <path d="M12 8v8"></path>
          </svg>
          <h3 className={styles.emptyTitle}>Chưa có đơn hàng nào</h3>
          <p>Khám phá kho sách phong phú và đặt mua tựa sách yêu thích ngay hôm nay!</p>
          <button className={styles.shopBtn} onClick={() => router.push('/books')}>
            🛒 Khám phá cửa hàng
          </button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => {
            const statusInfo = getStatusClassAndText(order.status);
            const isTimelineOpen = !!expandedTimelines[order.id];

            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Order Header */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderIdInfo}>
                    <span className={styles.orderId}>Mã đơn hàng: #{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={styles.orderDate}>Ngày đặt: {formatDate(order.createdAt)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Payment method badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
                      {order.paymentMethod === 'BANKING' && (
                        <>
                          <Image src="/wallets/sepay.png" alt="SePay" width={16} height={16} style={{ objectFit: 'contain' }} />
                          <span>VietQR (SePay)</span>
                        </>
                      )}
                      {order.paymentMethod === 'MOMO' && (
                        <>
                          <Image src="/wallets/momo.png" alt="MoMo" width={16} height={16} style={{ objectFit: 'contain' }} />
                          <span>Ví MoMo</span>
                        </>
                      )}
                      {order.paymentMethod === 'VNPAY' && (
                        <>
                          <Image src="/wallets/vnpay.png" alt="VNPay" width={16} height={16} style={{ objectFit: 'contain' }} />
                          <span>VNPay</span>
                        </>
                      )}
                      {(!order.paymentMethod || order.paymentMethod === 'COD') && (
                        <>
                          <span style={{ fontSize: '1rem' }}>💵</span>
                          <span>COD</span>
                        </>
                      )}
                    </div>

                    {/* Payment status badge */}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                        color: order.paymentStatus === 'PAID' ? '#166534' : '#b45309',
                        border: `1px solid ${order.paymentStatus === 'PAID' ? '#bbf7d0' : '#fde68a'}`,
                      }}
                    >
                      {order.paymentStatus === 'PAID' ? '● ĐÃ THANH TOÁN' : '○ CHƯA THANH TOÁN'}
                    </span>

                    {/* Order Fulfillment Status */}
                    <span className={`${styles.statusTag} ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Cancel Reason banner if cancelled */}
                {order.status === 'CANCELLED' && order.cancelReason && (
                  <div className={styles.cancelReasonAlert}>
                    <strong>Lý do hủy đơn:</strong> {order.cancelReason}
                  </div>
                )}

                {/* Carrier & Tracking details if shipped */}
                {order.carrierName && (
                  <div className={styles.carrierSection}>
                    <div className={styles.carrierDetails}>
                      <span className={styles.carrierBadge}>
                        <TruckIcon size={15} color="#0284c7" />
                        <span>{order.carrierName}</span>
                      </span>
                      {order.trackingNumber && (
                        <span>
                          Mã vận đơn: <span className={styles.trackingCode}>{order.trackingNumber}</span>
                        </span>
                      )}
                    </div>
                    {order.timelines && order.timelines.length > 0 && (
                      <button
                        className={styles.timelineToggleBtn}
                        onClick={() => toggleTimeline(order.id)}
                      >
                        {isTimelineOpen ? '▲ Thu gọn hành trình' : '▼ Xem hành trình vận chuyển'}
                      </button>
                    )}
                  </div>
                )}

                {/* Customer Timeline Details (Sorted Newest to Oldest) */}
                {isTimelineOpen && order.timelines && order.timelines.length > 0 && (
                  <div className={styles.customerTimeline}>
                    <h5 className={styles.timelineHeading}>
                      <MapPinIcon size={16} color="#EE4D2D" />
                      <span>Lịch sử tiến trình đơn hàng</span>
                    </h5>
                    <div className={styles.timelineList}>
                      {[...order.timelines]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )
                        .map((t, idx) => {
                          const isLatest = idx === 0;
                          return (
                            <div
                              key={t.id}
                              className={`${styles.timelineItem} ${
                                isLatest ? styles.timelineItemLatest : ''
                              }`}
                            >
                              <div className={styles.timelineItemHeader}>
                                <span
                                  className={`${styles.timelineEventTitle} ${
                                    isLatest ? styles.timelineEventTitleLatest : ''
                                  }`}
                                >
                                  {t.title}
                                </span>
                                {isLatest && (
                                  <span className={styles.latestBadge}>Mới nhất</span>
                                )}
                                <span className={styles.timelineTime}>
                                  {formatDate(t.createdAt)}
                                </span>
                              </div>
                              {t.description && (
                                <p className={styles.timelineDesc}>{t.description}</p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className={styles.itemsList}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.bookCover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200'}
                        alt={item.bookTitle}
                        className={styles.itemCover}
                      />
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
                    <span className={styles.shippingLabel}>Địa chỉ giao nhận & Thông tin</span>
                    <span className={styles.shippingAddress}>{order.shippingAddress}</span>
                    {order.paymentCode && (
                      <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Mã thanh toán: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{order.paymentCode}</strong>
                      </span>
                    )}
                  </div>
                  <div className={styles.totalSummary}>
                    <span className={styles.totalLabel}>Tổng thanh toán</span>
                    <span className={styles.totalAmount}>{formatPrice(order.totalAmount)}</span>
                    {order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED' && order.paymentMethod && order.paymentMethod !== 'COD' && (
                      <button
                        type="button"
                        onClick={() => handlePayNow(order)}
                        disabled={payingOrderId === order.id}
                        style={{
                          marginTop: '8px',
                          background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {payingOrderId === order.id ? 'Đang xử lý...' : '⚡ Thanh toán ngay'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SePay VietQR Modal for paying unpaid banking orders */}
      {sepayData && (
        <SePayQrModal
          paymentData={sepayData}
          onClose={() => setSepayData(null)}
          onSuccess={() => {
            setSepayData(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
