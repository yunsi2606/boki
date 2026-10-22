import { scheduleApiFetch } from './api';
import {
  GiveawayCampaign,
  GiveawayCampaignDetail,
  GiveawayEntry,
  GiveawaySubmitEntryRequest,
  PageResponse,
} from '@/types/giveaway';

export const giveawayService = {
  getGiveaways: async (page = 0, size = 12): Promise<PageResponse<GiveawayCampaign>> => {
    return scheduleApiFetch<PageResponse<GiveawayCampaign>>(`/giveaways?page=${page}&size=${size}`);
  },

  getGiveawayDetail: async (slug: string): Promise<GiveawayCampaignDetail> => {
    return scheduleApiFetch<GiveawayCampaignDetail>(`/giveaways/${slug}`);
  },

  submitEntry: async (
    slug: string,
    payload: GiveawaySubmitEntryRequest
  ): Promise<GiveawayEntry> => {
    return scheduleApiFetch<GiveawayEntry>(`/giveaways/${slug}/entries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
