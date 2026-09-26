'use client';

import React, { useState } from 'react';
import type { BookVariant } from '@/types';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
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

  React.useEffect(() => {
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
            isStandaloneDisplay: false,
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
            isStandaloneDisplay: true,
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
      isStandaloneDisplay: true,
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
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {/* Real-time Synchronized Inventory Banner */}
          <div className={styles.stockSummaryBanner}>
            <div className={styles.stockSummaryLeft}>
              <div className={styles.stockSummaryIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
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
              <div key={v.id} className={styles.variantItem}>
                <div className={styles.variantItemHeader}>
                  <span className={styles.itemNum}>Phân loại #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id)}
                    className={styles.removeBtn}
                  >
                    ✕ Xóa phân loại
                  </button>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Tên phân loại (VD: Bản Đặc Biệt)</label>
                    <input
                      type="text"
                      required
                      value={v.name}
                      onChange={(e) => handleUpdateVariant(v.id, { name: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Mã SKU (tùy chọn)</label>
                    <input
                      type="text"
                      value={v.sku || ''}
                      onChange={(e) => handleUpdateVariant(v.id, { sku: e.target.value })}
                      placeholder="SKU-001"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Giá bán (VNĐ)</label>
                    <input
                      type="number"
                      required
                      value={v.price}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, { price: parseInt(e.target.value) || 0 })
                      }
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Giá gốc / Bìa (VNĐ)</label>
                    <input
                      type="number"
                      value={v.originalPrice || 0}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, {
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
                      value={v.stockQuantity}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, {
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
                      value={v.maxOrderQuantity ?? ''}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, {
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
                      value={v.attributes?.['Tag'] || ''}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, {
                          attributes: { ...v.attributes, Tag: e.target.value },
                        })
                      }
                      className={styles.formInput}
                    />
                  </div>

                  {hasVariantImages && (
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <ImageUploadInput
                        label={`Hình ảnh riêng cho "${v.name}"`}
                        value={v.imageUrl || ''}
                        onChange={(url) => handleUpdateVariant(v.id, { imageUrl: url })}
                        placeholder={`Tải ảnh đại diện riêng cho phân loại "${v.name}"...`}
                      />
                    </div>
                  )}

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        checked={v.isStandaloneDisplay ?? true}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, {
                            isStandaloneDisplay: e.target.checked,
                          })
                        }
                      />
                      <span>
                        Hiển thị phân loại này thành 1 sản phẩm riêng biệt ở trang chủ & danh mục
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddVariant} className={styles.addBtn}>
            + Thêm Phân Loại Hàng Mới
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
