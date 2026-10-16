'use client';

import Link from 'next/link';
import type { ReleaseStoreLinkItem, LinkedBookInfo } from '@/types/schedule';
import styles from './volumeStoreLinks.module.css';

interface Props {
  bookTitle: string;
  linkedBook?: LinkedBookInfo | null;
  storeLinks?: ReleaseStoreLinkItem[];
}

export function VolumeStoreLinks({ bookTitle, linkedBook, storeLinks }: Props) {
  return (
    <div className={styles.storeLinksGrid}>
      {linkedBook && (
        <Link
          href={`/books/${linkedBook.slug || linkedBook.id}`}
          className={`${styles.storeCard} ${styles.storeCardBoki}`}
        >
          <div>
            <div className={styles.storeName}>Boki Store (Chính Hãng)</div>
            <div className={styles.storeSubtext}>Giao nhanh, bọc cẩn thận</div>
          </div>
          <div className={styles.storePrice}>Mua ngay</div>
        </Link>
      )}

      {storeLinks && storeLinks.length > 0 ? (
        storeLinks.map((store) => (
          <a
            key={store.id || store.productUrl}
            href={store.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.storeCard}
          >
            <div>
              <div className={styles.storeName}>{store.storeName || store.platform}</div>
              <div className={styles.storeSubtext}>Gian hàng phân phối</div>
            </div>
            <div className={styles.storePrice}>
              {store.marketPrice
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(store.marketPrice)
                : 'Xem giá'}
            </div>
          </a>
        ))
      ) : (
        <>
          <a
            href={`https://shopee.vn/search?keyword=${encodeURIComponent(bookTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.storeCard}
          >
            <div>
              <div className={styles.storeName}>Shopee</div>
              <div className={styles.storeSubtext}>Tìm trên sàn Shopee</div>
            </div>
            <div className={styles.storePrice}>Xem giá</div>
          </a>
          <a
            href={`https://www.tiktok.com/search?q=${encodeURIComponent(bookTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.storeCard}
          >
            <div>
              <div className={styles.storeName}>TikTok Shop</div>
              <div className={styles.storeSubtext}>Tìm trên TikTok Shop</div>
            </div>
            <div className={styles.storePrice}>Xem giỏ hàng</div>
          </a>
        </>
      )}
    </div>
  );
}
