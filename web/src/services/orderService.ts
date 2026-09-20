import { api } from './api';
import type { Order, CreateOrderPayload, CalculatePricingPayload, PricingResponse } from '@/types';

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    return api.post<Order>('/orders', payload);
  },

  calculatePricing: async (payload: CalculatePricingPayload): Promise<PricingResponse> => {
    return api.post<PricingResponse>('/orders/calculate-pricing', payload);
  },

  getOrder: async (id: string): Promise<Order> => {
    return api.get<Order>(`/orders/${id}`);
  },

  getBuyerOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>('/orders/buyer');
  },

  completeOrder: async (id: string): Promise<Order> => {
    return api.put<Order>(`/orders/${id}/complete`, {});
  },
};
