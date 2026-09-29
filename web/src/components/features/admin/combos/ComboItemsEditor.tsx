'use client';

import React from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import type { SelectedComboItem } from './ComboItemPickerModal';
import styles from './adminComboCreateModal.module.css';

interface Props {
  items: SelectedComboItem[];
  onOpenPicker: () => void;
  onRemoveItem: (index: number) => void;
}

export default function ComboItemsEditor({
  items,
  onOpenPicker,
  onRemoveItem,
}: Props) {
  return (
    <div className={styles.itemsSection}>
      <div className={styles.itemsHeader}>
        <div className={styles.itemsTitle}>
          <Layers size={18} />
          <span>Sản phẩm trong Combo ({items.length})</span>
        </div>
        <button
          type="button"
          className={styles.addItemBtn}
          onClick={onOpenPicker}
        >
          <Plus size={14} /> Thêm sản phẩm lẻ
        </button>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyItems}>
          Chưa có sản phẩm nào. Nhấn &quot;Thêm sản phẩm lẻ&quot; để chọn sách hoặc phân loại.
        </div>
      ) : (
        <div className={styles.itemList}>
          {items.map((it, idx) => (
            <div key={`${it.singleBookId}_${it.variantId || 'base'}_${idx}`} className={styles.itemCard}>
              <div className={styles.itemInfo}>
                {it.coverImage && (
                  <img src={it.coverImage} alt={it.title} className={styles.itemCover} />
                )}
                <div className={styles.itemDetails}>
                  <div className={styles.itemTitle}>
                    {it.title}
                    {it.variantName && (
                      <span className={styles.variantTag}>{it.variantName}</span>
                    )}
                  </div>
                  <div className={styles.itemPrice}>
                    {it.price.toLocaleString('vi-VN')}đ / sp • {it.author}
                  </div>
                </div>
              </div>
              <div className={styles.itemActions}>
                <span className={styles.qtyTag}>x{it.quantity}</span>
                <button
                  type="button"
                  className={styles.deleteItemBtn}
                  onClick={() => onRemoveItem(idx)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
