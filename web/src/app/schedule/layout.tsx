import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lịch Phát Hành Manga & Sách Mới Nhất',
  description:
    'Theo dõi lịch xuất bản Manga, Light Novel, Comic từ các NXB Kim Đồng, IPM, NXB Trẻ, Wings Books, AZ Việt Nam. Cập nhật ngày phát hành, pre-order và quà tặng kèm độc quyền.',
  openGraph: {
    title: 'Lịch Phát Hành Manga & Sách Mới Nhất | Boki',
    description:
      'Theo dõi lịch xuất bản Manga, Light Novel, Comic từ các NXB Kim Đồng, IPM, NXB Trẻ. Cập nhật ngày phát hành, pre-order và quà tặng kèm.',
  },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
