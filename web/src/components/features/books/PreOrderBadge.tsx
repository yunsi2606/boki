'use client';

import React from 'react';
import styles from './PreOrderBadge.module.css';

/**
 * Returns user-facing label for pre-order status:
 * - If days specified: "Đặt hàng trước (14 ngày)"
 * - If indefinite/null/0: "Đặt hàng trước"
 */
export function getPreOrderLabel(days?: number | null): string {
  if (days && days > 0) {
    return `Đặt hàng trước (${days} ngày)`;
  }
  return 'Đặt hàng trước';
}

/**
 * Calculates estimated delivery release date from today + lead days.
 * Returns formatted date string in Vietnamese format (dd/MM/yyyy).
 */
export function getEstimatedDeliveryDate(days?: number | null): string {
  if (days && days > 0) {
    const target = new Date();
    target.setDate(target.getDate() + days);
    return target.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return 'Sẽ thông báo khi có hàng';
}

interface PreOrderBadgeProps {
  isPreOrder?: boolean;
  preOrderDays?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  floating?: boolean;
  className?: string;
}

export function PreOrderBadge({
  isPreOrder,
  preOrderDays,
  size = 'md',
  showIcon = true,
  floating = false,
  className = '',
}: PreOrderBadgeProps) {
  if (!isPreOrder) return null;

  const label = getPreOrderLabel(preOrderDays);

  return (
    <span
      className={`${styles.preOrderBadge} ${styles[`size_${size}`]} ${
        floating ? styles.floatingBadge : ''
      } ${className}`}
      title={
        preOrderDays && preOrderDays > 0
          ? `Hàng đặt trước: Dự kiến giao hàng khoảng ${preOrderDays} ngày sau khi đặt.`
          : 'Hàng đặt trước: Thời gian giao hàng sẽ được thông báo sau.'
      }
    >
      {showIcon && (
        <span className={styles.badgeIcon}>
          <svg width={size === 'sm' ? 12 : 14} height={size === 'sm' ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}

interface PreOrderDeliveryEstimateProps {
  isPreOrder?: boolean;
  preOrderDays?: number | null;
  className?: string;
}

export function PreOrderDeliveryEstimate({
  isPreOrder,
  preOrderDays,
  className = '',
}: PreOrderDeliveryEstimateProps) {
  if (!isPreOrder) return null;

  const hasDays = preOrderDays !== undefined && preOrderDays !== null && preOrderDays > 0;
  const estDate = getEstimatedDeliveryDate(preOrderDays);

  return (
    <div className={`${styles.deliveryEstimateBox} ${className}`}>
      <div className={styles.estimateIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <div className={styles.estimateContent}>
        <div className={styles.estimateTitle}>
          <span>Thời gian giao hàng dự kiến:</span>
          {hasDays && <strong className={styles.estimateDate}>{estDate}</strong>}
        </div>
        <div className={styles.estimateNote}>
          {hasDays ? (
            <span>
              Sản phẩm dự kiến được đóng gói và giao sau khoảng <strong>{preOrderDays} ngày</strong> kể từ khi quý khách đặt đơn thành công.
            </span>
          ) : (
            <span>
              Sản phẩm thuộc diện đặt trước chưa ấn định ngày phát hành cụ thể. Boki sẽ gửi thông báo và chuẩn bị giao hàng ngay khi sách về kho.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreOrderBadge;
