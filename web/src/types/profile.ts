import type { User, Order } from './index';

export interface TierBenefit {
  level: string;
  displayName: string;
  minSpentThreshold: number;
  discountPercent: number;
  perks: string[];
  isAchieved: boolean;
  isCurrent: boolean;
}

export interface MemberRanking {
  currentTier: string;
  displayName: string;
  discountPercent: number;
  tierUpgradedAt: string;
  tierExpiresAt: string;
  daysRemaining: number;
  cycleSpent: number;
  lifetimeSpent: number;
  nextTier: string | null;
  nextTierDisplayName: string | null;
  nextTierThreshold: number | null;
  spentNeededForNextTier: number | null;
  progressPercent: number;
  tiersRoadmap: TierBenefit[];
}

export interface SpendingStats {
  lifetimeSpent: number;
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  loyaltyPoints: number;
  totalDiscountSaved: number;
}

export interface CustomerProfileSummary {
  user: User;
  ranking: MemberRanking;
  stats: SpendingStats;
  recentOrders: Order[];
}

export interface UpdateShippingAddressPayload {
  fullName: string;
  phoneNumber: string;
  province: string;
  provinceCode: number | null;
  district: string;
  districtCode: number | null;
  ward: string;
  wardCode: number | null;
  streetAddress: string;
  note?: string;
}

export interface UpdateProfileDetailsPayload {
  displayName: string;
  avatarUrl?: string;
  phoneNumber?: string;
}
