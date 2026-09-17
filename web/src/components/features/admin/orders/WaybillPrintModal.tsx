'use client';

import React, { useState, useEffect } from 'react';
import type { AdminOrder } from '@/services/adminService';
import { adminService } from '@/services/adminService';
import type { StoreGeneralConfig, PrintWaybillResponse } from '@/types';
import { defaultStoreGeneralConfig } from '@/config/carrierConfig';
import styles from './WaybillPrintModal.module.css';

interface WaybillPrintModalProps {
  order: AdminOrder;
  isOpen: boolean;
  onClose: () => void;
}

export function isGhnOrder(order?: AdminOrder | null): boolean {
  if (!order) return false;
  const name = (order.carrierName || '').toLowerCase().trim();
  const tracking = (order.trackingNumber || '').trim();
  return (
    name.includes('ghn') ||
    name.includes('giao hàng nhanh') ||
    name.includes('giao hang nhanh') ||
    name.includes('nhanh') ||
    (Boolean(tracking) && /^L[A-Z0-9]+$/i.test(tracking))
  );
}

export function WaybillPrintModal({ order, isOpen, onClose }: WaybillPrintModalProps) {
  const isGhn = isGhnOrder(order);
  const [activeTab, setActiveTab] = useState<'GHN' | 'INTERNAL'>(isGhn ? 'GHN' : 'INTERNAL');
  const [paperSize, setPaperSize] = useState<'A5' | '80x80' | '52x70'>('A5');
  const [storeInfo, setStoreInfo] = useState<StoreGeneralConfig>(defaultStoreGeneralConfig);

  const [printData, setPrintData] = useState<PrintWaybillResponse | null>(null);
  const [loadingGhn, setLoadingGhn] = useState<boolean>(false);
  const [ghnError, setGhnError] = useState<string | null>(null);

  // Sync activeTab whenever order changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(isGhn ? 'GHN' : 'INTERNAL');
    }
  }, [isOpen, order?.id, isGhn]);

  useEffect(() => {
    async function loadStore() {
      try {
        const info = await adminService.getStoreGeneralConfig();
        setStoreInfo(info);
      } catch (err) {
        console.error('Failed to load store info in waybill', err);
      }
    }
    loadStore();
  }, []);

  // Fetch official GHN print token whenever modal opens with GHN order
  useEffect(() => {
    if (!isOpen || !isGhn || !order?.trackingNumber) return;

    let isMounted = true;
    async function fetchGhnPrint() {
      setLoadingGhn(true);
      setGhnError(null);
      try {
        const res = await adminService.getPrintWaybillUrl(order.id, paperSize);
        if (isMounted) {
          setPrintData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to fetch GHN print token:', err);
          setGhnError(err?.response?.data?.message || err?.message || 'Không thể lấy token in từ cổng GHN.');
        }
      } finally {
        if (isMounted) setLoadingGhn(false);
      }
    }

    fetchGhnPrint();
    return () => {
      isMounted = false;
    };
  }, [isOpen, isGhn, order?.id, order?.trackingNumber, paperSize]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (activeTab === 'GHN' && printData?.printUrl) {
      // Print the iframe if possible, or fallback to window.open
      const iframe = document.getElementById('ghnPrintIframe') as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          return;
        } catch (e) {
          console.warn('Cross-origin iframe print prevented, opening in popup tab', e);
        }
      }
      window.open(printData.printUrl, '_blank');
    } else {
      window.print();
    }
  };

  const handleOpenGhnTab = () => {
    if (printData?.printUrl) {
      window.open(printData.printUrl, '_blank');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const trackingCode = order.trackingNumber || `BOKI-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: activeTab === 'GHN' ? '820px' : '620px' }}
      >
        {/* Top Control Bar */}
        <div className={styles.topBar}>
          {/* Tab Switcher */}
          <div className={styles.tabSwitcher}>
            {isGhn && (
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'GHN' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('GHN')}
                style={activeTab === 'GHN' ? { color: '#ea580c', fontWeight: 700 } : {}}
              >
                🚚 Phiếu In Chuẩn GHN (Chính Thức)
              </button>
            )}
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'INTERNAL' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('INTERNAL')}
            >
              📋 Phiếu In Nội Bộ Boki
            </button>
          </div>

          {/* GHN Size Selector */}
          {activeTab === 'GHN' && (
            <div className={styles.sizeSelector}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Khổ in:</span>
              <button
                type="button"
                className={`${styles.sizeBtn} ${paperSize === 'A5' ? styles.sizeBtnActive : ''}`}
                onClick={() => setPaperSize('A5')}
                title="Khổ giấy A5 tiêu chuẩn GHN"
              >
                A5
              </button>
              <button
                type="button"
                className={`${styles.sizeBtn} ${paperSize === '80x80' ? styles.sizeBtnActive : ''}`}
                onClick={() => setPaperSize('80x80')}
                title="Khổ in nhiệt 80x80 mm dán bưu kiện"
              >
                80×80 mm
              </button>
              <button
                type="button"
                className={`${styles.sizeBtn} ${paperSize === '52x70' ? styles.sizeBtnActive : ''}`}
                onClick={() => setPaperSize('52x70')}
                title="Khổ in nhiệt 52x70 mm tem nhãn nhỏ"
              >
                52×70 mm
              </button>
            </div>
          )}

          {/* Top Actions */}
          <div className={styles.topBarActions}>
            {activeTab === 'GHN' && printData?.printUrl && (
              <button
                type="button"
                className={styles.openTabBtn}
                onClick={handleOpenGhnTab}
                title="Mở toàn màn hình trong tab mới để in hoặc tải PDF từ GHN"
              >
                <span>↗</span>
                <span>Mở Tab GHN</span>
              </button>
            )}
            <button type="button" className={styles.printBtn} onClick={handlePrint}>
              <span>🖨️</span>
              <span>In Phiếu</span>
            </button>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Content Area: Official GHN vs Internal Boki Sheet */}
        {activeTab === 'GHN' ? (
          <div style={{ padding: '16px', background: '#f8fafc', minHeight: '560px' }}>
            {loadingGhn && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '480px',
                  gap: '12px',
                  color: '#64748b',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid #cbd5e1',
                    borderTopColor: '#ea580c',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Đang kết nối cổng in chính thức GHN ({paperSize})...
                </span>
              </div>
            )}

            {ghnError && !loadingGhn && (
              <div
                style={{
                  padding: '24px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  color: '#b91c1c',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>⚠️ Không thể tải phiếu in từ cổng GHN:</div>
                <div style={{ fontSize: '0.875rem', marginBottom: '12px' }}>{ghnError}</div>
                <button
                  type="button"
                  className={styles.tabBtn}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1' }}
                  onClick={() => setActiveTab('INTERNAL')}
                >
                  Chuyển sang in phiếu nội bộ Boki
                </button>
              </div>
            )}

            {!loadingGhn && !ghnError && printData?.printUrl && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    fontSize: '0.85rem',
                    color: '#475569',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#059669', fontWeight: 600 }}>● Cổng GHN Sẵn Sàng</span>
                    <span>
                      • Mã vận đơn: <strong style={{ color: '#ea580c' }}>{printData.orderCode}</strong>
                    </span>
                    <span>
                      • Khổ: <strong>{paperSize}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenGhnTab}
                    style={{
                      padding: '4px 10px',
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Mở toàn màn hình trong tab mới để in trực tiếp qua trình duyệt"
                  >
                    <span>↗</span> Mở Tab GHN In Trực Tiếp
                  </button>
                </div>
                <iframe
                  id="ghnPrintIframe"
                  src={printData.printUrl}
                  style={{
                    width: '100%',
                    height: paperSize === 'A5' ? '680px' : '560px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    background: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  title="Official GHN Waybill"
                />
              </div>
            )}
          </div>
        ) : (
          /* Printable Internal Waybill Area */
          <div className={styles.waybillSheet}>
            <div className={styles.billBorder}>
              {/* Header */}
              <div className={styles.headerRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src="/brand/logo.png"
                    alt="Boki Store Logo"
                    style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                  />
                  <div>
                    <div className={styles.brandName}>BOKI STORE</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>Hệ thống Nhà sách & Xuất bản trực tuyến</div>
                  </div>
                </div>
                <div className={styles.carrierBadge}>{order.carrierName || 'GIAO HÀNG TIÊU CHUẨN'}</div>
              </div>

              {/* Barcode & Tracking Number */}
              <div className={styles.barcodeContainer}>
                <div className={styles.barcodeGraphics}>|||||| | |||| ||| ||||| | ||| |||| |</div>
                <div className={styles.trackingText}>{trackingCode}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mã đơn hàng: #{order.id.toUpperCase()}</div>
              </div>

              {/* Parties Grid (Sender & Receiver) */}
              <div className={styles.partiesGrid}>
                <div className={styles.partyBox}>
                  <div className={styles.partyTitle}>NGƯỜI GỬI (FROM):</div>
                  <div>
                    <strong>{storeInfo.storeName.toUpperCase()}</strong>
                  </div>
                  <div>
                    SĐT: {storeInfo.senderPhone} / Hotline: {storeInfo.hotline}
                  </div>
                  <div>Địa chỉ: {storeInfo.senderAddress}</div>
                </div>

                <div className={styles.partyBox}>
                  <div className={styles.partyTitle}>NGƯỜI NHẬN (TO):</div>
                  <div>
                    <strong>{order.customerName || 'Khách hàng'}</strong>
                  </div>
                  <div>
                    SĐT: <strong>{order.customerPhone || '---'}</strong>
                  </div>
                  <div>Địa chỉ: {order.shippingAddress}</div>
                </div>
              </div>

              {/* Items Checklist for Packaging */}
              <div className={styles.itemsChecklist}>
                <div className={styles.partyTitle} style={{ marginBottom: '6px' }}>
                  DANH SÁCH HÀNG HÓA ({order.items?.length || 0} sản phẩm) - Khối lượng: {order.weightGrams || 500}g
                </div>
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, idx) => (
                    <div key={idx} className={styles.itemLine}>
                      <span>
                        [ ] <strong>{it.bookTitle}</strong>
                      </span>
                      <span>
                        SL: <strong>x{it.quantity}</strong>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={styles.itemLine}>
                    <span>[ ] Kiện hàng sách tổng hợp</span>
                    <span>SL: x1</span>
                  </div>
                )}
              </div>

              {/* COD & Shipping Details */}
              <div className={styles.codSection}>
                <div>
                  <div className={styles.codTitle}>TIỀN THU NGƯỜI NHẬN (COD):</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chỉ thu đúng số tiền ghi trên phiếu</div>
                </div>
                <div className={styles.codAmount}>{formatCurrency(order.totalAmount)}</div>
              </div>

              {/* Instructions */}
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>* CHO XEM HÀNG - KHÔNG CHO THỬ</span>
                <span>Ngày tạo: {formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaybillPrintModal;
