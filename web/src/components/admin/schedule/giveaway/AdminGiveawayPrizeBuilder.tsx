'use client';

import { AdminGiveawayPrize } from '@/services/adminGiveawayService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './adminGiveawayCampaignModal.module.css';

interface Props {
  prizeStructureType: string;
  prizes: AdminGiveawayPrize[];
  schedules: ReleaseScheduleItem[];
  onAddPrize: () => void;
  onRemovePrize: (index: number) => void;
  onUpdatePrize: (index: number, field: keyof AdminGiveawayPrize, val: any) => void;
}

export default function AdminGiveawayPrizeBuilder({
  prizeStructureType,
  prizes,
  schedules,
  onAddPrize,
  onRemovePrize,
  onUpdatePrize,
}: Props) {
  const isTiered = prizeStructureType === 'TIERED';

  return (
    <div className={styles.prizeSection}>
      <div className={styles.prizeSectionHeader}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {isTiered ? 'Cơ cấu giải phân cấp' : 'Danh sách quà tặng đồng hạng'}
          </span>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 2 }}>
            {isTiered
              ? 'Xếp hạng từ cao xuống thấp (Giải Nhất, Nhì, Ba, Khuyến khích). Mỗi giải có thể gắn với truyện LPH.'
              : 'Tất cả các giải có giá trị tương đương nhau, người trúng giải sẽ nhận quà từ trên xuống dưới.'}
          </div>
        </div>
        <button type="button" onClick={onAddPrize} className={styles.addPrizeBtn}>
          {isTiered ? '+ Thêm hạng giải' : '+ Thêm phần quà'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {prizes.map((p, index) => (
          <div key={index} className={styles.prizeItemBox}>
            <div className={styles.prizeRowTop}>
              {isTiered ? (
                <select
                  value={p.prizeTier}
                  onChange={(e) => onUpdatePrize(index, 'prizeTier', e.target.value)}
                  className={styles.select}
                  style={{ width: 140, fontWeight: 600 }}
                >
                  <option value="FIRST">Giải Nhất</option>
                  <option value="SECOND">Giải Nhì</option>
                  <option value="THIRD">Giải Ba</option>
                  <option value="CONSOLATION">Khuyến Khích</option>
                  <option value="STANDARD">Khác</option>
                </select>
              ) : (
                <span className={styles.flatPrizeBadge}>Quà #{index + 1}</span>
              )}

              <input
                type="text"
                value={p.prizeName}
                onChange={(e) => onUpdatePrize(index, 'prizeName', e.target.value)}
                placeholder="Tên phần quà / sách tặng kèm..."
                className={styles.input}
                style={{ flex: 1, minWidth: 0 }}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>SL:</span>
                <input
                  type="number"
                  min={1}
                  value={p.quantity}
                  onChange={(e) => onUpdatePrize(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                  className={styles.input}
                  style={{ width: 60, textAlign: 'center', padding: '0 4px' }}
                  title="Số lượng giải"
                  required
                />
              </div>

              {prizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemovePrize(index)}
                  className={styles.removePrizeBtn}
                  title="Xóa giải này"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className={styles.prizeRowBottom}>
              <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>
                Liên kết Lịch phát hành:
              </span>
              <select
                value={p.scheduleId || ''}
                onChange={(e) => onUpdatePrize(index, 'scheduleId', e.target.value || undefined)}
                className={styles.select}
                style={{ flex: 1, minWidth: 0, fontSize: 13, height: 34 }}
              >
                <option value="">-- Không gắn LPH (Quà tặng/Sách tự do) --</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.publisher})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
