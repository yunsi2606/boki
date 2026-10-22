'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { giveawayService } from '@/services/giveawayService';
import { GiveawayEntry } from '@/types/giveaway';
import styles from './giveawayEntryModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  drawDateFormatted: string;
  onEntrySuccess?: (entry: GiveawayEntry) => void;
}

export function GiveawayEntryModal({ isOpen, onClose, slug, drawDateFormatted, onEntrySuccess }: Props) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [luckyNumber, setLuckyNumber] = useState<number | ''>('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedEntry, setSubmittedEntry] = useState<GiveawayEntry | null>(null);

  useEffect(() => {
    if (user) {
      if (user.displayName && !fullName) setFullName(user.displayName);
      if (user.email && !email) setEmail(user.email);
      if (user.phoneNumber && !phone) setPhone(user.phoneNumber);
    }
  }, [user, fullName, email, phone]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    setLuckyNumber(Math.floor(Math.random() * 900) + 100);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (luckyNumber === '' || luckyNumber < 100 || luckyNumber > 999) {
      setErrorMsg('Vui lòng chọn con số may mắn từ 100 đến 999');
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại');
      return;
    }

    try {
      setLoading(true);
      const res = await giveawayService.submitEntry(slug, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        luckyNumber: Number(luckyNumber),
        comment: comment.trim() || undefined,
      });
      setSubmittedEntry(res);
      if (onEntrySuccess) onEntrySuccess(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi gửi đăng ký tham gia');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Đăng ký tham gia Give Away</h3>
          <button type="button" onClick={handleClose} className={styles.closeBtn} title="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submittedEntry ? (
          <div className={styles.body}>
            <div className={styles.successBox}>
              <h4 className={styles.successTitle}>Đăng ký thành công!</h4>
              <p className={styles.successText}>
                Chúc mừng bạn đã hoàn tất đăng ký. Boki đã gửi email xác nhận đến <strong>{submittedEntry.email}</strong>.
              </p>
              <div className={styles.numberDisplay}>{submittedEntry.luckyNumber}</div>
              <div className={styles.rulesBanner}>
                Kết quả sẽ được so khớp trực tiếp với 3 số cuối Giải Đặc Biệt Xổ Số Miền Bắc ngày{' '}
                <span className={styles.rulesBannerHighlight}>{drawDateFormatted}</span> (mở lúc 18:15).
              </div>
              <button type="button" onClick={handleClose} className={styles.submitBtn} style={{ width: '100%', marginTop: 16 }}>
                Hoàn tất
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.body}>
            {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}

            <div className={styles.rulesBanner}>
              Kết quả sẽ được so khớp trực tiếp với 3 số cuối Giải Đặc Biệt Xổ Số Miền Bắc ngày{' '}
              <span className={styles.rulesBannerHighlight}>{drawDateFormatted}</span> (mở lúc 18:15).
            </div>

            <div className={styles.luckySection}>
              <span className={styles.luckyLabel}>Chọn con số may mắn (100 - 999) *</span>
              <div className={styles.luckyInputRow}>
                <input
                  type="number"
                  min={100}
                  max={999}
                  value={luckyNumber}
                  onChange={(e) => setLuckyNumber(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="777"
                  className={styles.luckyInput}
                  required
                />
                <button type="button" onClick={handleRandomize} className={styles.randomBtn}>
                  Chọn ngẫu nhiên
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Họ và tên *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email nhận thông báo *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điện thoại *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Lời nhắn gửi (Tùy chọn)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cảm nghĩ của bạn về bộ truyện hoặc sự kiện này..."
                className={styles.textarea}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Đang gửi đăng ký...' : 'Xác nhận tham gia'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
