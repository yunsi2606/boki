import type { Metadata } from 'next';
import BlogDetailClient from '@/components/features/blog/BlogDetailClient';
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
      const title = post.title;
      const description = post.excerpt || post.content?.slice(0, 160).replace(/<[^>]*>/g, '') || 'Bài viết từ Boki Blog.';
      const cover = post.coverImage || post.effectiveCoverImage;

      return {
        title,
        description,
        openGraph: {
          title: `${title} | Boki Blog`,
          description,
          images: cover ? [{ url: cover, alt: post.title }] : undefined,
        },
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    title: 'Bài Viết Blog',
    description: 'Tin tức xuất bản manga và bài viết review sách tại Boki.',
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}
