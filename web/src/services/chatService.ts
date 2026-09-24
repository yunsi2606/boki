import { api } from './api';
import type { ChatRequest, ChatResponse } from '@/types/chat';

export const chatService = {
  /**
   * Gửi tin nhắn từ Client Storefront
   */
  sendMessage: (request: ChatRequest): Promise<ChatResponse> => {
    return api.post<ChatResponse>('/chat/message', request, { bypassCache: true });
  },

  /**
   * Lấy gợi ý câu hỏi nhanh theo đường dẫn trang
   */
  getSuggestions: (path?: string): Promise<string[]> => {
    const query = path ? `?path=${encodeURIComponent(path)}` : '';
    return api.get<string[]>(`/chat/suggestions${query}`);
  },

  /**
   * Gửi đánh giá phản hồi (Like / Dislike)
   */
  sendFeedback: (logId: number, feedback: 'LIKE' | 'DISLIKE', reason?: string): Promise<void> => {
    return api.post<void>('/chat/feedback', { logId, feedback, reason });
  },

  /**
   * Gửi tin nhắn từ Admin Co-Pilot Panel
   */
  sendAdminMessage: (request: ChatRequest): Promise<ChatResponse> => {
    return api.post<ChatResponse>('/admin/chat/message', request, { bypassCache: true });
  },

  /**
   * Lấy báo cáo Daily Briefing cho Admin
   */
  getAdminBriefing: (): Promise<any> => {
    return api.get<any>('/admin/chat/briefing', { bypassCache: true });
  },

  /**
   * Lấy danh sách phím tắt lệnh quản trị
   */
  getAdminShortcuts: (): Promise<Array<{ label: string; prompt: string }>> => {
    return api.get<Array<{ label: string; prompt: string }>>('/admin/chat/shortcuts');
  },

  /**
   * Lấy số liệu phân tích Chatbot Analytics
   */
  getAdminAnalytics: (): Promise<any> => {
    return api.get<any>('/admin/chat/analytics', { bypassCache: true });
  },

  /**
   * Xác nhận hoặc từ chối hành động quản trị 2 bước
   */
  confirmAdminAction: (ticketId: string, confirmed: boolean): Promise<any> => {
    return api.post<any>('/admin/chat/confirm', { ticketId, confirmed });
  },

  /**
   * Lấy danh sách lịch sử kiểm tra (Audit Logs) của Chatbot
   */
  getAdminAuditLogs: (page: number = 0, size: number = 15): Promise<any> => {
    return api.get<any>(`/admin/chat/logs?page=${page}&size=${size}`, { bypassCache: true });
  },
};
