import { api } from './api';
import type { ReleaseScheduleItem } from '@/types/schedule';

export interface GetSchedulesParams {
  month?: number;
  year?: number;
  publisher?: string;
  hasBook?: boolean;
}

export const scheduleService = {
  getSchedules: async (params?: GetSchedulesParams): Promise<ReleaseScheduleItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.month !== undefined) searchParams.append('month', params.month.toString());
    if (params?.year !== undefined) searchParams.append('year', params.year.toString());
    if (params?.publisher) searchParams.append('publisher', params.publisher);
    if (params?.hasBook !== undefined) searchParams.append('hasBook', params.hasBook.toString());

    const qs = searchParams.toString();
    return api.get<ReleaseScheduleItem[]>(`/release-schedules${qs ? `?${qs}` : ''}`);
  },

  getScheduleDetail: async (id: string): Promise<ReleaseScheduleItem> => {
    return api.get<ReleaseScheduleItem>(`/release-schedules/${id}`);
  },

  getPublishers: async (): Promise<string[]> => {
    return api.get<string[]>('/release-schedules/publishers');
  },
};
