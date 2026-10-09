import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giỏ Hàng Của Bạn',
  description: 'Xem lại các tựa sách trong giỏ hàng, áp dụng voucher giảm giá và thanh toán đơn hàng tại Boki.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
