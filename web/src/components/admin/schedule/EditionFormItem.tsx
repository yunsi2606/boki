'use client';

import { useState } from 'react';
import type { ReleaseEditionType, ReleaseScheduleStatus } from '@/types/schedule';
import type { CreateEditionPayload } from '@/services/scheduleService';
import type { Book } from '@/types';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import BookSearchSelector from './BookSearchSelector';
import styles from './editionFormItem.module.css';

interface EditionFormItemProps {
  index: number;
  edition: CreateEditionPayload;
  parentReleaseDate: string;
  parentPreOrderDate?: string;
  onChange: (updated: CreateEditionPayload) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function EditionFormItem({
  index,
  edition,
  parentReleaseDate,
  parentPreOrderDate,
  onChange,
  onRemove,
  canRemove,
}: EditionFormItemProps) {
  const [hasCustomDates, setHasCustomDates] = useState(
    Boolean(edition.releaseDate || edition.preOrderDate)
  );

  const handleToggleCustomDates = (checked: boolean) => {
    setHasCustomDates(checked);
    if (!checked) {
      onChange({
        ...edition,
        releaseDate: null,
        preOrderDate: null,
      });
    } else {
      onChange({
        ...edition,
        releaseDate: parentReleaseDate,
        preOrderDate: parentPreOrderDate || null,
      });
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.editionIndex}>#{index + 1}</span>
          <strong className={styles.headerTitle}>{edition.editionName || 'Phiên bản mới'}</strong>
        </div>
        {canRemove && (
          <button type="button" className={styles.removeBtn} onClick={onRemove}>
            Xóa bản này
          </button>
        )}
      </div>

      <div className={styles.fieldsGrid}>
        <div className={styles.fieldRow}>
          <div className={styles.formGroup} style={{ flex: 2 }}>
            <label>Tên phiên bản *</label>
            <input
              type="text"
              required
              value={edition.editionName}
              onChange={(e) => onChange({ ...edition, editionName: e.target.value })}
              placeholder="VD: Bản Thường, Bản Đặc Biệt..."
            />
          </div>

          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label>Loại ấn bản</label>
            <select
              value={edition.editionType || 'STANDARD'}
              onChange={(e) => onChange({ ...edition, editionType: e.target.value as ReleaseEditionType })}
            >
              <option value="STANDARD">Bản thường</option>
              <option value="SPECIAL">Bản đặc biệt</option>
              <option value="LIMITED">Bản giới hạn</option>
              <option value="BOXSET">Boxset</option>
            </select>
          </div>

          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label>Giá bìa (đ)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={edition.estimatedPrice ?? ''}
              onChange={(e) => onChange({ ...edition, estimatedPrice: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="VD: 75000"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Quà tặng kèm riêng của bản này</label>
          <input
            type="text"
            value={edition.gifts || ''}
            onChange={(e) => onChange({ ...edition, gifts: e.target.value })}
            placeholder="VD: Kèm 01 Standee Acrylic Gojo & Sukuna + Bookmark 2 mặt"
          />
        </div>

        <div className={styles.formGroup}>
          <ImageUploadInput
            label="Ảnh bìa riêng của bản này (tùy chọn nếu khác bìa chính)"
            value={edition.coverUrl || ''}
            onChange={(url) => onChange({ ...edition, coverUrl: url })}
            placeholder="Chọn hoặc kéo thả ảnh bìa riêng của bản này"
            helperText="Để trống sẽ tự động hiển thị theo ảnh bìa chính của đầu sách."
          />
        </div>

        {/* Custom Dates Option */}
        <div className={styles.customDateBox}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={hasCustomDates}
              onChange={(e) => handleToggleCustomDates(e.target.checked)}
            />
            <span>Tùy chỉnh ngày phát hành / pre-order riêng cho bản này</span>
          </label>

          {hasCustomDates ? (
            <div className={styles.dateInputsRow}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Ngày phát hành riêng</label>
                <input
                  type="date"
                  value={edition.releaseDate || ''}
                  onChange={(e) => onChange({ ...edition, releaseDate: e.target.value || null })}
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Ngày mở pre-order riêng</label>
                <input
                  type="date"
                  value={edition.preOrderDate || ''}
                  onChange={(e) => onChange({ ...edition, preOrderDate: e.target.value || null })}
                />
              </div>
            </div>
          ) : (
            <p className={styles.dateHint}>
              Đang kế thừa theo ngày của đầu sách ({parentReleaseDate})
            </p>
          )}
        </div>

        {/* Book search & linking */}
        <BookSearchSelector
          selectedBookId={edition.bookId || null}
          selectedBookTitle={null}
          onSelectBook={(book: Book) => onChange({ ...edition, bookId: book.id })}
          onUnlinkBook={() => onChange({ ...edition, bookId: null })}
        />
      </div>
    </div>
  );
}
