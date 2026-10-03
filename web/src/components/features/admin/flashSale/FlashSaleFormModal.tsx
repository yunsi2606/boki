'use client';

import { useState, useEffect } from 'react';
import { Zap, X, Plus, Loader2 } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { flashSaleService } from '@/services/flashSaleService';
import type { Book } from '@/types';
import type { FlashSale } from '@/types/flashSale';
import FlashSaleItemsTable, { type FormItem } from './FlashSaleItemsTable';
import styles from './FlashSaleFormModal.module.css';

interface FlashSaleFormModalProps {
  sale?: FlashSale | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FlashSaleFormModal({
  sale,
  onClose,
  onSaved,
}: FlashSaleFormModalProps) {
  const [name, setName] = useState(sale?.name || '');
  const [description, setDescription] = useState(sale?.description || '');
  const [bannerUrl, setBannerUrl] = useState(sale?.bannerUrl || '');
  const [startTime, setStartTime] = useState(
    sale?.startTime ? sale.startTime.substring(0, 16) : ''
  );
  const [endTime, setEndTime] = useState(
    sale?.endTime ? sale.endTime.substring(0, 16) : ''
  );
  const [items, setItems] = useState<FormItem[]>(
    sale?.items?.map((it) => ({
      bookId: it.bookId,
      bookTitle: it.bookTitle,
      bookImage: it.bookImageUrl,
      originalPrice: it.originalPrice,
      flashSalePrice: it.flashSalePrice,
      quantityLimit: it.quantityLimit,
      userLimit: it.userLimit,
    })) || []
  );

  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bookService.searchBooks().then((b) => setAvailableBooks(b || [])).catch(console.error);
  }, []);

  const handleAddBook = () => {
    if (!selectedBookId) return;
    const found = availableBooks.find((b) => b.id === selectedBookId);
    if (!found) return;

    if (items.some((it) => it.bookId === selectedBookId)) {
      alert('Sách này đã được thêm vào chiến dịch!');
      return;
    }

    const regPrice = found.price || 100000;
    const discounted = Math.round(regPrice * 0.7);

    setItems((prev) => [
      ...prev,
      {
        bookId: found.id,
        bookTitle: found.title,
        bookImage: found.imageUrls?.[0] || '',
        originalPrice: regPrice,
        flashSalePrice: discounted,
        quantityLimit: 10,
        userLimit: 1,
      },
    ]);
    setSelectedBookId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Vui lòng nhập tên chiến dịch');
    if (!startTime || !endTime) return setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
    if (new Date(endTime) <= new Date(startTime)) {
      return setError('Thời gian kết thúc phải sau thời gian bắt đầu');
    }
    if (items.length === 0) return setError('Vui lòng thêm ít nhất 1 sản phẩm');

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        description: description || undefined,
        bannerUrl: bannerUrl || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        items: items.map((it) => ({
          bookId: it.bookId,
          originalPrice: it.originalPrice,
          flashSalePrice: it.flashSalePrice,
          quantityLimit: it.quantityLimit,
          userLimit: it.userLimit,
        })),
      };

      if (sale?.id) {
        await flashSaleService.updateFlashSale(sale.id, payload);
      } else {
        await flashSaleService.createFlashSale(payload);
      }
      onSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu chiến dịch';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <Zap size={20} color="#ee4d2d" strokeWidth={2.2} />
            {sale ? 'Chỉnh Sửa Chiến Dịch Flash Sale' : 'Tạo Chiến Dịch Flash Sale Mới'}
          </h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Tên chiến dịch *</label>
            <input
              type="text"
              required
              placeholder="VD: Flash Sale Giờ Vàng 12h - 14h"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Thời gian bắt đầu *</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Thời gian kết thúc *</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <label className={styles.label}>Sản phẩm trong Flash Sale ({items.length})</label>
              <div className={styles.addItemRow}>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className={styles.select}
                  style={{ width: 260 }}
                >
                  <option value="">-- Chọn sách để thêm --</option>
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({new Intl.NumberFormat('vi-VN').format(b.price || 0)}đ)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddBook}
                  className={styles.submitBtn}
                  style={{ padding: '7px 12px' }}
                >
                  <Plus size={16} /> Thêm
                </button>
              </div>
            </div>

            <FlashSaleItemsTable
              items={items}
              onRemoveItem={(i) => setItems((p) => p.filter((_, idx) => idx !== i))}
              onUpdateItem={(i, f) => {
                setItems((p) => {
                  const copy = [...p];
                  copy[i] = { ...copy[i], ...f };
                  return copy;
                });
              }}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Hủy
            </button>
            <button type="submit" disabled={saving} className={styles.submitBtn}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {sale ? 'Cập Nhật' : 'Tạo Chiến Dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
