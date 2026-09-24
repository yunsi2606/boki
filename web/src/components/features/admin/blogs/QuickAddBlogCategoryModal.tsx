'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { blogService } from '@/services/blogService';
import type { BlogCategory } from '@/types/blog';
import styles from './quickAddBlogCategory.module.css';

interface QuickAddBlogCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: string[];
  onCategoryCreated: (newCategory: BlogCategory) => void;
}

export default function QuickAddBlogCategoryModal({
  isOpen,
  onClose,
  existingCategories,
  onCategoryCreated,
}: QuickAddBlogCategoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setErrorMessage('');
      setSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const trimmedName = name.trim();
  const isDuplicate = existingCategories.some(
    (cat) => cat.toLowerCase().trim() === trimmedName.toLowerCase()
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Tên danh mục cần tối thiểu 2 ký tự.');
      return;
    }

    if (isDuplicate) {
      setErrorMessage(`Danh mục "${trimmedName}" đã tồn tại trong hệ thống.`);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const newCat = await blogService.createCategory({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      onCategoryCreated(newCat);
      onClose();
    } catch (err: any) {
      console.error('Failed to create blog category:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Không thể tạo danh mục. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Thêm danh mục bài viết mới</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            {errorMessage && <div className={styles.errorBox}>{errorMessage}</div>}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tên danh mục <span className={styles.required}>*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="Ví dụ: Phỏng vấn tác giả, Góc Light Novel..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={styles.input}
                maxLength={100}
                required
              />
              {isDuplicate && (
                <p className={styles.warningBox} style={{ margin: '4px 0 0' }}>
                  Danh mục này đã tồn tại trong danh sách.
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mô tả danh mục (tùy chọn)</label>
              <textarea
                placeholder="Mô tả ngắn gọn mục đích của danh mục bài viết này..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                maxLength={500}
                rows={3}
              />
              <p className={styles.hint}>Mô tả giúp phân loại và quản trị bài viết khoa học hơn.</p>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !trimmedName || trimmedName.length < 2 || isDuplicate}
            >
              {submitting ? 'Đang tạo...' : '+ Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
