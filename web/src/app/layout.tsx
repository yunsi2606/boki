import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import StorefrontLayoutWrapper from '@/components/layout/StorefrontLayoutWrapper';
import ActivityTrackerListener from '@/components/common/ActivityTrackerListener';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boki — Đại Lý Sách & Truyện Bản Quyền',
  description:
    'Đại lý phân phối Manga, Light Novel và Sách bản quyền trực tiếp. Đặt mua nhanh chóng, ưu đãi lớn!',
  keywords: ['books', 'manga', 'light novel', 'bookstore', 'boki'],
  icons: {
    icon: '/brand/logo.png',
    shortcut: '/brand/logo.png',
    apple: '/brand/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <CartProvider>
            <ActivityTrackerListener />
            <StorefrontLayoutWrapper>{children}</StorefrontLayoutWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


