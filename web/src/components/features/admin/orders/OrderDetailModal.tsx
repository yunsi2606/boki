'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { AdminOrder } from '@/services/adminService';
import { adminService } from '@/services/adminService';
import { paymentService } from '@/services/paymentService';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import styles from './OrderDetailModal.module.css';

interface OrderDetailModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenShipping: (order: AdminOrder) => void;
  onOpenCancel: (order: AdminOrder) => void;
  onOpenPrint: (order: AdminOrder) => void;
  onUpdateStatus: (orderId: string, status: AdminOrder['status'], reason?: string) => Promise<void>;
  onUpdateOrder?: (updated: AdminOrder) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onOpenShipping,
  onOpenCancel,
  onOpenPrint,
  onUpdateStatus,
  onUpdateOrder,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép: ${text}`);
  };

  const handleConfirmOrder = async () => {
    if (confirm('Xác nhận duyệt đơn hàng này?')) {
      await onUpdateStatus(order.id, 'CONFIRMED');
    }
  };

  const handleDeliverOrder = async () => {
    if (confirm('Xác nhận đơn hàng đã được giao thành công tới khách hàng?')) {
      await onUpdateStatus(order.id, 'DELIVERED');
    }
  };

  const [updatingCod, setUpdatingCod] = useState(false);
  const [updatingInfo, setUpdatingInfo] = useState(false);

  const handleUpdateCod = async () => {
    const currentAmount = order.totalAmount;
    const input = prompt(`Nhập số tiền thu hộ (COD) mới cho đơn hàng (Hiện tại: ${formatCurrency(currentAmount)}):`, currentAmount.toString());
    if (input !== null && input.trim()) {
      const newCod = Number(input.trim());
      if (isNaN(newCod) || newCod < 0) {
        alert('Số tiền COD không hợp lệ!');
        return;
      }
      try {
        setUpdatingCod(true);
        const updated = await adminService.updateOrderCod(order.id, newCod);
        alert(`Đã cập nhật tiền COD thành công trên hệ thống và ĐVVC: ${formatCurrency(newCod)}`);
        if (onUpdateOrder) onUpdateOrder(updated);
      } catch (err: any) {
        alert(err?.message || 'Cập nhật COD thất bại');
      } finally {
        setUpdatingCod(false);
      }
    }
  };

  const handleUpdateShippingInfo = async () => {
    const newAddress = prompt('Nhập địa chỉ giao hàng mới:', order.shippingAddress);
    if (newAddress !== null && newAddress.trim()) {
      const newNotes = prompt('Nhập ghi chú giao hàng mới (để trống nếu giữ nguyên):') || undefined;
      try {
        setUpdatingInfo(true);
        const updated = await adminService.updateOrderShippingInfo(order.id, {
          toAddress: newAddress.trim(),
          notes: newNotes,
        });
        alert('Đã cập nhật thông tin giao hàng thành công trên hệ thống và ĐVVC!');
        if (onUpdateOrder) onUpdateOrder(updated);
      } catch (err: any) {
        alert(err?.message || 'Cập nhật thông tin giao hàng thất bại');
      } finally {
        setUpdatingInfo(false);
      }
    }
  };

  const [markingPaid, setMarkingPaid] = useState(false);
  const handleMarkPaid = async () => {
    if (confirm('Xác nhận đã nhận được tiền thanh toán cho đơn hàng này?')) {
      try {
        setMarkingPaid(true);
        const updated = await paymentService.markOrderPaid(order.id, 'Admin xác nhận thanh toán thủ công');
        alert('Đã cập nhật trạng thái thanh toán thành công: ĐÃ THANH TOÁN (PAID)!');
        if (onUpdateOrder) onUpdateOrder(updated as AdminOrder);
      } catch (err: any) {
        alert(err?.message || 'Xác nhận thanh toán thất bại');
      } finally {
        setMarkingPaid(false);
      }
    }
  };

  const handleReturnOrder = async () => {
    const reason = prompt('Nhập lý do giao thất bại / khách yêu cầu chuyển hoàn về kho:');
    if (reason && reason.trim()) {
      try {
        const updated = await adminService.returnCarrierOrder(order.id, reason.trim());
        alert('Đã gửi yêu cầu buộc hoàn hàng sang GHN và cập nhật trạng thái đơn thành công!');
        if (onUpdateOrder) onUpdateOrder(updated);
      } catch (err: any) {
        alert(err?.message || 'Yêu cầu hoàn hàng thất bại');
      }
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.orderId}>Đơn Hàng #{order.id.slice(0, 8).toUpperCase()}</span>
            <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
              {order.status === 'PENDING' && 'Chờ xác nhận'}
              {order.status === 'CONFIRMED' && 'Đã xác nhận'}
              {order.status === 'SHIPPED' && 'Đang vận chuyển'}
              {order.status === 'DELIVERED' && 'Đã giao hàng'}
              {order.status === 'CANCELLED' && 'Đã hủy'}
              {order.status === 'RETURNED' && 'Hoàn hàng / Thất bại'}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* AI Risk Assessment Card */}
          <RiskAssessmentCard
            order={order}
            onOrderUpdated={onUpdateOrder}
            onRequestCancel={() => onOpenCancel(order)}
          />

          {/* Two-Column Info Cards */}
          <div className={styles.gridTwoCols}>
            {/* Customer Details */}
            <div className={styles.infoCard}>
              <div className={styles.cardTitle}>
                <span>Thông Tin Khách Hàng</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Họ và tên:</span>
                <span className={styles.infoValue}>{order.customerName || 'Khách hàng Boki'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Số điện thoại:</span>
                <span className={styles.infoValue}>{order.customerPhone || '---'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Địa chỉ giao hàng:</span>
                <span className={styles.infoValue}>{order.shippingAddress}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Ngày đặt:</span>
                <span className={styles.infoValue}>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {/* Shipping & Carrier Info */}
            <div className={styles.infoCard}>
              <div className={styles.cardTitle}>
                <span>Vận Chuyển & Giao Nhận</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Đơn vị vận chuyển:</span>
                <span className={styles.infoValue}>{order.carrierName || 'Chưa bàn giao ĐVVC'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Mã vận đơn (AWB):</span>
                <div className={styles.infoValue}>
                  {order.trackingNumber ? (
                    <span className={styles.trackingHighlight}>
                      {order.trackingNumber}
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(order.trackingNumber!)}
                        title="Sao chép mã"
                      >
                        📋
                      </button>
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Chưa có mã</span>
                  )}
                </div>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Cước vận chuyển:</span>
                <span className={styles.infoValue}>{formatCurrency(order.shippingFee || 0)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Dự kiến giao:</span>
                <span className={styles.infoValue}>
                  {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : '---'}
                </span>
              </div>

              {/* Carrier Actions Bar */}
              {order.trackingNumber && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(() => {
                    const name = (order.carrierName || '').toLowerCase();
                    const tracking = order.trackingNumber;
                    let trackUrl: string | null = null;
                    if (name.includes('spx')) trackUrl = `https://spx.vn/track?bill_no=${tracking}`;
                    else if (name.includes('ghn') || name.includes('giao hàng nhanh') || name.includes('giao hang nhanh')) trackUrl = `https://tracking.ghn.vn/?order_code=${tracking}`;
                    else if (name.includes('j&t') || name.includes('jnt')) trackUrl = `https://jtexpress.vn/vi/tracking?billcode=${tracking}`;
                    else if (name.includes('viettel')) trackUrl = `https://viettelpost.vn/tra-cuu-hanh-trinh-don/?billcode=${tracking}`;
                    else if (name.includes('ghtk') || name.includes('tiết kiệm')) trackUrl = `https://i.ghtk.vn/${tracking}`;
                    else if (name.includes('vnpost') || name.includes('bưu điện')) trackUrl = `http://www.vnpost.vn/vi-vn/dinh-vi/buu-pham?key=${tracking}`;

                    return (
                      <>
                        {trackUrl && (
                          <a
                            href={trackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: '#f8fafc',
                              color: '#0f172a',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Mở website của ĐVVC để tra cứu lộ trình bưu kiện trực tiếp"
                          >
                            Tra cứu {order.carrierName} ↗
                          </a>
                        )}
                        {(name.includes('ghn') || name.includes('giao hàng nhanh') || name.includes('giao hang nhanh')) && (
                          <>
                            <button
                              type="button"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer' }}
                              onClick={handleUpdateCod}
                              disabled={updatingCod}
                              title="Cập nhật số tiền COD trực tiếp trên cổng GHN"
                            >
                              Sửa COD
                            </button>
                            <button
                              type="button"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                              onClick={handleUpdateShippingInfo}
                              disabled={updatingInfo}
                              title="Cập nhật địa chỉ và ghi chú giao hàng trên cổng GHN"
                            >
                              Sửa địa chỉ
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={() => onOpenPrint(order)}
                          title="In phiếu vận đơn giao hàng"
                        >
                          In vận đơn
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Payment Details Card */}
            <div className={styles.infoCard} style={{ gridColumn: 'span 2' }}>
              <div className={styles.cardTitle} style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Phương Thức & Tình Trạng Thanh Toán</span>
                </div>
                {order.paymentStatus !== 'PAID' && (
                  <button
                    type="button"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                    onClick={handleMarkPaid}
                    disabled={markingPaid}
                  >
                    {markingPaid ? 'Đang cập nhật...' : '✓ Xác nhận đã nhận tiền (Thủ công)'}
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div className={styles.infoRow} style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <span className={styles.infoLabel}>Hình thức thanh toán:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                    {order.paymentMethod === 'BANKING' && (
                      <>
                        <Image src="/wallets/sepay.png" alt="SePay" width={22} height={22} style={{ objectFit: 'contain', borderRadius: '4px' }} />
                        <span>Chuyển khoản SePay (VietQR)</span>
                      </>
                    )}
                    {order.paymentMethod === 'MOMO' && (
                      <>
                        <Image src="/wallets/momo.png" alt="MoMo" width={22} height={22} style={{ objectFit: 'contain', borderRadius: '4px' }} />
                        <span>Ví Điện Tử MoMo</span>
                      </>
                    )}
                    {order.paymentMethod === 'VNPAY' && (
                      <>
                        <Image src="/wallets/vnpay.png" alt="VNPay" width={22} height={22} style={{ objectFit: 'contain', borderRadius: '4px' }} />
                        <span>Cổng VNPay</span>
                      </>
                    )}
                    {(!order.paymentMethod || order.paymentMethod === 'COD') && (
                      <>
                        <Image src="/wallets/cod.svg" alt="COD" width={22} height={22} style={{ objectFit: 'contain' }} />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.infoRow} style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <span className={styles.infoLabel}>Trạng thái thanh toán:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {order.paymentStatus === 'PAID' ? (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        ● ĐÃ THANH TOÁN
                      </span>
                    ) : order.paymentStatus === 'REFUNDED' ? (
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        ● ĐÃ HOÀN TIỀN
                      </span>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        ○ CHƯA THANH TOÁN
                      </span>
                    )}
                    {order.paidAt && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ({formatDate(order.paidAt)})
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.infoRow} style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <span className={styles.infoLabel}>Mã thanh toán (Payment Code):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {order.paymentCode || '---'}
                    </code>
                    {order.paymentCode && (
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(order.paymentCode!)}
                        title="Sao chép mã thanh toán"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancelled Alert if Cancelled */}
          {order.status === 'CANCELLED' && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', color: '#991b1b', fontSize: '0.875rem' }}>
              <strong>Lý do hủy đơn:</strong> {order.cancelReason || 'Không có lý do cụ thể'} (Bởi: {order.cancelledBy || 'Admin'}). Tồn kho đã được hoàn trả.
            </div>
          )}

          {/* Returned Alert if Returned */}
          {order.status === 'RETURNED' && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '12px 16px', color: '#9a3412', fontSize: '0.875rem' }}>
              <strong>Trạng thái hoàn hàng:</strong> {order.cancelReason || 'Khách không nhận kiện hàng'}.
            </div>
          )}

          {/* Items Section */}
          <div className={styles.itemsSection}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Sản phẩm sách</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className={styles.itemCell}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.bookCover} alt={it.bookTitle} className={styles.itemThumb} />
                          <div>
                            <div className={styles.itemTitle}>{it.bookTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mã sách: {it.bookId.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>{it.quantity}</td>
                      <td>{formatCurrency(it.unitPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(it.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      (Thông tin chi tiết sản phẩm lưu theo đơn)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Summary Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.9rem', background: '#f8fafc', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Thanh toán qua:</span>
              <strong style={{ color: '#0f172a' }}>{order.paymentMethod || 'COD'}</strong>
              <span style={{
                background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                color: order.paymentStatus === 'PAID' ? '#166534' : '#b45309',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b', marginRight: '8px' }}>Tổng thanh toán:</span>
              <strong style={{ fontSize: '1.25rem', color: '#2563eb' }}>{formatCurrency(order.totalAmount)}</strong>
            </div>
          </div>

          {/* Order Timeline / Audit Stepper */}
          <div className={styles.timelineSection}>
            <div className={styles.cardTitle}>
              <span>Lịch Sử Hành Trình & Nhật Ký Xử Lý Đơn Hàng</span>
            </div>

            {order.timelines && order.timelines.length > 0 ? (
              <div className={styles.timelineList}>
                {[...order.timelines]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .map((tl, i) => (
                    <div key={tl.id || i} className={styles.timelineItem}>
                      <div className={styles.timelineDot}></div>
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineTitle}>{tl.title}</span>
                        {i === 0 && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#047857',
                              background: '#d1fae5',
                              border: '1px solid #a7f3d0',
                              padding: '1px 6px',
                              borderRadius: '9999px',
                              textTransform: 'uppercase',
                            }}
                          >
                            Mới nhất
                          </span>
                        )}
                        <span className={styles.timelineTime}>{formatDate(tl.createdAt)}</span>
                      </div>
                      {tl.description && <div className={styles.timelineDesc}>{tl.description}</div>}
                      <div className={styles.timelineActor}>Thực hiện: <strong>{tl.actor}</strong></div>
                    </div>
                  ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                Chưa có nhật ký hành trình được ghi nhận cho đơn hàng này.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.printBtn} onClick={() => onOpenPrint(order)}>
            <span>In Phiếu Giao Hàng</span>
          </button>

          <div className={styles.actionBtnGroup}>
            {/* PENDING -> Confirm Button */}
            {order.status === 'PENDING' && (
              <button type="button" className={styles.primaryActionBtn} onClick={handleConfirmOrder}>
                <span>✓</span>
                <span>Xác Nhận Đơn</span>
              </button>
            )}

            {/* CONFIRMED -> Push Carrier Button */}
            {order.status === 'CONFIRMED' && (
              <button
                type="button"
                className={styles.primaryActionBtn}
                style={{ background: '#7c3aed' }}
                onClick={() => onOpenShipping(order)}
              >
                <span>Đẩy Đơn Sang ĐVVC</span>
              </button>
            )}

            {/* SHIPPED -> Deliver or Return Buttons */}
            {order.status === 'SHIPPED' && (
              <>
                <button
                  type="button"
                  className={styles.primaryActionBtn}
                  style={{ background: '#16a34a' }}
                  onClick={handleDeliverOrder}
                >
                  <span>✓</span>
                  <span>Giao Thành Công</span>
                </button>
                <button
                  type="button"
                  className={styles.cancelActionBtn}
                  style={{ background: '#ffedd5', color: '#c2410c', borderColor: '#fed7aa' }}
                  onClick={handleReturnOrder}
                >
                  <span>↩</span>
                  <span>Báo Hoàn Hàng</span>
                </button>
              </>
            )}

            {/* Cancel Order Button */}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
              <button type="button" className={styles.cancelActionBtn} onClick={() => onOpenCancel(order)}>
                <span>✕ Hủy Đơn</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;

