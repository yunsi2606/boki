import { api } from './api';

export interface AdminGiveawayPrize {
  id?: string;
  prizeTier: string; // FIRST, SECOND, THIRD, CONSOLATION, STANDARD
  prizeName: string;
  quantity: number;
  displayOrder: number;
  scheduleId?: string;
  scheduleTitle?: string;
  scheduleCoverUrl?: string;
}

export interface AdminGiveawayCampaign {
  id: string;
  title: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  scheduleId?: string;
  scheduleTitle?: string;
  scheduleCoverUrl?: string;
  prizeStructureType: string;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'DRAWN';
  startDate: string;
  endDate: string;
  drawDate?: string;
  winningNumber?: number;
  totalWinnersCount: number;
  totalEntriesCount: number;
  createdAt: string;
  prizes?: AdminGiveawayPrize[];
}

export interface AdminGiveawayEntry {
  id: string;
  campaignId: string;
  fullName: string;
  email: string;
  phone: string;
  luckyNumber: number;
  comment?: string;
  isWinner: boolean;
  prizeId?: string;
  prizeName?: string;
  prizeTier?: string;
  prizeRank?: number;
  createdAt: string;
}

export interface DrawCandidate {
  rank: number;
  entryId: string;
  fullName: string;
  email: string;
  phone: string;
  luckyNumber: number;
  distance: number;
  submittedAt: string;
  prizeId?: string;
  prizeName?: string;
  prizeTier?: string;
  isWinner: boolean;
}

export interface DrawPreviewResult {
  campaignId: string;
  campaignTitle: string;
  winningNumber: number;
  totalPrizes: number;
  totalEntries: number;
  candidates: DrawCandidate[];
}

export interface CreateGiveawayPayload {
  title: string;
  slug?: string;
  description?: string;
  bannerUrl?: string;
  scheduleId?: string;
  prizeStructureType: string;
  status?: string;
  startDate: string;
  endDate: string;
  prizes: AdminGiveawayPrize[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminGiveawayService = {
  getCampaigns: async (status?: string, page = 0, size = 20): Promise<PagedResponse<AdminGiveawayCampaign>> => {
    const query = status && status !== 'ALL' ? `?status=${status}&page=${page}&size=${size}` : `?page=${page}&size=${size}`;
    return api.get<PagedResponse<AdminGiveawayCampaign>>(`/admin/giveaways${query}`);
  },

  createCampaign: async (payload: CreateGiveawayPayload): Promise<AdminGiveawayCampaign> => {
    return api.post<AdminGiveawayCampaign>('/admin/giveaways', payload);
  },

  updateCampaign: async (id: string, payload: CreateGiveawayPayload): Promise<AdminGiveawayCampaign> => {
    return api.put<AdminGiveawayCampaign>(`/admin/giveaways/${id}`, payload);
  },

  deleteCampaign: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete<{ success: boolean; message: string }>(`/admin/giveaways/${id}`);
  },

  getEntries: async (id: string, page = 0, size = 50): Promise<PagedResponse<AdminGiveawayEntry>> => {
    return api.get<PagedResponse<AdminGiveawayEntry>>(`/admin/giveaways/${id}/entries?page=${page}&size=${size}`);
  },

  previewDraw: async (id: string, winningNumber: number): Promise<DrawPreviewResult> => {
    return api.post<DrawPreviewResult>(`/admin/giveaways/${id}/preview-draw?winningNumber=${winningNumber}`, {});
  },

  executeDraw: async (
    id: string,
    payload: { winningNumber: number; sendNotificationEmails?: boolean }
  ): Promise<DrawPreviewResult> => {
    return api.post<DrawPreviewResult>(`/admin/giveaways/${id}/draw`, payload);
  },
};
