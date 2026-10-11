'use client';

import React, { useState, useEffect } from 'react';
import type { PermissionGroup, RoleItem, SaveRolePayload } from '@/types/rbac';
import styles from './rolePermissionModal.module.css';

interface RolePermissionModalProps {
  role: RoleItem | null; // null means create new
  permissionGroups: PermissionGroup[];
  onClose: () => void;
  onSave: (payload: SaveRolePayload, id?: string) => Promise<void>;
}

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({
  role,
  permissionGroups,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState(role ? role.code : '');
  const [name, setName] = useState(role ? role.name : '');
  const [description, setDescription] = useState(role?.description || '');
  const [color, setColor] = useState(role?.color || '#EE4D2D');
  const [selectedPerms, setSelectedPerms] = useState<string[]>(role?.permissionCodes || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setCode(role.code);
      setName(role.name);
      setDescription(role.description || '');
      setColor(role.color || '#EE4D2D');
      setSelectedPerms(role.permissionCodes || []);
    }
  }, [role]);

  const togglePerm = (pCode: string) => {
    setSelectedPerms((prev) =>
      prev.includes(pCode) ? prev.filter((c) => c !== pCode) : [...prev, pCode]
    );
  };

  const toggleGroup = (group: PermissionGroup) => {
    const groupCodes = group.permissions.map((p) => p.code);
    const allChecked = groupCodes.every((c) => selectedPerms.includes(c));

    if (allChecked) {
      setSelectedPerms((prev) => prev.filter((c) => !groupCodes.includes(c)));
    } else {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...groupCodes])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên vai trò');
      return;
    }
    if (!role && !code.trim()) {
      setError('Vui lòng nhập mã vai trò');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
          color,
          permissionCodes: selectedPerms,
        },
        role?.id
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu vai trò';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{role ? `Cấu Hình Vai Trò: ${role.name}` : 'Tạo Vai Trò Mới'}</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Mã vai trò (Code):</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: BOOK_CURATOR"
                disabled={!!role} // code cannot be changed once created
                className={styles.inputField}
                required
              />
            </div>
            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Tên vai trò:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Quản Lý Kho Sách"
                className={styles.inputField}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroupHalf} style={{ flex: 3 }}>
              <label className={styles.fieldLabel}>Mô tả chức năng:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả phạm vi trách nhiệm của vai trò..."
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroupHalf} style={{ flex: 1 }}>
              <label className={styles.fieldLabel}>Màu nhận diện:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={styles.colorPicker}
              />
            </div>
          </div>

          <div className={styles.matrixSection}>
            <div className={styles.matrixHeader}>
              <span className={styles.matrixTitle}>Ma Trận Quyền Hạn (Permission Matrix)</span>
              <span className={styles.matrixCount}>Đã chọn: {selectedPerms.length} quyền</span>
            </div>

            <div className={styles.groupsContainer}>
              {permissionGroups.map((group) => {
                const groupCodes = group.permissions.map((p) => p.code);
                const allGroupChecked = groupCodes.every((c) => selectedPerms.includes(c));
                const someGroupChecked = groupCodes.some((c) => selectedPerms.includes(c));

                return (
                  <div key={group.module} className={styles.groupCard}>
                    <div className={styles.groupHead}>
                      <span className={styles.groupName}>{group.moduleName}</span>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group)}
                        className={styles.toggleGroupBtn}
                      >
                        {allGroupChecked ? 'Bỏ chọn cả nhóm' : 'Chọn toàn bộ'}
                      </button>
                    </div>

                    <div className={styles.permissionGrid}>
                      {group.permissions.map((p) => {
                        const isChecked = selectedPerms.includes(p.code);
                        return (
                          <label key={p.code} className={`${styles.permItem} ${isChecked ? styles.permChecked : ''}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePerm(p.code)}
                              className={styles.permCheckbox}
                            />
                            <div className={styles.permText}>
                              <span className={styles.permCode}>{p.name} ({p.code})</span>
                              <span className={styles.permDesc}>{p.description}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu vai trò'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
