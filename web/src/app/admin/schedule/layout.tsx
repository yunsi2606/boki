import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Lịch Phát Hành',
};

export default function AdminScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
