'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { AdminUserStats, AdminUserSummary, UserFilterState } from '@/types/adminUser';
import type { PermissionGroup, RoleItem, SaveRolePayload } from '@/types/rbac';
import { adminUserService } from '@/services/adminUserService';
import { adminRbacService } from '@/services/adminRbacService';
import { UserStatsHeader } from '@/components/admin/users/UserStatsHeader';
import { UserFilterBar } from '@/components/admin/users/UserFilterBar';
import { UserTable } from '@/components/admin/users/UserTable';
import { UserDetailDrawer } from '@/components/admin/users/UserDetailDrawer';
import { AssignRoleModal } from '@/components/admin/users/AssignRoleModal';
import { RoleManagerTab } from '@/components/admin/rbac/RoleManagerTab';
import styles from './usersPage.module.css';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [filter, setFilter] = useState<UserFilterState>({
    keyword: '',
    active: 'ALL',
    phoneVerified: 'ALL',
    memberTier: 'ALL',
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [assigningUser, setAssigningUser] = useState<AdminUserSummary | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await adminUserService.getUsers({
        keyword: filter.keyword,
        active: filter.active === 'ALL' ? undefined : filter.active === 'ACTIVE',
        phoneVerified: filter.phoneVerified === 'ALL' ? undefined : filter.phoneVerified === 'VERIFIED',
        memberTier: filter.memberTier === 'ALL' ? undefined : filter.memberTier,
        page,
        size: 15,
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [filter, page]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await adminUserService.getUserStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchRolesData = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const [rList, pGroups] = await Promise.all([
        adminRbacService.getAllRoles(),
        adminRbacService.getAllPermissions(),
      ]);
      setRoles(rList || []);
      setPermissionGroups(pGroups || []);
    } catch (err) {
      console.error('Failed to load roles and permissions:', err);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
    fetchRolesData();
  }, [fetchStats, fetchRolesData]);

  const handleToggleStatus = async (user: AdminUserSummary) => {
    const actionText = user.active ? 'khóa' : 'mở khóa';
    const reason = window.prompt(`Nhập lý do ${actionText} tài khoản ${user.email}:`, 'Thao tác bởi Quản trị viên');
    if (reason === null) return;

    try {
      await adminUserService.updateUserStatus(user.id, !user.active, reason);
      fetchUsers();
      fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái';
      alert(msg);
    }
  };

  const handleSaveUserRoles = async (userId: string, roleCodes: string[], memberTier: string) => {
    await adminUserService.updateUserRoles(userId, roleCodes, memberTier);
    fetchUsers();
    fetchStats();
  };

  const handleSaveRole = async (payload: SaveRolePayload, id?: string) => {
    if (id) {
      await adminRbacService.updateRole(id, payload);
    } else {
      await adminRbacService.createRole(payload);
    }
    fetchRolesData();
  };

  const handleDeleteRole = async (id: string) => {
    await adminRbacService.deleteRole(id);
    fetchRolesData();
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Quản Trị Người Dùng & Phân Quyền</h1>
          <p className={styles.pageSubtitle}>
            Hồ sơ 360 độ khách hàng, kiểm soát quyền hạn động và chống rủi ro gian lận.
          </p>
        </div>

        <div className={styles.tabButtons}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Danh sách người dùng
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'roles' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Vai trò & Phân quyền ({roles.length})
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <UserStatsHeader stats={stats} loading={loadingStats} />
          <UserFilterBar
            filter={filter}
            onFilterChange={(newF) => { setFilter(newF); setPage(0); }}
            onRefresh={() => { fetchUsers(); fetchStats(); }}
            loading={loadingUsers}
          />
          <UserTable
            users={users}
            loading={loadingUsers}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setPage}
            onSelectUser={(u) => setSelectedUserId(u.id)}
            onToggleStatus={handleToggleStatus}
            onAssignRole={(u) => setAssigningUser(u)}
          />
        </>
      ) : (
        <RoleManagerTab
          roles={roles}
          permissionGroups={permissionGroups}
          loading={loadingRoles}
          onSaveRole={handleSaveRole}
          onDeleteRole={handleDeleteRole}
          onRefresh={fetchRolesData}
        />
      )}

      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {assigningUser && (
        <AssignRoleModal
          user={assigningUser}
          allRoles={roles}
          onClose={() => setAssigningUser(null)}
          onSave={handleSaveUserRoles}
        />
      )}
    </div>
  );
}
