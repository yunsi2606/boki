import { api } from './api';
import type { Voucher, VoucherValidationResult } from '@/types/voucher';
import type { CartItem } from '@/types';

function normalizeVoucher(v: any): Voucher {
  const discountVal = Number(v.discountValue ?? v.discountAmount ?? 0);
  const minOrderVal = Number(v.minOrderValue ?? v.minOrderAmount ?? 0);
  const maxDiscountVal = v.maxDiscountAmount ? Number(v.maxDiscountAmount) : undefined;

  return {
    id: String(v.id || `v_${Date.now()}`),
    code: String(v.code || ''),
    type: v.type === 'SHIPPING' ? 'SHIPPING' : 'PRODUCT',
    discountType: v.discountType || (v.type === 'SHIPPING' ? 'FREE_SHIPPING' : 'FIXED_AMOUNT'),
    tag: v.tag || (v.type === 'SHIPPING' ? '🚚 MIỄN PHÍ VẬN CHUYỂN' : '🎟️ GIẢM GIÁ SẢN PHẨM'),
    title: v.title || '',
    description: v.description || '',
    discountValue: discountVal,
    discountAmount: discountVal,
    maxDiscountAmount: maxDiscountVal,
    minOrderValue: minOrderVal,
    minOrderAmount: minOrderVal,
    usageLimit: Number(v.usageLimit ?? 100),
    usedCount: Number(v.usedCount ?? 0),
    userUsageLimit: Number(v.userUsageLimit ?? 1),
    applicableCategoryId: v.applicableCategoryId ? Number(v.applicableCategoryId) : undefined,
    applicableCategoryName: v.applicableCategoryName,
    userScope: v.userScope || 'ALL',
    isActive: v.isActive !== false,
    startDate: v.startDate,
    endDate: v.endDate,
    createdAt: v.createdAt,
  };
}

export const voucherService = {
  // Get active vouchers for checkout & wallet
  getAllVouchers: async (): Promise<Voucher[]> => {
    try {
      const remoteVouchers = await api.get<Voucher[]>('/vouchers');
      if (Array.isArray(remoteVouchers)) {
        return remoteVouchers.map(normalizeVoucher);
      }
    } catch (err) {
      console.log('Failed to load vouchers:', err);
    }
    return [];
  },

  // Get Admin Vouchers
  getAdminVouchers: async (): Promise<Voucher[]> => {
    try {
      const res = await api.get<Voucher[]>('/admin/vouchers');
      if (Array.isArray(res)) {
        return res.map(normalizeVoucher);
      }
    } catch (err) {
      console.log('Failed to load admin vouchers:', err);
    }
    return [];
  },

  // Create Voucher (Admin)
  createVoucher: async (voucherData: Omit<Voucher, 'id' | 'usedCount'>): Promise<Voucher> => {
    const payload = {
      ...voucherData,
      discountAmount: voucherData.discountValue,
      minOrderAmount: voucherData.minOrderValue,
    };
    const res = await api.post<Voucher>('/admin/vouchers', payload);
    return normalizeVoucher(res);
  },

  // Delete Voucher (Admin)
  deleteVoucher: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/vouchers/${id}`);
    } catch (err) {
      console.log('Deleted local voucher:', id);
    }
  },

  // Core Validator: Evaluates a Voucher against cart subtotal, items, and shipping fee
  validateVoucher: (
    voucherInput: Voucher,
    subtotal: number,
    shippingFee: number = 22000,
    items: CartItem[] = []
  ): VoucherValidationResult => {
    const voucher = normalizeVoucher(voucherInput);
    const now = new Date();
    const minOrderVal = voucher.minOrderValue;
    const discountVal = voucher.discountValue;

    // 1. Check Active Status
    if (!voucher.isActive) {
      return {
        voucher,
        isEligible: false,
        discountAmount: 0,
        reason: 'Mã giảm giá này hiện tạm ngưng sử dụng.',
      };
    }

    // 2. Check Expiration / Timeframe
    if (voucher.startDate && new Date(voucher.startDate) > now) {
      return {
        voucher,
        isEligible: false,
        discountAmount: 0,
        reason: 'Mã giảm giá chưa đến thời gian áp dụng.',
      };
    }
    if (voucher.endDate && new Date(voucher.endDate) < now) {
      return {
        voucher,
        isEligible: false,
        discountAmount: 0,
        reason: 'Mã giảm giá đã hết thời hạn sử dụng.',
      };
    }

    // 3. Check Global Usage Limit
    if (voucher.usedCount >= voucher.usageLimit) {
      return {
        voucher,
        isEligible: false,
        discountAmount: 0,
        reason: 'Mã giảm giá đã hết số lượt sử dụng.',
      };
    }

    // 4. Check Minimum Order Subtotal Requirement
    if (subtotal < minOrderVal) {
      const missing = minOrderVal - subtotal;
      return {
        voucher,
        isEligible: false,
        discountAmount: 0,
        missingAmount: missing,
        reason: `Mua thêm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(missing)} để sử dụng mã này.`,
      };
    }

    // 5. Check Specific Category Restriction if present
    if (voucher.applicableCategoryId) {
      const hasCategoryItem = items.some(
        (item) => item.book.categoryId === voucher.applicableCategoryId
      );
      if (!hasCategoryItem) {
        return {
          voucher,
          isEligible: false,
          discountAmount: 0,
          reason: `Mã chỉ áp dụng cho sản phẩm thuộc danh mục "${voucher.applicableCategoryName || 'Đặc thù'}".`,
        };
      }
    }

    // 6. Calculate Discount Amount
    let discountAmount = 0;

    if (voucher.discountType === 'FREE_SHIPPING') {
      discountAmount = Math.min(shippingFee, discountVal);
    } else if (voucher.discountType === 'PERCENTAGE') {
      const rawDiscount = (subtotal * discountVal) / 100;
      if (voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0) {
        discountAmount = Math.min(rawDiscount, voucher.maxDiscountAmount);
      } else {
        discountAmount = rawDiscount;
      }
    } else {
      // FIXED_AMOUNT
      discountAmount = Math.min(subtotal, discountVal);
    }

    const safeDiscount = Math.max(0, Math.round(Number(discountAmount) || 0));

    return {
      voucher,
      isEligible: true,
      discountAmount: safeDiscount,
    };
  },
};
