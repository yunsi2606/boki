import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lịch Sử Đơn Hàng',
  description: 'Theo dõi tiến độ giao hàng và danh sách các đơn hàng đã đặt tại Boki.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderHistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
