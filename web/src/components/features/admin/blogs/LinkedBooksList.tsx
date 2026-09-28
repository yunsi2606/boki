'use client';

import { Plus, ArrowUp, ArrowDown, Trash2, BookOpen } from 'lucide-react';
import type { BookSummary } from '@/types/blog';
import styles from './linkedBooksList.module.css';

interface LinkedBooksListProps {
  books: BookSummary[];
  onChange: (books: BookSummary[]) => void;
  onOpenPicker: () => void;
}

export default function LinkedBooksList({
  books,
  onChange,
  onOpenPicker,
}: LinkedBooksListProps) {
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...books];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === books.length - 1) return;
    const updated = [...books];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = books.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.titleArea}>
          <span className={styles.label}>Sách liên kết đọc thử</span>
          <span className={styles.countBadge}>{books.length}</span>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={onOpenPicker}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>{books.length > 0 ? 'Thêm / Chỉnh sửa sách' : 'Chọn sách liên kết'}</span>
        </button>
      </div>

      {books.length === 0 ? (
        <div className={styles.emptyBox} onClick={onOpenPicker}>
          <BookOpen size={24} strokeWidth={1.5} />
          <span className={styles.emptyText}>Chưa có sách nào được liên kết. Bấm để chọn sách.</span>
        </div>
      ) : (
        <div className={styles.cardsList}>
          {books.map((book, idx) => (
            <div key={book.id} className={styles.bookCard}>
              <span className={styles.orderNum}>#{idx + 1}</span>

              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className={styles.thumb} />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <BookOpen size={14} />
                </div>
              )}

              <div className={styles.cardBody}>
                <div className={styles.cardTitle} title={book.title}>
                  {book.title}
                </div>
                <div className={styles.cardMeta}>
                  <span>{book.author}</span>
                  <span className={styles.cardPrice}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  title="Di chuyển lên"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  disabled={idx === books.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  title="Di chuyển xuống"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleRemove(idx)}
                  title="Gỡ bỏ"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
