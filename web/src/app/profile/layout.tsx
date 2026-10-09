import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tài Khoản Cá Nhân',
  description: 'Quản lý thông tin tài khoản, sổ địa chỉ giao hàng và bảo mật tại Boki.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
