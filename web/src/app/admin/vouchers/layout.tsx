import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Mã Giảm Giá',
};

export default function AdminVouchersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
