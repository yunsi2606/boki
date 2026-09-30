'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { BookVariant } from '@/types';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import styles from './VariantManagerModal.module.css';

interface VariantItemCardProps {
  variant: BookVariant;
  index: number;
  hasVariantImages: boolean;
  onUpdate: (id: string, updatedFields: Partial<BookVariant>) => void;
  onRemove: (id: string) => void;
}

export default function VariantItemCard({
  variant,
  index,
  hasVariantImages,
  onUpdate,
  onRemove,
}: VariantItemCardProps) {
  return (
    <div className={styles.variantItem}>
      <div className={styles.variantItemHeader}>
        <span className={styles.itemNum}>Phân loại #{index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(variant.id)}
          className={styles.removeBtn}
        >
          <Trash2 size={13} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
          Xóa phân loại
        </button>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Tên phân loại (VD: Bản Đặc Biệt)</label>
          <input
            type="text"
            required
            value={variant.name}
            onChange={(e) => onUpdate(variant.id, { name: e.target.value })}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mã SKU (tùy chọn)</label>
          <input
            type="text"
            value={variant.sku || ''}
            onChange={(e) => onUpdate(variant.id, { sku: e.target.value })}
            placeholder="SKU-001"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Giá bán (VNĐ)</label>
          <input
            type="number"
            required
            value={variant.price}
            onChange={(e) =>
              onUpdate(variant.id, { price: parseInt(e.target.value) || 0 })
            }
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Giá gốc / Bìa (VNĐ)</label>
          <input
            type="number"
            value={variant.originalPrice || 0}
            onChange={(e) =>
              onUpdate(variant.id, {
                originalPrice: parseInt(e.target.value) || 0,
              })
            }
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Số lượng tồn kho</label>
          <input
            type="number"
            required
            value={variant.stockQuantity}
            onChange={(e) =>
              onUpdate(variant.id, {
                stockQuantity: parseInt(e.target.value) || 0,
              })
            }
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Giới hạn mua / đơn (tùy chọn)</label>
          <input
            type="number"
            min="1"
            placeholder="Không giới hạn"
            value={variant.maxOrderQuantity ?? ''}
            onChange={(e) =>
              onUpdate(variant.id, {
                maxOrderQuantity: e.target.value ? Math.max(1, parseInt(e.target.value) || 0) : undefined,
              })
            }
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tag nhãn hiển thị (VD: Hot Edition)</label>
          <input
            type="text"
            value={variant.attributes?.['Tag'] || ''}
            onChange={(e) =>
              onUpdate(variant.id, {
                attributes: { ...variant.attributes, Tag: e.target.value },
              })
            }
            className={styles.formInput}
          />
        </div>

        {hasVariantImages && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <ImageUploadInput
              label={`Hình ảnh riêng cho "${variant.name}"`}
              value={variant.imageUrl || ''}
              onChange={(url) => onUpdate(variant.id, { imageUrl: url })}
              placeholder={`Tải ảnh đại diện riêng cho phân loại "${variant.name}"...`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
