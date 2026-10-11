import { api } from './api';
import type { PermissionGroup, RoleItem, SaveRolePayload } from '@/types/rbac';

export const adminRbacService = {
  async getAllRoles(): Promise<RoleItem[]> {
    return api.get<RoleItem[]>('/admin/roles', { bypassCache: true });
  },

  async getAllPermissions(): Promise<PermissionGroup[]> {
    return api.get<PermissionGroup[]>('/admin/roles/permissions', { bypassCache: true });
  },

  async getRoleById(id: string): Promise<RoleItem> {
    return api.get<RoleItem>(`/admin/roles/${id}`, { bypassCache: true });
  },

  async createRole(payload: SaveRolePayload): Promise<RoleItem> {
    return api.post<RoleItem>('/admin/roles', payload);
  },

  async updateRole(id: string, payload: SaveRolePayload): Promise<RoleItem> {
    return api.put<RoleItem>(`/admin/roles/${id}`, payload);
  },

  async deleteRole(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/admin/roles/${id}`);
  },
};
