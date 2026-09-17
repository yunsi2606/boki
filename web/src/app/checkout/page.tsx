'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types';
import AddressForm, { AddressFormData } from '@/components/features/checkout/AddressForm';
import PaymentMethodSelector, { PaymentMethod } from '@/components/features/checkout/PaymentMethodSelector';
import CheckoutSummary from '@/components/features/checkout/CheckoutSummary';
import SePayQrModal from '@/components/features/checkout/SePayQrModal';
import { paymentService } from '@/services/paymentService';
import type { PaymentInitResponse } from '@/types';
import styles from './page.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<AddressFormData>({
    fullName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    province: '',
    provinceCode: null,
    district: '',
    districtCode: null,
    ward: '',
    wardCode: null,
    streetAddress: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [sepayData, setSepayData] = useState<PaymentInitResponse | null>(null);

  // Update name/phone when user profile is loaded (leave address empty if not set)
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        phoneNumber: prev.phoneNumber || user.phoneNumber || '',
      }));
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirectTo=/checkout');
    }
  }, [isAuthenticated, router]);

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

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc trước khi đặt hàng!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    setSubmitting(true);

    try {
      // Build full structured shipping address
      const fullAddressString = `${formData.fullName.trim()} | SĐT: ${formData.phoneNumber.trim()} | ${formData.streetAddress.trim()}, ${formData.ward}, ${formData.district}, ${formData.province}${
        formData.note.trim() ? ` (Ghi chú: ${formData.note.trim()})` : ''
      } | PTTT: ${paymentMethod}`;

      const itemsPayload = cartItems.map((item) => ({
        bookId: item.book.id,
        variantId: item.selectedVariant?.id,
        quantity: item.quantity,
      }));

      const newOrder = await orderService.createOrder({
        shippingAddress: fullAddressString,
        items: itemsPayload,
        paymentMethod: paymentMethod,
      });

      clearCart();

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
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Đặt hàng thành công!</h1>
          <p className={styles.successDesc}>
            Cảm ơn bạn đã mua hàng tại Boki Store. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao tới địa chỉ của bạn.
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
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                💵 Thanh toán khi nhận hàng (COD)
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
                }}
              >
                📱 Quét lại mã VietQR SePay
              </button>
            </div>
          )}

          <div className={styles.actionButtons}>
            <Link href="/orders/history" className={styles.historyBtn}>
              Xem lịch sử đơn hàng
            </Link>
            <Link href="/books" className={styles.shopBtn}>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
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

      <div className={styles.checkoutLayout}>
        {/* Left Column: Address Form & Payment Method */}
        <div className={styles.leftColumn}>
          <AddressForm
            formData={formData}
            onChange={handleFormDataChange}
            errors={errors}
          />

          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.rightColumn}>
          <CheckoutSummary
            items={cartItems}
            onSubmit={handlePlaceOrder}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
