'use client';

import { GiveawayEntry } from '@/types/giveaway';
import styles from './giveawayWinnersBoard.module.css';

interface Props {
  winningNumber?: number;
  drawDate?: string;
  winners: GiveawayEntry[];
}

export function GiveawayWinnersBoard({ winningNumber, drawDate, winners }: Props) {
  const formatDrawDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getRankBadgeClass = (rank?: number) => {
    if (rank === 1) return styles.rank1;
    if (rank === 2) return styles.rank2;
    if (rank === 3) return styles.rank3;
    return styles.rankOther;
  };

  return (
    <div id="winners-board" className={styles.wrapper}>
      <h2 className={styles.title}>Bảng Vinh Danh Người Chiến Thắng</h2>

      {winningNumber !== undefined && winningNumber !== null && (
        <div className={styles.winningBanner}>
          <div className={styles.winningLabel}>KẾT QUẢ QUAY THƯỞNG (3 SỐ CUỐI XSMB)</div>
          <div className={styles.winningNumber}>{winningNumber}</div>
          {drawDate && <div className={styles.winningMeta}>Quay thưởng vào lúc: {formatDrawDate(drawDate)}</div>}
        </div>
      )}

      {winners.length === 0 ? (
        <div className={styles.empty}>Chưa có danh sách trúng thưởng cho sự kiện này.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>Thứ hạng</th>
                <th>Người trúng giải</th>
                <th>Số may mắn</th>
                <th>Giải thưởng</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w) => {
                const diff =
                  winningNumber !== undefined && winningNumber !== null
                    ? Math.abs(w.luckyNumber - winningNumber)
                    : null;

                return (
                  <tr key={w.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`${styles.rankBadge} ${getRankBadgeClass(w.prizeRank)}`}>
                        {w.prizeRank || '-'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{w.fullName}</span>
                        <span className={styles.userContact}>
                          {w.phone} • {w.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.luckyNumBadge}>{w.luckyNumber}</span>
                      {diff === 0 && <span className={styles.exactMatch}>Trùng khớp</span>}
                      {diff !== null && diff > 0 && (
                        <span className={styles.diffMatch}>(Lệch {diff} số)</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.prizeWon}>{w.prizeName || 'Quà tặng'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
