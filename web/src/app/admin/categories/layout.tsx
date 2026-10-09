import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Danh Mục Sách',
};

export default function AdminCategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
