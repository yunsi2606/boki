'use client';

import { useState, useEffect } from 'react';
import { defaultHomepageConfig } from '@/config/homepageConfig';
import { voucherService } from '@/services/voucherService';
import { useStoreConfig } from '@/contexts/StoreConfigContext';
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
  const { config, loading: configLoading, isRedirectToSchedule, scheduleUrl } = useStoreConfig();
  const [notification, setNotification] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsPreview(params.get('preview') === 'true');
    }
  }, []);

  useEffect(() => {
    if (!configLoading && isRedirectToSchedule && !isPreview) {
      setRedirecting(true);
      window.location.replace(scheduleUrl);
    }
  }, [configLoading, isRedirectToSchedule, isPreview, scheduleUrl]);

  useEffect(() => {
    voucherService.getAllVouchers().then(setVouchers).catch(console.error);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if ((configLoading || isRedirectToSchedule || redirecting) && !isPreview) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
        <span>Đang chuyển hướng sang Lịch phát hành...</span>
      </div>
    );
  }

  const sections = config.sections || defaultHomepageConfig.sections;

  return (
    <div className={styles.homeContainer}>
      {isPreview && (
        <div style={{ background: '#fff3bf', borderBottom: '1px solid #ffe066', padding: '10px 16px', textAlign: 'center', fontSize: '13px', color: '#854d0e', fontWeight: 600 }}>
          Chế độ xem trước dành cho Quản trị viên (Trang chủ đang tạm ẩn với khách truy cập thông thường)
        </div>
      )}

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
