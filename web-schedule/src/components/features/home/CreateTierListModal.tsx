'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { communityService, UserTierList, MangaTierEntry } from '@/services/communityService';
import styles from './createTierListModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (created: UserTierList) => void;
}

const SAMPLE_MANGA_POOL: MangaTierEntry[] = [
  { title: 'Ao Ashi', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200', slug: 'ao-ashi' },
  { title: 'Sakamoto Days', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200', slug: 'sakamoto-days' },
  { title: 'Frieren', coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200', slug: 'frieren' },
  { title: 'Dược Sư Tự Sự', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200', slug: 'duoc-su-tu-su' },
  { title: 'Chainsaw Man', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=200', slug: 'chainsaw-man' },
];

export function CreateTierListModal({ isOpen, onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [assigned, setAssigned] = useState<Record<string, 'S' | 'A' | 'B' | 'C'>>({
    'Ao Ashi': 'S',
    'Sakamoto Days': 'S',
    'Frieren': 'A',
    'Dược Sư Tự Sự': 'B',
  });

  if (!isOpen) return null;

  const handleRankChange = (title: string, rank: 'S' | 'A' | 'B' | 'C') => {
    setAssigned((prev) => ({ ...prev, [title]: rank }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tiers = {
      S: SAMPLE_MANGA_POOL.filter((m) => assigned[m.title] === 'S'),
      A: SAMPLE_MANGA_POOL.filter((m) => assigned[m.title] === 'A'),
      B: SAMPLE_MANGA_POOL.filter((m) => assigned[m.title] === 'B'),
      C: SAMPLE_MANGA_POOL.filter((m) => assigned[m.title] === 'C'),
    };

    const created = communityService.createTierList({
      title: title.trim(),
      authorName: user?.displayName || 'Độc giả ẩn danh',
      authorAvatarColor: '#EE4D2D',
      isPublic,
      tiers,
    });

    onCreated(created);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Tạo Manga Tier List</h3>
            <p className={styles.subtitle}>Xếp hạng các bộ truyện bạn yêu thích & chia sẻ cùng cộng đồng</p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Tên Tier List</label>
            <input
              type="text"
              placeholder="VD: Top Manga Hành Động 2026 của tôi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Quyền hiển thị</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                <span>Công khai (Được tính điểm phổ biến & bình chọn)</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                <span>Riêng tư (Chỉ mình tôi xem)</span>
              </label>
            </div>
          </div>

          <div className={styles.mangaAssignList}>
            <div className={styles.label}>Xếp bậc cho các tác phẩm</div>
            {SAMPLE_MANGA_POOL.map((m) => (
              <div key={m.title} className={styles.assignRow}>
                <span className={styles.mangaName}>{m.title}</span>
                <div className={styles.tierButtons}>
                  {(['S', 'A', 'B', 'C'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`${styles.tierBtn} ${assigned[m.title] === r ? styles[`tierBtn_${r}`] : ''}`}
                      onClick={() => handleRankChange(m.title, r)}
                    >
                      Bậc {r}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn}>
              Đăng Tier List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
