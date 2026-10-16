import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Boki - Lịch Phát Hành Truyện Tranh & Light Novel',
  description:
    'Cập nhật liên tục lịch phát hành Manga, Comic, Light Novel từ NXB Kim Đồng, Trẻ, IPM, Wings Books, Amak, AZ... kèm link mua Shopee, TikTok Shop và Boki Store.',
  openGraph: {
    title: 'Boki - Lịch Phát Hành Truyện Tranh & Light Novel',
    description:
      'Tra cứu lịch phát hành manga mới nhất, theo dõi ngày dời lịch và quản lý tủ sách cá nhân tại Boki.',
  },
};

export default function LichPhatHanhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
