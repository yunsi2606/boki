'use client';

import React from 'react';
import styles from './PaymentMethodSelector.module.css';

export type PaymentMethod = 'COD' | 'BANKING' | 'VNPAY' | 'MOMO';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const methods: { id: PaymentMethod; title: string; desc: string; icon?: string; logo?: string }[] = [
    {
      id: 'COD',
      title: 'Thanh toán khi nhận hàng (COD)',
      desc: 'Bạn sẽ thanh toán tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sách.',
      icon: '💵',
    },
    {
      id: 'BANKING',
      title: 'Chuyển khoản Ngân hàng (VietQR qua SePay)',
      desc: 'Quét mã VietQR chuyển khoản nhanh 24/7. Đơn hàng tự động xác nhận ngay sau khi chuyển.',
      logo: '/wallets/sepay.png',
    },
    {
      id: 'MOMO',
      title: 'Ví điện tử MoMo',
      desc: 'Thanh toán nhanh chóng, tiện lợi bằng tài khoản Ví MoMo trên điện thoại.',
      logo: '/wallets/momo.png',
    },
    {
      id: 'VNPAY',
      title: 'Cổng thanh toán VNPay',
      desc: 'Hỗ trợ tất cả ngân hàng nội địa (ATM), thẻ quốc tế Visa / Mastercard và quét VNPAY-QR.',
      logo: '/wallets/vnpay.png',
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerIcon}>💳</div>
        <h2 className={styles.cardTitle}>Phương thức thanh toán</h2>
      </div>

      <div className={styles.methodsList}>
        {methods.map((m) => {
          const isSelected = selectedMethod === m.id;
          return (
            <div
              key={m.id}
              className={`${styles.methodItem} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelect(m.id)}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={isSelected}
                onChange={() => onSelect(m.id)}
                className={styles.radioInput}
              />
              <div className={styles.methodIcon}>
                {m.logo ? (
                  <img src={m.logo} alt={m.title} className={styles.walletLogo} />
                ) : (
                  <span>{m.icon}</span>
                )}
              </div>
              <div className={styles.methodInfo}>
                <h4 className={styles.methodTitle}>{m.title}</h4>
                <p className={styles.methodDesc}>{m.desc}</p>

                {isSelected && m.id === 'BANKING' && (
                  <div className={styles.bankDetailsBox}>
                    ⚡ <strong>Hệ thống tự động:</strong> Sau khi bấm đặt hàng, mã <strong>VietQR SePay</strong> sẽ hiển thị trực tiếp để bạn quét mã trên ứng dụng ngân hàng mà không cần gõ số tiền hay nội dung.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
