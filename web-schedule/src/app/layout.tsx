import type { Metadata } from 'next';
import { ScheduleHeader } from '@/components/layout/ScheduleHeader';
import { ScheduleFooter } from '@/components/layout/ScheduleFooter';
import '@/styles/globals.css';

import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'Boki - Lịch Phát Hành Manga & Light Novel',
  description:
    'Nền tảng tra cứu lịch phát hành truyện tranh manga, comic, light novel toàn quốc. So sánh giá Shopee, TikTok Shop, Boki Store và quản lý tủ sách cá nhân.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'Boki Schedule',
    title: 'Boki - Lịch Phát Hành Manga & Light Novel',
    description:
      'Nền tảng tra cứu lịch phát hành truyện tranh manga, comic, light novel toàn quốc. So sánh giá Shopee, TikTok Shop, Boki Store và quản lý tủ sách cá nhân.',
    images: [
      {
        url: '/brand/logo.png',
        width: 800,
        height: 600,
        alt: 'Boki — Lịch Phát Hành Manga & Light Novel',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ScheduleHeader />
          {children}
          <ScheduleFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
