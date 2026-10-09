import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đặt Lại Mật Khẩu',
  description: 'Thiết lập mật khẩu mới an toàn cho tài khoản Boki của bạn.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
