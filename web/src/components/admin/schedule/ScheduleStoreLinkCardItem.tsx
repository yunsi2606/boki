'use client';

import React from 'react';
import type { ReleaseStoreLinkItem } from '@/types/schedule';
import styles from './scheduleStoreLinksSection.module.css';

interface Props {
  index: number;
  totalCount: number;
  link: ReleaseStoreLinkItem;
  isChecking: boolean;
  status?: { text: string; success: boolean };
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onUpdate: (updated: ReleaseStoreLinkItem) => void;
  onRemove: () => void;
  onCheckPrice: (url: string) => void;
}

export function ScheduleStoreLinkCardItem({
  index,
  totalCount,
  link,
  isChecking,
  status,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onMove,
  onUpdate,
  onRemove,
  onCheckPrice,
}: Props) {
  const isShopee = (link.platform || '').toUpperCase() === 'SHOPEE';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`${styles.linkCard} ${isDragging ? styles.isDragging : ''} ${
        isDragOver ? styles.isDragOver : ''
      }`}
    >
      {/* Drag & Order Bar */}
      <div className={styles.cardHeaderBar}>
        <div className={styles.dragHandle} title="Kéo thả để sắp xếp thứ tự hiển thị">
          <span className={styles.dragGripIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="5" r="1.5" fill="currentColor" />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="9" cy="19" r="1.5" fill="currentColor" />
              <circle cx="15" cy="5" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className={styles.orderBadge}>Vị trí #{index + 1}</span>
          <span className={styles.dragHint}>Kéo thả để đổi chỗ</span>
        </div>

        <div className={styles.orderControls}>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            className={styles.orderBtn}
            title="Di chuyển lên trên"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            type="button"
            disabled={index === totalCount - 1}
            onClick={() => onMove(index, index + 1)}
            className={styles.orderBtn}
            title="Di chuyển xuống dưới"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onRemove}
            title="Xóa liên kết này"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.rowTop}>
        <select
          className={styles.select}
          value={link.platform || 'SHOPEE'}
          onChange={(e) =>
            onUpdate({
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
          onChange={(e) => onUpdate({ ...link, storeName: e.target.value })}
        />
      </div>

      <div className={styles.rowBottom}>
        <input
          type="url"
          className={styles.input}
          placeholder="URL sản phẩm / Affiliate URL"
          value={link.productUrl || ''}
          onChange={(e) => onUpdate({ ...link, productUrl: e.target.value })}
        />

        <input
          type="number"
          className={styles.input}
          placeholder="Giá thực tế (VND)"
          value={link.marketPrice ?? ''}
          onChange={(e) =>
            onUpdate({
              ...link,
              marketPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />

        {isShopee && (
          <button
            type="button"
            className={styles.checkPriceBtn}
            disabled={isChecking}
            onClick={() => onCheckPrice(link.productUrl)}
          >
            {isChecking ? 'Đang check...' : 'Check giá Shopee'}
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
}
