'use client';

import React from 'react';
import type { OcrParsedBookItem, ReleaseEditionType } from '@/types/schedule';
import OcrCoverCell from './OcrCoverCell';
import styles from './ocrStagingTable.module.css';

interface OcrStagingTableProps {
  items: OcrParsedBookItem[];
  onUpdateItem: (tempId: string, updated: Partial<OcrParsedBookItem>) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function OcrStagingTable({
  items,
  onUpdateItem,
  onSelectAll,
}: OcrStagingTableProps) {
  const selectedCount = items.filter((i) => i.selected).length;

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'EXACT_MATCH':
        return styles.badgeExact;
      case 'SIMILAR_MATCH':
        return styles.badgeSimilar;
      default:
        return styles.badgeNew;
    }
  };

  const getBadgeLabel = (status: string) => {
    switch (status) {
      case 'EXACT_MATCH':
        return 'Khớp chính xác';
      case 'SIMILAR_MATCH':
        return 'Gợi ý khớp';
      default:
        return 'Bộ truyện mới';
    }
  };

  return (
    <div className={styles.stagingContainer}>
      <div className={styles.actionBar}>
        <div className={styles.actionStats}>
          Đã chọn: <strong>{selectedCount}</strong> / {items.length} cuốn
        </div>
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => onSelectAll(true)}
          >
            Chọn tất cả
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => onSelectAll(false)}
          >
            Bỏ chọn tất cả
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.stagingTable}>
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedCount === items.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th>Ngày</th>
              <th>Ảnh bìa</th>
              <th>Tên sách & Số tập</th>
              <th>Giá bìa</th>
              <th>Phiên bản</th>
              <th>Đối soát hệ thống</th>
              <th>Tác giả</th>
              <th>Tên gốc</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isRowDisabled = !item.selected;
              return (
                <tr
                  key={item.tempId}
                  className={isRowDisabled ? styles.tableRowDisabled : ''}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) =>
                        onUpdateItem(item.tempId, { selected: e.target.checked })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={item.releaseDate}
                      className={`${styles.inputField} ${styles.dateInput}`}
                      onChange={(e) =>
                        onUpdateItem(item.tempId, { releaseDate: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <OcrCoverCell
                      coverUrl={item.coverUrl}
                      onCoverChange={(url) =>
                        onUpdateItem(item.tempId, { coverUrl: url })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.title}
                      className={styles.inputField}
                      style={{ minWidth: 200 }}
                      onChange={(e) =>
                        onUpdateItem(item.tempId, { title: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.estimatedPrice ?? ''}
                      placeholder="Chưa có"
                      className={`${styles.inputField} ${styles.priceInput}`}
                      onChange={(e) =>
                        onUpdateItem(item.tempId, {
                          estimatedPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={item.editionType}
                      className={styles.inputField}
                      style={{ minWidth: 110 }}
                      onChange={(e) =>
                        onUpdateItem(item.tempId, {
                          editionType: e.target.value as ReleaseEditionType,
                        })
                      }
                    >
                      <option value="STANDARD">Bản thường</option>
                      <option value="SPECIAL">Bản đặc biệt</option>
                      <option value="LIMITED">Giới hạn</option>
                      <option value="BOXSET">Box Set</option>
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getBadgeClass(item.matchStatus)}`}>
                      {getBadgeLabel(item.matchStatus)}
                    </span>
                    <span className={styles.matchDesc} title={item.matchMessage}>
                      {item.matchMessage}
                    </span>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.author ?? ''}
                      placeholder="Chưa rõ"
                      className={styles.inputField}
                      style={{ minWidth: 120 }}
                      onChange={(e) =>
                        onUpdateItem(item.tempId, { author: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.originalTitle ?? ''}
                      placeholder="Chưa rõ"
                      className={styles.inputField}
                      style={{ minWidth: 110 }}
                      onChange={(e) =>
                        onUpdateItem(item.tempId, { originalTitle: e.target.value })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
