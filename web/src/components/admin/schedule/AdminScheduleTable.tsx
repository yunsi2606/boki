'use client';

import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './adminScheduleTable.module.css';

interface AdminScheduleTableProps {
  items: ReleaseScheduleItem[];
  onEdit: (item: ReleaseScheduleItem) => void;
  onDelete: (item: ReleaseScheduleItem) => void;
  onAddNextVolume: (item: ReleaseScheduleItem) => void;
}

export default function AdminScheduleTable({
  items,
  onEdit,
  onDelete,
  onAddNextVolume,
}: AdminScheduleTableProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getEditionBadgeClass = (type: string) => {
    switch (type) {
      case 'SPECIAL': return styles.badgeSpecial;
      case 'LIMITED': return styles.badgeLimited;
      case 'BOXSET': return styles.badgeBoxset;
      default: return styles.badgeStandard;
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>Chưa có mục lịch phát hành nào trong danh sách.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Bìa</th>
            <th>Tựa đề tác phẩm</th>
            <th>Nhà xuất bản</th>
            <th>Ngày phát hành</th>
            <th>Các phiên bản ({items.reduce((acc, i) => acc + (i.editions?.length || 0), 0)})</th>
            <th>Liên kết Boki</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const firstCover = item.coverUrl || item.editions?.find((e) => e.coverUrl)?.coverUrl;
            const linkedEditions = item.editions?.filter((e) => e.linkedBook || e.bookId) || [];

            return (
              <tr key={item.id}>
                <td>
                  <div className={styles.thumbBox}>
                    {firstCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firstCover} alt={item.title} className={styles.thumbImg} />
                    ) : (
                      <span className={styles.noThumb}>N/A</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.titleCol}>
                    <strong className={styles.mainTitle}>{item.title}</strong>
                    {item.originalTitle && <span className={styles.subTitle}>{item.originalTitle}</span>}
                    {item.author && <span className={styles.authorText}>TG: {item.author}</span>}
                  </div>
                </td>
                <td>
                  <span className={styles.publisherTag}>{item.publisher}</span>
                </td>
                <td>
                  <span className={styles.dateText}>{formatDate(item.releaseDate)}</span>
                  {item.preOrderDate && (
                    <span className={styles.preOrderDateText}>Pre-order: {formatDate(item.preOrderDate)}</span>
                  )}
                </td>
                <td>
                  <div className={styles.editionsPillsList}>
                    {item.editions && item.editions.length > 0 ? (
                      item.editions.map((ed, idx) => (
                        <div key={ed.id || idx} className={styles.editionRow}>
                          <span className={`${styles.badge} ${getEditionBadgeClass(ed.editionType)}`}>
                            {ed.editionName}
                          </span>
                          {ed.gifts && (
                            <span className={styles.giftsText} title={ed.gifts}>
                              🎁 {ed.gifts}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className={styles.unlinkedBadge}>Bản phổ thông</span>
                    )}
                  </div>
                </td>
                <td>
                  {linkedEditions.length > 0 ? (
                    <div className={styles.linkedBox}>
                      <span className={styles.linkedBadge}>Đã link {linkedEditions.length} bản</span>
                      {linkedEditions.map((le, idx) => (
                        <Link
                          key={le.id || idx}
                          href={`/books/${le.linkedBook?.slug || le.linkedBook?.id || le.bookId}`}
                          target="_blank"
                          className={styles.linkedLink}
                          title={le.linkedBook?.title || le.editionName}
                        >
                          {le.editionName}: {le.linkedBook?.title || 'Sản phẩm Boki'}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.unlinkedBadge}>Chưa liên kết</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className={styles.actionsRow}>
                    <button
                      type="button"
                      className={styles.cloneBtn}
                      onClick={() => onAddNextVolume(item)}
                      title="Lấy thông tin tác phẩm này để tạo tập tiếp theo"
                    >
                      Thêm tập
                    </button>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => onEdit(item)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => onDelete(item)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
