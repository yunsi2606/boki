import { api } from './api';
import type { Order, PaymentInitResponse, PaymentStatusResponse } from '@/types';

export interface CreatePaymentPayload {
  orderId: string;
  paymentMethod: 'COD' | 'BANKING' | 'MOMO' | 'VNPAY';
}

export const paymentService = {
  /**
   * Initiates payment for an order, returning VietQR payload or gateway URLs.
   */
  initiatePayment: async (payload: CreatePaymentPayload): Promise<PaymentInitResponse> => {
    return api.post<PaymentInitResponse>('/payments/create', payload);
  },

  /**
   * Polls the live payment status of an order.
   */
  getPaymentStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    return api.get<PaymentStatusResponse>(`/payments/order/${orderId}/status`);
  },

  /**
   * Admin manual confirmation of payment.
   */
  markOrderPaid: async (orderId: string, note?: string): Promise<Order> => {
    return api.patch<Order>(`/admin/orders/${orderId}/payment`, { note });
  },

  /**
   * Simulates a SePay transaction webhook (for developer and admin testing).
   */
  simulateSePayWebhook: async (payload: {
    id?: number;
    gateway?: string;
    transactionDate?: string;
    accountNumber?: string;
    code?: string;
    content?: string;
    transferType?: string;
    transferAmount?: number;
    referenceCode?: string;
  }): Promise<{ success: boolean; orderId?: string; paymentStatus?: string }> => {
    return api.post<{ success: boolean; orderId?: string; paymentStatus?: string }>('/admin/orders/simulate-sepay', payload);
  },
};
