'use client';

import { useState } from 'react';
import type { ReleaseScheduleItem } from '@/types/schedule';
import type { CreateSchedulePayload } from '@/services/scheduleService';
import { useScheduleFormState } from '@/hooks/useScheduleFormState';
import { useScheduleInheritanceCandidate } from './useScheduleInheritanceCandidate';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import ScheduleMetadataFields from './ScheduleMetadataFields';
import ScheduleDynamicSpecsSection from './ScheduleDynamicSpecsSection';
import ScheduleEditionsSection from './ScheduleEditionsSection';
import { ScheduleStoreLinksSection } from './ScheduleStoreLinksSection';
import AdminScheduleSmartFillModal from './AdminScheduleSmartFillModal';
import ScheduleDuplicateAlert from './ScheduleDuplicateAlert';
import styles from './adminScheduleFormModal.module.css';

interface AdminScheduleFormModalProps {
  initialItem?: ReleaseScheduleItem | null;
  allItems?: ReleaseScheduleItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSchedulePayload) => Promise<void>;
}

const PUBLISHERS_PRESET = ['Kim Đồng', 'IPM', 'NXB Trẻ', 'AZ Việt Nam', 'Wings Books', 'Nhã Nam'];

export default function AdminScheduleFormModal({
  initialItem,
  allItems = [],
  isOpen,
  onClose,
  onSubmit,
}: AdminScheduleFormModalProps) {
  const form = useScheduleFormState(initialItem, isOpen, onSubmit, onClose);
  const { candidateAttributes, candidateLinks } = useScheduleInheritanceCandidate(initialItem, allItems);
  const [isSmartFillOpen, setIsSmartFillOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.headerSubtitle}>Quản lý thông tin xuất bản</span>
            <h3 className={styles.headerTitle}>
              {initialItem?.id ? 'Chỉnh Sửa Tập Truyện' : initialItem ? 'Thêm Tập Mới' : 'Thêm Mục Lịch Mới'}
            </h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={form.handleSubmit} className={styles.formBody}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionHeader}>1. Thông tin đầu sách / tập truyện</div>
            <button type="button" className={styles.smartFillBtn} onClick={() => setIsSmartFillOpen(true)}>
              Điền từ văn bản
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 2 }}>
              <label>Tựa đề sách / manga *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => form.setTitle(e.target.value)}
                placeholder="VD: Chú Thuật Hồi Chiến - Tập 25"
              />
              <ScheduleDuplicateAlert title={form.title} isEditing={Boolean(initialItem?.id)} />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Tên gốc</label>
              <input
                type="text"
                value={form.originalTitle}
                onChange={(e) => form.setOriginalTitle(e.target.value)}
                placeholder="VD: Jujutsu Kaisen 25"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Nhà xuất bản *</label>
              <input
                type="text"
                required
                value={form.publisher}
                onChange={(e) => form.setPublisher(e.target.value)}
              />
              <div className={styles.presetsRow}>
                {PUBLISHERS_PRESET.map((p) => (
                  <button key={p} type="button" className={styles.presetChip} onClick={() => form.setPublisher(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Tác giả</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => form.setAuthor(e.target.value)}
                placeholder="VD: Gege Akutami"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Ngày phát hành chung *</label>
              <input
                type="date"
                required
                value={form.releaseDate}
                onChange={(e) => form.setReleaseDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Ngày mở đặt trước chung</label>
              <input
                type="date"
                value={form.preOrderDate}
                onChange={(e) => form.setPreOrderDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <ImageUploadInput
              label="Ảnh bìa chính của đầu sách *"
              value={form.coverUrl}
              onChange={form.setCoverUrl}
              placeholder="Chọn hoặc kéo thả ảnh bìa chính của sách/manga"
              helperText="Ảnh bìa chính dùng cho lịch và hiển thị mặc định cho các phiên bản."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Giới thiệu nội dung</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
              placeholder="Tóm tắt nội dung tập truyện..."
            />
          </div>

          <ScheduleMetadataFields
            artist={form.artist}
            setArtist={form.setArtist}
            imprint={form.imprint}
            setImprint={form.setImprint}
            genres={form.genres}
            setGenres={form.setGenres}
            format={form.format}
            setFormat={form.setFormat}
            seriesStatus={form.seriesStatus}
            setSeriesStatus={form.setSeriesStatus}
            ageRating={form.ageRating}
            setAgeRating={form.setAgeRating}
            previousAttributes={candidateAttributes}
            onInheritAttributes={candidateAttributes ? () => form.handleInheritAttributes(candidateAttributes) : undefined}
          />

          <ScheduleDynamicSpecsSection
            specsList={form.specsList}
            onAddSpec={form.handleAddSpec}
            onUpdateSpec={form.handleUpdateSpec}
            onRemoveSpec={form.handleRemoveSpec}
          />

          <ScheduleEditionsSection
            editions={form.editions}
            releaseDate={form.releaseDate}
            preOrderDate={form.preOrderDate}
            onAddEdition={form.handleAddEdition}
            onUpdateEdition={form.handleUpdateEdition}
            onUpdateSingleEdition={form.handleUpdateSingleEdition}
            onRemoveEdition={form.handleRemoveEdition}
          />

          <ScheduleStoreLinksSection
            storeLinks={form.storeLinks}
            previousLinks={candidateLinks}
            onInheritLinks={candidateLinks ? form.handleInheritLinks : undefined}
            onAddLink={form.handleAddStoreLink}
            onRemoveLink={form.handleRemoveStoreLink}
            onUpdateLink={form.handleUpdateStoreLink}
            onReorderLinks={form.handleReorderStoreLinks}
          />

          <div className={styles.actionsFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={form.submitting}>Hủy</button>
            <button type="submit" className={styles.submitBtn} disabled={form.submitting}>
              {form.submitting
                ? 'Đang lưu...'
                : initialItem?.id
                ? 'Lưu thay đổi'
                : initialItem
                ? 'Hoàn tất & Thêm tập mới'
                : 'Hoàn tất & Thêm lịch'}
            </button>
          </div>
        </form>
      </div>

      <AdminScheduleSmartFillModal
        isOpen={isSmartFillOpen}
        onClose={() => setIsSmartFillOpen(false)}
        onApply={form.handleApplySmartFill}
      />
    </div>
  );
}
