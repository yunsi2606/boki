'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import type { OrderCardData } from '@/types/chat';
import styles from '../styles/cards.module.css';

interface OrderCardProps {
  order: OrderCardData;
}

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();

  if (!order) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className={`${styles.orderStatusBadge} ${styles.orderStatusWarning}`}><Clock size={11} /> Chờ duyệt</span>;
      case 'CONFIRMED':
        return <span className={`${styles.orderStatusBadge} ${styles.orderStatusWarning}`}><Package size={11} /> Đang đóng gói</span>;
      case 'SHIPPED':
      case 'SHIPPING':
        return <span className={styles.orderStatusBadge}><Truck size={11} /> Đang vận chuyển</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className={`${styles.orderStatusBadge} ${styles.orderStatusSuccess}`}><CheckCircle2 size={11} /> Đã hoàn tất</span>;
      case 'CANCELLED':
        return <span className={`${styles.orderStatusBadge} ${styles.orderStatusDanger}`}><XCircle size={11} /> Đã hủy</span>;
      default:
        return <span className={styles.orderStatusBadge}>{status}</span>;
    }
  };

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div className={styles.orderId}>
          Đơn #{order.id.substring(0, 8)}
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className={styles.orderBody}>
        <div className={styles.orderRow}>
          <span>Tổng thanh toán:</span>
          <strong style={{ color: '#EE4D2D' }}>
            {Number(order.totalAmount).toLocaleString('vi-VN')} ₫
          </strong>
        </div>

        {order.carrierName && (
          <div className={styles.orderRow}>
            <span>Đơn vị vận chuyển:</span>
            <span>{order.carrierName}</span>
          </div>
        )}

        {order.trackingNumber && (
          <div className={styles.orderRow}>
            <span>Mã vận đơn:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.trackingNumber}</span>
          </div>
        )}

        {order.shippingAddress && (
          <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#64748b' }}>
            Địa chỉ: {order.shippingAddress}
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <button
          type="button"
          className={styles.btnSecondary}
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => router.push(`/orders?id=${order.id}`)}
        >
          <ExternalLink size={12} />
          Xem tiến trình đơn hàng
        </button>
      </div>
    </div>
  );
}
