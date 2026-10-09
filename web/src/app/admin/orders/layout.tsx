import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Đơn Hàng',
};

export default function AdminOrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
