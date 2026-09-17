'use client';

import { useState } from 'react';
import type { Book, BookVariant } from '@/types';
import styles from './QuickVariantSelectModal.module.css';

interface QuickVariantSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onConfirmAddToCart: (book: Book, variant: BookVariant) => void;
}

export default function QuickVariantSelectModal({
  isOpen,
  onClose,
  book,
  onConfirmAddToCart,
}: QuickVariantSelectModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<BookVariant | null>(
    book?.variants?.[0] || null
  );

  if (!isOpen || !book || !book.variants || book.variants.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const activeVariant = selectedVariant || book.variants[0];
  const coverUrl = activeVariant.imageUrl || book.imageUrls?.[0] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300';

  const handleConfirm = () => {
    onConfirmAddToCart(book, activeVariant);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Chọn Phân Loại Hàng</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.productPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt={book.title} className={styles.coverImg} />
          <div className={styles.productMeta}>
            <h4 className={styles.bookTitle}>{book.title}</h4>
            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(activeVariant.price)}</span>
              {activeVariant.originalPrice && activeVariant.originalPrice > activeVariant.price && (
                <span className={styles.originalPrice}>{formatPrice(activeVariant.originalPrice)}</span>
              )}
            </div>
            <span className={activeVariant.stockQuantity > 0 ? styles.stockOk : styles.stockEmpty}>
              {activeVariant.stockQuantity > 0 ? `Còn ${activeVariant.stockQuantity} sản phẩm` : 'Hết hàng'}
            </span>
          </div>
        </div>

        <div className={styles.variantsSection}>
          <label className={styles.sectionLabel}>Phiên bản / Phân loại ({book.variants.length}):</label>
          <div className={styles.variantList}>
            {book.variants.map((v) => {
              const isSelected = activeVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`${styles.variantOption} ${isSelected ? styles.selected : ''}`}
                >
                  <span className={styles.variantName}>{v.name}</span>
                  <span className={styles.variantPrice}>{formatPrice(v.price)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>Hủy bỏ</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={activeVariant.stockQuantity === 0}
            className={styles.addBtn}
          >
            🛒 Thêm Vào Giỏ Hàng
          </button>
        </div>
      </div>
    </div>
  );
}
