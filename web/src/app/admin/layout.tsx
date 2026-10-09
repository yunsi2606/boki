import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/layout/AdminLayoutClient';

export const metadata: Metadata = {
  title: {
    default: 'Quản Trị Hệ Thống | Boki',
    template: '%s | Quản Trị Boki',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
