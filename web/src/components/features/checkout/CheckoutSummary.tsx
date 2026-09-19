'use client';

import React, { useState, useEffect } from 'react';
import type { CartItem, PricingResponse, CalculatePricingPayload } from '@/types';
import type { Voucher, VoucherValidationResult } from '@/types/voucher';
import { voucherService } from '@/services/voucherService';
import { orderService } from '@/services/orderService';
import VoucherSelectorModal from './VoucherSelectorModal';
import { TicketIcon, LockIcon, CheckCircleIcon, CrownIcon, TagIcon } from '@/components/ui/LineIcons';
import styles from './CheckoutSummary.module.css';

interface CheckoutSummaryProps {
  items: CartItem[];
  onSubmit: (voucherCode?: string) => void;
  submitting?: boolean;
  onVoucherChange?: (code?: string) => void;
}

export default function CheckoutSummary({
  items,
  onSubmit,
  submitting = false,
  onVoucherChange,
}: CheckoutSummaryProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [serverPricing, setServerPricing] = useState<PricingResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const clientSubtotal = items.reduce((sum, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : item.book.price;
    return sum + price * item.quantity;
  }, 0);

  const clientShippingFee = clientSubtotal >= 300000 || clientSubtotal === 0 ? 0 : 22000;

  // Server-authoritative pricing evaluation
  useEffect(() => {
    if (items.length === 0) {
      setServerPricing(null);
      return;
    }

    let isSubscribed = true;

    const queryServerPricing = async () => {
      setIsCalculating(true);
      try {
        const payload: CalculatePricingPayload = {
          items: items.map((i) => ({
            bookId: i.book.id,
            variantId: i.selectedVariant?.id,
            quantity: i.quantity,
          })),
          voucherCode: selectedVoucher?.code,
          shippingFee: clientShippingFee,
        };

        const result = await orderService.calculatePricing(payload);
        if (isSubscribed) {
          setServerPricing(result);
        }
      } catch (err) {
        console.warn('Server pricing check returned error, falling back to local calculation:', err);
      } finally {
        if (isSubscribed) {
          setIsCalculating(false);
        }
      }
    };

    queryServerPricing();

    return () => {
      isSubscribed = false;
    };
  }, [items, selectedVoucher, clientShippingFee]);

  const handleVoucherSelected = (res: VoucherValidationResult | null) => {
    if (!res) {
      setSelectedVoucher(null);
      onVoucherChange?.(undefined);
    } else {
      setSelectedVoucher(res.voucher);
      onVoucherChange?.(res.voucher.code);
    }
  };

  // Pricing values (server prioritized, fallback to client)
  const displaySubtotal = serverPricing ? serverPricing.subtotal : clientSubtotal;
  const displayShipping = serverPricing ? serverPricing.shippingFee : clientShippingFee;
  const memberDiscount = serverPricing ? serverPricing.memberDiscountAmount : 0;
  const voucherDiscount = serverPricing ? serverPricing.voucherDiscountAmount : 0;
  const displayFinalTotal = serverPricing
    ? serverPricing.finalTotal
    : Math.max(0, clientSubtotal + clientShippingFee - (selectedVoucher ? 0 : 0));

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
          <TicketIcon size={18} color="#6366f1" />
          <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, marginLeft: '4px' }}>
            {selectedVoucher ? `Voucher: ${selectedVoucher.code}` : 'Chọn hoặc Nhập mã giảm giá'}
          </span>
          <span style={{ color: '#ff4d4f', fontSize: '13px', fontWeight: 700 }}>
            {voucherDiscount > 0
              ? `Giảm ${formatPrice(voucherDiscount)}`
              : selectedVoucher
              ? selectedVoucher.code
              : 'Chọn mã >'}
          </span>
        </button>
      </div>

      {selectedVoucher && (
        <div className={styles.voucherSuccess} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleIcon size={16} color="#16a34a" />
          <span>
            Đã áp dụng mã <strong>{selectedVoucher.code}</strong>
            {voucherDiscount > 0 && `: Tiết kiệm ${formatPrice(voucherDiscount)}`}
          </span>
        </div>
      )}

      {/* Member Tier Announcement if active */}
      {serverPricing && serverPricing.memberTier && serverPricing.memberTier !== 'STANDARD' && (
        <div
          style={{
            margin: '8px 0 16px',
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#b45309',
            fontWeight: 600,
          }}
        >
          <CrownIcon size={18} color="#d97706" />
          <span>
            Hạng {serverPricing.memberTier}: Giảm {serverPricing.memberDiscountPercent}% trên đơn
          </span>
        </div>
      )}

      {/* Price breakdown */}
      <div className={styles.priceBreakdown}>
        <div className={styles.priceRow}>
          <span>Tạm tính</span>
          <span>{formatPrice(displaySubtotal)}</span>
        </div>

        {/* Member tier discount row */}
        {memberDiscount > 0 && (
          <div className={styles.priceRow} style={{ color: '#b45309', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CrownIcon size={14} color="#d97706" />
              <span>Ưu đãi thành viên ({serverPricing?.memberTier})</span>
            </span>
            <span>-{formatPrice(memberDiscount)}</span>
          </div>
        )}

        {/* Voucher discount row */}
        {voucherDiscount > 0 && (
          <div className={styles.priceRow} style={{ color: '#16a34a', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TagIcon size={14} color="#16a34a" />
              <span>Giảm giá Voucher ({selectedVoucher?.code})</span>
            </span>
            <span className={styles.discountValue}>-{formatPrice(voucherDiscount)}</span>
          </div>
        )}

        <div className={styles.priceRow}>
          <span>Phí vận chuyển</span>
          {displayShipping === 0 ? (
            <span className={styles.freeShipping}>Miễn phí</span>
          ) : (
            <span>{formatPrice(displayShipping)}</span>
          )}
        </div>

        <div className={styles.totalDivider}></div>

        <div className={styles.grandTotalRow}>
          <span className={styles.grandTotalLabel}>Tổng số tiền</span>
          <span className={styles.grandTotalValue}>
            {isCalculating ? '...' : formatPrice(displayFinalTotal)}
          </span>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="button"
        className={styles.submitBtn}
        onClick={() => onSubmit(selectedVoucher?.code)}
        disabled={submitting || items.length === 0}
      >
        {submitting ? 'Đang xử lý đặt hàng...' : 'ĐẶT HÀNG NGAY'}
      </button>

      <div className={styles.securityNote} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <LockIcon size={14} color="#64748b" />
        <span>Thông tin thanh toán & địa chỉ được đối soát bảo mật 100%</span>
      </div>

      {/* Voucher Selector Modal */}
      <VoucherSelectorModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        subtotal={displaySubtotal}
        shippingFee={displayShipping}
        items={items}
        selectedVoucher={selectedVoucher}
        onSelectVoucher={handleVoucherSelected}
      />
    </div>
  );
}
