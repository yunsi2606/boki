'use client';

import React from 'react';
import type { AdminUserSummary } from '@/types/adminUser';
import { UserSmartBadge } from './UserSmartBadge';
import styles from './userTable.module.css';

interface UserTableProps {
  users: AdminUserSummary[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onSelectUser: (user: AdminUserSummary) => void;
  onToggleStatus: (user: AdminUserSummary) => void;
  onAssignRole: (user: AdminUserSummary) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onSelectUser,
  onToggleStatus,
  onAssignRole,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò & Nhãn</th>
              <th>Hạng & Điểm</th>
              <th>Tổng chi tiêu</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th className={styles.thActions}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={7}><div className={styles.skeletonBar} /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  <p>Không tìm thấy người dùng nào phù hợp với bộ lọc</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className={!u.active ? styles.inactiveRow : undefined}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatarBox}>
                        {u.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatarUrl} alt={u.displayName} className={styles.avatarImg} />
                        ) : (
                          <div className={styles.avatarInitial}>
                            {(u.displayName || u.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={styles.userText}>
                        <span className={styles.userName}>{u.displayName || 'Khách hàng'}</span>
                        <span className={styles.userEmail}>{u.email}</span>
                        {u.phoneNumber && (
                          <span className={styles.userPhone}>
                            {u.phoneNumber} {u.phoneVerified && <span className={styles.verifiedDot}>✓</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className={styles.roleTagList}>
                      {u.roleCodes && u.roleCodes.length > 0 ? (
                        u.roleCodes.map((r) => <UserSmartBadge key={r} type="role" value={r} />)
                      ) : (
                        <UserSmartBadge type="role" value={u.primaryRole || 'BUYER'} />
                      )}
                      {u.smartTags && u.smartTags.map((t) => (
                        <UserSmartBadge key={t} type="tag" value={t} />
                      ))}
                    </div>
                  </td>

                  <td>
                    <div className={styles.tierCell}>
                      <UserSmartBadge type="tier" value={u.memberTier || 'STANDARD'} />
                      <span className={styles.loyaltyPts}>{u.loyaltyPoints || 0} điểm</span>
                    </div>
                  </td>

                  <td>
                    <span className={styles.spentAmount}>{formatCurrency(u.totalSpent)}</span>
                  </td>

                  <td>
                    <span className={styles.dateText}>{formatDate(u.createdAt)}</span>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(u)}
                      className={`${styles.statusToggle} ${u.active ? styles.statusActive : styles.statusBlocked}`}
                      title={u.active ? 'Bấm để khóa tài khoản' : 'Bấm để mở khóa'}
                    >
                      <span className={styles.statusIndicator} />
                      <span>{u.active ? 'Hoạt động' : 'Bị khóa'}</span>
                    </button>
                  </td>

                  <td className={styles.tdActions}>
                    <button
                      type="button"
                      onClick={() => onAssignRole(u)}
                      className={styles.actionBtnSecondary}
                      title="Phân vai trò & thứ hạng"
                    >
                      Phân quyền
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectUser(u)}
                      className={styles.actionBtnPrimary}
                      title="Xem hồ sơ 360 độ"
                    >
                      Chi tiết 360°
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationBar}>
          <span className={styles.pageInfo}>
            Hiển thị trang {page + 1} / {totalPages} (Tổng {totalElements.toLocaleString('vi-VN')} người dùng)
          </span>
          <div className={styles.pageButtons}>
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => onPageChange(page - 1)}
              className={styles.pageBtn}
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => onPageChange(page + 1)}
              className={styles.pageBtn}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
