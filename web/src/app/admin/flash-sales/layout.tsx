import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Flash Sale Giờ Vàng',
};

export default function AdminFlashSalesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
