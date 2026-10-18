'use client';

import { useState } from 'react';
import type { ReleaseScheduleItem } from '@/types/schedule';
import type { CreateSchedulePayload } from '@/services/scheduleService';
import { useScheduleFormState } from '@/hooks/useScheduleFormState';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import ScheduleMetadataFields from './ScheduleMetadataFields';
import ScheduleDynamicSpecsSection from './ScheduleDynamicSpecsSection';
import ScheduleEditionsSection from './ScheduleEditionsSection';
import AdminScheduleSmartFillModal from './AdminScheduleSmartFillModal';
import styles from './adminScheduleFormModal.module.css';

interface AdminScheduleFormModalProps {
  initialItem?: ReleaseScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSchedulePayload) => Promise<void>;
}

const PUBLISHERS_PRESET = ['Kim Đồng', 'IPM', 'NXB Trẻ', 'AZ Việt Nam', 'Wings Books', 'Nhã Nam'];

export default function AdminScheduleFormModal({
  initialItem,
  isOpen,
  onClose,
  onSubmit,
}: AdminScheduleFormModalProps) {
  const {
    title, setTitle,
    originalTitle, setOriginalTitle,
    publisher, setPublisher,
    author, setAuthor,
    artist, setArtist,
    imprint, setImprint,
    genres, setGenres,
    format, setFormat,
    seriesStatus, setSeriesStatus,
    ageRating, setAgeRating,
    specsList,
    handleAddSpec,
    handleUpdateSpec,
    handleRemoveSpec,
    releaseDate, setReleaseDate,
    preOrderDate, setPreOrderDate,
    coverUrl, setCoverUrl,
    description, setDescription,
    editions,
    submitting,
    handleAddEdition,
    handleUpdateEdition,
    handleUpdateSingleEdition,
    handleRemoveEdition,
    handleApplySmartFill,
    handleSubmit,
  } = useScheduleFormState(initialItem, isOpen, onSubmit, onClose);

  const [isSmartFillOpen, setIsSmartFillOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.headerSubtitle}>Quản lý thông tin xuất bản</span>
            <h3 className={styles.headerTitle}>
              {initialItem?.id
                ? 'Chỉnh Sửa Tập Truyện & Phiên Bản'
                : initialItem
                ? 'Thêm Tập Mới Cho Bộ Truyện'
                : 'Thêm Mục Lịch Phát Hành Mới'}
            </h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionHeader}>1. Thông tin đầu sách / tập truyện</div>
            <button
              type="button"
              className={styles.smartFillBtn}
              onClick={() => setIsSmartFillOpen(true)}
            >
              Điền từ văn bản
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 2 }}>
              <label>Tựa đề sách / manga *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Chú Thuật Hồi Chiến - Tập 25"
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Tên gốc</label>
              <input
                type="text"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
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
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
              <div className={styles.presetsRow}>
                {PUBLISHERS_PRESET.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={styles.presetChip}
                    onClick={() => setPublisher(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Tác giả</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
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
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Ngày mở đặt trước chung (Pre-order)</label>
              <input
                type="date"
                value={preOrderDate}
                onChange={(e) => setPreOrderDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <ImageUploadInput
              label="Ảnh bìa chính của đầu sách *"
              value={coverUrl}
              onChange={setCoverUrl}
              placeholder="Chọn hoặc kéo thả ảnh bìa chính của sách/manga"
              helperText="Ảnh bìa chính dùng cho lịch và hiển thị mặc định cho các phiên bản."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Giới thiệu nội dung</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tóm tắt nội dung tập truyện..."
            />
          </div>

          <ScheduleMetadataFields
            artist={artist}
            setArtist={setArtist}
            imprint={imprint}
            setImprint={setImprint}
            genres={genres}
            setGenres={setGenres}
            format={format}
            setFormat={setFormat}
            seriesStatus={seriesStatus}
            setSeriesStatus={setSeriesStatus}
            ageRating={ageRating}
            setAgeRating={setAgeRating}
          />

          <ScheduleDynamicSpecsSection
            specsList={specsList}
            onAddSpec={handleAddSpec}
            onUpdateSpec={handleUpdateSpec}
            onRemoveSpec={handleRemoveSpec}
          />

          <ScheduleEditionsSection
            editions={editions}
            releaseDate={releaseDate}
            preOrderDate={preOrderDate}
            onAddEdition={handleAddEdition}
            onUpdateEdition={handleUpdateEdition}
            onUpdateSingleEdition={handleUpdateSingleEdition}
            onRemoveEdition={handleRemoveEdition}
          />

          <div className={styles.actionsFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting
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
        onApply={handleApplySmartFill}
      />
    </div>
  );
}
