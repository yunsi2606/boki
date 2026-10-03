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
import DynamicBookSection from '@/components/features/home/DynamicBookSection';
import PersonalizedSection from '@/components/features/recommendations/PersonalizedSection';
import FlashSaleSection from '@/components/features/home/flashSale/FlashSaleSection';
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
          if (!data.sections || data.sections.length === 0) {
            data.sections = defaultHomepageConfig.sections;
          } else {
            const hasCat = data.sections.some((s) => s.type === 'CATEGORY_CIRCLES');
            const hasFs = data.sections.some((s) => s.type === 'FLASH_SALE');
            const hasRec = data.sections.some((s) => s.type === 'RECOMMENDATIONS');
            const updated = [...data.sections];
            if (!hasCat) {
              updated.unshift({
                id: 'sec_category_circles',
                type: 'CATEGORY_CIRCLES',
                title: 'Khám Phá Thể Loại Sách',
                enabled: true,
                dataSource: 'CATEGORY',
                displayStyle: 'GRID',
                itemLimit: 10,
              });
            }
            if (!hasFs) {
              updated.splice(1, 0, {
                id: 'sec_flash_sale',
                type: 'FLASH_SALE',
                title: 'Flash Sale Giờ Vàng',
                enabled: true,
                dataSource: 'FLASH_SALE',
                displayStyle: 'SLIDER',
                itemLimit: 10,
                showViewAll: true,
                viewAllUrl: '/books',
              });
            }
            if (!hasRec) {
              updated.splice(2, 0, {
                id: 'sec_personalized',
                type: 'RECOMMENDATIONS',
                title: 'Gợi Ý Dành Riêng Cho Bạn',
                enabled: true,
                dataSource: 'PERSONALIZED',
                displayStyle: 'GRID',
                itemLimit: 8,
              });
            }
            data.sections = updated;
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

      {/* Dynamic Sections (Configured and reordered by Admin) */}
      {sections
        .filter((sec) => sec.enabled)
        .map((sec) => {
          switch (sec.type) {
            case 'CATEGORY_CIRCLES':
              return <CategoryCircles key={sec.id} />;

            case 'FLASH_SALE':
              return (
                <FlashSaleSection
                  key={sec.id}
                  section={sec}
                  onShowNotification={showNotification}
                />
              );

            case 'RECOMMENDATIONS':
              return (
                <PersonalizedSection
                  key={sec.id}
                  onShowNotification={showNotification}
                />
              );

            case 'HOT_RECOMMENDED':
              return (
                <ProductShowcase
                  key={sec.id}
                  title={sec.title}
                  subtitle={sec.subtitle}
                  onShowNotification={showNotification}
                />
              );

            case 'VOUCHERS':
              return (
                <VoucherSection
                  key={sec.id}
                  vouchers={vouchers}
                  onShowNotification={showNotification}
                />
              );

            case 'BEST_SELLERS':
            case 'CATEGORY_LIST':
            case 'DAILY_VIP':
            default:
              return (
                <DynamicBookSection
                  key={sec.id}
                  section={sec}
                  onShowNotification={showNotification}
                />
              );
          }
        })}
    </div>
  );
}
