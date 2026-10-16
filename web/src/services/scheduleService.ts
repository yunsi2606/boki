import { api } from './api';
import type { OcrScheduleScanResponse, ReleaseScheduleItem } from '@/types/schedule';

export interface GetSchedulesParams {
  month?: number;
  year?: number;
  publisher?: string;
  hasBook?: boolean;
}

export interface CreateEditionPayload {
  id?: string;
  editionName: string;
  editionType?: 'STANDARD' | 'SPECIAL' | 'LIMITED' | 'BOXSET';
  releaseDate?: string | null;
  preOrderDate?: string | null;
  estimatedPrice?: number;
  gifts?: string;
  coverUrl?: string;
  status?: 'SCHEDULED' | 'RELEASED' | 'DELAYED' | 'CANCELLED';
  bookId?: string | null;
  sortOrder?: number;
}

export interface CreateSchedulePayload {
  title: string;
  originalTitle?: string;
  publisher: string;
  author?: string;
  releaseDate: string;
  preOrderDate?: string;
  coverUrl?: string;
  description?: string;
  status?: 'SCHEDULED' | 'RELEASED' | 'DELAYED' | 'CANCELLED';
  editions?: CreateEditionPayload[];
}

export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {}

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

  getScheduleBySlug: async (slug: string): Promise<ReleaseScheduleItem> => {
    return api.get<ReleaseScheduleItem>(`/release-schedules/slug/${encodeURIComponent(slug)}`);
  },

  getSeriesVolumes: async (seriesSlug: string): Promise<ReleaseScheduleItem[]> => {
    return api.get<ReleaseScheduleItem[]>(`/release-schedules/series/${encodeURIComponent(seriesSlug)}`);
  },

  getSeriesSummaries: async (): Promise<Array<{
    seriesName: string;
    seriesSlug: string;
    publisher: string;
    author: string;
    volumeCount: number;
    coverUrl: string;
  }>> => {
    return api.get<any[]>('/release-schedules/series');
  },

  getPublishers: async (): Promise<string[]> => {
    return api.get<string[]>('/release-schedules/publishers');
  },

  createSchedule: async (payload: CreateSchedulePayload): Promise<ReleaseScheduleItem> => {
    return api.post<ReleaseScheduleItem>('/release-schedules', payload);
  },

  batchCreateSchedules: async (items: CreateSchedulePayload[]): Promise<ReleaseScheduleItem[]> => {
    return api.post<ReleaseScheduleItem[]>('/release-schedules/batch', { items });
  },

  scanScheduleImage: async (
    file: File,
    publisher?: string,
    apiKey?: string
  ): Promise<OcrScheduleScanResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    if (publisher && publisher !== 'ALL') formData.append('publisher', publisher);
    if (apiKey) formData.append('apiKey', apiKey);
    return api.upload<OcrScheduleScanResponse>('/release-schedules/ocr-scan', formData);
  },

  updateSchedule: async (id: string, payload: UpdateSchedulePayload): Promise<ReleaseScheduleItem> => {
    return api.put<ReleaseScheduleItem>(`/release-schedules/${id}`, payload);
  },

  deleteSchedule: async (id: string): Promise<void> => {
    return api.delete<void>(`/release-schedules/${id}`);
  },

  syncSeries: async (): Promise<{ status: string; totalSynced: number; message: string }> => {
    return api.post<{ status: string; totalSynced: number; message: string }>('/release-schedules/admin/sync-series');
  },
};

