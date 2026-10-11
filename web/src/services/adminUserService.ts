import { api } from './api';
import type { AdminUserDetail, AdminUserStats, AdminUserSummary } from '@/types/adminUser';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminUserService = {
  async getUsers(params: {
    keyword?: string;
    active?: boolean;
    phoneVerified?: boolean;
    memberTier?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminUserSummary>> {
    const searchParams = new URLSearchParams();
    if (params.keyword?.trim()) searchParams.set('keyword', params.keyword.trim());
    if (params.active !== undefined) searchParams.set('active', String(params.active));
    if (params.phoneVerified !== undefined) searchParams.set('phoneVerified', String(params.phoneVerified));
    if (params.memberTier && params.memberTier !== 'ALL') searchParams.set('memberTier', params.memberTier);
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.size !== undefined) searchParams.set('size', String(params.size));

    const query = searchParams.toString();
    const endpoint = `/api/admin/users${query ? `?${query}` : ''}`;
    return api.get<PageResponse<AdminUserSummary>>(endpoint, { bypassCache: true });
  },

  async getUserStats(): Promise<AdminUserStats> {
    return api.get<AdminUserStats>('/api/admin/users/stats', { bypassCache: true });
  },

  async getUserDetail(id: string): Promise<AdminUserDetail> {
    return api.get<AdminUserDetail>(`/api/admin/users/${id}`, { bypassCache: true });
  },

  async updateUserStatus(id: string, active: boolean, reason?: string): Promise<{ message: string }> {
    return api.patch<{ message: string }>(`/api/admin/users/${id}/status`, { active, reason });
  },

  async updateUserRoles(id: string, roleCodes: string[], memberTier?: string): Promise<{ message: string }> {
    return api.patch<{ message: string }>(`/api/admin/users/${id}/roles`, { roleCodes, memberTier });
  },
};
