'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './scheduleDetailModal.module.css';

interface ScheduleDetailModalProps {
  item: ReleaseScheduleItem | null;
  onClose: () => void;
}

export default function ScheduleDetailModal({ item, onClose }: ScheduleDetailModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const formatCurrency = (val?: number) => {
    if (!val) return 'Đang cập nhật';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getEditionLabel = (type: string) => {
    switch (type) {
      case 'SPECIAL': return 'Bản đặc biệt (Special Edition)';
      case 'LIMITED': return 'Bản giới hạn (Limited Edition)';
      case 'BOXSET': return 'Hộp sưu tầm (Boxset)';
      default: return 'Bản phổ thông (Standard)';
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.headerSubtitle}>Thông tin lịch xuất bản</span>
            <h3 className={styles.modalTitle}>{item.title}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.modalBody}>
          <div className={styles.coverSide}>
            <div className={styles.coverBox}>
              {item.coverUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className={styles.coverImg}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={styles.coverFallback}>Ảnh bìa dự kiến</div>
              )}
            </div>
            <div className={styles.publisherTagBox}>
              <span className={styles.pubTagLabel}>Nhà xuất bản</span>
              <span className={styles.pubTagName}>{item.publisher}</span>
            </div>
          </div>

          <div className={styles.detailsSide}>
            {/* Meta Table */}
            <div className={styles.metaList}>
              {item.originalTitle && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Tên gốc:</span>
                  <span className={styles.metaValue}>{item.originalTitle}</span>
                </div>
              )}
              {item.author && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Tác giả:</span>
                  <span className={styles.metaValue}>{item.author}</span>
                </div>
              )}
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Ngày phát hành:</span>
                <span className={`${styles.metaValue} ${styles.highlightDate}`}>
                  {formatDate(item.releaseDate)}
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Phiên bản:</span>
                <span className={styles.metaValue}>{getEditionLabel(item.editionType)}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Giá bìa dự kiến:</span>
                <span className={`${styles.metaValue} ${styles.priceHighlight}`}>
                  {formatCurrency(item.estimatedPrice)}
                </span>
              </div>
            </div>

            {/* Gifts Box */}
            {item.gifts && (
              <div className={styles.giftsBox}>
                <h5 className={styles.giftsTitle}>Phụ kiện & Quà tặng kèm</h5>
                <p className={styles.giftsText}>{item.gifts}</p>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className={styles.descBox}>
                <h5 className={styles.descTitle}>Giới thiệu nội dung</h5>
                <p className={styles.descText}>{item.description}</p>
              </div>
            )}

            {/* Store Link Section */}
            <div className={styles.storeLinkCard}>
              {item.linkedBook ? (
                <div className={styles.linkedSuccess}>
                  <div className={styles.linkedInfo}>
                    <span className={styles.linkedBadge}>Đã có trên Boki</span>
                    <span className={styles.linkedPrice}>
                      Giá mở bán: {formatCurrency(item.linkedBook.price)}
                    </span>
                  </div>
                  <Link
                    href={`/books/${item.linkedBook.slug || item.linkedBook.id}`}
                    className={styles.ctaButton}
                    onClick={onClose}
                  >
                    {item.linkedBook.isPreOrder ? 'Đặt trước trên Boki' : 'Xem trang sản phẩm'}
                  </Link>
                </div>
              ) : (
                <div className={styles.unlinkedNotice}>
                  <span className={styles.noticeTitle}>Tình trạng mở bán trên Boki</span>
                  <p className={styles.noticeText}>
                    Tập sách này hiện chưa mở bán chính thức trên sàn Boki. Ban biên tập sẽ cập nhật link đặt ngay khi có nguồn hàng!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
