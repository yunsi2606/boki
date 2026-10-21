'use client';

import React, { useState, useEffect } from 'react';
import styles from './emailSubscriptionModal.module.css';
import { scheduleNotificationService } from '@/services/scheduleNotificationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetId?: string;
  targetName?: string;
}

export function EmailSubscriptionModal({
  isOpen,
  onClose,
  targetId,
  targetName,
}: Props) {
  const [email, setEmail] = useState('');
  const [seriesAlert, setSeriesAlert] = useState(true);
  const [delayAlert, setDelayAlert] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('boki_saved_email');
      if (savedEmail) setEmail(savedEmail);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const types: ('SERIES' | 'VOLUME' | 'VAULT' | 'DELAY_ALERT' | 'WEEKLY_DIGEST')[] = [];
    if (seriesAlert && targetId) types.push('SERIES');
    if (delayAlert) types.push('DELAY_ALERT');
    if (weeklyDigest) types.push('WEEKLY_DIGEST');

    if (types.length === 0) {
      setStatus({ type: 'error', message: 'Vui lòng chọn ít nhất một loại thông báo.' });
      return;
    }

    try {
      setIsLoading(true);
      await scheduleNotificationService.subscribe({
        email: email.trim(),
        subscriptionTypes: types,
        targetId: targetId || undefined,
        targetName: targetName || undefined,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('boki_saved_email', email.trim());
      }

      setStatus({
        type: 'success',
        message: 'Đăng ký thành công! Bạn sẽ nhận thông báo khi có lịch phát hành mới.',
      });

      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 1800);
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Có lỗi xảy ra khi lưu đăng ký. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleBox}>
            <h3 className={styles.title}>Bật thông báo phát hành</h3>
            <p className={styles.subtitle}>Nhận email tức thời khi có lịch hoặc cập nhật mới</p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            {targetName && (
              <div className={styles.targetCard}>
                <span className={styles.targetLabel}>Tác phẩm đang theo dõi</span>
                <span className={styles.targetName}>{targetName}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="sub-email" className={styles.inputLabel}>
                Địa chỉ email của bạn
              </label>
              <input
                id="sub-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className={styles.emailInput}
              />
            </div>

            <div className={styles.optionsSection}>
              <span className={styles.optionsTitle}>Tùy chọn nhận thông báo</span>

              {targetId && (
                <label className={`${styles.optionItem} ${seriesAlert ? styles.optionItemActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={seriesAlert}
                    onChange={(e) => setSeriesAlert(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <div className={styles.optionText}>
                    <span className={styles.optionTitle}>Thông báo tập mới của bộ truyện này</span>
                    <span className={styles.optionDesc}>
                      Gửi email ngay khi nhà xuất bản công bố tập tiếp theo
                    </span>
                  </div>
                </label>
              )}

              <label className={`${styles.optionItem} ${delayAlert ? styles.optionItemActive : ''}`}>
                <input
                  type="checkbox"
                  checked={delayAlert}
                  onChange={(e) => setDelayAlert(e.target.checked)}
                  className={styles.checkbox}
                />
                <div className={styles.optionText}>
                  <span className={styles.optionTitle}>Báo thay đổi hoặc hoãn lịch</span>
                  <span className={styles.optionDesc}>Nhận thông báo khi lịch phát hành bị dời ngày</span>
                </div>
              </label>

              <label className={`${styles.optionItem} ${weeklyDigest ? styles.optionItemActive : ''}`}>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className={styles.checkbox}
                />
                <div className={styles.optionText}>
                  <span className={styles.optionTitle}>Bản tin tổng hợp tuần (Weekly Digest)</span>
                  <span className={styles.optionDesc}>Tổng hợp toàn bộ truyện phát hành trong tuần tới</span>
                </div>
              </label>
            </div>

            {status && (
              <div
                className={`${styles.statusMsg} ${
                  status.type === 'success' ? styles.statusSuccess : styles.statusError
                }`}
              >
                {status.message}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.guaranteeNote}>Hủy đăng ký bất cứ lúc nào với 1 chạm.</span>
            <button type="submit" disabled={isLoading} className={styles.submitBtn}>
              {isLoading ? 'Đang lưu...' : 'Xác nhận đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
