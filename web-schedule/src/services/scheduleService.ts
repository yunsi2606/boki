import { scheduleApiFetch } from './api';
import type { ReleaseScheduleItem } from '@/types/schedule';

export interface SeriesSummaryItem {
  seriesSlug: string;
  seriesName: string;
  publisher?: string;
  author?: string;
  volumeCount?: number;
  totalVolumes?: number;
  coverUrl?: string;
  sampleCover?: string;
  format?: string;
  genres?: string;
  seriesStatus?: string;
  latestReleaseDate?: string;
}

export const scheduleService = {
  async getSchedules(params?: {
    month?: number;
    year?: number;
    publisher?: string;
    hasBook?: boolean;
  }): Promise<ReleaseScheduleItem[]> {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month.toString());
    if (params?.year) query.set('year', params.year.toString());
    if (params?.publisher && params.publisher !== 'ALL') query.set('publisher', params.publisher);
    if (params?.hasBook !== undefined) query.set('hasBook', params.hasBook.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return scheduleApiFetch<ReleaseScheduleItem[]>(`/release-schedules${qs}`);
  },

  async getScheduleDetail(id: string): Promise<ReleaseScheduleItem> {
    return scheduleApiFetch<ReleaseScheduleItem>(`/release-schedules/${encodeURIComponent(id)}`);
  },

  async getScheduleBySlug(slug: string): Promise<ReleaseScheduleItem> {
    return scheduleApiFetch<ReleaseScheduleItem>(`/release-schedules/slug/${encodeURIComponent(slug)}`);
  },

  async getSeriesVolumes(seriesSlug: string): Promise<ReleaseScheduleItem[]> {
    return scheduleApiFetch<ReleaseScheduleItem[]>(`/release-schedules/series/${encodeURIComponent(seriesSlug)}`);
  },

  async getSeriesSummaries(): Promise<SeriesSummaryItem[]> {
    return scheduleApiFetch<SeriesSummaryItem[]>(`/release-schedules/series`);
  },

  async getPublishers(): Promise<string[]> {
    return scheduleApiFetch<string[]>('/release-schedules/publishers');
  },

  async getFeaturedSchedules(mode = 'SMART', limit = 15): Promise<ReleaseScheduleItem[]> {
    return scheduleApiFetch<ReleaseScheduleItem[]>(
      `/release-schedules/featured?mode=${encodeURIComponent(mode)}&limit=${limit}`
    );
  },
};
