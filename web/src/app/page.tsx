'use client';

import { useState, useEffect } from 'react';
import { defaultHomepageConfig, type HomepageConfig } from '@/config/homepageConfig';
import { adminService } from '@/services/adminService';
import { voucherService } from '@/services/voucherService';
import type { Voucher } from '@/types/voucher';
import HeroBanner from '@/components/features/home/HeroBanner';
import CategoryCircles from '@/components/features/home/CategoryCircles';
import VoucherSection from '@/components/features/home/VoucherSection';
import ProductShowcase from '@/components/features/home/ProductShowcase';
import MemberBooksSection from '@/components/features/home/MemberBooksSection';
import BestSellersSection from '@/components/features/home/BestSellersSection';
import CategoryBooksSection from '@/components/features/home/CategoryBooksSection';
import styles from './page.module.css';

export default function HomePage() {
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [notification, setNotification] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    async function loadStoreConfig() {
      try {
        const data = await adminService.getStoreConfig();
        if (data) {
          // If loaded data doesn't have sections yet, backfill from default
          if (!data.sections || data.sections.length === 0) {
            data.sections = defaultHomepageConfig.sections;
          }
          setConfig(data);
        }
      } catch (err) {
        console.error('Failed to load dynamic store config', err);
      }
    }

    loadStoreConfig();
    voucherService.getAllVouchers().then(setVouchers).catch(console.error);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const sections = config.sections || defaultHomepageConfig.sections;

  return (
    <div className={styles.homeContainer}>
      {/* Toast Notification */}
      {notification && <div className={styles.toast}>{notification}</div>}

      {/* Hero Section Banner with Background Image */}
      <HeroBanner config={config.hero} />

      {/* Story-style Circular Categories */}
      <CategoryCircles />

      {/* Dynamic Sections (Configured and reordered by Admin) */}
      {sections
        .filter((sec) => sec.enabled)
        .map((sec) => {
          switch (sec.type) {
            case 'BEST_SELLERS':
              return (
                <BestSellersSection
                  key={sec.id}
                  title={sec.title}
                  subtitle={sec.subtitle}
                  itemLimit={sec.itemLimit || 10}
                />
              );

            case 'HOT_RECOMMENDED':
              return (
                <ProductShowcase
                  key={sec.id}
                  onShowNotification={showNotification}
                />
              );

            case 'CATEGORY_LIST':
              return (
                <CategoryBooksSection
                  key={sec.id}
                  title={sec.title}
                  subtitle={sec.subtitle}
                  categoryId={sec.categoryId}
                  categoryName={sec.categoryName}
                  itemLimit={sec.itemLimit || 8}
                  onShowNotification={showNotification}
                />
              );

            case 'DAILY_VIP':
              return <MemberBooksSection key={sec.id} />;

            case 'VOUCHERS':
              return (
                <VoucherSection
                  key={sec.id}
                  vouchers={vouchers}
                  onShowNotification={showNotification}
                />
              );

            default:
              return null;
          }
        })}
    </div>
  );
}
