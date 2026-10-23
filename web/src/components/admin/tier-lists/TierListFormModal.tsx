'use client';

import React, { useState, useEffect } from 'react';
import type { MangaTierListSummary, CreateTierListPayload } from '@/types/tierList';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { adminTierListService } from '@/services/adminTierListService';
import { scheduleService } from '@/services/scheduleService';
import { X, Search, Check } from 'lucide-react';
import styles from './tierListFormModal.module.css';

interface Props {
  isOpen: boolean;
  editingItem: MangaTierListSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TierListFormModal({
  isOpen,
  editingItem,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [searchSchedule, setSearchSchedule] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function initModal() {
      try {
        setLoading(true);
        const allSchedules = await scheduleService.getSchedules();
        setSchedules(allSchedules || []);

        if (editingItem) {
          setTitle(editingItem.title);
          setDescription(editingItem.description || '');
          setIsPublic(editingItem.isPublic);
          const detail = await adminTierListService.getTierListDetail(editingItem.id);
          setSelectedIds(detail.items.map((i) => i.scheduleId));
        } else {
          setTitle('');
          setDescription('');
          setIsPublic(true);
          setSelectedIds([]);
        }
      } catch (err) {
        console.error('Failed to init modal data:', err);
      } finally {
        setLoading(false);
      }
    }

    initModal();
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề danh sách tuyển chọn');
      return;
    }

    const payload: CreateTierListPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      isPublic,
      scheduleIds: selectedIds,
    };

    try {
      setSubmitting(true);
      if (editingItem) {
        await adminTierListService.updateTierList(editingItem.id, payload);
      } else {
        await adminTierListService.createTierList(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save tier list:', err);
      alert('Không thể lưu danh sách tuyển chọn. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSchedules = schedules.filter(
    (s) =>
      s.title.toLowerCase().includes(searchSchedule.toLowerCase()) ||
      (s.imprint && s.imprint.toLowerCase().includes(searchSchedule.toLowerCase())) ||
      (s.publisher && s.publisher.toLowerCase().includes(searchSchedule.toLowerCase()))
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingItem ? 'Chỉnh Sửa Tuyển Chọn' : 'Tạo Danh Sách Tuyển Chọn Mới'}
          </h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tiêu đề danh sách <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="VD: Hyd Manga List, Top Manga Đỉnh Nhất..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả</label>
            <textarea
              className={styles.textarea}
              placeholder="Mô tả tóm tắt về danh sách tuyển chọn này..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Công khai danh sách này trên trang chủ cộng đồng</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.selectionHeader}>
              <label className={styles.label}>
                Chọn truyện từ Lịch phát hành ({selectedIds.length} đã chọn)
              </label>
              <div className={styles.searchBox}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Tìm tên truyện..."
                  value={searchSchedule}
                  onChange={(e) => setSearchSchedule(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.scheduleList}>
              {loading ? (
                <div className={styles.scheduleLoading}>Đang tải danh sách lịch phát hành...</div>
              ) : filteredSchedules.length === 0 ? (
                <div className={styles.scheduleEmpty}>Không tìm thấy truyện phù hợp</div>
              ) : (
                filteredSchedules.map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  const cover = s.coverUrl || s.editions?.[0]?.coverUrl;
                  return (
                    <div
                      key={s.id}
                      className={`${styles.scheduleItem} ${isChecked ? styles.scheduleItemSelected : ''}`}
                      onClick={() => toggleSelect(s.id)}
                    >
                      <div className={styles.checkIndicator}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div className={styles.itemThumb}>
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" className={styles.thumbImg} />
                        ) : (
                          <div className={styles.noCover} />
                        )}
                      </div>
                      <div className={styles.itemMeta}>
                        <span className={styles.mangaTitle}>{s.title}</span>
                        <span className={styles.mangaSub}>
                          {(s.imprint || s.publisher)} • {s.releaseDate || 'Chưa định ngày'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p className={styles.helpText}>
              * 3 truyện đầu tiên được chọn sẽ tự động kết hợp thành avatar tròn 3 lát.
            </p>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Hủy
            </button>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
