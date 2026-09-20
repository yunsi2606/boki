'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { checkoutNavigationService } from '@/services/checkoutNavigationService';
import type { Order, CartItem, PaymentInitResponse } from '@/types';
import AddressForm, { AddressFormData } from '@/components/features/checkout/AddressForm';
import PaymentMethodSelector, { PaymentMethod } from '@/components/features/checkout/PaymentMethodSelector';
import CheckoutSummary from '@/components/features/checkout/CheckoutSummary';
import SePayQrModal from '@/components/features/checkout/SePayQrModal';
import { paymentService } from '@/services/paymentService';
import { activityTracker } from '@/services/activityTracker';
import {
  BoltIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CrownIcon,
} from '@/components/ui/LineIcons';
import styles from './page.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Smooth state transition: prioritize state passed via checkoutNavigationService
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>(cartItems);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    activityTracker.trackCheckoutStep('Mở trang thanh toán', {
      isAuthenticated,
    });
  }, [isAuthenticated]);

  useEffect(() => {
    const navState = checkoutNavigationService.getCheckoutState();
    if (navState && Array.isArray(navState.items) && navState.items.length > 0) {
      setCheckoutItems(navState.items);
      if (navState.voucherCode) {
        setAppliedVoucherCode(navState.voucherCode);
      }
    } else if (cartItems.length > 0) {
      setCheckoutItems(cartItems);
    }
  }, [cartItems]);

  const [formData, setFormData] = useState<AddressFormData>({
    fullName: user?.shippingFullName || user?.displayName || '',
    phoneNumber: user?.shippingPhone || user?.phoneNumber || '',
    email: user?.email || '',
    province: user?.shippingProvince || '',
    provinceCode: user?.shippingProvinceCode ?? null,
    district: user?.shippingDistrict || '',
    districtCode: user?.shippingDistrictCode ?? null,
    ward: user?.shippingWard || '',
    wardCode: user?.shippingWardCode ?? null,
    streetAddress: user?.shippingStreetAddress || '',
    note: user?.shippingDeliveryNote || '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [sepayData, setSepayData] = useState<PaymentInitResponse | null>(null);

  // Auto-fill name, phone, email, and default shipping address from user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        fullName: prev.fullName || user.shippingFullName || user.displayName || '',
        phoneNumber: prev.phoneNumber || user.shippingPhone || user.phoneNumber || '',
        email: prev.email || user.email || '',
        province: prev.province || user.shippingProvince || '',
        provinceCode: prev.provinceCode ?? user.shippingProvinceCode ?? null,
        district: prev.district || user.shippingDistrict || '',
        districtCode: prev.districtCode ?? user.shippingDistrictCode ?? null,
        ward: prev.ward || user.shippingWard || '',
        wardCode: prev.wardCode ?? user.shippingWardCode ?? null,
        streetAddress: prev.streetAddress || user.shippingStreetAddress || '',
        note: prev.note || user.shippingDeliveryNote || '',
      }));
    }
  }, [user]);


  const handleFormDataChange = (updatedFields: Partial<AddressFormData>) => {
    setFormData((prev) => ({ ...prev, ...updatedFields }));
    // Clear errors for fields being updated
    setErrors((prev) => {
      const copy = { ...prev };
      Object.keys(updatedFields).forEach((key) => {
        delete copy[key];
      });
      return copy;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên người nhận';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại nhận hàng';
    } else if (!/^[0-9]{9,11}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (gồm 9-11 chữ số)';
    }
    if (!isAuthenticated) {
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Vui lòng nhập email nhận thông tin đơn hàng';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Địa chỉ email không hợp lệ';
      }
    }
    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    }
    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn Quận/Huyện';
    }
    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn Xã/Phường';
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường...)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (voucherCode?: string) => {
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc trước khi đặt hàng!');
      return;
    }

    const activeItems = checkoutItems.length > 0 ? checkoutItems : cartItems;
    if (activeItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    setSubmitting(true);

    try {
      // Build full structured shipping address
      const fullAddressString = `${formData.fullName.trim()} | SĐT: ${formData.phoneNumber.trim()} | ${formData.streetAddress.trim()}, ${formData.ward}, ${formData.district}, ${formData.province}${
        formData.note.trim() ? ` (Ghi chú: ${formData.note.trim()})` : ''
      } | PTTT: ${paymentMethod}`;

      const itemsPayload = activeItems.map((item) => ({
        bookId: item.book.id,
        variantId: item.selectedVariant?.id,
        quantity: item.quantity,
      }));

      const isGuestOrder = !isAuthenticated;
      const effectiveVoucher = voucherCode || appliedVoucherCode || undefined;

      const newOrder = await orderService.createOrder({
        shippingAddress: fullAddressString,
        items: itemsPayload,
        paymentMethod: paymentMethod,
        isGuest: isGuestOrder,
        guestName: isGuestOrder ? formData.fullName.trim() : undefined,
        guestPhone: isGuestOrder ? formData.phoneNumber.trim() : undefined,
        guestEmail: isGuestOrder ? (formData.email?.trim() || undefined) : undefined,
        voucherCode: effectiveVoucher,
      });

      // Track order placement event
      activityTracker.trackOrderPlaced(
        newOrder.id,
        newOrder.totalAmount || 0,
        paymentMethod,
        itemsPayload.length,
        {
          isGuest: isGuestOrder,
          shippingProvince: formData.province,
          voucherApplied: !!effectiveVoucher,
          voucherCode: effectiveVoucher,
        }
      );

      clearCart();
      checkoutNavigationService.clearCheckoutState();

      if (paymentMethod === 'BANKING') {
        try {
          const initResp = await paymentService.initiatePayment({
            orderId: newOrder.id,
            paymentMethod: 'BANKING',
          });
          setSepayData(initResp);
        } catch (paymentErr) {
          console.error('Failed to init SePay payment:', paymentErr);
        }
        setCreatedOrder(newOrder);
      } else if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
        try {
          const initResp = await paymentService.initiatePayment({
            orderId: newOrder.id,
            paymentMethod: paymentMethod,
          });
          if (initResp.payUrl) {
            window.location.href = initResp.payUrl;
            return;
          }
        } catch (gatewayErr) {
          console.error('Failed to init gateway payment:', gatewayErr);
        }
        setCreatedOrder(newOrder);
      } else {
        setCreatedOrder(newOrder);
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      alert(err?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Success Screen
  if (createdOrder) {
    return (
      <div className={styles.container}>
        {sepayData && (
          <SePayQrModal
            paymentData={sepayData}
            onClose={() => setSepayData(null)}
          />
        )}

        <div className={styles.successCard}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon size={48} color="#16a34a" />
            </div>
          </div>
          <h1 className={styles.successTitle}>Đặt hàng thành công!</h1>
          <p className={styles.successDesc}>
            Cảm ơn bạn đã mua hàng tại Boki Store. Đơn hàng của bạn đã được tiếp nhận và xử lý an toàn.
          </p>
          <div className={styles.orderBadge}>Mã đơn hàng: #{createdOrder.id.slice(0, 8).toUpperCase()}</div>

          <div style={{ margin: '16px 0', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Phương thức:</span>
            {paymentMethod === 'BANKING' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                <img src="/wallets/sepay.png" alt="SePay" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                Chuyển khoản VietQR qua SePay
              </span>
            )}
            {paymentMethod === 'MOMO' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                <img src="/wallets/momo.png" alt="MoMo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                Ví MoMo
              </span>
            )}
            {paymentMethod === 'VNPAY' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                <img src="/wallets/vnpay.png" alt="VNPay" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                Cổng VNPay
              </span>
            )}
            {paymentMethod === 'COD' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                <img src="/wallets/cod.svg" alt="COD" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                Thanh toán khi nhận hàng (COD)
              </span>
            )}
          </div>

          {paymentMethod === 'BANKING' && sepayData && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setSepayData({ ...sepayData })}
                style={{
                  background: '#ffedd5',
                  color: '#c2410c',
                  border: '1px solid #fed7aa',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <DevicePhoneMobileIcon size={16} color="#c2410c" />
                <span>Quét lại mã VietQR SePay</span>
              </button>
            </div>
          )}

          {!isAuthenticated && formData.email && (
            <div style={{
              margin: '12px 0 16px',
              padding: '12px 16px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              color: '#1e40af',
              fontSize: '13px',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <EnvelopeIcon size={18} color="#2563eb" style={{ flexShrink: 0 }} />
              <span>
                Thông tin chi tiết đơn hàng đã được gửi về email <strong>{formData.email}</strong>. Quý khách vui lòng lưu lại mã đơn hàng để tra cứu khi cần thiết.
              </span>
            </div>
          )}

          <div className={styles.actionButtons}>
            {isAuthenticated ? (
              <Link href="/orders/history" className={styles.historyBtn}>
                Xem lịch sử đơn hàng
              </Link>
            ) : (
              <Link href="/" className={styles.historyBtn}>
                Về trang chủ
              </Link>
            )}
            <Link href="/books" className={styles.shopBtn}>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeCheckoutItems = checkoutItems.length > 0 ? checkoutItems : cartItems;

  if (activeCheckoutItems.length === 0) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
          Giỏ hàng của bạn đang trống
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Hãy chọn sách trước khi tiến hành thanh toán nhé!
        </p>
        <Link href="/books">
          <button style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            Khám phá cửa hàng
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Trang chủ
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/cart" className={styles.breadcrumbLink}>
          Giỏ hàng
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span>Thanh toán</span>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Thanh toán đơn hàng</h1>
        <p className={styles.pageSubtitle}>
          Vui lòng kiểm tra lại địa chỉ nhận hàng và thông tin thanh toán trước khi xác nhận đặt hàng.
        </p>
      </div>

      {/* Member tier notification or guest notification */}
      {isAuthenticated && user?.memberTier && user.memberTier !== 'STANDARD' ? (
        <div style={{
          marginBottom: '20px',
          padding: '12px 18px',
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: '#92400e',
        }}>
          <CrownIcon size={20} color="#d97706" />
          <span>
            Bạn đang đăng nhập với tư cách <strong>Thành viên {user.memberTier}</strong>. Chiết khấu tương ứng sẽ được áp dụng tự động phía máy chủ!
          </span>
        </div>
      ) : !isAuthenticated ? (
        <div style={{
          marginBottom: '24px',
          padding: '14px 20px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          color: '#166534',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BoltIcon size={18} color="#16a34a" />
            <span>
              Bạn đang đặt hàng nhanh với tư cách <strong>Khách vãng lai (Guest)</strong>. Không cần đăng nhập vẫn hoàn tất đặt hàng tiện lợi!
            </span>
          </div>
          <Link
            href="/login?redirectTo=/checkout"
            style={{
              fontWeight: 700,
              color: '#15803d',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Đăng nhập ngay để nhận ưu đãi thành viên ➔
          </Link>
        </div>
      ) : null}

      <div className={styles.checkoutLayout}>
        {/* Left Column: Address Form & Payment Method */}
        <div className={styles.leftColumn}>
          <AddressForm
            formData={formData}
            onChange={handleFormDataChange}
            errors={errors}
            isGuest={!isAuthenticated}
          />

          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={(method) => {
              setPaymentMethod(method);
              activityTracker.trackCheckoutStep('Chọn phương thức thanh toán', { paymentMethod: method });
            }}
          />
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.rightColumn}>
          <CheckoutSummary
            items={activeCheckoutItems}
            onSubmit={handlePlaceOrder}
            submitting={submitting}
            onVoucherChange={(code) => {
              setAppliedVoucherCode(code);
              if (code) {
                activityTracker.trackVoucherApplied(code, true);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
