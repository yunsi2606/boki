export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  avatarUrl?: string;
  primaryRole: string;
  memberTier: string;
  totalSpent: number;
  loyaltyPoints: number;
  active: boolean;
  createdAt: string;
  roleCodes: string[];
  smartTags: string[];
}

export interface UserRecentActivity {
  actionType: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  avatarUrl?: string;
  primaryRole: string;
  memberTier: string;
  totalSpent: number;
  loyaltyPoints: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Shipping address
  shippingFullName?: string;
  shippingPhone?: string;
  shippingProvince?: string;
  shippingDistrict?: string;
  shippingWard?: string;
  shippingStreetAddress?: string;
  shippingDeliveryNote?: string;
  // Roles & Permissions
  roleCodes: string[];
  permissionCodes: string[];
  smartTags: string[];
  // Order stats
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  recentActivities: UserRecentActivity[];
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  phoneVerifiedUsers: number;
  vipUsers: number;
  tierCounts: Record<string, number>;
}

export interface UserFilterState {
  keyword: string;
  active: string; // 'ALL' | 'ACTIVE' | 'BLOCKED'
  phoneVerified: string; // 'ALL' | 'VERIFIED' | 'UNVERIFIED'
  memberTier: string; // 'ALL' | 'STANDARD' | 'SILVER' | 'GOLD' | 'DIAMOND'
}
