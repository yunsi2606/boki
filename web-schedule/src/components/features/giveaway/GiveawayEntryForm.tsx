'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { giveawayService } from '@/services/giveawayService';
import { GiveawayEntry } from '@/types/giveaway';
import styles from './giveawayEntryForm.module.css';

interface Props {
  slug: string;
  onEntrySuccess?: (entry: GiveawayEntry) => void;
}

export function GiveawayEntryForm({ slug, onEntrySuccess }: Props) {
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

  const handleRandomizeNumber = () => {
    const random = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
    setLuckyNumber(random);
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

  if (submittedEntry) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.successBox}>
          <h3 className={styles.successTitle}>Đăng ký tham gia thành công!</h3>
          <p className={styles.successText}>
            Chúc mừng bạn đã hoàn tất đăng ký. Boki đã gửi email xác nhận đến {submittedEntry.email}.
          </p>
          <div className={styles.registeredNumber}>{submittedEntry.luckyNumber}</div>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginTop: 16 }}>
            Kết quả sẽ được so khớp trực tiếp với 3 số cuối Giải Đặc Biệt XSMB khi sự kiện kết thúc. Chúc bạn may mắn!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Đăng ký tham gia Give Away</h2>
      <p className={styles.subtitle}>
        Chọn ngay một con số may mắn từ 100 đến 999 để có cơ hội sở hữu phần quà giá trị!
      </p>

      <div className={styles.rulesBox}>
        <span className={styles.rulesTitle}>Thể lệ & Nguyên tắc trúng thưởng:</span>
        <div>• So khớp với 3 số cuối Giải Đặc Biệt Xổ Số Miền Bắc (XSMB) ngày quay thưởng.</div>
        <div>• Người có khoảng cách gần nhất sẽ chiến thắng. Khi cùng khoảng cách, số nhỏ hơn được ưu tiên hơn.</div>
        <div>• Trường hợp trùng số may mắn, người gửi lượt đăng ký sớm hơn sẽ chiến thắng.</div>
        <div>• Mỗi bạn chỉ được tham gia 1 lần (1 email & 1 số điện thoại).</div>
      </div>

      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.luckyNumberSection}>
          <span className={styles.luckyLabel}>Con số may mắn của bạn (100 - 999)</span>
          <div className={styles.luckyInputRow}>
            <input
              type="number"
              min={100}
              max={999}
              placeholder="___"
              value={luckyNumber}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : '';
                setLuckyNumber(val);
                setErrorMsg(null);
              }}
              className={styles.luckyInput}
              required
            />
            <button
              type="button"
              onClick={handleRandomizeNumber}
              className={styles.randomBtn}
            >
              Quay số ngẫu nhiên
            </button>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Họ và tên *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Số điện thoại nhận quà *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email nhận thông báo kết quả *</label>
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
          <label className={styles.label}>Lời nhắn / Lời chúc (Tùy chọn)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nghĩ hoặc tựa truyện yêu thích của bạn..."
            className={styles.textarea}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Đang gửi đăng ký...' : 'Xác nhận tham gia Give Away'}
        </button>
      </form>
    </div>
  );
}
