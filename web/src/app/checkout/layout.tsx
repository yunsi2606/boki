import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thanh Toán Đơn Hàng',
  description: 'Hoàn tất địa chỉ nhận hàng và lựa chọn phương thức thanh toán an toàn tại Boki.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
