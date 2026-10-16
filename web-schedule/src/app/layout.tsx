import type { Metadata } from 'next';
import { ScheduleHeader } from '@/components/layout/ScheduleHeader';
import { ScheduleFooter } from '@/components/layout/ScheduleFooter';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Boki - Lịch Phát Hành Manga & Light Novel',
  description:
    'Nền tảng tra cứu lịch phát hành truyện tranh manga, comic, light novel toàn quốc. So sánh giá Shopee, TikTok Shop, Boki Store và quản lý tủ sách cá nhân.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ScheduleHeader />
        {children}
        <ScheduleFooter />
      </body>
    </html>
  );
}
