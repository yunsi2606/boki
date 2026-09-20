import { api } from './api';
import type { User } from '@/types';
import type {
  CustomerProfileSummary,
  UpdateShippingAddressPayload,
  UpdateProfileDetailsPayload,
} from '@/types/profile';

export const customerProfileService = {
  /**
   * Fetches customer profile overview: user info, ranking details, spending stats, and recent orders.
   */
  getProfileSummary: async (): Promise<CustomerProfileSummary> => {
    return api.get<CustomerProfileSummary>('/users/profile/summary');
  },

  /**
   * Updates customer's default shipping address.
   */
  updateShippingAddress: async (payload: UpdateShippingAddressPayload): Promise<User> => {
    return api.put<User>('/users/profile/address', payload);
  },

  /**
   * Updates basic profile details (displayName, avatarUrl, phoneNumber).
   */
  updateProfileDetails: async (payload: UpdateProfileDetailsPayload): Promise<User> => {
    return api.put<User>('/users/profile', payload);
  },
};
