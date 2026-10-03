'use client';

import { Trash2 } from 'lucide-react';
import type { FlashSaleItemInput } from '@/types/flashSale';
import styles from './FlashSaleFormModal.module.css';

export interface FormItem extends FlashSaleItemInput {
  bookTitle?: string;
  bookImage?: string;
}

interface FlashSaleItemsTableProps {
  items: FormItem[];
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, fields: Partial<FormItem>) => void;
}

export default function FlashSaleItemsTable({
  items,
  onRemoveItem,
  onUpdateItem,
}: FlashSaleItemsTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <table className={styles.itemsTable}>
      <thead>
        <tr>
          <th>Sách</th>
          <th style={{ width: 130 }}>Giá Flash Sale</th>
          <th style={{ width: 90 }}>Số lượng</th>
          <th style={{ width: 90 }}>Giới hạn/khách</th>
          <th style={{ width: 40 }}></th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, idx) => (
          <tr key={it.bookId}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {it.bookImage && (
                  <img src={it.bookImage} alt="" className={styles.itemThumb} />
                )}
                <span style={{ fontWeight: 600 }}>{it.bookTitle || it.bookId}</span>
              </div>
            </td>
            <td>
              <input
                type="number"
                className={styles.numInput}
                value={it.flashSalePrice}
                onChange={(e) =>
                  onUpdateItem(idx, { flashSalePrice: Number(e.target.value) })
                }
              />
            </td>
            <td>
              <input
                type="number"
                className={styles.numInput}
                value={it.quantityLimit}
                onChange={(e) =>
                  onUpdateItem(idx, { quantityLimit: Number(e.target.value) })
                }
              />
            </td>
            <td>
              <input
                type="number"
                className={styles.numInput}
                value={it.userLimit}
                onChange={(e) =>
                  onUpdateItem(idx, { userLimit: Number(e.target.value) })
                }
              />
            </td>
            <td>
              <button
                type="button"
                onClick={() => onRemoveItem(idx)}
                className={styles.deleteItemBtn}
                title="Xóa khỏi danh sách"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
