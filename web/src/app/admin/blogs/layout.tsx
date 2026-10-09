import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Bài Viết Blog',
};

export default function AdminBlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
