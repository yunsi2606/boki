import type { Metadata } from 'next';
import PreviewReaderClient from '@/components/features/preview/PreviewReaderClient';
import { API_BASE_URL } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const post = await res.json();
      const title = `Đọc Thử: ${post.title}`;
      const description = `Trải nghiệm đọc thử miễn phí tác phẩm ${post.title} trước khi mua tại Boki.`;
      const cover = post.coverImage || post.effectiveCoverImage;

      return {
        title,
        description,
        openGraph: {
          title: `${title} | Boki`,
          description,
          images: cover ? [{ url: cover, alt: post.title }] : undefined,
        },
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    title: 'Đọc Thử Sách',
    description: 'Trải nghiệm đọc thử miễn phí truyện tranh và sách bản quyền tại Boki.',
  };
}

export default async function PreviewReaderPage({ params }: Props) {
  const { slug } = await params;
  return <PreviewReaderClient slug={slug} />;
}
