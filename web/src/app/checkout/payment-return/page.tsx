'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './paymentReturn.module.css';

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState<'MOMO' | 'VNPAY' | 'UNKNOWN'>('UNKNOWN');
  const [orderId, setOrderId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [transactionNo, setTransactionNo] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Check if VNPay return
    if (searchParams.has('vnp_ResponseCode') || searchParams.has('vnp_TxnRef')) {
      setMethod('VNPAY');
      const responseCode = searchParams.get('vnp_ResponseCode');
      const txnRef = searchParams.get('vnp_TxnRef') || '';
      const vnpAmount = Number(searchParams.get('vnp_Amount') || 0) / 100;
      const transNo = searchParams.get('vnp_TransactionNo') || '';

      setOrderId(txnRef);
      setAmount(vnpAmount);
      setTransactionNo(transNo);

      if (responseCode === '00') {
        setSuccess(true);
        setMessage('Giao dịch thanh toán qua Cổng VNPay đã thành công!');
      } else {
        setSuccess(false);
        setMessage(
          responseCode === '24'
            ? 'Khách hàng đã hủy giao dịch trên cổng VNPay.'
            : `Giao dịch VNPay không thành công (Mã lỗi: ${responseCode}).`
        );
      }
      setLoading(false);
      return;
    }

    // Check if MoMo return
    if (searchParams.has('resultCode') || searchParams.has('orderId')) {
      setMethod('MOMO');
      const resultCode = searchParams.get('resultCode');
      const momoOrderId = searchParams.get('orderId') || '';
      const momoAmount = Number(searchParams.get('amount') || 0);
      const transId = searchParams.get('transId') || '';
      const momoMsg = searchParams.get('message') || '';

      setOrderId(momoOrderId);
      setAmount(momoAmount);
      setTransactionNo(transId);

      if (resultCode === '0') {
        setSuccess(true);
        setMessage('Giao dịch thanh toán qua Ví MoMo đã thành công!');
      } else {
        setSuccess(false);
        setMessage(`Thanh toán MoMo thất bại hoặc bị hủy: ${momoMsg || `Mã kết quả ${resultCode}`}`);
      }
      setLoading(false);
      return;
    }

    // Fallback
    setLoading(false);
    setMessage('Không tìm thấy thông tin kết quả giao dịch thanh toán.');
  }, [searchParams]);

  const formatVnd = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner}></div>
        <p>Đang đối soát kết quả thanh toán...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card} glass>
        <div className={styles.header}>
          <div className={`${styles.statusIcon} ${success ? styles.iconSuccess : styles.iconFailed}`}>
            {success ? '✓' : '✕'}
          </div>
          <h1 className={styles.title}>
            {success ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}
          </h1>
          <p className={styles.subtitle}>{message}</p>
        </div>

        <div className={styles.detailsBox}>
          {method !== 'UNKNOWN' && (
            <div className={styles.row}>
              <span className={styles.label}>Cổng thanh toán:</span>
              <span className={styles.valWithLogo}>
                {method === 'MOMO' && (
                  <>
                    <img src="/wallets/momo.png" alt="MoMo" className={styles.logoImg} /> Ví MoMo
                  </>
                )}
                {method === 'VNPAY' && (
                  <>
                    <img src="/wallets/vnpay.png" alt="VNPay" className={styles.logoImg} /> Cổng VNPay
                  </>
                )}
              </span>
            </div>
          )}

          {orderId && (
            <div className={styles.row}>
              <span className={styles.label}>Mã đơn hàng:</span>
              <span className={styles.value}>#{orderId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}

          {amount > 0 && (
            <div className={styles.row}>
              <span className={styles.label}>Số tiền:</span>
              <span className={`${styles.value} ${styles.highlight}`}>{formatVnd(amount)}</span>
            </div>
          )}

          {transactionNo && (
            <div className={styles.row}>
              <span className={styles.label}>Mã giao dịch:</span>
              <span className={styles.value}>{transactionNo}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Link href="/orders/history">
            <Button size="lg" variant="primary">
              📋 Xem Đơn Hàng Của Tôi
            </Button>
          </Link>
          <Link href="/books">
            <Button size="lg" variant="secondary">
              📚 Tiếp Tục Mua Sắm
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Đang tải...</div>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
