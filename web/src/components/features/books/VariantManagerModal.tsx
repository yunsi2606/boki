'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Plus } from 'lucide-react';
import type { BookVariant } from '@/types';
import VariantItemCard from './VariantItemCard';
import styles from './VariantManagerModal.module.css';

interface VariantManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookId: string;
  initialVariants?: BookVariant[];
  onSaveVariants: (variants: BookVariant[]) => void;
}

export default function VariantManagerModal({
  isOpen,
  onClose,
  bookTitle,
  bookId,
  initialVariants = [],
  onSaveVariants,
}: VariantManagerModalProps) {
  const [variants, setVariants] = useState<BookVariant[]>(initialVariants);
  const [hasVariantImages, setHasVariantImages] = useState<boolean>(
    initialVariants.some((v) => Boolean(v.imageUrl))
  );

  useEffect(() => {
    if (isOpen) {
      if (initialVariants && initialVariants.length > 0) {
        setVariants(initialVariants);
        setHasVariantImages(initialVariants.some((v) => Boolean(v.imageUrl)));
      } else {
        setVariants([
          {
            id: `v_${Date.now()}_1`,
            bookId,
            name: 'Bản Thường',
            price: 95000,
            originalPrice: 120000,
            stockQuantity: 20,
            imageUrl: '',
          },
          {
            id: `v_${Date.now()}_2`,
            bookId,
            name: 'Bản Đặc Biệt',
            price: 145000,
            originalPrice: 180000,
            stockQuantity: 10,
            imageUrl: '',
            attributes: { Tag: 'Hot Edition' },
          },
        ]);
        setHasVariantImages(false);
      }
    }
  }, [isOpen, bookId, initialVariants]);

  if (!isOpen) return null;

  const handleAddVariant = () => {
    const newVariant: BookVariant = {
      id: `v_${Date.now()}`,
      bookId,
      name: 'Phân loại mới',
      price: 100000,
      originalPrice: 120000,
      stockQuantity: 15,
      imageUrl: '',
    };
    setVariants([...variants, newVariant]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('Phải có ít nhất 1 phân loại hàng.');
      return;
    }
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (id: string, updatedFields: Partial<BookVariant>) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
  };

  const handleSave = () => {
    if (hasVariantImages) {
      const missingImage = variants.some((v) => !v.imageUrl || !v.imageUrl.trim());
      if (missingImage) {
        alert('Khi bật chế độ "Tải hình ảnh riêng", TẤT CẢ các phân loại đều phải được tải hình ảnh đại diện riêng. Vui lòng chọn ảnh cho tất cả phân loại hoặc tắt chế độ ảnh riêng!');
        return;
      }
    }

    const finalVariants = hasVariantImages
      ? variants
      : variants.map((v) => ({ ...v, imageUrl: '' }));
    onSaveVariants(finalVariants);
    onClose();
  };

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Quản Lý Phân Loại Hàng: {bookTitle}</h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.stockSummaryBanner}>
            <div className={styles.stockSummaryLeft}>
              <div className={styles.stockSummaryIcon}>
                <Package size={20} />
              </div>
              <div>
                <div className={styles.stockSummaryTitle}>Tổng tồn kho của sách</div>
                <div className={styles.stockSummarySubtitle}>
                  Tự động đồng bộ và cộng dồn từ {variants.length} phân loại hàng
                </div>
              </div>
            </div>
            <div className={styles.stockSummaryValue}>
              {totalStock} cuốn
            </div>
          </div>

          <div className={styles.imageModeToggle}>
            <label className={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={hasVariantImages}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setHasVariantImages(checked);
                  if (!checked) {
                    setVariants(variants.map((v) => ({ ...v, imageUrl: '' })));
                  }
                }}
              />
              <span>
                Tải hình ảnh riêng cho từng phân loại (Nếu tắt, các phân loại sẽ dùng ảnh bìa chính của sách)
              </span>
            </label>
          </div>

          <div className={styles.variantList}>
            {variants.map((v, idx) => (
              <VariantItemCard
                key={v.id}
                variant={v}
                index={idx}
                hasVariantImages={hasVariantImages}
                onUpdate={handleUpdateVariant}
                onRemove={handleRemoveVariant}
              />
            ))}
          </div>

          <button type="button" onClick={handleAddVariant} className={styles.addBtn}>
            <Plus size={16} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
            Thêm Phân Loại Hàng Mới
          </button>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Hủy bỏ
          </button>
          <button type="button" onClick={handleSave} className={styles.saveBtn}>
            Lưu Tất Cả Phân Loại
          </button>
        </div>
      </div>
    </div>
  );
}
