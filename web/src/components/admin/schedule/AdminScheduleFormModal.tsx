'use client';

import { useState, useEffect } from 'react';
import type { ReleaseScheduleItem, ReleaseEditionType, ReleaseScheduleStatus } from '@/types/schedule';
import type { CreateSchedulePayload } from '@/services/scheduleService';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import styles from './adminScheduleFormModal.module.css';

interface AdminScheduleFormModalProps {
  initialItem?: ReleaseScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSchedulePayload) => Promise<void>;
}

export default function AdminScheduleFormModal({
  initialItem,
  isOpen,
  onClose,
  onSubmit,
}: AdminScheduleFormModalProps) {
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [publisher, setPublisher] = useState('Kim Đồng');
  const [author, setAuthor] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | undefined>();
  const [editionType, setEditionType] = useState<ReleaseEditionType>('STANDARD');
  const [gifts, setGifts] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ReleaseScheduleStatus>('SCHEDULED');
  const [bookId, setBookId] = useState<string | null>(null);

  // Book search for linking
  const [searchBookTerm, setSearchBookTerm] = useState('');
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setOriginalTitle(initialItem.originalTitle || '');
      setPublisher(initialItem.publisher || 'Kim Đồng');
      setAuthor(initialItem.author || '');
      setReleaseDate(initialItem.releaseDate || '');
      setEstimatedPrice(initialItem.estimatedPrice);
      setEditionType(initialItem.editionType || 'STANDARD');
      setGifts(initialItem.gifts || '');
      setCoverUrl(initialItem.coverUrl || '');
      setDescription(initialItem.description || '');
      setStatus(initialItem.status || 'SCHEDULED');
      setBookId(initialItem.bookId || null);
      setSelectedBookTitle(initialItem.linkedBook?.title || null);
    } else {
      setTitle('');
      setOriginalTitle('');
      setPublisher('Kim Đồng');
      setAuthor('');
      setReleaseDate(new Date().toISOString().slice(0, 10));
      setEstimatedPrice(undefined);
      setEditionType('STANDARD');
      setGifts('');
      setCoverUrl('');
      setDescription('');
      setStatus('SCHEDULED');
      setBookId(null);
      setSelectedBookTitle(null);
    }
    setSearchBookTerm('');
    setBookResults([]);
  }, [initialItem, isOpen]);

  const handleSearchBook = async (term: string) => {
    setSearchBookTerm(term);
    if (!term.trim()) {
      setBookResults([]);
      return;
    }
    try {
      const res = await bookService.searchBooks(undefined, term.trim());
      setBookResults(res?.slice(0, 5) || []);
    } catch {
      setBookResults([]);
    }
  };

  const handleSelectBook = (book: Book) => {
    setBookId(book.id);
    setSelectedBookTitle(book.title);
    setSearchBookTerm('');
    setBookResults([]);
  };

  const handleUnlinkBook = () => {
    setBookId(null);
    setSelectedBookTitle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !publisher.trim() || !releaseDate) return;

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        publisher: publisher.trim(),
        author: author.trim() || undefined,
        releaseDate,
        estimatedPrice,
        editionType,
        gifts: gifts.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        description: description.trim() || undefined,
        status,
        bookId,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const publishersPreset = ['Kim Đồng', 'IPM', 'NXB Trẻ', 'AZ Việt Nam', 'Wings Books', 'Nhã Nam'];

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{initialItem ? 'Chỉnh Sửa Mục Lịch' : 'Thêm Mục Lịch Phát Hành Mới'}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 2 }}>
              <label>Tựa đề sách / manga *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Chú Thuật Hồi Chiến - Tập 25"
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Tên gốc</label>
              <input
                type="text"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                placeholder="VD: Jujutsu Kaisen 25"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Nhà xuất bản *</label>
              <input
                type="text"
                required
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
              <div className={styles.presetsRow}>
                {publishersPreset.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={styles.presetChip}
                    onClick={() => setPublisher(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Tác giả</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: Gege Akutami"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Ngày phát hành *</label>
              <input
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Giá bìa dự kiến (đ)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={estimatedPrice ?? ''}
                onChange={(e) => setEstimatedPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="VD: 75000"
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Phiên bản</label>
              <select
                value={editionType}
                onChange={(e) => setEditionType(e.target.value as ReleaseEditionType)}
              >
                <option value="STANDARD">Bản thường</option>
                <option value="SPECIAL">Bản đặc biệt</option>
                <option value="LIMITED">Bản giới hạn</option>
                <option value="BOXSET">Boxset</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Phụ kiện & Quà tặng kèm</label>
            <input
              type="text"
              value={gifts}
              onChange={(e) => setGifts(e.target.value)}
              placeholder="VD: 01 Standee Acrylic Gojo & Sukuna + Bìa áo Metalize"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Link ảnh bìa dự kiến</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Giới thiệu nội dung</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tóm tắt nội dung tập sách..."
            />
          </div>

          {/* Link with Boki Book */}
          <div className={styles.linkBookSection}>
            <label className={styles.sectionLabel}>Liên kết với sách trên sàn Boki (Tùy chọn)</label>
            {selectedBookTitle ? (
              <div className={styles.selectedBookBox}>
                <span>Sách đang liên kết: <strong>{selectedBookTitle}</strong></span>
                <button type="button" className={styles.unlinkBtn} onClick={handleUnlinkBook}>Hủy liên kết</button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={searchBookTerm}
                  onChange={(e) => handleSearchBook(e.target.value)}
                  placeholder="Gõ từ khóa để tìm sách trên Boki cần link..."
                />
                {bookResults.length > 0 && (
                  <div className={styles.resultsDropdown}>
                    {bookResults.map((b) => (
                      <div
                        key={b.id}
                        className={styles.resultItem}
                        onClick={() => handleSelectBook(b)}
                      >
                        <strong>{b.title}</strong> — {new Intl.NumberFormat('vi-VN').format(b.price)}đ
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.actionsFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Đang lưu...' : (initialItem ? 'Cập nhật' : 'Thêm mục lịch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
