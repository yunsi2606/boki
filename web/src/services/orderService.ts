import { api } from './api';
import type { Order, CreateOrderPayload } from '@/types';

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    return api.post<Order>('/orders', payload);
  },

  getOrder: async (id: string): Promise<Order> => {
    return api.get<Order>(`/orders/${id}`);
  },

  getBuyerOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>('/orders/buyer');
  },
};
