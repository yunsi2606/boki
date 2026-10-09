import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Động Cơ Gợi Ý AI',
};

export default function AdminRecommendationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
