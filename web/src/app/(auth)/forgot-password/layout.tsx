import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quên Mật Khẩu',
  description: 'Khôi phục mật khẩu tài khoản Boki qua email đăng ký.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
