'use client';

import { useState } from 'react';
import type { HomepageSectionConfig } from '@/config/homepageConfig';
import styles from './DecorationCanvas.module.css';

interface DecorationCanvasProps {
  sections: HomepageSectionConfig[];
  selectedId: string | null;
  onSelectSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleEnabled: (id: string) => void;
  onDeleteSection: (id: string) => void;
}

export default function DecorationCanvas({
  sections,
  selectedId,
  onSelectSection,
  onReorder,
  onToggleEnabled,
  onDeleteSection,
}: DecorationCanvasProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatSourceLabel = (sec: HomepageSectionConfig) => {
    switch (sec.dataSource) {
      case 'BEST_SELLING':
        return 'Top Bán Chạy';
      case 'CATEGORY':
        return sec.categoryName ? `Ngành: ${sec.categoryName}` : 'Theo Thể Loại';
      case 'VIP_MEMBERS':
        return 'Hội Viên VIP';
      case 'LATEST':
        return 'Mới Nhất';
      case 'DISCOUNTED':
        return 'Khuyến Mãi';
      case 'FEATURED_TABS':
        return 'Tabs Nổi Bật';
      case 'VOUCHERS':
        return 'Mã Giảm Giá';
      default:
        return sec.type;
    }
  };

  const formatDisplayLabel = (sec: HomepageSectionConfig) => {
    switch (sec.displayStyle) {
      case 'SLIDER':
        return 'Trượt Ngang';
      case 'RANKING':
        return 'Xếp Hạng (1..10)';
      case 'GRID':
      default:
        return `${sec.itemLimit || 8} Cuốn (Lưới)`;
    }
  };

  return (
    <div className={styles.canvasWrapper}>
      <div className={styles.canvasHeader}>
        <div>
          <h3 className={styles.headerTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Bố Cục Trang Chủ (Canvas)
          </h3>
          <span className={styles.headerSubtitle}>
            Bấm vào mục để cấu hình chi tiết tiêu đề & điều kiện load data
          </span>
        </div>

        <span style={{ fontSize: '12px', fontWeight: 700, color: '#ee4d2d', background: '#fff1f0', padding: '4px 10px', borderRadius: '9999px' }}>
          {sections.length} Section
        </span>
      </div>

      <div className={styles.sectionStack}>
        {sections.length === 0 ? (
          <div className={styles.emptyNotice}>Chưa có section nào. Vui lòng thêm từ cột bên trái.</div>
        ) : (
          sections.map((sec, idx) => {
            const isSelected = selectedId === sec.id;
            const isDragging = draggedIndex === idx;

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectSection(sec.id)}
                className={`${styles.sectionCard} ${isSelected ? styles.sectionCardSelected : ''} ${
                  !sec.enabled ? styles.sectionCardDisabled : ''
                } ${isDragging ? styles.sectionCardDragging : ''}`}
              >
                <div className={styles.leftArea}>
                  {/* Order Controls */}
                  <div className={styles.orderControls} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onReorder(idx, idx - 1)}
                      disabled={idx === 0}
                      className={styles.arrowBtn}
                      title="Lên trên"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorder(idx, idx + 1)}
                      disabled={idx === sections.length - 1}
                      className={styles.arrowBtn}
                      title="Xuống dưới"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <span className={styles.orderNumber}>#{idx + 1}</span>

                  <div className={styles.dragHandle} title="Kéo để di chuyển">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="6" r="1.5" />
                      <circle cx="15" cy="6" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="18" r="1.5" />
                      <circle cx="15" cy="18" r="1.5" />
                    </svg>
                  </div>

                  <div className={styles.sectionInfo}>
                    <div className={styles.titleRow}>
                      <span className={styles.sectionTitle}>{sec.title}</span>
                      <span className={styles.tagPill}>{formatSourceLabel(sec)}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span>Kiểu: {formatDisplayLabel(sec)}</span>
                      {sec.subtitle && (
                        <>
                          <span>•</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                            {sec.subtitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.rightArea} onClick={(e) => e.stopPropagation()}>
                  {/* Active Toggle Switch */}
                  <label className={styles.switchToggle} title={sec.enabled ? 'Đang bật hiển thị' : 'Đang ẩn'}>
                    <input
                      type="checkbox"
                      checked={sec.enabled}
                      onChange={() => onToggleEnabled(sec.id)}
                    />
                    <span className={styles.slider}></span>
                  </label>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteSection(sec.id)}
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    title="Xóa section này"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
