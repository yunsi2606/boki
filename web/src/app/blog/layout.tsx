import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Góc Đọc Sách & Tin Tức Xuất Bản',
  description:
    'Tổng hợp bài viết review sách hay, tin tức xuất bản Manga, Light Novel và cẩm nang đọc sách bản quyền chính hãng tại Boki.',
  openGraph: {
    title: 'Góc Đọc Sách & Tin Tức Xuất Bản | Boki',
    description:
      'Tổng hợp bài viết review sách hay, tin tức xuất bản Manga, Light Novel và cẩm nang đọc sách bản quyền chính hãng tại Boki.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
