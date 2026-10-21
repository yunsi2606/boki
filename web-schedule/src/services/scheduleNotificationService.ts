import { scheduleApiFetch } from './api';

export interface SubscriptionRequest {
  email: string;
  subscriptionTypes: ('SERIES' | 'VOLUME' | 'VAULT' | 'DELAY_ALERT' | 'WEEKLY_DIGEST')[];
  targetId?: string;
  targetName?: string;
}

export interface SubscriptionResponse {
  id: string;
  email: string;
  subscriptionType: string;
  targetId: string;
  targetName?: string;
  active: boolean;
  unsubscribeToken: string;
  createdAt: string;
}

export const scheduleNotificationService = {
  async subscribe(payload: SubscriptionRequest): Promise<SubscriptionResponse[]> {
    return scheduleApiFetch<SubscriptionResponse[]>('/schedule-email/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getSubscriptions(email: string): Promise<SubscriptionResponse[]> {
    return scheduleApiFetch<SubscriptionResponse[]>(
      `/schedule-email/subscriptions?email=${encodeURIComponent(email)}`
    );
  },

  async unsubscribe(token: string): Promise<{ success: boolean; message: string }> {
    return scheduleApiFetch<{ success: boolean; message: string }>(
      `/schedule-email/unsubscribe?token=${encodeURIComponent(token)}`,
      { method: 'POST' }
    );
  },
};
