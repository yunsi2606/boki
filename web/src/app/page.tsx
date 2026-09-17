'use client';

import { useState, useEffect } from 'react';
import { defaultHomepageConfig } from '@/config/homepageConfig';
import { voucherService } from '@/services/voucherService';
import type { Voucher } from '@/types/voucher';
import HeroBanner from '@/components/features/home/HeroBanner';
import CategoryCircles from '@/components/features/home/CategoryCircles';
import VoucherSection from '@/components/features/home/VoucherSection';
import ProductShowcase from '@/components/features/home/ProductShowcase';
import MemberBooksSection from '@/components/features/home/MemberBooksSection';
import RankingSection from '@/components/features/home/RankingSection';
import styles from './page.module.css';

export default function HomePage() {
  const [notification, setNotification] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    voucherService.getAllVouchers().then(setVouchers).catch(console.error);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className={styles.homeContainer}>
      {/* Toast Notification */}
      {notification && <div className={styles.toast}>{notification}</div>}

      {/* Hero Section Banner with Background Image */}
      <HeroBanner config={defaultHomepageConfig.hero} />

      {/* Story-style Circular Categories */}
      <CategoryCircles />

      {/* Real Voucher Ticket Section */}
      <VoucherSection
        vouchers={vouchers}
        onShowNotification={showNotification}
      />

      {/* Main Tabbed Product Showcase */}
      <ProductShowcase onShowNotification={showNotification} />

      {/* Daily Books for VIP Members */}
      <MemberBooksSection />

      {/* Netflix-style Top 5 Rankings */}
      <RankingSection />
    </div>
  );
}
