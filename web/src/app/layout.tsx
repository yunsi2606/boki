import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import StorefrontLayoutWrapper from '@/components/layout/StorefrontLayoutWrapper';
import ActivityTrackerListener from '@/components/common/ActivityTrackerListener';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://boki.vn'),
  title: {
    default: 'Boki — Đại Lý Sách & Truyện Bản Quyền',
    template: '%s | Boki',
  },
  description:
    'Sàn phân phối Manga, Light Novel, Comic và Sách bản quyền chính hãng tại Việt Nam từ NXB Kim Đồng, Trẻ, IPM, Nhã Nam. Giao hàng toàn quốc, ưu đãi độc quyền.',
  keywords: [
    'sách bản quyền',
    'manga',
    'light novel',
    'truyện tranh',
    'nhà sách boki',
    'đặt trước manga',
    'lịch phát hành sách',
    'kim đồng',
    'ipm',
    'nxb trẻ',
  ],
  authors: [{ name: 'Boki Store' }],
  creator: 'Boki Store',
  publisher: 'Boki Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'Boki Store',
    title: 'Boki — Đại Lý Sách & Truyện Bản Quyền',
    description:
      'Sàn phân phối Manga, Light Novel, Comic và Sách bản quyền chính hãng tại Việt Nam.',
    images: [
      {
        url: '/brand/logo.png',
        width: 800,
        height: 600,
        alt: 'Boki — Sách & Truyện Bản Quyền',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boki — Đại Lý Sách & Truyện Bản Quyền',
    description:
      'Sàn phân phối Manga, Light Novel, Comic và Sách bản quyền chính hãng tại Việt Nam.',
    images: ['/brand/logo.png'],
  },
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


