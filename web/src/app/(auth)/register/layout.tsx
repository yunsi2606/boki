import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Ký Thành Viên',
  description: 'Tạo tài khoản Boki để nhận ngay ưu đãi chào mừng và tích lũy điểm thưởng thành viên.',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
