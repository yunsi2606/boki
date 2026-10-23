'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';
import styles from './scheduleDetailEditionContent.module.css';

interface ScheduleDetailEditionContentProps {
  item: ReleaseScheduleItem;
  currentEdition: ReleaseScheduleEditionItem;
  onClose: () => void;
}

export default function ScheduleDetailEditionContent({
  item,
  currentEdition,
  onClose,
}: ScheduleDetailEditionContentProps) {
  const [imgError, setImgError] = useState(false);

  const formatCurrency = (val?: number) => {
    if (!val) return 'Đang cập nhật';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Đang cập nhật';
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

  const displayCover = currentEdition.coverUrl || item.coverUrl || item.editions?.find((e) => e.coverUrl)?.coverUrl;
  const displayReleaseDate = currentEdition.effectiveReleaseDate || currentEdition.releaseDate || item.releaseDate;
  const displayPreOrderDate = currentEdition.effectivePreOrderDate || currentEdition.preOrderDate || item.preOrderDate;

  const hasMultipleEditions = item.editions && item.editions.length > 1;

  return (
    <div className={styles.bodyLayout}>
      <div className={styles.coverSide}>
        <div className={styles.coverBox}>
          {displayCover && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayCover}
              alt={item.title}
              className={styles.coverImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.coverFallback}>Ảnh bìa dự kiến</div>
          )}
        </div>
        <div className={styles.publisherTagBox}>
          <span className={styles.pubTagLabel}>{item.imprint ? 'Đơn vị phát hành' : 'Nhà xuất bản'}</span>
          <span className={styles.pubTagName}>{item.imprint || item.publisher}</span>
        </div>
      </div>

      <div className={styles.detailsSide}>
        <div className={styles.metaList}>
          {item.imprint && item.publisher && item.imprint.trim().toLowerCase() !== item.publisher.trim().toLowerCase() && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Nhà xuất bản:</span>
              <span className={styles.metaValue}>{item.publisher}</span>
            </div>
          )}
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
              {formatDate(displayReleaseDate)}
            </span>
          </div>
          {displayPreOrderDate && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Ngày mở Pre-order:</span>
              <span className={`${styles.metaValue} ${styles.preOrderHighlight}`}>
                {formatDate(displayPreOrderDate)}
              </span>
            </div>
          )}
          {(hasMultipleEditions || currentEdition.editionType !== 'STANDARD') && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Phiên bản:</span>
              <span className={styles.metaValue}>{getEditionLabel(currentEdition.editionType)}</span>
            </div>
          )}
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Giá bìa dự kiến:</span>
            <span className={`${styles.metaValue} ${styles.priceHighlight}`}>
              {formatCurrency(currentEdition.estimatedPrice)}
            </span>
          </div>
        </div>

        {currentEdition.gifts && (
          <div className={styles.giftsBox}>
            <h5 className={styles.giftsTitle}>
              {hasMultipleEditions
                ? `Phụ kiện & Quà tặng kèm (${currentEdition.editionName})`
                : 'Phụ kiện & Quà tặng kèm'}
            </h5>
            <p className={styles.giftsText}>{currentEdition.gifts}</p>
          </div>
        )}

        {item.description && (
          <div className={styles.descBox}>
            <h5 className={styles.descTitle}>Giới thiệu nội dung</h5>
            <p className={styles.descText}>{item.description}</p>
          </div>
        )}

        <div className={styles.storeLinkCard}>
          {currentEdition.linkedBook ? (
            <div className={styles.linkedSuccess}>
              <div className={styles.linkedInfo}>
                <span className={styles.linkedBadge}>
                  {hasMultipleEditions
                    ? `Đã có trên Boki (${currentEdition.editionName})`
                    : 'Đã có trên Boki'}
                </span>
                <span className={styles.linkedPrice}>
                  Giá mở bán: {formatCurrency(currentEdition.linkedBook.price)}
                </span>
              </div>
              <Link
                href={`/books/${currentEdition.linkedBook.slug || currentEdition.linkedBook.id}`}
                className={styles.ctaButton}
                onClick={onClose}
              >
                {currentEdition.linkedBook.isPreOrder ? 'Đặt trước trên Boki' : 'Xem trang sản phẩm'}
              </Link>
            </div>
          ) : (
            <div className={styles.unlinkedNotice}>
              <span className={styles.noticeTitle}>Tình trạng mở bán trên Boki</span>
              <p className={styles.noticeText}>
                Phiên bản này hiện chưa mở bán chính thức trên sàn Boki. Ban biên tập sẽ cập nhật link đặt ngay khi có nguồn hàng!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
