import { api } from './api';
import type { PermissionGroup, RoleItem, SaveRolePayload } from '@/types/rbac';

export const adminRbacService = {
  async getAllRoles(): Promise<RoleItem[]> {
    return api.get<RoleItem[]>('/api/admin/roles', { bypassCache: true });
  },

  async getAllPermissions(): Promise<PermissionGroup[]> {
    return api.get<PermissionGroup[]>('/api/admin/roles/permissions', { bypassCache: true });
  },

  async getRoleById(id: string): Promise<RoleItem> {
    return api.get<RoleItem>(`/api/admin/roles/${id}`, { bypassCache: true });
  },

  async createRole(payload: SaveRolePayload): Promise<RoleItem> {
    return api.post<RoleItem>('/api/admin/roles', payload);
  },

  async updateRole(id: string, payload: SaveRolePayload): Promise<RoleItem> {
    return api.put<RoleItem>(`/api/admin/roles/${id}`, payload);
  },

  async deleteRole(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/api/admin/roles/${id}`);
  },
};
