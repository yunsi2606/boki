'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { giveawayService } from '@/services/giveawayService';
import { GiveawayCampaignDetail, GiveawayEntry } from '@/types/giveaway';
import { GiveawayHero } from '@/components/features/giveaway/GiveawayHero';
import { GiveawayGallery } from '@/components/features/giveaway/GiveawayGallery';
import { GiveawayPrizeList } from '@/components/features/giveaway/GiveawayPrizeList';
import { GiveawayWinnersBoard } from '@/components/features/giveaway/GiveawayWinnersBoard';
import { GiveawayEntryModal } from '@/components/features/giveaway/GiveawayEntryModal';
import styles from './giveawayDetail.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function GiveawayDetailPage({ params }: Props) {
  const { slug } = use(params);
  const [campaign, setCampaign] = useState<GiveawayCampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await giveawayService.getGiveawayDetail(slug);
      setCampaign(data);
    } catch (err: any) {
      console.error('Failed to load giveaway details:', err);
      setErrorMsg(err.message || 'Không tìm thấy thông tin sự kiện Give Away này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleEntrySuccess = (_entry: GiveawayEntry) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        totalEntriesCount: (campaign.totalEntriesCount || 0) + 1,
      });
    }
  };

  const formatDrawDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const drawDateFormatted = campaign ? formatDrawDate(campaign.drawDate || campaign.endDate) : '';

  const realImages = campaign?.imageUrls && campaign.imageUrls.length > 0
    ? campaign.imageUrls
    : (campaign?.bannerUrl ? [campaign.bannerUrl] : []);

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadcrumbLink}>Trang chủ</Link>
        <span>/</span>
        <Link href="/giveaway" className={styles.breadcrumbLink}>Give Away</Link>
        <span>/</span>
        <span className={styles.breadcrumbActive}>{campaign ? campaign.title : slug}</span>
      </nav>

      {loading && <div className={styles.loadingBox}>Đang tải thông tin Give Away...</div>}

      {!loading && errorMsg && (
        <div className={styles.errorBox}>
          <p>{errorMsg}</p>
          <Link href="/giveaway" style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>
            Quay lại danh sách Give Away
          </Link>
        </div>
      )}

      {!loading && campaign && (
        <>
          <GiveawayHero
            campaign={campaign}
            onOpenEntryModal={() => setIsModalOpen(true)}
          />

          {realImages.length > 0 && (
            <GiveawayGallery
              images={realImages}
              title={campaign.title}
            />
          )}

          <GiveawayPrizeList
            prizes={campaign.prizes}
            prizeStructureType={campaign.prizeStructureType}
          />

          {campaign.status === 'DRAWN' && (
            <GiveawayWinnersBoard
              winningNumber={campaign.winningNumber}
              drawDate={campaign.drawDate}
              winners={campaign.winners}
            />
          )}

          <GiveawayEntryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            slug={campaign.slug}
            drawDateFormatted={drawDateFormatted}
            onEntrySuccess={handleEntrySuccess}
          />
        </>
      )}
    </div>
  );
}
