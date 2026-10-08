'use client';

import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './adminScheduleTable.module.css';

interface AdminScheduleTableProps {
  items: ReleaseScheduleItem[];
  onEdit: (item: ReleaseScheduleItem) => void;
  onDelete: (id: string, title: string) => void;
}

export default function AdminScheduleTable({
  items,
  onEdit,
  onDelete,
}: AdminScheduleTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getEditionBadge = (type: string) => {
    switch (type) {
      case 'SPECIAL': return <span className={`${styles.badge} ${styles.badgeSpecial}`}>Bản đặc biệt</span>;
      case 'LIMITED': return <span className={`${styles.badge} ${styles.badgeLimited}`}>Bản giới hạn</span>;
      case 'BOXSET': return <span className={`${styles.badge} ${styles.badgeBoxset}`}>Boxset</span>;
      default: return <span className={`${styles.badge} ${styles.badgeStandard}`}>Bản thường</span>;
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
            <th>Phiên bản</th>
            <th>Quà tặng kèm</th>
            <th>Liên kết Boki</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className={styles.thumbBox}>
                  {item.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverUrl} alt={item.title} className={styles.thumbImg} />
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
              </td>
              <td>
                {getEditionBadge(item.editionType)}
              </td>
              <td>
                <div className={styles.giftsText} title={item.gifts || ''}>
                  {item.gifts || '—'}
                </div>
              </td>
              <td>
                {item.linkedBook ? (
                  <div className={styles.linkedBox}>
                    <span className={styles.linkedBadge}>Đã liên kết</span>
                    <Link
                      href={`/books/${item.linkedBook.slug || item.linkedBook.id}`}
                      target="_blank"
                      className={styles.linkedLink}
                      title={item.linkedBook.title}
                    >
                      {item.linkedBook.title}
                    </Link>
                  </div>
                ) : (
                  <span className={styles.unlinkedBadge}>Chưa liên kết</span>
                )}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div className={styles.actionsRow}>
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
                    onClick={() => onDelete(item.id, item.title)}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
