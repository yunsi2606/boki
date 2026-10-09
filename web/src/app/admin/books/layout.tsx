import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Sách & Tồn Kho',
};

export default function AdminBooksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
