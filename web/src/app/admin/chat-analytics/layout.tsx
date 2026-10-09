import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thống Kê AI Chatbot',
};

export default function AdminChatAnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
