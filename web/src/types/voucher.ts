export type VoucherDiscountType = 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
export type VoucherType = 'PRODUCT' | 'SHIPPING';
export type UserScope = 'ALL' | 'NEW_USER' | 'VIP_USER';

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  discountType: VoucherDiscountType;
  tag: string;
  title: string;
  description: string;
  discountValue: number;         // e.g. 20000 VND or 15%
  discountAmount?: number;       // Backend field alias
  maxDiscountAmount?: number;    // e.g. Max 50000 VND for percentage discount
  minOrderValue: number;         // e.g. Min 150000 VND order
  minOrderAmount?: number;       // Backend field alias
  usageLimit: number;            // Total global usages limit
  usedCount: number;             // Current usages count
  userUsageLimit: number;        // Max usages per user
  startDate?: string;            // ISO date string
  endDate?: string;              // ISO date string
  applicableCategoryId?: number; // Optional category restriction
  applicableCategoryName?: string;
  userScope: UserScope;          // Target user segment
  isActive: boolean;
  createdAt?: string;
}

export interface VoucherValidationResult {
  voucher: Voucher;
  isEligible: boolean;
  discountAmount: number;
  reason?: string;
  missingAmount?: number;        // Amount needed to reach minOrderValue
}
