'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';
import styles from './scheduleBookCard.module.css';

interface ScheduleBookCardProps {
  item: ReleaseScheduleItem;
  onOpenDetail: (item: ReleaseScheduleItem, selectedEditionIdx?: number) => void;
}

export default function ScheduleBookCard({ item, onOpenDetail }: ScheduleBookCardProps) {
  const [activeEditionIdx, setActiveEditionIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const editions = item.editions && item.editions.length > 0
    ? item.editions
    : [{
        editionName: 'Bản phổ thông',
        editionType: 'STANDARD' as const,
        releaseDate: item.releaseDate,
        status: item.status,
      }];

  const currentEdition: ReleaseScheduleEditionItem = editions[activeEditionIdx] || editions[0];

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
      case 'SPECIAL': return 'Bản đặc biệt';
      case 'LIMITED': return 'Bản giới hạn';
      case 'BOXSET': return 'Boxset';
      default: return 'Bản thường';
    }
  };

  const displayCover = currentEdition.coverUrl || item.editions?.find((e) => e.coverUrl)?.coverUrl;
  const displayDate = currentEdition.effectiveReleaseDate || currentEdition.releaseDate || item.releaseDate;

  return (
    <div className={styles.card}>
      {/* Cover container */}
      <div className={styles.coverContainer} onClick={() => onOpenDetail(item, activeEditionIdx)}>
        {displayCover && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayCover}
            alt={item.title}
            className={styles.coverImg}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.coverFallback}>Bìa phát hành</div>
        )}
      </div>

      {/* Info column */}
      <div className={styles.infoColumn}>
        <div>
          <div className={styles.topMetaRow}>
            <span className={styles.publisherBadge}>{item.publisher}</span>
            <span className={styles.editionBadge}>{getEditionLabel(currentEdition.editionType)}</span>
            <span className={styles.datePill}>{formatDate(displayDate)}</span>
          </div>

          <h4 className={styles.bookTitle} onClick={() => onOpenDetail(item, activeEditionIdx)} title={item.title}>
            {item.title}
          </h4>

          {item.originalTitle && (
            <p className={styles.originalTitle}>{item.originalTitle}</p>
          )}

          {item.author && (
            <div className={styles.metaRow}>
              <span>Tác giả: <strong>{item.author}</strong></span>
            </div>
          )}

          {/* Editions Selector Chips */}
          {editions.length > 1 && (
            <div className={styles.editionsChipsRow}>
              <span className={styles.editionsChipsLabel}>Phiên bản:</span>
              {editions.map((ed, idx) => (
                <button
                  key={ed.id || idx}
                  type="button"
                  className={`${styles.editionChipBtn} ${activeEditionIdx === idx ? styles.editionChipBtnActive : ''}`}
                  onClick={() => {
                    setActiveEditionIdx(idx);
                    setImgError(false);
                  }}
                >
                  {ed.editionName}
                </button>
              ))}
            </div>
          )}

          {/* Gifts preview */}
          {currentEdition.gifts && (
            <div className={styles.giftsTag} title={currentEdition.gifts}>
              <span className={styles.giftsLabel}>Quà kèm:</span> {currentEdition.gifts}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className={styles.bottomActionRow}>
          <div className={styles.priceGroup}>
            <span className={styles.priceLabel}>Giá bìa ({currentEdition.editionName})</span>
            <span className={styles.priceMain}>
              {formatCurrency(currentEdition.linkedBook?.price || currentEdition.estimatedPrice)}
            </span>
          </div>

          <div className={styles.actionsBtnGroup}>
            <button
              type="button"
              className={styles.detailBtn}
              onClick={() => onOpenDetail(item, activeEditionIdx)}
            >
              Chi tiết
            </button>

            {currentEdition.linkedBook ? (
              <Link
                href={`/books/${currentEdition.linkedBook.slug || currentEdition.linkedBook.id}`}
                className={styles.viewProductBtn}
              >
                {currentEdition.linkedBook.isPreOrder ? 'Đặt trước' : 'Xem sản phẩm'}
              </Link>
            ) : (
              <span className={styles.notOnSaleTag}>Chờ mở bán</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
