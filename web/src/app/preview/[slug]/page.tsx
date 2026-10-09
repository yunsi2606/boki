import type { Metadata } from 'next';
import PreviewReaderClient from '@/components/features/preview/PreviewReaderClient';
import { API_BASE_URL } from '@/lib/constants';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs/${params.slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const post = await res.json();
      const title = `Đọc Thử: ${post.title}`;
      const description = `Trải nghiệm đọc thử miễn phí tác phẩm ${post.title} trước khi mua tại Boki.`;

      return {
        title,
        description,
        openGraph: {
          title: `${title} | Boki`,
          description,
          images: post.thumbnailUrl ? [{ url: post.thumbnailUrl, alt: post.title }] : undefined,
        },
      };
    }
  } catch (err) {
    console.error('Failed to generate metadata for preview reader:', err);
  }

  return {
    title: 'Đọc Thử Sách',
    description: 'Trải nghiệm đọc thử miễn phí truyện tranh và sách bản quyền tại Boki.',
  };
}

export default function PreviewReaderPage({ params }: Props) {
  return <PreviewReaderClient slug={params.slug} />;
}
