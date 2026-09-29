'use client';

import React, { useState, useMemo } from 'react';
import type { Book, Category, CreateComboPayload } from '@/types';
import { Package, X, Loader2 } from 'lucide-react';
import { comboService } from '@/services/comboService';
import ComboItemPickerModal, { SelectedComboItem } from './ComboItemPickerModal';
import ComboItemsEditor from './ComboItemsEditor';
import ComboSavingsSummary from './ComboSavingsSummary';
import styles from './adminComboCreateModal.module.css';

interface Props {
  isOpen: boolean;
  books: Book[];
  categories: Category[];
  onClose: () => void;
  onSuccess: (newCombo: Book) => void;
}

export default function AdminComboCreateModal({
  isOpen,
  books,
  categories,
  onClose,
  onSuccess,
}: Props) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [items, setItems] = useState<SelectedComboItem[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(categories[0]?.id);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [comboPrice, setComboPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const originalTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const { savingsAmount, savingsPercent } = useMemo(() => {
    const savings = originalTotal - comboPrice;
    if (savings > 0 && originalTotal > 0) {
      return {
        savingsAmount: savings,
        savingsPercent: Math.round((savings / originalTotal) * 100),
      };
    }
    return { savingsAmount: 0, savingsPercent: 0 };
  }, [originalTotal, comboPrice]);

  if (!isOpen) return null;

  const handleSelectItem = (item: SelectedComboItem) => {
    setItems((prev) => [...prev, item]);
    if (!coverUrl && item.coverImage) {
      setCoverUrl(item.coverImage);
    }
    setIsPickerOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên Combo');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Vui lòng thêm ít nhất một sản phẩm lẻ vào combo');
      return;
    }
    if (comboPrice <= 0) {
      setErrorMsg('Vui lòng nhập giá bán combo hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const payload: CreateComboPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId,
        price: comboPrice,
        stockQuantity: stockQuantity,
        imageUrls: coverUrl ? [coverUrl] : undefined,
        items: items.map((it, idx) => ({
          singleBookId: it.singleBookId,
          variantId: it.variantId || null,
          quantity: it.quantity,
          sortOrder: idx,
        })),
      };

      const created = await comboService.createCombo(payload);
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo combo';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Package size={20} />
              <span>Tạo Combo Sách Tiết Kiệm</span>
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContent}>
            {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</div>}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tên Combo <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="VD: Bộ Combo Doraemon Toàn Tập (Tập 1 - 5)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Danh mục</label>
                <select
                  className={styles.select}
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(Number(e.target.value) || undefined)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ảnh bìa Combo (URL)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="https://... hoặc tự lấy từ sản phẩm lẻ"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
              </div>
            </div>

            <ComboItemsEditor
              items={items}
              onOpenPicker={() => setIsPickerOpen(true)}
              onRemoveItem={handleRemoveItem}
            />

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Giá bán Combo (đ) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className={styles.input}
                  placeholder="Nhập giá ưu đãi combo..."
                  value={comboPrice || ''}
                  onChange={(e) => setComboPrice(Number(e.target.value) || 0)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Số lượng trong kho</label>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  placeholder="Để trống để tự tính theo kho lẻ"
                  value={stockQuantity !== undefined ? stockQuantity : ''}
                  onChange={(e) =>
                    setStockQuantity(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>
            </div>

            <ComboSavingsSummary
              originalTotal={originalTotal}
              comboPrice={comboPrice}
              savingsAmount={savingsAmount}
              savingsPercent={savingsPercent}
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Mô tả combo</label>
              <textarea
                rows={3}
                className={styles.textarea}
                placeholder="Mô tả các ưu điểm khi mua combo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                Tạo Combo
              </button>
            </div>
          </form>
        </div>
      </div>

      <ComboItemPickerModal
        isOpen={isPickerOpen}
        books={books}
        selectedItems={items}
        onSelect={handleSelectItem}
        onClose={() => setIsPickerOpen(false)}
      />
    </>
  );
}
