'use client';

import { useState } from 'react';
import {
  AdminGiveawayCampaign,
  DrawPreviewResult,
  adminGiveawayService,
} from '@/services/adminGiveawayService';
import styles from './adminGiveawayDrawModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaign: AdminGiveawayCampaign;
  onDrawSuccess: () => void;
}

export default function AdminGiveawayDrawModal({
  isOpen,
  onClose,
  campaign,
  onDrawSuccess,
}: Props) {
  const [winningNumber, setWinningNumber] = useState<number | ''>(
    campaign.winningNumber || ''
  );
  const [sendEmails, setSendEmails] = useState(true);
  const [previewData, setPreviewData] = useState<DrawPreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreview = async () => {
    setErrorMsg(null);
    if (winningNumber === '' || winningNumber < 100 || winningNumber > 999) {
      setErrorMsg('Vui lòng nhập 3 số cuối giải ĐB XSMB (100 - 999)');
      return;
    }

    try {
      setLoading(true);
      const res = await adminGiveawayService.previewDraw(campaign.id, Number(winningNumber));
      setPreviewData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi xem trước kết quả');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDraw = async () => {
    if (!window.confirm(`Xác nhận chốt kết quả giải thưởng với số trúng ${winningNumber}?`)) {
      return;
    }
    try {
      setDrawing(true);
      setErrorMsg(null);
      await adminGiveawayService.executeDraw(campaign.id, {
        winningNumber: Number(winningNumber),
        sendNotificationEmails: sendEmails,
      });
      alert('Đã chốt kết quả và phân bổ giải thưởng thành công!');
      onDrawSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi chốt kết quả');
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Quay số & Phân bổ giải thưởng</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.body}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)' }}>
            Sự kiện: <strong>{campaign.title}</strong> ({campaign.totalEntriesCount} người tham gia)
          </p>

          <div className={styles.inputCard}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                3 SỐ CUỐI XSMB:
              </label>
              <input
                type="number"
                min={100}
                max={999}
                placeholder="___"
                value={winningNumber}
                onChange={(e) => setWinningNumber(e.target.value ? parseInt(e.target.value, 10) : '')}
                className={styles.numberInput}
              />
            </div>

            <button
              type="button"
              onClick={handlePreview}
              disabled={loading}
              className={styles.previewBtn}
            >
              {loading ? 'Đang tính toán...' : 'Xem trước phân bổ'}
            </button>

            <label className={styles.emailOption}>
              <input
                type="checkbox"
                checked={sendEmails}
                onChange={(e) => setSendEmails(e.target.checked)}
              />
              Tự động gửi email thông báo trúng thưởng qua Outbox Queue
            </label>
          </div>

          {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}

          {previewData && (
            <div>
              <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                Tổng giải thưởng: {previewData.totalPrizes} giải | Người tham gia: {previewData.totalEntries}
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 50, textAlign: 'center' }}>Hạng</th>
                      <th>Họ tên</th>
                      <th>Liên hệ</th>
                      <th style={{ textAlign: 'center' }}>Số chọn</th>
                      <th style={{ textAlign: 'center' }}>Lệch</th>
                      <th>Giải phân bổ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.candidates.map((c) => (
                      <tr key={c.entryId} className={c.isWinner ? styles.winnerRow : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`${styles.rankBadge} ${c.isWinner ? styles.rankWinner : ''}`}>
                            {c.rank}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                        <td style={{ fontSize: 12 }}>{c.phone} • {c.email}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.luckyNumber}</td>
                        <td style={{ textAlign: 'center', color: c.distance === 0 ? '#059669' : '#6B7280' }}>
                          {c.distance === 0 ? 'Trùng 100%' : `Lệch ${c.distance}`}
                        </td>
                        <td>
                          {c.isWinner ? (
                            <strong style={{ color: '#059669' }}>{c.prizeName}</strong>
                          ) : (
                            <span style={{ color: '#9CA3AF' }}>Không trúng</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>Hủy</button>
          <button
            type="button"
            onClick={handleConfirmDraw}
            disabled={drawing || !previewData}
            className={styles.confirmDrawBtn}
          >
            {drawing ? 'Đang chốt giải...' : 'Xác nhận chốt giải & Gửi thông báo'}
          </button>
        </div>
      </div>
    </div>
  );
}
