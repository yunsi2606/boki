import { api } from './api';

export interface EmailJobItem {
  id: string;
  recipientEmail: string;
  subject: string;
  emailType: string;
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED' | 'BOUNCED';
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  scheduledAt: string;
  sentAt?: string;
  createdAt: string;
}

export interface EmailStats {
  pendingJobs: number;
  sentJobs: number;
  failedJobs: number;
  bouncedJobs: number;
  totalSubscribers: number;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  passwordConfigured?: boolean;
  authEnabled?: boolean;
  starttlsEnabled?: boolean;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  maxRatePerMinute?: number;
  isEnabled?: boolean;
}

export interface ComposeBroadcastPayload {
  subject: string;
  content: string;
  targetGroup: 'TEST_ONLY' | 'SERIES_SUBSCRIBERS' | 'ALL_DIGEST_SUBSCRIBERS';
  targetId?: string;
  testEmail?: string;
}

export interface SubscriptionItem {
  id: string;
  email: string;
  subscriptionType: string;
  targetId?: string;
  targetName?: string;
  active: boolean;
  unsubscribeToken: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminScheduleEmailService = {
  getStats: async (): Promise<EmailStats> => {
    return api.get<EmailStats>('/admin/schedule/email/stats', { bypassCache: true });
  },

  getJobs: async (
    status?: string,
    emailType?: string,
    page = 0,
    size = 20
  ): Promise<PagedResponse<EmailJobItem>> => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (emailType && emailType !== 'ALL') params.append('emailType', emailType);
    params.append('page', String(page));
    params.append('size', String(size));
    return api.get<PagedResponse<EmailJobItem>>(`/admin/schedule/email/jobs?${params.toString()}`, {
      bypassCache: true,
    });
  },

  retryJob: async (jobId: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/admin/schedule/email/jobs/${jobId}/retry`, {});
  },

  broadcast: async (payload: ComposeBroadcastPayload): Promise<{ message: string; enqueuedCount: number }> => {
    return api.post<{ message: string; enqueuedCount: number }>('/admin/schedule/email/broadcast', payload);
  },

  getSmtpConfig: async (): Promise<SmtpConfig> => {
    return api.get<SmtpConfig>('/admin/schedule/email/smtp', { bypassCache: true });
  },

  updateSmtpConfig: async (payload: SmtpConfig): Promise<{ message: string }> => {
    return api.put<{ message: string }>('/admin/schedule/email/smtp', payload);
  },

  testSmtpConnection: async (payload: SmtpConfig): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>('/admin/schedule/email/smtp/test', payload);
  },

  getSubscriptions: async (page = 0, size = 20): Promise<PagedResponse<SubscriptionItem>> => {
    return api.get<PagedResponse<SubscriptionItem>>(
      `/admin/schedule/email/subscriptions?page=${page}&size=${size}`,
      { bypassCache: true }
    );
  },
};
