'use client';

import React from 'react';
import type { MangaTierListSummary } from '@/types/tierList';
import TrioCoverBadge from './TrioCoverBadge';
import { Edit2, Trash2, Eye, EyeOff, Heart, BookOpen } from 'lucide-react';
import styles from './tierListTable.module.css';

interface Props {
  items: MangaTierListSummary[];
  loading: boolean;
  onEdit: (item: MangaTierListSummary) => void;
  onDelete: (item: MangaTierListSummary) => void;
  onTogglePublic: (id: string) => void;
}

export default function TierListTable({
  items,
  loading,
  onEdit,
  onDelete,
  onTogglePublic,
}: Props) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Đang tải danh sách tuyển chọn...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <BookOpen size={40} className={styles.emptyIcon} />
        <h3>Chưa có danh sách tuyển chọn nào</h3>
        <p>Bấm &quot;Tạo danh sách mới&quot; để thiết lập bộ sưu tập tuyển chọn đầu tiên.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tuyển Chọn</th>
              <th>Người Tạo</th>
              <th>Số Truyện</th>
              <th>Quan Tâm</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className={styles.nameCell}>
                    <TrioCoverBadge covers={item.topCovers} size={42} />
                    <div className={styles.infoCol}>
                      <span className={styles.titleText}>{item.title}</span>
                      {item.description && (
                        <span className={styles.descText}>{item.description}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.authorBadge}>{item.authorHandle}</span>
                </td>
                <td>
                  <span className={styles.countBadge}>{item.totalItems} truyện</span>
                </td>
                <td>
                  <div className={styles.likesCell}>
                    <Heart size={14} className={styles.heartIcon} />
                    <span>{item.likesCount}</span>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onTogglePublic(item.id)}
                    className={`${styles.statusBtn} ${
                      item.isPublic ? styles.statusPublic : styles.statusPrivate
                    }`}
                    title={item.isPublic ? 'Bấm để ẩn' : 'Bấm để công khai'}
                  >
                    {item.isPublic ? (
                      <>
                        <Eye size={13} /> Công khai
                      </>
                    ) : (
                      <>
                        <EyeOff size={13} /> Riêng tư
                      </>
                    )}
                  </button>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionBtnEdit}
                      onClick={() => onEdit(item)}
                      title="Chỉnh sửa tuyển chọn"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtnDelete}
                      onClick={() => onDelete(item)}
                      title="Xóa tuyển chọn"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
