'use client';

import React, { useState } from 'react';
import type { ReleaseStoreLinkItem } from '@/types/schedule';
import { scheduleService } from '@/services/scheduleService';
import { ScheduleStoreLinkCardItem } from './ScheduleStoreLinkCardItem';
import styles from './scheduleStoreLinksSection.module.css';

interface Props {
  storeLinks: ReleaseStoreLinkItem[];
  previousLinks?: ReleaseStoreLinkItem[];
  onInheritLinks?: (links: ReleaseStoreLinkItem[]) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink: (index: number, updated: ReleaseStoreLinkItem) => void;
  onReorderLinks: (newLinks: ReleaseStoreLinkItem[]) => void;
}

export function ScheduleStoreLinksSection({
  storeLinks,
  previousLinks,
  onInheritLinks,
  onAddLink,
  onRemoveLink,
  onUpdateLink,
  onReorderLinks,
}: Props) {
  const [checkingIdx, setCheckingIdx] = useState<number | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, { text: string; success: boolean }>>({});
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const moveLink = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= storeLinks.length || fromIndex === toIndex) return;
    const updated = [...storeLinks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorderLinks(updated.map((link, idx) => ({ ...link, sortOrder: idx })));
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== dropIdx) moveLink(draggedIdx, dropIdx);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleCheckPrice = async (idx: number, url: string) => {
    if (!url || !url.trim()) {
      setStatusMap((prev) => ({
        ...prev,
        [idx]: { text: 'Vui lòng nhập link trước khi check giá', success: false },
      }));
      return;
    }
    try {
      setCheckingIdx(idx);
      setStatusMap((prev) => ({ ...prev, [idx]: { text: 'Đang kiểm tra...', success: true } }));
      const res = await scheduleService.checkShopeePrice(url);
      if (res.success && typeof res.price === 'number') {
        const foundPrice = res.price;
        onUpdateLink(idx, {
          ...storeLinks[idx],
          marketPrice: foundPrice,
          storeName: storeLinks[idx].storeName || res.storeName || 'Gian hàng Shopee',
        });
        setStatusMap((prev) => ({
          ...prev,
          [idx]: {
            text: `Đã tìm thấy giá: ${new Intl.NumberFormat('vi-VN').format(foundPrice)}đ`,
            success: true,
          },
        }));
      } else {
        setStatusMap((prev) => ({
          ...prev,
          [idx]: {
            text: res.message || 'Không thể crawl tự động, bạn có thể nhập giá tay',
            success: false,
          },
        }));
      }
    } catch {
      setStatusMap((prev) => ({
        ...prev,
        [idx]: { text: 'Lỗi khi gọi API kiểm tra giá', success: false },
      }));
    } finally {
      setCheckingIdx(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>Liên kết sàn thương mại & Affiliate ({storeLinks.length})</span>
        </div>
        <div className={styles.headerActions}>
          {onInheritLinks && previousLinks && previousLinks.length > 0 && (
            <button
              type="button"
              onClick={() => onInheritLinks(previousLinks)}
              className={styles.inheritBtn}
              title="Lấy danh sách liên kết sàn từ tập trước (không kèm ID để tạo mới)"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Lấy link từ tập trước ({previousLinks.length})</span>
            </button>
          )}
          <button type="button" onClick={onAddLink} className={styles.addBtn}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Thêm liên kết sàn</span>
          </button>
        </div>
      </div>

      {storeLinks.length === 0 ? (
        <div className={styles.emptyHint}>
          Chưa cấu hình liên kết sàn. Hệ thống sẽ tự động dùng link tìm kiếm thông minh Shopee/TikTok/Tiki/Fahasa theo tên sách.
        </div>
      ) : (
        <div className={styles.linksList}>
          {storeLinks.map((link, idx) => (
            <ScheduleStoreLinkCardItem
              key={link.id || idx}
              index={idx}
              totalCount={storeLinks.length}
              link={link}
              isChecking={checkingIdx === idx}
              status={statusMap[idx]}
              isDragging={draggedIdx === idx}
              isDragOver={dragOverIdx === idx && draggedIdx !== idx}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, idx)}
              onMove={moveLink}
              onUpdate={(updated) => onUpdateLink(idx, updated)}
              onRemove={() => onRemoveLink(idx)}
              onCheckPrice={(url) => handleCheckPrice(idx, url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
