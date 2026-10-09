import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Nhập Tài Khoản',
  description: 'Đăng nhập vào Boki để mua sắm manga, sách bản quyền và quản lý đơn hàng dễ dàng.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
