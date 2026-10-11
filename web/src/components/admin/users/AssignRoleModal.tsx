'use client';

import React, { useState } from 'react';
import type { AdminUserSummary } from '@/types/adminUser';
import type { RoleItem } from '@/types/rbac';
import styles from './assignRoleModal.module.css';

interface AssignRoleModalProps {
  user: AdminUserSummary;
  allRoles: RoleItem[];
  onClose: () => void;
  onSave: (userId: string, roleCodes: string[], memberTier: string) => Promise<void>;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  user,
  allRoles,
  onClose,
  onSave,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.roleCodes && user.roleCodes.length > 0 ? user.roleCodes : [user.primaryRole || 'BUYER']
  );
  const [memberTier, setMemberTier] = useState<string>(user.memberTier || 'STANDARD');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (code: string) => {
    setSelectedRoles((prev) =>
      prev.includes(code) ? prev.filter((r) => r !== code) : [...prev, code]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      setError('Vui lòng chọn ít nhất một vai trò cho người dùng');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(user.id, selectedRoles, memberTier);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi cập nhật vai trò';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Phân Quyền & Hạng Thành Viên</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.modalForm}>
          <div className={styles.userBannerBox}>
            <span className={styles.bannerName}>{user.displayName}</span>
            <span className={styles.bannerEmail}>{user.email}</span>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Chọn các vai trò áp dụng:</label>
            <div className={styles.roleSelectList}>
              {allRoles.map((role) => {
                const isChecked = selectedRoles.includes(role.code);
                return (
                  <label key={role.id} className={`${styles.roleSelectOption} ${isChecked ? styles.optionChecked : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRole(role.code)}
                      className={styles.roleCheckbox}
                    />
                    <div className={styles.roleOptionInfo}>
                      <span className={styles.roleOptionName} style={{ color: role.color }}>
                        {role.name} ({role.code})
                      </span>
                      <span className={styles.roleOptionDesc}>
                        {role.description || `${role.permissionCodes.length} quyền hạn`}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="memberTierSelect">
              Hạng thành viên (Loyalty Tier):
            </label>
            <select
              id="memberTierSelect"
              value={memberTier}
              onChange={(e) => setMemberTier(e.target.value)}
              className={styles.selectTierInput}
            >
              <option value="STANDARD">Standard</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="DIAMOND">Diamond</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={saving}>
              Hủy bỏ
            </button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
