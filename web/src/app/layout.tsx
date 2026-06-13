import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PhoneVerificationModal from '@/components/features/auth/PhoneVerificationModal';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boki — Book Marketplace',
  description:
    'The modern book marketplace. Buy and sell books with ease, discover great reads, and connect with book lovers.',
  keywords: ['books', 'marketplace', 'buy books', 'sell books', 'bookstore'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
            <PhoneVerificationModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

