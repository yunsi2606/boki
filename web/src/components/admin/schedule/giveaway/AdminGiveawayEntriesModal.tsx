'use client';

import { useState, useEffect } from 'react';
import {
  AdminGiveawayCampaign,
  AdminGiveawayEntry,
  adminGiveawayService,
} from '@/services/adminGiveawayService';
import styles from './adminGiveawayEntriesModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaign: AdminGiveawayCampaign;
}

export default function AdminGiveawayEntriesModal({ isOpen, onClose, campaign }: Props) {
  const [entries, setEntries] = useState<AdminGiveawayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      adminGiveawayService
        .getEntries(campaign.id, 0, 200)
        .then((res) => setEntries(res.content || []))
        .catch((err) => console.error('Failed to load entries', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, campaign.id]);

  if (!isOpen) return null;

  const filtered = entries.filter((e) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term) ||
      e.phone.includes(term) ||
      String(e.luckyNumber).includes(term)
    );
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Danh sách lượt tham gia</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.body}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
              Sự kiện: <strong>{campaign.title}</strong> (Tổng {entries.length} lượt)
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên, email, số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchBar}
            />
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải danh sách...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
              Không tìm thấy lượt tham gia nào.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>#</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th style={{ textAlign: 'center' }}>Số may mắn</th>
                    <th>Thời gian</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', color: '#6B7280' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{item.fullName}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-primary-500)' }}>
                        {item.luckyNumber}
                      </td>
                      <td style={{ fontSize: 12, color: '#6B7280' }}>
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.isWinner ? (
                          <span className={styles.winnerBadge}>
                            Trúng #{item.prizeRank} ({item.prizeName})
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: 12 }}>Tham gia</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.closeFooterBtn}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
