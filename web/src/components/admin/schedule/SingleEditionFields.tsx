'use client';

import type { CreateEditionPayload } from '@/services/scheduleService';
import type { Book } from '@/types';
import BookSearchSelector from './BookSearchSelector';
import styles from './singleEditionFields.module.css';

interface SingleEditionFieldsProps {
  edition: CreateEditionPayload;
  onChange: (updated: Partial<CreateEditionPayload>) => void;
  onEnableMultipleEditions: () => void;
}

export default function SingleEditionFields({
  edition,
  onChange,
  onEnableMultipleEditions,
}: SingleEditionFieldsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>2. Giá bán, quà tặng & liên kết sản phẩm</span>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label>Giá bìa niêm yết (đ)</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={edition.estimatedPrice ?? ''}
            onChange={(e) =>
              onChange({
                estimatedPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="VD: 55000"
          />
        </div>

        <div className={styles.formGroup} style={{ flex: 2 }}>
          <label>Quà tặng kèm theo (nếu có)</label>
          <input
            type="text"
            value={edition.gifts || ''}
            onChange={(e) => onChange({ gifts: e.target.value })}
            placeholder="VD: Tặng kèm 01 Bookmark hai mặt hoặc Obi..."
          />
        </div>
      </div>

      <BookSearchSelector
        selectedBookId={edition.bookId || null}
        selectedBookTitle={null}
        onSelectBook={(book: Book) => onChange({ bookId: book.id })}
        onUnlinkBook={() => onChange({ bookId: null })}
      />

      <div className={styles.multiEditionsBanner}>
        <div className={styles.multiEditionsInfo}>
          <span className={styles.multiEditionsTitle}>
            Tác phẩm có nhiều phiên bản phát hành?
          </span>
          <span className={styles.multiEditionsSub}>
            Tách thêm Bản Đặc Biệt, Bản Giới Hạn hoặc Boxset với quà tặng & giá bìa riêng biệt.
          </span>
        </div>
        <button
          type="button"
          className={styles.enableMultiBtn}
          onClick={onEnableMultipleEditions}
        >
          Thêm phiên bản khác
        </button>
      </div>
    </div>
  );
}
