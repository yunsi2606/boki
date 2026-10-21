'use client';

import React, { useState } from 'react';
import type { ComposeBroadcastPayload } from '@/services/adminScheduleEmailService';
import { adminScheduleEmailService } from '@/services/adminScheduleEmailService';
import styles from './emailComposeModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailComposeModal({ isOpen, onClose, onSuccess }: Props) {
  const [subject, setSubject] = useState('');
  const [targetGroup, setTargetGroup] = useState<'TEST_ONLY' | 'SERIES_SUBSCRIBERS' | 'ALL_DIGEST_SUBSCRIBERS'>('TEST_ONLY');
  const [testEmail, setTestEmail] = useState('');
  const [targetId, setTargetId] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }
    if (targetGroup === 'TEST_ONLY' && !testEmail.trim()) {
      alert('Vui lòng nhập địa chỉ email kiểm thử.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: ComposeBroadcastPayload = {
        subject: subject.trim(),
        content: content.trim(),
        targetGroup,
        targetId: targetGroup === 'SERIES_SUBSCRIBERS' ? targetId.trim() : undefined,
        testEmail: targetGroup === 'TEST_ONLY' ? testEmail.trim() : undefined,
      };

      const res = await adminScheduleEmailService.broadcast(payload);
      alert(res.message);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Lỗi gửi email: ' + (err.message || 'Lỗi server'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Soạn tin nhắn gửi Email</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className={styles.body}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nhóm người nhận</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value as any)}
                className={styles.select}
              >
                <option value="TEST_ONLY">Gửi thử nghiệm vào 1 email cụ thể</option>
                <option value="SERIES_SUBSCRIBERS">Gửi đến người đăng ký tác phẩm cụ thể</option>
                <option value="ALL_DIGEST_SUBSCRIBERS">Gửi đến tất cả người đăng ký nhận tin</option>
              </select>
            </div>

            {targetGroup === 'TEST_ONLY' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Email nhận thử</label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={styles.input}
                />
              </div>
            )}

            {targetGroup === 'SERIES_SUBSCRIBERS' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Slug của bộ truyện</label>
                <input
                  type="text"
                  required
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="vi-du: sousou-no-frieren"
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Tiêu đề Email</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="[Boki Schedule] Cập nhật lịch phát hành tháng mới"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nội dung văn bản</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thông báo gửi đến độc giả..."
                className={styles.textarea}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Đang xếp hàng gửi...' : 'Đưa vào hàng đợi Outbox'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
