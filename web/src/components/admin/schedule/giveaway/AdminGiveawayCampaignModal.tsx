'use client';

import { useState, useEffect } from 'react';
import {
  AdminGiveawayCampaign,
  AdminGiveawayPrize,
  CreateGiveawayPayload,
} from '@/services/adminGiveawayService';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './adminGiveawayCampaignModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateGiveawayPayload) => Promise<void>;
  campaign: AdminGiveawayCampaign | null;
}

export default function AdminGiveawayCampaignModal({ isOpen, onClose, onSave, campaign }: Props) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [scheduleId, setScheduleId] = useState<string>('');
  const [prizeStructureType, setPrizeStructureType] = useState('TIERED');
  const [status, setStatus] = useState('OPEN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prizes, setPrizes] = useState<AdminGiveawayPrize[]>([
    { prizeTier: 'FIRST', prizeName: 'Tập truyện bản Đặc Biệt', quantity: 1, displayOrder: 1 },
  ]);

  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    scheduleService.getSchedules().then((data) => setSchedules(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title || '');
      setSlug(campaign.slug || '');
      setDescription(campaign.description || '');
      setBannerUrl(campaign.bannerUrl || '');
      setScheduleId(campaign.scheduleId || '');
      setPrizeStructureType(campaign.prizeStructureType || 'TIERED');
      setStatus(campaign.status || 'OPEN');
      setStartDate(campaign.startDate ? campaign.startDate.slice(0, 16) : '');
      setEndDate(campaign.endDate ? campaign.endDate.slice(0, 16) : '');
      if (campaign.prizes && campaign.prizes.length > 0) {
        setPrizes(campaign.prizes);
      }
    } else {
      setTitle('');
      setSlug('');
      setDescription('');
      setBannerUrl('');
      setScheduleId('');
      setPrizeStructureType('TIERED');
      setStatus('OPEN');
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setStartDate(now.toISOString().slice(0, 16));
      setEndDate(nextWeek.toISOString().slice(0, 16));
      setPrizes([
        { prizeTier: 'FIRST', prizeName: 'Tập truyện bản Đặc Biệt', quantity: 1, displayOrder: 1 },
        { prizeTier: 'SECOND', prizeName: 'Bộ quà tặng Standee/Postcard', quantity: 2, displayOrder: 2 },
      ]);
    }
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const handleAddPrize = () => {
    setPrizes([
      ...prizes,
      { prizeTier: 'STANDARD', prizeName: 'Quà tặng Manga Boki', quantity: 1, displayOrder: prizes.length + 1 },
    ]);
  };

  const handleRemovePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const handleUpdatePrize = (index: number, field: keyof AdminGiveawayPrize, val: any) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: val };
    setPrizes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề sự kiện');
      return;
    }
    if (prizes.length === 0) {
      setErrorMsg('Phải có ít nhất một giải thưởng');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        scheduleId: scheduleId || undefined,
        prizeStructureType,
        status,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        prizes,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu sự kiện Give Away');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {campaign ? 'Chỉnh sửa sự kiện Give Away' : 'Tạo sự kiện Give Away mới'}
          </h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Tiêu đề sự kiện *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Give Away One Piece Tập 108 Bản Giới Hạn"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Slug (Đường dẫn)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Tự động sinh nếu để trống"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Liên kết Lịch phát hành (Tùy chọn)</label>
              <select
                value={scheduleId}
                onChange={(e) => setScheduleId(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Không liên kết --</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.publisher})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ảnh Banner (URL)</label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className={styles.input}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Loại cơ cấu giải</label>
              <select
                value={prizeStructureType}
                onChange={(e) => setPrizeStructureType(e.target.value)}
                className={styles.select}
              >
                <option value="TIERED">Phân cấp (Nhất, Nhì, Ba, Khuyến khích)</option>
                <option value="FLAT">Đồng hạng (N giải tương đương)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.select}
              >
                <option value="UPCOMING">Sắp diễn ra (UPCOMING)</option>
                <option value="OPEN">Đang diễn ra (OPEN)</option>
                <option value="CLOSED">Đã đóng nhận đăng ký (CLOSED)</option>
                <option value="DRAWN">Đã quay số (DRAWN)</option>
              </select>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Bắt đầu *</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Kết thúc *</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mô tả / Thể lệ chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung giới thiệu sự kiện, quà tặng kèm..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.prizeSection}>
            <div className={styles.prizeSectionHeader}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Danh sách giải thưởng</span>
              <button type="button" onClick={handleAddPrize} className={styles.addPrizeBtn}>
                + Thêm giải thưởng
              </button>
            </div>

            {prizes.map((p, index) => (
              <div key={index} className={styles.prizeRow}>
                <select
                  value={p.prizeTier}
                  onChange={(e) => handleUpdatePrize(index, 'prizeTier', e.target.value)}
                  className={styles.select}
                  style={{ width: 140 }}
                >
                  <option value="FIRST">Giải Nhất</option>
                  <option value="SECOND">Giải Nhì</option>
                  <option value="THIRD">Giải Ba</option>
                  <option value="CONSOLATION">Khuyến Khích</option>
                  <option value="STANDARD">Đồng Hạng</option>
                </select>
                <input
                  type="text"
                  value={p.prizeName}
                  onChange={(e) => handleUpdatePrize(index, 'prizeName', e.target.value)}
                  placeholder="Tên giải thưởng"
                  className={styles.input}
                  style={{ flex: 1 }}
                  required
                />
                <input
                  type="number"
                  min={1}
                  value={p.quantity}
                  onChange={(e) => handleUpdatePrize(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                  className={styles.input}
                  style={{ width: 70, textAlign: 'center' }}
                  title="Số lượng"
                  required
                />
                {prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePrize(index)}
                    className={styles.removePrizeBtn}
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Hủy</button>
            <button type="submit" disabled={loading} className={styles.saveBtn}>
              {loading ? 'Đang lưu...' : 'Lưu sự kiện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
