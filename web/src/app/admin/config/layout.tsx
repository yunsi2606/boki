import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cấu Hình Trang Chủ',
};

export default function AdminConfigLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
