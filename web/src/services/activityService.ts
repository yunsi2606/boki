import { api } from './api';
import type {
  UserActivity,
  ActivityAnalytics,
  ActivityFilterParams,
  PaginatedActivitiesResponse,
} from '@/types/activity';

export const activityService = {
  /**
   * Fetches paginated activity logs with optional filters for Admin.
   */
  getActivities: async (params?: ActivityFilterParams): Promise<PaginatedActivitiesResponse> => {
    const query = new URLSearchParams();
    if (params?.eventType && params.eventType !== 'ALL') query.set('eventType', params.eventType);
    if (params?.eventCategory && params.eventCategory !== 'ALL') query.set('eventCategory', params.eventCategory);
    if (params?.sessionId) query.set('sessionId', params.sessionId);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.search) query.set('search', params.search);
    if (params?.fromTime) query.set('fromTime', params.fromTime);
    if (params?.toTime) query.set('toTime', params.toTime);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));

    const qs = query.toString();
    return api.get<PaginatedActivitiesResponse>(`/admin/activities${qs ? `?${qs}` : ''}`);
  },

  /**
   * Fetches real-time aggregated metrics & conversion funnel statistics.
   */
  getAnalytics: async (): Promise<ActivityAnalytics> => {
    return api.get<ActivityAnalytics>('/admin/activities/analytics');
  },

  /**
   * Fetches the complete chronological journey for a single session.
   */
  getSessionJourney: async (sessionId: string): Promise<UserActivity[]> => {
    return api.get<UserActivity[]>(`/admin/activities/sessions/${encodeURIComponent(sessionId)}`);
  },
};
