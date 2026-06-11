'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { bookService } from '@/services/bookService';
import type { ApiError } from '@/types';
import Button from '@/components/ui/Button';
import styles from './new.module.css';

const categoriesList = [
  { id: 1, name: 'Sách Văn học' },
  { id: 2, name: 'Sách Thiếu nhi' },
  { id: 3, name: 'Sách Kinh tế' },
  { id: 4, name: 'Sách Giáo khoa' },
  { id: 5, name: 'Kỹ Năng' },
  { id: 6, name: 'Phát triển bản thân' },
  { id: 7, name: 'Sổ tay các loại' }
];

const conditionsList = [
  { value: 'NEW', label: 'Mới (NEW) — Chưa qua sử dụng' },
  { value: 'LIKE_NEW', label: 'Như mới (LIKE NEW) — Đọc 1-2 lần, rất mới' },
  { value: 'GOOD', label: 'Tốt (GOOD) — Đầy đủ trang, hơi cũ' },
  { value: 'FAIR', label: 'Chấp nhận được (FAIR) — Trang hơi ngả màu' },
  { value: 'POOR', label: 'Cũ/Yếu (POOR) — Rách bìa nhẹ, cũ kỹ' }
];

export default function SellBookPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [condition, setCondition] = useState('GOOD');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Authenticate user check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/books/new');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    
    // Simple validation URL check
    if (!imageUrlInput.startsWith('http://') && !imageUrlInput.startsWith('https://')) {
      setError('Đường dẫn hình ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    if (imageUrls.length >= 5) {
      setError('Chỉ cho phép đăng tối đa 5 hình ảnh');
      return;
    }

    setImageUrls([...imageUrls, imageUrlInput.trim()]);
    setImageUrlInput('');
    setError(null);
  };

  const handleRemoveImageUrl = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim() || !author.trim() || !price || !stockQuantity) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Giá bán không hợp lệ');
      return;
    }

    const stockNum = parseInt(stockQuantity);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Số lượng kho không hợp lệ');
      return;
    }

    setSubmitting(true);

    try {
      const newBook = await bookService.createBook({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim() || undefined,
        categoryId,
        condition,
        price: priceNum,
        stockQuantity: stockNum,
        description: description.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/books/${newBook.id}`);
      }, 1500);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Lỗi đăng bán sách. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '100px 24px' }}>
        <p>Đang kiểm tra thông tin tài khoản của bạn...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>Đăng bán sách mới</h1>
        <p className={styles.pageSubtitle}>
          Chia sẻ quyển sách của bạn đến hàng ngàn người đọc trên hệ thống Boki.
        </p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {error && <div className={styles.errorBlock}>{error}</div>}
          {success && <div className={styles.successBlock}>Đăng sách thành công! Đang chuyển hướng...</div>}

          <div className={styles.formGrid}>
            {/* Title */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Tên sách *</label>
              <input
                type="text"
                placeholder="Nhập tên đầy đủ của sách (ví dụ: Sherlock Holmes)..."
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Author */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Tác giả *</label>
              <input
                type="text"
                placeholder="Nhập tên tác giả..."
                className={styles.input}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* ISBN */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Mã ISBN (nếu có)</label>
              <input
                type="text"
                placeholder="Nhập mã ISBN..."
                className={styles.input}
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Category */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Thể loại *</label>
              <select
                className={styles.select}
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value))}
                disabled={submitting}
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Tình trạng sách *</label>
              <select
                className={styles.select}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={submitting}
              >
                {conditionsList.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Giá bán (VND) *</label>
              <input
                type="number"
                placeholder="Ví dụ: 85000"
                min="0"
                className={styles.input}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Stock */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Số lượng đăng bán *</label>
              <input
                type="number"
                placeholder="1"
                min="1"
                className={styles.input}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Images */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Đường dẫn ảnh bìa sách (Tối đa 5 ảnh)</label>
              <div className={styles.imageUrlRow}>
                <input
                  type="text"
                  placeholder="Nhập link ảnh (ví dụ: https://images.unsplash.com/...)"
                  className={styles.input}
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  disabled={submitting}
                />
                <Button type="button" variant="secondary" onClick={handleAddImageUrl} disabled={submitting}>
                  Thêm ảnh
                </Button>
              </div>
              
              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className={styles.imagePreviews}>
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className={styles.previewWrapper}>
                      <img src={url} alt={`Preview ${idx}`} className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.removePreviewBtn}
                        onClick={() => handleRemoveImageUrl(idx)}
                        disabled={submitting}
                        aria-label="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Mô tả chi tiết</label>
              <textarea
                placeholder="Mô tả tóm tắt nội dung sách, các điểm cũ mới hoặc lưu ý cho người mua..."
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.actionsRow}>
            <Button type="button" variant="secondary" onClick={() => router.back()} disabled={submitting}>
              Quay lại
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang đăng sách...' : 'Đăng bán ngay'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
