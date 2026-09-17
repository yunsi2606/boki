'use client';

import React, { useState } from 'react';
import type { CartItem } from '@/types';
import type { Voucher, VoucherValidationResult } from '@/types/voucher';
import { voucherService } from '@/services/voucherService';
import VoucherSelectorModal from './VoucherSelectorModal';
import styles from './CheckoutSummary.module.css';

interface CheckoutSummaryProps {
  items: CartItem[];
  onSubmit: () => void;
  submitting?: boolean;
}

export default function CheckoutSummary({ items, onSubmit, submitting = false }: CheckoutSummaryProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : item.book.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = subtotal >= 300000 || subtotal === 0 ? 0 : 22000;

  // Re-evaluate discount if subtotal or selected voucher changes
  React.useEffect(() => {
    if (selectedVoucher) {
      const res = voucherService.validateVoucher(selectedVoucher, subtotal, shippingFee, items);
      if (res.isEligible) {
        setDiscountAmount(res.discountAmount);
      } else {
        setSelectedVoucher(null);
        setDiscountAmount(0);
      }
    } else {
      setDiscountAmount(0);
    }
  }, [selectedVoucher, subtotal, shippingFee, items]);

  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleVoucherSelected = (res: VoucherValidationResult | null) => {
    if (!res) {
      setSelectedVoucher(null);
      setDiscountAmount(0);
    } else {
      setSelectedVoucher(res.voucher);
      setDiscountAmount(res.discountAmount);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Tóm tắt đơn hàng</h2>
        <span className={styles.itemCount}>{items.reduce((s, i) => s + i.quantity, 0)} sản phẩm</span>
      </div>

      {/* Items list */}
      <div className={styles.itemsList}>
        {items.map((item) => {
          const key = item.selectedVariant ? `${item.book.id}_${item.selectedVariant.id}` : item.book.id;
          const cover =
            item.selectedVariant?.imageUrl ||
            item.book.imageUrls?.[0] ||
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200';
          const price = item.selectedVariant ? item.selectedVariant.price : item.book.price;

          return (
            <div key={key} className={styles.itemRow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={item.book.title} className={styles.itemCover} />
              <div className={styles.itemInfo}>
                <h4 className={styles.itemTitle}>{item.book.title}</h4>
                {item.selectedVariant && (
                  <span className={styles.variantTag}>{item.selectedVariant.name}</span>
                )}
                <div className={styles.qtyPrice}>
                  {formatPrice(price)} x {item.quantity}
                </div>
              </div>
              <span className={styles.itemSubtotal}>{formatPrice(price * item.quantity)}</span>
            </div>
          );
        })}
      </div>

      {/* Voucher Selector Button */}
      <div className={styles.voucherBox}>
        <button
          type="button"
          className={styles.voucherSelectBtn}
          onClick={() => setIsVoucherModalOpen(true)}
        >
          <span style={{ fontSize: '16px' }}>🎟️</span>
          <span style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>
            {selectedVoucher ? `Voucher: ${selectedVoucher.code}` : 'Chọn hoặc Nhập mã giảm giá'}
          </span>
          <span style={{ color: '#ff4d4f', fontSize: '13px', fontWeight: 700 }}>
            {selectedVoucher ? `Giảm ${formatPrice(discountAmount)}` : 'Chọn mã >'}
          </span>
        </button>
      </div>

      {selectedVoucher && (
        <div className={styles.voucherSuccess}>
          ✓ Áp dụng mã <strong>{selectedVoucher.code}</strong>: Giảm {formatPrice(discountAmount)}
        </div>
      )}

      {/* Price breakdown */}
      <div className={styles.priceBreakdown}>
        <div className={styles.priceRow}>
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className={styles.priceRow}>
          <span>Phí vận chuyển</span>
          {shippingFee === 0 ? (
            <span className={styles.freeShipping}>Miễn phí</span>
          ) : (
            <span>{formatPrice(shippingFee)}</span>
          )}
        </div>

        {discountAmount > 0 && (
          <div className={styles.priceRow}>
            <span>Giảm giá Voucher</span>
            <span className={styles.discountValue}>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className={styles.totalDivider}></div>

        <div className={styles.grandTotalRow}>
          <span className={styles.grandTotalLabel}>Tổng số tiền</span>
          <span className={styles.grandTotalValue}>{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="button"
        className={styles.submitBtn}
        onClick={onSubmit}
        disabled={submitting || items.length === 0}
      >
        {submitting ? 'Đang xử lý đặt hàng...' : 'ĐẶT HÀNG NGAY'}
      </button>

      <div className={styles.securityNote}>
        🔒 Thông tin thanh toán & địa chỉ được bảo mật 100%
      </div>

      {/* Voucher Selector Modal */}
      <VoucherSelectorModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        subtotal={subtotal}
        shippingFee={shippingFee}
        items={items}
        selectedVoucher={selectedVoucher}
        onSelectVoucher={handleVoucherSelected}
      />
    </div>
  );
}
