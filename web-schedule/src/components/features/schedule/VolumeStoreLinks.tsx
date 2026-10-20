'use client';

import React from 'react';
import type { ReleaseStoreLinkItem, LinkedBookInfo } from '@/types/schedule';
import { PlatformLogo } from './PlatformLogo';
import styles from './volumeStoreLinks.module.css';

interface Props {
  bookTitle: string;
  basePrice?: number;
  linkedBook?: LinkedBookInfo | null;
  storeLinks?: ReleaseStoreLinkItem[];
}

function formatVnd(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

function getPlatformTitle(platform: string) {
  const upper = (platform || '').toUpperCase();
  if (upper.includes('SHOPEE')) return 'Shopee';
  if (upper.includes('TIKTOK')) return 'TikTok Shop';
  if (upper.includes('TIKI')) return 'Tiki';
  if (upper.includes('FAHASA')) return 'Fahasa';
  if (upper.includes('BOKI')) return 'Boki Store';
  return 'Đại lý';
}

function ExternalArrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.externalIcon}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function VolumeStoreLinks({ bookTitle, basePrice, linkedBook, storeLinks }: Props) {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
  const hasCustomLinks = storeLinks && storeLinks.length > 0;

  const defaultFallbacks = [
    {
      platform: 'SHOPEE',
      name: 'Shopee',
      url: `https://shopee.vn/search?keyword=${encodeURIComponent(bookTitle)}`,
    },
    {
      platform: 'TIKTOK_SHOP',
      name: 'TikTok Shop',
      url: `https://www.tiktok.com/search?q=${encodeURIComponent(bookTitle)}`,
    },
    {
      platform: 'FAHASA',
      name: 'Fahasa',
      url: `https://www.fahasa.com/catalogsearch/result/?q=${encodeURIComponent(bookTitle)}`,
    },
    {
      platform: 'TIKI',
      name: 'Tiki',
      url: `https://tiki.vn/search?q=${encodeURIComponent(bookTitle)}`,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.dockHeader}>
        <span className={styles.dockLabel}>Mua online & Sàn thương mại</span>
        <span className={styles.dockSubhint}>So sánh giá và ưu đãi sàn</span>
      </div>

      <div className={styles.chipsGrid}>
        {/* Boki Store Official Link */}
        {linkedBook && (
          <a
            href={`${storeUrl}/books/${linkedBook.slug || linkedBook.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.chip} ${styles.chipBoki}`}
            title="Mua trực tiếp trên sàn Boki Store"
          >
            <PlatformLogo platform="BOKI_STORE" size={20} />
            <span className={styles.chipPlatform}>Boki Store</span>
            <span className={styles.officialBadge}>Chính hãng</span>
            <span className={styles.chipPrice}>{formatVnd(linkedBook.price)}</span>
            <ExternalArrow />
          </a>
        )}

        {/* Custom Admin Configured Store Links */}
        {hasCustomLinks
          ? storeLinks.map((store) => {
              const discount =
                basePrice && store.marketPrice && store.marketPrice < basePrice
                  ? Math.round(((basePrice - store.marketPrice) / basePrice) * 100)
                  : 0;

              return (
                <a
                  key={store.id || store.productUrl}
                  href={store.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.chip}
                  title={store.storeName || getPlatformTitle(store.platform)}
                >
                  <PlatformLogo platform={store.platform} size={20} />
                  <span className={styles.chipPlatform}>{getPlatformTitle(store.platform)}</span>
                  {store.storeName && (
                    <span className={styles.chipStoreName}>{store.storeName}</span>
                  )}
                  {store.marketPrice ? (
                    <span className={styles.chipPrice}>{formatVnd(store.marketPrice)}</span>
                  ) : (
                    <span className={styles.chipPrice}>Xem giá</span>
                  )}
                  {discount > 0 && <span className={styles.discountBadge}>-{discount}%</span>}
                  <ExternalArrow />
                </a>
              );
            })
          : defaultFallbacks.map((fb) => (
              <a
                key={fb.platform}
                href={fb.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chip}
              >
                <PlatformLogo platform={fb.platform} size={20} />
                <span className={styles.chipPlatform}>{fb.name}</span>
                <span className={styles.chipPrice}>Xem giá sàn</span>
                <ExternalArrow />
              </a>
            ))}
      </div>
    </div>
  );
}
