'use client';

import Link from 'next/link';
import type { ReleaseScheduleEditionItem } from '@/types/schedule';
import styles from './volumeEditionsList.module.css';

interface Props {
  editions: ReleaseScheduleEditionItem[];
  selectedEditionIdx: number;
  onSelectEdition: (index: number) => void;
}

export function VolumeEditionsList({
  editions,
  selectedEditionIdx,
  onSelectEdition,
}: Props) {
  if (!editions || editions.length === 0) return null;

  const currentEdition = editions[selectedEditionIdx] || editions[0];
  const price = currentEdition.linkedBook?.price || currentEdition.estimatedPrice;
  const isSpecial =
    currentEdition.editionType === 'SPECIAL' || currentEdition.editionType === 'LIMITED';

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Phiên bản phát hành</h3>
        <span className={styles.editionCount}>{editions.length} phiên bản</span>
      </div>

      {/* Edition Switcher Tabs */}
      {editions.length > 1 && (
        <div className={styles.tabsRow}>
          {editions.map((ed, idx) => {
            const isTabActive = idx === selectedEditionIdx;
            const isTabSpecial = ed.editionType === 'SPECIAL' || ed.editionType === 'LIMITED';

            return (
              <button
                key={ed.id || idx}
                type="button"
                className={`${styles.tabBtn} ${isTabActive ? styles.activeTab : ''} ${
                  isTabSpecial ? styles.specialTab : ''
                }`}
                onClick={() => onSelectEdition(idx)}
              >
                <span>{ed.editionName}</span>
                {ed.estimatedPrice && (
                  <span className={styles.tabPrice}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(ed.estimatedPrice)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Edition Details Box */}
      <div className={`${styles.detailBox} ${isSpecial ? styles.specialDetailBox : ''}`}>
        <div className={styles.detailHeader}>
          <div className={styles.nameAndBadge}>
            <h4 className={styles.editionName}>{currentEdition.editionName}</h4>
            <span className={isSpecial ? styles.badgeSpecial : styles.badgeStandard}>
              {currentEdition.editionType}
            </span>
          </div>
          <div className={styles.priceTag}>
            {price
              ? new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(price)
              : 'Đang cập nhật giá'}
          </div>
        </div>

        {currentEdition.gifts ? (
          <div className={styles.giftsRow}>
            <span className={styles.giftsLabel}>Phụ kiện & Quà tặng kèm:</span>
            <div className={styles.giftsContent}>{currentEdition.gifts}</div>
          </div>
        ) : (
          <div className={styles.giftsRow}>
            <span className={styles.giftsLabel}>Phụ kiện:</span>
            <span className={styles.noGifts}>Bản tiêu chuẩn, không kèm quà tặng rời.</span>
          </div>
        )}

        {currentEdition.linkedBook && (
          <div className={styles.linkedStoreBox}>
            <div className={styles.linkedText}>
              Đã mở bán chính thức trên sàn <strong>Boki Store</strong>:
            </div>
            <Link
              href={`https://boki.nhatcuong.io.vn/books/${currentEdition.linkedBook.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bokiBuyBtn}
            >
              Xem & Mua trên Boki Store ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentEdition.linkedBook.price)})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
