'use client';

import React, { useState } from 'react';
import type { ReleaseStoreLinkItem } from '@/types/schedule';
import { scheduleService } from '@/services/scheduleService';
import styles from './scheduleStoreLinksSection.module.css';

interface Props {
  storeLinks: ReleaseStoreLinkItem[];
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink: (index: number, updated: ReleaseStoreLinkItem) => void;
}

export function ScheduleStoreLinksSection({
  storeLinks,
  onAddLink,
  onRemoveLink,
  onUpdateLink,
}: Props) {
  const [checkingIdx, setCheckingIdx] = useState<number | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, { text: string; success: boolean }>>({});

  const handleCheckPrice = async (idx: number, url: string) => {
    if (!url || !url.trim()) {
      setStatusMap((prev) => ({ ...prev, [idx]: { text: 'Vui lòng nhập link trước khi check giá', success: false } }));
      return;
    }

    try {
      setCheckingIdx(idx);
      setStatusMap((prev) => ({ ...prev, [idx]: { text: 'Đang kiểm tra...', success: true } }));
      const res = await scheduleService.checkShopeePrice(url);

      if (res.success && typeof res.price === 'number') {
        const foundPrice = res.price;
        onUpdateLink(idx, {
          ...storeLinks[idx],
          marketPrice: foundPrice,
          storeName: storeLinks[idx].storeName || res.storeName || 'Gian hàng Shopee',
        });
        setStatusMap((prev) => ({
          ...prev,
          [idx]: {
            text: `Đã tìm thấy giá: ${new Intl.NumberFormat('vi-VN').format(foundPrice)}đ`,
            success: true,
          },
        }));
      } else {
        setStatusMap((prev) => ({
          ...prev,
          [idx]: {
            text: res.message || 'Không thể crawl tự động, bạn có thể nhập giá tay',
            success: false,
          },
        }));
      }
    } catch {
      setStatusMap((prev) => ({
        ...prev,
        [idx]: { text: 'Lỗi khi gọi API kiểm tra giá', success: false },
      }));
    } finally {
      setCheckingIdx(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Liên kết sàn thương mại & Affiliate</span>
        </div>
        <button type="button" onClick={onAddLink} className={styles.addBtn}>
          Thêm liên kết sàn
        </button>
      </div>

      {storeLinks.length === 0 ? (
        <div className={styles.emptyHint}>
          Chưa cấu hình liên kết sàn. Hệ thống sẽ tự động dùng link tìm kiếm thông minh Shopee/TikTok/Tiki/Fahasa theo tên sách.
        </div>
      ) : (
        <div className={styles.linksList}>
          {storeLinks.map((link, idx) => {
            const isShopee = (link.platform || '').toUpperCase() === 'SHOPEE';
            const status = statusMap[idx];

            return (
              <div key={idx} className={styles.linkCard}>
                <div className={styles.rowTop}>
                  <select
                    className={styles.select}
                    value={link.platform || 'SHOPEE'}
                    onChange={(e) =>
                      onUpdateLink(idx, {
                        ...link,
                        platform: e.target.value as ReleaseStoreLinkItem['platform'],
                      })
                    }
                  >
                    <option value="SHOPEE">Shopee</option>
                    <option value="TIKTOK_SHOP">TikTok Shop</option>
                    <option value="TIKI">Tiki</option>
                    <option value="FAHASA">Fahasa</option>
                    <option value="BOKI_STORE">Boki Store</option>
                    <option value="OTHER">Đại lý / Sàn khác</option>
                  </select>

                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Tên gian hàng (VD: Kim Đồng Official, Gian hàng IPM...)"
                    value={link.storeName || ''}
                    onChange={(e) => onUpdateLink(idx, { ...link, storeName: e.target.value })}
                  />

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => onRemoveLink(idx)}
                    title="Xóa liên kết này"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                <div className={styles.rowBottom}>
                  <input
                    type="url"
                    className={styles.input}
                    placeholder="URL sản phẩm / Affiliate URL"
                    value={link.productUrl || ''}
                    onChange={(e) => onUpdateLink(idx, { ...link, productUrl: e.target.value })}
                  />

                  <input
                    type="number"
                    className={styles.input}
                    placeholder="Giá thực tế (VND)"
                    value={link.marketPrice ?? ''}
                    onChange={(e) =>
                      onUpdateLink(idx, {
                        ...link,
                        marketPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />

                  {isShopee && (
                    <button
                      type="button"
                      className={styles.checkPriceBtn}
                      disabled={checkingIdx === idx}
                      onClick={() => handleCheckPrice(idx, link.productUrl)}
                    >
                      {checkingIdx === idx ? 'Đang check...' : 'Check giá Shopee'}
                    </button>
                  )}
                </div>

                {status && (
                  <div
                    className={`${styles.statusMessage} ${
                      status.success ? styles.statusSuccess : styles.statusError
                    }`}
                  >
                    {status.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
