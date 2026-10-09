import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Trị Lưu Trữ R2',
};

export default function AdminStorageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
