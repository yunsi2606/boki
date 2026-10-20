'use client';

import Link from 'next/link';
import type { ReleaseScheduleEditionItem, ReleaseStoreLinkItem } from '@/types/schedule';
import { VolumeStoreLinks } from './VolumeStoreLinks';
import styles from './volumeEditionsList.module.css';

interface Props {
  editions: ReleaseScheduleEditionItem[];
  selectedEditionIdx: number;
  onSelectEdition: (index: number) => void;
  bookTitle: string;
  publisher: string;
  author?: string;
  scheduleReleaseDate: string;
  scheduleCoverUrl?: string;
  storeLinks?: ReleaseStoreLinkItem[];
}

export function VolumeEditionsList({
  editions,
  selectedEditionIdx,
  onSelectEdition,
  bookTitle,
  publisher,
  author,
  scheduleReleaseDate,
  scheduleCoverUrl,
  storeLinks,
}: Props) {
  if (!editions || editions.length === 0) return null;

  const currentEdition = editions[selectedEditionIdx] || editions[0];
  const price = currentEdition.linkedBook?.price || currentEdition.estimatedPrice;
  const isSpecial =
    currentEdition.editionType === 'SPECIAL' || currentEdition.editionType === 'LIMITED';
  const coverUrl = currentEdition.coverUrl || scheduleCoverUrl;
  const releaseDateStr =
    currentEdition.effectiveReleaseDate || currentEdition.releaseDate || scheduleReleaseDate;

  const formattedDate = releaseDateStr
    ? new Date(releaseDateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Đang cập nhật';

  const editionStoreLinks = storeLinks?.filter(
    (s) => !s.editionId || s.editionId === currentEdition.id
  ) || storeLinks;

  return (
    <section className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>Phiên bản phát hành</h2>
        {editions.length > 1 && (
          <span className={styles.editionCount}>{editions.length} phiên bản</span>
        )}
      </div>

      {/* Switcher Tabs */}
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
                <span className={styles.tabName}>{ed.editionName}</span>
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

      {/* Content-rich Product Catalog Card */}
      <div className={`${styles.catalogCard} ${isSpecial ? styles.specialCard : ''}`}>
        <div className={styles.catalogGrid}>
          {/* Left: Edition Cover Visual */}
          <div className={styles.coverCol}>
            <div className={styles.coverFrame}>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt={currentEdition.editionName} className={styles.coverImg} />
              ) : (
                <div className={styles.placeholderCover}>Bìa phiên bản</div>
              )}
              {(isSpecial || editions.length > 1) && (
                <span className={isSpecial ? styles.badgeSpecial : styles.badgeStandard}>
                  {currentEdition.editionName}
                </span>
              )}
            </div>
          </div>

          {/* Right: Rich Metadata Table */}
          <div className={styles.infoCol}>
            <div className={styles.infoHeader}>
              <h3 className={styles.editionHeading}>
                {editions.length > 1 || isSpecial
                  ? `${bookTitle} — ${currentEdition.editionName}`
                  : bookTitle}
              </h3>
              <div className={styles.priceRow}>
                <span className={styles.priceValue}>
                  {price
                    ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(price)
                    : 'Đang cập nhật giá'}
                </span>
              </div>
            </div>

            {/* Book Spec Data Grid */}
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Nhà xuất bản:</span>
                <span className={styles.specVal}>{publisher}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Biên soạn / Tác giả:</span>
                <span className={styles.specVal}>{author || 'Đang cập nhật'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Ngày phát hành:</span>
                <span className={styles.specVal}>{formattedDate}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Trạng thái:</span>
                <span className={styles.specValStatus}>
                  {currentEdition.status === 'RELEASED' ? 'Đã phát hành' : 'Lịch dự kiến'}
                </span>
              </div>
            </div>

            {/* Gifts & Goodies Section */}
            <div className={styles.giftsBox}>
              <span className={styles.giftsTitle}>Phụ kiện & Quà tặng kèm:</span>
              <div className={styles.giftsText}>
                {currentEdition.gifts && currentEdition.gifts.trim().length > 0
                  ? currentEdition.gifts
                  : 'Bản phổ thông, không kèm phụ kiện rời theo thông báo NXB.'}
              </div>
            </div>

            {/* Compact Merchant & Affiliate Dock */}
            <VolumeStoreLinks
              bookTitle={bookTitle}
              basePrice={price}
              linkedBook={currentEdition.linkedBook}
              storeLinks={editionStoreLinks}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
