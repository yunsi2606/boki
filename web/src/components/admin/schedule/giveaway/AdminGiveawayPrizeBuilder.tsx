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
  onUpdatePrize: (index: number, updates: Partial<AdminGiveawayPrize>) => void;
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
        {prizes.map((p, index) => {
          const selectedSchedule = p.scheduleId ? schedules.find((s) => s.id === p.scheduleId) : undefined;
          const editions = selectedSchedule?.editions || [];

          return (
            <div key={index} className={styles.prizeItemBox}>
              <div className={styles.prizeRowTop}>
                {isTiered ? (
                  <select
                    value={p.prizeTier}
                    onChange={(e) => onUpdatePrize(index, { prizeTier: e.target.value })}
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
                  onChange={(e) => onUpdatePrize(index, { prizeName: e.target.value })}
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
                    onChange={(e) => onUpdatePrize(index, { quantity: parseInt(e.target.value, 10) || 1 })}
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
                  Lịch phát hành:
                </span>
                <select
                  value={p.scheduleId || ''}
                  onChange={(e) => {
                    const newSchId = e.target.value || undefined;
                    onUpdatePrize(index, { scheduleId: newSchId, editionId: undefined });
                  }}
                  className={styles.select}
                  style={{ flex: 1, minWidth: 0, fontSize: 13, height: 34 }}
                >
                  <option value="">-- Không gắn LPH (Quà tặng/Sách tự do) --</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.imprint || s.publisher})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSchedule && editions.length > 0 && (
                <div className={styles.prizeEditionRow}>
                  <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>
                    Phân loại / Bản:
                  </span>
                  <select
                    value={p.editionId || ''}
                    onChange={(e) => {
                      const newEdId = e.target.value || undefined;
                      const selectedEd = editions.find((ed) => ed.id === newEdId);
                      onUpdatePrize(index, {
                        editionId: newEdId,
                        editionName: selectedEd ? selectedEd.editionName : undefined,
                        editionGifts: selectedEd ? selectedEd.gifts : undefined,
                      });
                    }}
                    className={styles.select}
                    style={{ flex: 1, minWidth: 0, fontSize: 12, height: 32 }}
                  >
                    <option value="">-- Cả tập chung / Mặc định (Tất cả phân loại) --</option>
                    {editions.map((ed) => (
                      <option key={ed.id} value={ed.id}>
                        {ed.editionName} {ed.gifts ? `— Quà: ${ed.gifts}` : `(${ed.editionType})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
