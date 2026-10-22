'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { giveawayService } from '@/services/giveawayService';
import { GiveawayCampaignDetail, GiveawayEntry } from '@/types/giveaway';
import { GiveawayHero } from '@/components/features/giveaway/GiveawayHero';
import { GiveawayPrizeList } from '@/components/features/giveaway/GiveawayPrizeList';
import { GiveawayEntryForm } from '@/components/features/giveaway/GiveawayEntryForm';
import { GiveawayWinnersBoard } from '@/components/features/giveaway/GiveawayWinnersBoard';
import styles from './giveawayDetail.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function GiveawayDetailPage({ params }: Props) {
  const { slug } = use(params);
  const [campaign, setCampaign] = useState<GiveawayCampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleEntrySuccess = (entry: GiveawayEntry) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        totalEntriesCount: (campaign.totalEntriesCount || 0) + 1,
      });
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadcrumbLink}>
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/giveaway" className={styles.breadcrumbLink}>
          Give Away
        </Link>
        <span>/</span>
        <span className={styles.breadcrumbActive}>{campaign ? campaign.title : slug}</span>
      </nav>

      {loading && <div className={styles.loadingBox}>Đang tải thông tin Give Away...</div>}

      {!loading && errorMsg && (
        <div className={styles.errorBox}>
          <p>{errorMsg}</p>
          <Link href="/giveaway" style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>
            ← Quay lại danh sách Give Away
          </Link>
        </div>
      )}

      {!loading && campaign && (
        <>
          <GiveawayHero campaign={campaign} />

          <GiveawayPrizeList prizes={campaign.prizes} />

          {campaign.status === 'DRAWN' && (
            <GiveawayWinnersBoard
              winningNumber={campaign.winningNumber}
              drawDate={campaign.drawDate}
              winners={campaign.winners}
            />
          )}

          {campaign.status === 'OPEN' && (
            <GiveawayEntryForm slug={campaign.slug} onEntrySuccess={handleEntrySuccess} />
          )}

          {campaign.status === 'UPCOMING' && (
            <div className={styles.closedNotice}>
              Sự kiện Give Away này sẽ chính thức mở nhận lượt tham gia vào lúc:{' '}
              <strong>
                {new Date(campaign.startDate).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
              . Hãy quay lại sau nhé!
            </div>
          )}

          {campaign.status === 'CLOSED' && (
            <div className={styles.closedNotice}>
              Sự kiện Give Away này đã kết thúc nhận đăng ký và đang chờ công bố kết quả Xổ Số Miền Bắc.
              Boki sẽ sớm cập nhật danh sách người chiến thắng tại đây!
            </div>
          )}
        </>
      )}
    </div>
  );
}
