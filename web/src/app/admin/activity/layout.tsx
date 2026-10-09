import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nhật Ký & Hành Vi',
};

export default function AdminActivityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
