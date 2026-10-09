import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tất Cả Sách & Truyện Tranh Bản Quyền',
  description:
    'Khám phá danh mục toàn bộ Manga, Light Novel, Tiểu thuyết và Sách bản quyền chính hãng tại Boki với dải giá tốt nhất và nhiều ưu đãi hấp dẫn.',
  openGraph: {
    title: 'Tất Cả Sách & Truyện Tranh Bản Quyền | Boki',
    description:
      'Khám phá danh mục toàn bộ Manga, Light Novel, Tiểu thuyết và Sách bản quyền chính hãng tại Boki.',
  },
};

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
