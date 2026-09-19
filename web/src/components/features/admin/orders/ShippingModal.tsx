'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { AdminOrder } from '@/services/adminService';
import { adminService } from '@/services/adminService';
import type { ShippingCarrierCode, PushShippingPayload, CarrierConfig } from '@/types';
import { defaultCarrierConfigs } from '@/config/carrierConfig';
import styles from './ShippingModal.module.css';

interface ShippingModalProps {
  order: AdminOrder;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: PushShippingPayload) => Promise<void>;
}

export function ShippingModal({ order, isOpen, onClose, onConfirm }: ShippingModalProps) {
  const [carriers, setCarriers] = useState<CarrierConfig[]>(defaultCarrierConfigs);
  const [selectedCarrier, setSelectedCarrier] = useState<ShippingCarrierCode>('SPX');
  const [fulfillmentMode, setFulfillmentMode] = useState<'AUTO' | 'MANUAL'>('MANUAL');
  const [weightGrams, setWeightGrams] = useState<number>(order.weightGrams || 500);
  const [customTracking, setCustomTracking] = useState<string>('');
  const [customFee, setCustomFee] = useState<number>(22000);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('Cho xem hàng, không cho thử');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [realtimeEstimate, setRealtimeEstimate] = useState<import('@/types').CarrierFeeEstimate | null>(null);
  const [loadingRealtime, setLoadingRealtime] = useState<boolean>(false);

  // Load configured carriers on mount
  useEffect(() => {
    async function loadConfigs() {
      try {
        const [loadedCarriers, storeGeneral] = await Promise.all([
          adminService.getShippingCarriers(),
          adminService.getStoreGeneralConfig(),
        ]);
        setCarriers(loadedCarriers);
        const firstActive = loadedCarriers.find((c) => c.isActive);
        if (firstActive) {
          setSelectedCarrier(firstActive.code);
          setFulfillmentMode(firstActive.code === 'GHN' ? 'AUTO' : 'MANUAL');
        }
        if (storeGeneral.defaultShippingNote) {
          setNotes(storeGeneral.defaultShippingNote);
        }
      } catch (err) {
        console.error('Failed to load carrier configs in modal', err);
      }
    }
    loadConfigs();
  }, []);

  // Update default delivery date whenever carrier changes
  useEffect(() => {
    const days = selectedCarrier === 'GHN' ? 2 : selectedCarrier === 'JT_EXPRESS' ? 3 : 3;
    const target = new Date();
    target.setDate(target.getDate() + days);
    setDeliveryDate(target.toISOString().split('T')[0]);
  }, [selectedCarrier]);

  // When switching carrier, set default mode (GHN -> AUTO, others -> MANUAL)
  const handleSelectCarrier = (code: ShippingCarrierCode) => {
    setSelectedCarrier(code);
    if (code === 'GHN') {
      setFulfillmentMode('AUTO');
    } else {
      setFulfillmentMode('MANUAL');
    }
  };

  // Fetch realtime fee from carrier gateway when carrier is GHN in AUTO mode
  useEffect(() => {
    if (!isOpen || selectedCarrier !== 'GHN' || fulfillmentMode !== 'AUTO') {
      setRealtimeEstimate(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingRealtime(true);
      try {
        const res = await adminService.calculateCarrierFee({
          carrier: 'GHN',
          weightGrams,
        });
        setRealtimeEstimate(res);
        if (res.fee) {
          setCustomFee(res.fee);
        }
      } catch (err) {
        console.warn('Realtime fee estimate failed:', err);
      } finally {
        setLoadingRealtime(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen, selectedCarrier, fulfillmentMode, weightGrams]);

  const activeCarriers = useMemo(() => {
    return carriers.filter((c) => c.isActive);
  }, [carriers]);

  const selectedCarrierObj = useMemo(() => {
    return activeCarriers.find((c) => c.code === selectedCarrier) || activeCarriers[0] || carriers[0];
  }, [activeCarriers, selectedCarrier, carriers]);

  // Calculate estimated fee dynamically
  const estimatedFee = useMemo(() => {
    if (realtimeEstimate?.fee && fulfillmentMode === 'AUTO') {
      return realtimeEstimate.fee;
    }
    if (!selectedCarrierObj) return 20000;
    let fee = selectedCarrierObj.baseFee;
    if (weightGrams > 500) {
      const extra500g = Math.ceil((weightGrams - 500) / 500);
      fee += extra500g * (selectedCarrierObj.weightStepFee || 5000);
    }
    return fee;
  }, [selectedCarrierObj, weightGrams, realtimeEstimate, fulfillmentMode]);

  // Sync customFee when estimatedFee changes if user hasn't overridden
  useEffect(() => {
    setCustomFee(estimatedFee);
  }, [estimatedFee]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleCopyAll = () => {
    const itemsText = order.items?.map((it) => `${it.quantity}x ${it.bookTitle}`).join(', ') || 'Kiện sách';
    const allText = [
      `Người nhận: ${order.customerName || 'Khách hàng'}`,
      `SĐT: ${order.customerPhone || '---'}`,
      `Địa chỉ: ${order.shippingAddress}`,
      `Thu hộ COD: ${new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ`,
      `Khối lượng: ${weightGrams}g`,
      `Hàng hóa: ${itemsText}`,
      `Ghi chú: ${notes}`,
    ].join('\n');

    copyToClipboard(allText, 'ALL');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fulfillmentMode === 'MANUAL' && !customTracking.trim()) {
      alert(`Vui lòng nhập mã vận đơn nhận được từ đối tác ${selectedCarrierObj.name}!`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: PushShippingPayload = {
        carrier: selectedCarrier,
        weightGrams,
        shippingFee: customFee > 0 ? customFee : estimatedFee,
        notes: notes.trim() || undefined,
        trackingNumber: fulfillmentMode === 'MANUAL' ? customTracking.trim().toUpperCase() : undefined,
        estimatedDelivery: deliveryDate ? deliveryDate : undefined,
      };
      await onConfirm(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi bàn giao đơn cho ĐVVC.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getCarrierPrefixPlaceholder = (code: ShippingCarrierCode) => {
    switch (code) {
      case 'SPX':
        return 'VD: SPXVN049182391';
      case 'JT_EXPRESS':
        return 'VD: 840192841920';
      case 'VIETTEL_POST':
        return 'VD: VTP1928491823';
      case 'GHTK':
        return 'VD: S21049281.BO.123';
      case 'VNPOST':
        return 'VD: EM918274619VN';
      default:
        return 'Nhập mã vận đơn ĐVVC cung cấp...';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            <span>Bàn Giao & Đẩy Đơn Sang ĐVVC</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Order Summary Info */}
          <div className={styles.orderSummaryBox}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Mã đơn hàng:</span>
              <span className={styles.summaryValue}>#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Người nhận:</span>
              <span className={styles.summaryValue}>{order.customerName || 'Khách hàng'}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Số điện thoại:</span>
              <span className={styles.summaryValue} style={{ color: '#2563eb' }}>
                {order.customerPhone || '---'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Địa chỉ giao:</span>
              <span className={styles.summaryValue} style={{ maxWidth: '360px', textAlign: 'right' }}>
                {order.shippingAddress}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Tổng tiền thu COD:</span>
              <span className={styles.summaryValue} style={{ color: '#ea580c', fontWeight: 700 }}>
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Quick-Copy Panel for Portal / App Creation */}
          <div className={styles.copyHelperBox}>
            <div className={styles.copyHelperHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <span>📋</span>
                <span>Sao chép thông tin để tạo đơn trên Portal / App ĐVVC</span>
              </div>
              <button type="button" className={styles.copyAllBtn} onClick={handleCopyAll}>
                {copiedField === 'ALL' ? '✓ Đã chép tất cả!' : 'Sao chép tất cả'}
              </button>
            </div>
            <div className={styles.copyHelperGrid}>
              <div className={styles.copyHelperItem}>
                <span className={styles.copyItemLabel}>Người nhận:</span>
                <span className={styles.copyItemVal}>{order.customerName || 'Khách hàng'}</span>
                <button
                  type="button"
                  className={styles.miniCopyBtn}
                  onClick={() => copyToClipboard(order.customerName || '', 'NAME')}
                  title="Sao chép tên"
                >
                  {copiedField === 'NAME' ? '✓' : '📋'}
                </button>
              </div>
              <div className={styles.copyHelperItem}>
                <span className={styles.copyItemLabel}>SĐT:</span>
                <span className={styles.copyItemVal} style={{ color: '#2563eb', fontWeight: 700 }}>
                  {order.customerPhone || '---'}
                </span>
                <button
                  type="button"
                  className={styles.miniCopyBtn}
                  onClick={() => copyToClipboard(order.customerPhone || '', 'PHONE')}
                  title="Sao chép SĐT"
                >
                  {copiedField === 'PHONE' ? '✓' : '📋'}
                </button>
              </div>
              <div className={styles.copyHelperItem} style={{ gridColumn: 'span 2' }}>
                <span className={styles.copyItemLabel}>Địa chỉ:</span>
                <span className={styles.copyItemVal}>{order.shippingAddress}</span>
                <button
                  type="button"
                  className={styles.miniCopyBtn}
                  onClick={() => copyToClipboard(order.shippingAddress, 'ADDRESS')}
                  title="Sao chép địa chỉ"
                >
                  {copiedField === 'ADDRESS' ? '✓' : '📋'}
                </button>
              </div>
              <div className={styles.copyHelperItem}>
                <span className={styles.copyItemLabel}>Tiền COD:</span>
                <span className={styles.copyItemVal} style={{ color: '#ea580c', fontWeight: 700 }}>
                  {formatCurrency(order.totalAmount)}
                </span>
                <button
                  type="button"
                  className={styles.miniCopyBtn}
                  onClick={() => copyToClipboard(String(order.totalAmount), 'COD')}
                  title="Sao chép tiền COD"
                >
                  {copiedField === 'COD' ? '✓' : '📋'}
                </button>
              </div>
              <div className={styles.copyHelperItem}>
                <span className={styles.copyItemLabel}>Khối lượng:</span>
                <span className={styles.copyItemVal}>{weightGrams}g</span>
                <button
                  type="button"
                  className={styles.miniCopyBtn}
                  onClick={() => copyToClipboard(String(weightGrams), 'WEIGHT')}
                  title="Sao chép khối lượng"
                >
                  {copiedField === 'WEIGHT' ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>

          {/* Carrier Selection */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Chọn Đơn Vị Vận Chuyển Đối Tác</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {selectedCarrier === 'GHN' ? 'Hỗ trợ API Gateway tự động & Webhook' : 'Tạo đơn thủ công trên App/Portal'}
              </span>
            </label>
            <div className={styles.carrierGrid}>
              {activeCarriers.map((c) => (
                <div
                  key={c.code}
                  className={`${styles.carrierCard} ${selectedCarrier === c.code ? styles.carrierSelected : ''}`}
                  onClick={() => handleSelectCarrier(c.code)}
                >
                  <div className={styles.carrierIcon}>
                    {c.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={c.logo} alt={c.name} className={styles.carrierLogoImg} />
                    ) : (
                      <span>🚚</span>
                    )}
                  </div>
                  <div className={styles.carrierDetails}>
                    <div className={styles.carrierName}>{c.name}</div>
                    <div className={styles.carrierEstimate}>Dự kiến: {c.deliveryDays}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment Mode Tabs */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phương Thức Bàn Giao Vận Đơn</label>
            <div className={styles.modeTabs}>
              {selectedCarrier === 'GHN' && (
                <button
                  type="button"
                  className={`${styles.modeTabBtn} ${fulfillmentMode === 'AUTO' ? styles.modeTabBtnActive : ''}`}
                  onClick={() => setFulfillmentMode('AUTO')}
                >
                  <span>⚡ Tự Động Qua Cổng GHN API</span>
                </button>
              )}
              <button
                type="button"
                className={`${styles.modeTabBtn} ${fulfillmentMode === 'MANUAL' ? styles.modeTabBtnActive : ''}`}
                onClick={() => setFulfillmentMode('MANUAL')}
              >
                <span>✏️ Tạo Trên Portal/App {selectedCarrierObj.name} & Nhập Mã Thủ Công</span>
              </button>
            </div>
          </div>

          {/* Manual Fulfillment Guide & Inputs */}
          {fulfillmentMode === 'MANUAL' && (
            <div className={styles.portalHintBox}>
              <span>💡</span>
              <div>
                <strong>Quy trình tạo đơn ngoài cho {selectedCarrierObj.name}:</strong>
                <div style={{ marginTop: '2px' }}>
                  1. Mở App hoặc Portal của <strong>{selectedCarrierObj.name}</strong>, dán thông tin người nhận ở bảng trên để tạo đơn.
                  <br />
                  2. Lấy <strong>Mã vận đơn</strong> và nhập vào ô bên dưới để Boki liên kết hành trình và đồng bộ trạng thái.
                </div>
              </div>
            </div>
          )}

          {/* Tracking Number Input */}
          {fulfillmentMode === 'MANUAL' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <span>Mã vận đơn của {selectedCarrierObj.name} (*)</span>
                <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Bắt buộc nhập</span>
              </label>
              <input
                type="text"
                placeholder={getCarrierPrefixPlaceholder(selectedCarrier)}
                className={styles.inputField}
                value={customTracking}
                onChange={(e) => setCustomTracking(e.target.value.toUpperCase())}
                required
                autoFocus
              />
            </div>
          )}

          {/* Package Weight & Estimated/Actual Fee & Delivery Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {/* Weight */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Khối lượng (gram)</label>
              <input
                type="number"
                min="100"
                max="20000"
                step="50"
                className={styles.inputField}
                value={weightGrams}
                onChange={(e) => setWeightGrams(Number(e.target.value) || 500)}
                required
              />
            </div>

            {/* Custom/Actual Fee */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Cước ĐVVC thu (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="1000"
                className={styles.inputField}
                value={customFee}
                onChange={(e) => setCustomFee(Number(e.target.value) || 0)}
                title="Cước phí thực tế mà hãng vận chuyển tính cho đơn hàng này"
              />
            </div>

            {/* Delivery Date */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ngày hẹn giao</label>
              <input
                type="date"
                className={styles.inputField}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Fee Preview Banner */}
          <div className={styles.feeEstimateBox}>
            <div>
              <div className={styles.feeLabel}>
                {fulfillmentMode === 'AUTO' && realtimeEstimate
                  ? '⚡ Cước tính realtime (GHN Gateway):'
                  : `Cước vận chuyển ước tính (${selectedCarrierObj.name}):`}
              </div>
              {fulfillmentMode === 'AUTO' && realtimeEstimate && (
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  Dự kiến giao: {realtimeEstimate.deliveryDays} ({realtimeEstimate.note})
                </div>
              )}
              {loadingRealtime && <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>Đang kiểm tra cước phí GHN...</div>}
            </div>
            <div className={styles.feeAmount}>{formatCurrency(customFee || estimatedFee)}</div>
          </div>

          {/* Shipper Notes */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ghi chú cho shipper / Ghi chú đơn hàng</label>
            <input
              type="text"
              placeholder="VD: Cho xem hàng, gọi trước khi giao..."
              className={styles.inputField}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Đóng
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting
                ? 'Đang xử lý...'
                : fulfillmentMode === 'AUTO'
                  ? 'Đẩy Đơn Qua GHN Gateway'
                  : `✓ Liên Kết Vận Đơn ${selectedCarrierObj.name}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShippingModal;
