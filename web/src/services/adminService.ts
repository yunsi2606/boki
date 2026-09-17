import { api } from './api';
import type { Book, Order, PushShippingPayload, OrderTimeline } from '@/types';
import { defaultHomepageConfig, type HomepageConfig } from '@/config/homepageConfig';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalBooks: number;
  lowStockCount: number;
  pendingOrdersCount: number;
}

export type AdminOrder = Order & {
  itemCount?: number;
};

export interface AdminVoucher {
  id: string;
  code: string;
  type: 'SHIPPING' | 'PRODUCT';
  tag: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export const adminService = {
  // Stats - Fetches from real API endpoints or calculates live metrics
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const [books, orders] = await Promise.all([
        api.get<Book[]>('/books').catch(() => []),
        api.get<AdminOrder[]>('/admin/orders').catch(() => api.get<AdminOrder[]>('/orders/admin').catch(() => [])),
      ]);

      const totalRevenue = orders
        .filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const lowStockCount = books.filter((b) => b.stockQuantity <= 3).length;
      const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

      return {
        totalRevenue,
        totalOrders: orders.length,
        totalBooks: books.length,
        lowStockCount,
        pendingOrdersCount,
      };
    } catch (err) {
      console.log('Failed to fetch admin stats from backend:', err);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalBooks: 0,
        lowStockCount: 0,
        pendingOrdersCount: 0,
      };
    }
  },

  // Orders - Real Backend API calls with strict status & carrier integration
  async getOrders(status?: string, search?: string): Promise<AdminOrder[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      if (search && search.trim()) params.append('search', search.trim());
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await api.get<AdminOrder[]>(`/admin/orders${queryStr}`);
    } catch (err) {
      console.log('Failed to fetch admin orders from backend:', err);
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: AdminOrder['status'], reason?: string): Promise<AdminOrder> {
    return await api.patch<AdminOrder>(`/admin/orders/${orderId}/status`, { status, reason });
  },

  async pushOrderToCarrier(orderId: string, payload: PushShippingPayload): Promise<AdminOrder> {
    return await api.post<AdminOrder>(`/admin/orders/${orderId}/ship`, payload);
  },

  async cancelOrder(orderId: string, reason: string): Promise<AdminOrder> {
    return await api.post<AdminOrder>(`/admin/orders/${orderId}/cancel`, { reason });
  },

  async getOrderTimelines(orderId: string): Promise<OrderTimeline[]> {
    try {
      return await api.get<OrderTimeline[]>(`/admin/orders/${orderId}/timeline`);
    } catch (err) {
      console.error('Failed to get order timelines:', err);
      return [];
    }
  },

  async getPrintWaybillUrl(orderId: string, size = 'A5'): Promise<import('@/types').PrintWaybillResponse> {
    return await api.get<import('@/types').PrintWaybillResponse>(`/admin/orders/${orderId}/print-url?size=${size}`);
  },

  async cancelCarrierOrder(orderId: string, reason: string): Promise<AdminOrder> {
    return await api.post<AdminOrder>(`/admin/orders/${orderId}/carrier-cancel`, { reason });
  },

  async returnCarrierOrder(orderId: string, reason?: string): Promise<AdminOrder> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return await api.post<AdminOrder>(`/admin/orders/${orderId}/carrier-return${query}`, {});
  },

  async updateOrderCod(orderId: string, codAmount: number): Promise<AdminOrder> {
    return await api.patch<AdminOrder>(`/admin/orders/${orderId}/cod`, { codAmount });
  },

  async updateOrderShippingInfo(orderId: string, payload: import('@/types').UpdateShippingInfoPayload): Promise<AdminOrder> {
    return await api.put<AdminOrder>(`/admin/orders/${orderId}/shipping-info`, payload);
  },

  async calculateCarrierFee(payload: { carrier: string; weightGrams?: number; toDistrictId?: number; toWardCode?: string }): Promise<import('@/types').CarrierFeeEstimate> {
    return await api.post<import('@/types').CarrierFeeEstimate>('/admin/orders/calculate-fee', payload);
  },

  async simulateCarrierWebhook(payload: any): Promise<AdminOrder> {
    return await api.post<AdminOrder>('/admin/orders/simulate-webhook', payload);
  },

  // Vouchers - Real Backend API calls
  async getVouchers(): Promise<AdminVoucher[]> {
    try {
      return await api.get<AdminVoucher[]>('/vouchers');
    } catch (err) {
      console.log('Failed to fetch admin vouchers from backend:', err);
      return [];
    }
  },

  async createVoucher(voucher: Omit<AdminVoucher, 'id' | 'usedCount'>): Promise<AdminVoucher> {
    return api.post<AdminVoucher>('/vouchers', voucher);
  },

  async deleteVoucher(id: string): Promise<void> {
    await api.delete<void>(`/vouchers/${id}`);
  },

  // Config - Storefront Admin Configuration
  async getStoreConfig(): Promise<HomepageConfig> {
    try {
      const configs = await api.get<{ configKey: string; configValue: string }[]>('/admin/config');
      const item = configs.find((c) => c.configKey === 'homepage_config');
      if (item && item.configValue) {
        return JSON.parse(item.configValue);
      }
    } catch {
      // Fallback to local
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('boki_admin_config') : null;
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse admin config', e);
      }
    }
    return defaultHomepageConfig;
  },

  async updateStoreConfig(config: HomepageConfig): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_admin_config', JSON.stringify(config));
    }
    try {
      await api.put('/admin/config', {
        homepage_config: JSON.stringify(config),
      });
    } catch (err) {
      console.error('Failed to sync store config to backend', err);
    }
  },

  // Shipping Carrier Configuration (SPX, J&T, GHN, GHTK, Viettel Post, VNPost)
  async getShippingCarriers(): Promise<import('@/types').CarrierConfig[]> {
    const { defaultCarrierConfigs } = await import('@/config/carrierConfig');
    try {
      const configs = await api.get<{ configKey: string; configValue: string }[]>('/admin/config');
      const item = configs.find((c) => c.configKey === 'shipping_carriers');
      if (item && item.configValue) {
        const savedList: import('@/types').CarrierConfig[] = JSON.parse(item.configValue);
        // Merge with defaults to ensure all fields and newly added carriers exist
        return defaultCarrierConfigs.map((def) => {
          const matched = savedList.find((s) => s.code === def.code);
          return matched ? { ...def, ...matched } : def;
        });
      }
    } catch {
      // Fallback to localStorage or defaults
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('boki_carrier_configs') : null;
    if (local) {
      try {
        const savedList: import('@/types').CarrierConfig[] = JSON.parse(local);
        return defaultCarrierConfigs.map((def) => {
          const matched = savedList.find((s) => s.code === def.code);
          return matched ? { ...def, ...matched } : def;
        });
      } catch (e) {
        console.error('Failed to parse local carrier configs', e);
      }
    }
    return defaultCarrierConfigs;
  },

  async updateShippingCarriers(carriers: import('@/types').CarrierConfig[]): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_carrier_configs', JSON.stringify(carriers));
    }
    await api.put('/admin/config', {
      shipping_carriers: JSON.stringify(carriers),
    });
  },

  // General Store Info Configuration
  async getStoreGeneralConfig(): Promise<import('@/types').StoreGeneralConfig> {
    const { defaultStoreGeneralConfig } = await import('@/config/carrierConfig');
    try {
      const configs = await api.get<{ configKey: string; configValue: string }[]>('/admin/config');
      const item = configs.find((c) => c.configKey === 'store_general');
      if (item && item.configValue) {
        return { ...defaultStoreGeneralConfig, ...JSON.parse(item.configValue) };
      }
    } catch {
      // Fallback
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('boki_store_general') : null;
    if (local) {
      try {
        return { ...defaultStoreGeneralConfig, ...JSON.parse(local) };
      } catch (e) {
        console.error('Failed to parse local store general config', e);
      }
    }
    return defaultStoreGeneralConfig;
  },

  async updateStoreGeneralConfig(config: import('@/types').StoreGeneralConfig): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_store_general', JSON.stringify(config));
    }
    await api.put('/admin/config', {
      store_general: JSON.stringify(config),
    });
  },

  // Payment Gateways Configuration (SePay, MoMo, VNPay)
  async getPaymentConfigs(): Promise<Record<string, string>> {
    try {
      const configs = await api.get<{ configKey: string; configValue: string }[]>('/admin/config');
      const map: Record<string, string> = {};
      configs.forEach((c) => {
        map[c.configKey] = c.configValue;
      });
      return map;
    } catch (err) {
      console.error('Failed to get payment configs from backend', err);
      return {};
    }
  },

  async updatePaymentConfigs(configs: Record<string, string>): Promise<void> {
    await api.put('/admin/config', configs);
  },
};
