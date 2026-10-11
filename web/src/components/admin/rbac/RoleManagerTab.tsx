'use client';

import React, { useState } from 'react';
import type { PermissionGroup, RoleItem, SaveRolePayload } from '@/types/rbac';
import { RolePermissionModal } from './RolePermissionModal';
import styles from './roleManagerTab.module.css';

interface RoleManagerTabProps {
  roles: RoleItem[];
  permissionGroups: PermissionGroup[];
  loading: boolean;
  onSaveRole: (payload: SaveRolePayload, id?: string) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const RoleManagerTab: React.FC<RoleManagerTabProps> = ({
  roles,
  permissionGroups,
  loading,
  onSaveRole,
  onDeleteRole,
  onRefresh,
}) => {
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role: RoleItem) => {
    if (role.isSystem) return;
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}" không?`);
    if (!confirmed) return;

    setDeletingId(role.id);
    try {
      await onDeleteRole(role.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa vai trò';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.tabContainer}>
      <div className={styles.actionHeader}>
        <div>
          <h3 className={styles.title}>Quản Trị Vai Trò & Phân Quyền Động</h3>
          <p className={styles.subtitle}>
            Tùy biến nhóm quyền hạt nhân cho từng bộ phận vận hành, kho sách, biên tập và CSKH.
          </p>
        </div>
        <div className={styles.headerButtons}>
          <button type="button" onClick={onRefresh} className={styles.secondaryBtn} title="Tải lại">
            Làm mới
          </button>
          <button type="button" onClick={handleOpenCreate} className={styles.primaryBtn}>
            Tạo vai trò mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.roleCardSkeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.roleGrid}>
          {roles.map((role) => (
            <div key={role.id} className={styles.roleCard} style={{ borderLeftColor: role.color || '#EE4D2D' }}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleBox}>
                  <div className={styles.colorDot} style={{ backgroundColor: role.color || '#EE4D2D' }} />
                  <span className={styles.roleName}>{role.name}</span>
                </div>
                <div className={styles.badgeRow}>
                  {role.isSystem && <span className={styles.systemBadge}>Hệ Thống</span>}
                  <span className={styles.roleCode}>{role.code}</span>
                </div>
              </div>

              <p className={styles.cardDesc}>{role.description || 'Không có mô tả chi tiết'}</p>

              <div className={styles.permSummary}>
                <span className={styles.permCountText}>
                  <strong>{role.permissionCodes.length}</strong> quyền hạt nhân
                </span>
                <div className={styles.permChipList}>
                  {role.permissionCodes.slice(0, 4).map((p) => (
                    <span key={p} className={styles.miniPermChip}>{p}</span>
                  ))}
                  {role.permissionCodes.length > 4 && (
                    <span className={styles.morePermChip}>+{role.permissionCodes.length - 4}</span>
                  )}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(role)}
                  className={styles.editBtn}
                >
                  Cấu hình quyền
                </button>
                {!role.isSystem && (
                  <button
                    type="button"
                    onClick={() => handleDelete(role)}
                    disabled={deletingId === role.id}
                    className={styles.deleteBtn}
                  >
                    {deletingId === role.id ? 'Đang xóa...' : 'Xóa vai trò'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <RolePermissionModal
          role={editingRole}
          permissionGroups={permissionGroups}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveRole}
        />
      )}
    </div>
  );
};
