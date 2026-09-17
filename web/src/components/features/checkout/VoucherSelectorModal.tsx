'use client';

import React, { useEffect, useState } from 'react';
import { voucherService } from '@/services/voucherService';
import type { Voucher, VoucherValidationResult } from '@/types/voucher';
import type { CartItem } from '@/types';
import styles from './VoucherSelectorModal.module.css';

interface VoucherSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  shippingFee: number;
  items: CartItem[];
  selectedVoucher: Voucher | null;
  onSelectVoucher: (result: VoucherValidationResult | null) => void;
}

export default function VoucherSelectorModal({
  isOpen,
  onClose,
  subtotal,
  shippingFee,
  items,
  selectedVoucher,
  onSelectVoucher,
}: VoucherSelectorModalProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [activeTab, setActiveTab] = useState<'eligible' | 'ineligible'>('eligible');
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      voucherService.getAllVouchers().then(setVouchers);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Evaluate all vouchers against cart
  const evaluatedVouchers = vouchers.map((v) =>
    voucherService.validateVoucher(v, subtotal, shippingFee, items)
  );

  const eligibleVouchers = evaluatedVouchers.filter((item) => item.isEligible);
  const ineligibleVouchers = evaluatedVouchers.filter((item) => !item.isEligible);

  const handleApplyInputCode = () => {
    setErrorMsg('');
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    const found = vouchers.find((v) => v.code.toUpperCase() === code);
    if (!found) {
      setErrorMsg('Mã giảm giá không tồn tại hoặc đã hết hạn.');
      return;
    }

    const validation = voucherService.validateVoucher(found, subtotal, shippingFee, items);
    if (!validation.isEligible) {
      setErrorMsg(validation.reason || 'Mã giảm giá chưa đủ điều kiện áp dụng.');
      return;
    }

    onSelectVoucher(validation);
    onClose();
  };

  const handleSelectTicket = (validation: VoucherValidationResult) => {
    if (selectedVoucher?.id === validation.voucher.id) {
      onSelectVoucher(null); // Deselect if clicked again
    } else {
      onSelectVoucher(validation);
    }
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.icon}>🎟️</span>
            <h3 className={styles.title}>Chọn Boki Voucher</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Custom Input */}
        <div className={styles.inputSection}>
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="Nhập mã giảm giá..."
              className={styles.codeInput}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <button type="button" className={styles.applyBtn} onClick={handleApplyInputCode}>
              Áp dụng
            </button>
          </div>
          {errorMsg && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px' }}>{errorMsg}</div>}
        </div>

        {/* Tab Headers */}
        <div className={styles.tabHeader}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'eligible' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('eligible')}
          >
            Mã Khả Dụng ({eligibleVouchers.length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'ineligible' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('ineligible')}
          >
            Chưa Đủ Điều Kiện ({ineligibleVouchers.length})
          </button>
        </div>

        {/* Vouchers List */}
        <div className={styles.voucherList}>
          {activeTab === 'eligible' && eligibleVouchers.length === 0 && (
            <div className={styles.emptyState}>
              Không có mã giảm giá nào phù hợp với đơn hàng hiện tại.
            </div>
          )}

          {activeTab === 'ineligible' && ineligibleVouchers.length === 0 && (
            <div className={styles.emptyState}>Tất cả các mã đều khả dụng!</div>
          )}

          {(activeTab === 'eligible' ? eligibleVouchers : ineligibleVouchers).map((res) => {
            const v = res.voucher;
            const isSelected = selectedVoucher?.id === v.id;

            return (
              <div
                key={v.id}
                className={`${styles.ticket} ${isSelected ? styles.ticketSelected : ''} ${
                  !res.isEligible ? styles.ticketDisabled : ''
                }`}
              >
                <div
                  className={`${styles.ticketLeft} ${
                    v.type === 'SHIPPING' ? styles.ticketLeftShipping : ''
                  } ${!res.isEligible ? styles.ticketLeftDisabled : ''}`}
                >
                  <span className={styles.ticketTag}>
                    {v.type === 'SHIPPING' ? 'FREESHIP' : 'GIẢM GIÁ'}
                  </span>
                </div>

                <div className={styles.ticketRight}>
                  <div>
                    <h4 className={styles.ticketTitle}>{v.title}</h4>
                    <p className={styles.ticketDesc}>{v.description}</p>
                    {!res.isEligible && res.reason && (
                      <div className={styles.ineligibleReason}>⚠️ {res.reason}</div>
                    )}
                  </div>

                  <div className={styles.ticketMeta}>
                    <span className={styles.codeBadge}>{v.code}</span>

                    {res.isEligible && (
                      <button
                        type="button"
                        className={styles.selectBtn}
                        onClick={() => handleSelectTicket(res)}
                      >
                        {isSelected ? 'Bỏ chọn' : 'Áp dụng'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
