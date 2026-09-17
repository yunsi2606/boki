'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService, type AdminOrder } from '@/services/adminService';
import styles from './adminOrders.module.css';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ShippingModal } from '@/components/features/admin/orders/ShippingModal';
import { OrderDetailModal } from '@/components/features/admin/orders/OrderDetailModal';
import { CancelOrderModal } from '@/components/features/admin/orders/CancelOrderModal';
import { WaybillPrintModal } from '@/components/features/admin/orders/WaybillPrintModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals state
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [shippingOrder, setShippingOrder] = useState<AdminOrder | null>(null);
  const [cancelOrder, setCancelOrder] = useState<AdminOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<AdminOrder | null>(null);

  // Notification banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrders();
      setOrders(data);
    } catch (err: unknown) {
      console.error('Failed to load orders', err);
      showNotice('error', 'Không thể tải danh sách đơn hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Contextual Action: Duyệt đơn (PENDING -> CONFIRMED)
  const handleConfirmOrder = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      const updated = await adminService.updateOrderStatus(orderId, 'CONFIRMED');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      showNotice('success', `Đã duyệt xác nhận đơn #${orderId.slice(0, 8)} thành công!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Duyệt đơn thất bại';
      showNotice('error', errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Contextual Action: Hoàn thành giao (SHIPPED -> DELIVERED)
  const handleDeliverOrder = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      const updated = await adminService.updateOrderStatus(orderId, 'DELIVERED');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      showNotice('success', `Đã đánh dấu giao thành công đơn #${orderId.slice(0, 8)}!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại';
      showNotice('error', errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Contextual Action: Báo hoàn hàng (SHIPPED -> RETURNED)
  const handleReturnOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn đánh dấu đơn hàng này là HOÀN HÀNG / GIAO THẤT BẠI không?')) {
      return;
    }
    try {
      setActionLoadingId(orderId);
      const updated = await adminService.updateOrderStatus(orderId, 'RETURNED');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      showNotice('success', `Đã cập nhật trạng thái Hoàn hàng cho đơn #${orderId.slice(0, 8)}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      showNotice('error', errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Callback when order is pushed to carrier successfully
  const handleShippingSuccess = (updatedOrder: AdminOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)));
    showNotice('success', `Đã đẩy đơn #${updatedOrder.id.slice(0, 8)} sang ${updatedOrder.carrierName} (Mã VĐ: ${updatedOrder.trackingNumber})!`);
  };

  // Callback when order is cancelled successfully
  const handleCancelSuccess = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED', cancelReason: reason } : o))
    );
    showNotice('success', `Đã hủy đơn hàng #${orderId.slice(0, 8)} và hoàn tồn kho thành công.`);
  };

  // Filter & Search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Tab filter
      if (activeTab !== 'ALL' && o.status !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = o.id.toLowerCase().includes(query);
        const matchName = (o.customerName || '').toLowerCase().includes(query);
        const matchPhone = (o.customerPhone || '').toLowerCase().includes(query);
        const matchTracking = (o.trackingNumber || '').toLowerCase().includes(query);
        const matchCarrier = (o.carrierName || '').toLowerCase().includes(query);
        if (!matchId && !matchName && !matchPhone && !matchTracking && !matchCarrier) {
          return false;
        }
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === 'PENDING').length,
      CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      RETURNED: orders.filter((o) => o.status === 'RETURNED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [orders]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'CONFIRMED':
        return 'Đã duyệt';
      case 'SHIPPED':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Đã giao';
      case 'RETURNED':
        return 'Hoàn hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {notice && (
        <div
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            backgroundColor: notice.type === 'success' ? '#ECFDF5' : '#FFF1F2',
            color: notice.type === 'success' ? '#047857' : '#BE123C',
            border: `1px solid ${notice.type === 'success' ? '#A7F3D0' : '#FECDD3'}`,
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{notice.type === 'success' ? '✅' : '⚠️'} {notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản Lý & Đẩy Đơn Vận Chuyển</h1>
          <p className={styles.pageSubtitle}>
            Theo dõi trạng thái đơn hàng, kết nối đơn vị vận chuyển (GHN, GHTK, Viettel Post) và in vận đơn
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <span style={{ fontSize: '16px', opacity: 0.7 }}>🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn, khách hàng, số điện thoại, mã vận đơn, hãng vận chuyển..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.statusTabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          Tất cả ({counts.ALL})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'PENDING' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Chờ xác nhận ({counts.PENDING})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'CONFIRMED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('CONFIRMED')}
        >
          Đã xác nhận ({counts.CONFIRMED})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'SHIPPED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('SHIPPED')}
        >
          Đang giao ({counts.SHIPPED})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'DELIVERED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('DELIVERED')}
        >
          Đã giao ({counts.DELIVERED})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'RETURNED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('RETURNED')}
        >
          Hoàn hàng ({counts.RETURNED})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'CANCELLED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('CANCELLED')}
        >
          Đã hủy ({counts.CANCELLED})
        </button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Thời gian</th>
                <th>Khách hàng</th>
                <th>Vận chuyển & Mã VĐ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px', color: '#64748B' }}>
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isActionLoading = actionLoadingId === ord.id;
                  return (
                    <tr key={ord.id}>
                      <td>
                        <button
                          onClick={() => setDetailOrder(ord)}
                          className={styles.orderId}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                          title="Xem chi tiết đơn"
                        >
                          #{ord.id.slice(0, 8).toUpperCase()}
                        </button>
                      </td>
                      <td className={styles.dateCell}>{formatDate(ord.createdAt)}</td>
                      <td>
                        <div className={styles.customerBox}>
                          <span className={styles.customerName}>{ord.customerName || 'Khách vãng lai'}</span>
                          <span className={styles.customerPhone}>{ord.customerPhone || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.carrierCell}>
                          {ord.carrierName ? (
                            <>
                              <span className={styles.carrierBadge}>
                                🚚 {ord.carrierName}
                              </span>
                              {ord.trackingNumber && (
                                <span className={styles.trackingCode}>
                                  {ord.trackingNumber}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className={styles.noCarrier}>Chưa gửi ĐVVC</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.priceCell}>
                        <div>{formatCurrency(ord.totalAmount)}</div>
                        <div style={{ marginTop: '3px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              background: ord.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                              color: ord.paymentStatus === 'PAID' ? '#166534' : '#b45309',
                              border: `1px solid ${ord.paymentStatus === 'PAID' ? '#bbf7d0' : '#fde68a'}`,
                            }}
                          >
                            {ord.paymentMethod === 'BANKING' ? '🏦 VietQR' : ord.paymentMethod === 'MOMO' ? '🟣 MoMo' : ord.paymentMethod === 'VNPAY' ? '🔴 VNPay' : '💵 COD'}
                            {' '}{ord.paymentStatus === 'PAID' ? '✓' : '•'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status_${ord.status}`]}`}>
                          {getStatusLabel(ord.status)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          {/* PENDING: Duyệt đơn hoặc Hủy */}
                          {ord.status === 'PENDING' && (
                            <>
                              <button
                                className={`${styles.btnAction} ${styles.btnPrimaryAction}`}
                                onClick={() => handleConfirmOrder(ord.id)}
                                disabled={isActionLoading}
                                title="Xác nhận đơn hàng"
                              >
                                {isActionLoading ? '...' : '✓ Duyệt'}
                              </button>
                              <button
                                className={`${styles.btnAction} ${styles.btnCancelAction}`}
                                onClick={() => setCancelOrder(ord)}
                                disabled={isActionLoading}
                                title="Hủy đơn hàng"
                              >
                                Hủy
                              </button>
                            </>
                          )}

                          {/* CONFIRMED: Đẩy ĐVVC hoặc Hủy */}
                          {ord.status === 'CONFIRMED' && (
                            <>
                              <button
                                className={`${styles.btnAction} ${styles.btnShippingAction}`}
                                onClick={() => setShippingOrder(ord)}
                                disabled={isActionLoading}
                                title="Đẩy đơn sang ĐVVC"
                              >
                                🚚 Đẩy ĐVVC
                              </button>
                              <button
                                className={`${styles.btnAction} ${styles.btnCancelAction}`}
                                onClick={() => setCancelOrder(ord)}
                                disabled={isActionLoading}
                                title="Hủy đơn hàng"
                              >
                                Hủy
                              </button>
                            </>
                          )}

                          {/* SHIPPED: Đã giao, Hoàn hàng, In vận đơn */}
                          {ord.status === 'SHIPPED' && (
                            <>
                              <button
                                className={`${styles.btnAction} ${styles.btnSuccessAction}`}
                                onClick={() => handleDeliverOrder(ord.id)}
                                disabled={isActionLoading}
                                title="Xác nhận khách đã nhận hàng"
                              >
                                {isActionLoading ? '...' : '✓ Đã giao'}
                              </button>
                              <button
                                className={`${styles.btnAction} ${styles.btnReturnAction}`}
                                onClick={() => handleReturnOrder(ord.id)}
                                disabled={isActionLoading}
                                title="Giao thất bại / Hoàn hàng"
                              >
                                Hoàn
                              </button>
                              <button
                                className={`${styles.btnAction} ${styles.btnPrintAction}`}
                                onClick={() => setPrintOrder(ord)}
                                disabled={isActionLoading}
                                title="In phiếu giao hàng A5/A6"
                              >
                                🖨 In
                              </button>
                            </>
                          )}

                          {/* DELIVERED: In vận đơn */}
                          {ord.status === 'DELIVERED' && (
                            <button
                              className={`${styles.btnAction} ${styles.btnPrintAction}`}
                              onClick={() => setPrintOrder(ord)}
                              disabled={isActionLoading}
                              title="In phiếu giao hàng"
                            >
                              🖨 In
                            </button>
                          )}

                          {/* View Detail button for all orders */}
                          <button
                            className={`${styles.btnAction} ${styles.btnDetailAction}`}
                            onClick={() => setDetailOrder(ord)}
                            title="Xem chi tiết & Timeline"
                          >
                            👁
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          isOpen={!!detailOrder}
          onClose={() => setDetailOrder(null)}
          onOpenShipping={(order) => {
            setDetailOrder(null);
            setShippingOrder(order);
          }}
          onOpenPrint={(order) => {
            setDetailOrder(null);
            setPrintOrder(order);
          }}
          onOpenCancel={(order) => {
            setDetailOrder(null);
            setCancelOrder(order);
          }}
          onUpdateStatus={async (orderId, status, reason) => {
            if (status === 'CANCELLED') {
              await adminService.cancelOrder(orderId, reason || 'Admin thao tác hủy đơn');
              handleCancelSuccess(orderId, reason || 'Admin thao tác hủy đơn');
            } else {
              const updated = await adminService.updateOrderStatus(orderId, status);
              setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
              setDetailOrder((prev) => (prev && prev.id === orderId ? { ...prev, ...updated } : null));
            }
          }}
          onUpdateOrder={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
            setDetailOrder(updated);
          }}
        />
      )}

      {shippingOrder && (
        <ShippingModal
          order={shippingOrder}
          isOpen={!!shippingOrder}
          onClose={() => setShippingOrder(null)}
          onConfirm={async (payload) => {
            const updated = await adminService.pushOrderToCarrier(shippingOrder.id, payload);
            handleShippingSuccess(updated);
          }}
        />
      )}

      {cancelOrder && (
        <CancelOrderModal
          order={cancelOrder}
          isOpen={!!cancelOrder}
          onClose={() => setCancelOrder(null)}
          onConfirmCancel={async (orderId, reason) => {
            if (cancelOrder.carrierName) {
              await adminService.cancelCarrierOrder(orderId, reason);
            } else {
              await adminService.cancelOrder(orderId, reason);
            }
            handleCancelSuccess(orderId, reason);
          }}
        />
      )}

      {printOrder && (
        <WaybillPrintModal
          order={printOrder}
          isOpen={!!printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}
