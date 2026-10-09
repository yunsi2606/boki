import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đọc Thử Sách & Chương Mẫu Miễn Phí',
  description:
    'Trải nghiệm đọc thử các chương mở đầu Manga, Light Novel và Sách hot hoàn toàn miễn phí trước khi quyết định mua tại Boki.',
  openGraph: {
    title: 'Đọc Thử Sách & Chương Mẫu Miễn Phí | Boki',
    description:
      'Trải nghiệm đọc thử các chương mở đầu Manga, Light Novel và Sách hot hoàn toàn miễn phí trước khi quyết định mua tại Boki.',
  },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
