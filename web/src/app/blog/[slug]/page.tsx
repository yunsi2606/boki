import type { Metadata } from 'next';
import BlogDetailClient from '@/components/features/blog/BlogDetailClient';
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
      const title = post.title;
      const description = post.excerpt || post.content?.slice(0, 160).replace(/<[^>]*>/g, '') || 'Bài viết từ Boki Blog.';

      return {
        title,
        description,
        openGraph: {
          title: `${title} | Boki Blog`,
          description,
          images: post.thumbnailUrl ? [{ url: post.thumbnailUrl, alt: post.title }] : undefined,
        },
      };
    }
  } catch (err) {
    console.error('Failed to generate metadata for blog:', err);
  }

  return {
    title: 'Bài Viết Blog',
    description: 'Tin tức xuất bản manga và bài viết review sách tại Boki.',
  };
}

export default function BlogDetailPage({ params }: Props) {
  return <BlogDetailClient slug={params.slug} />;
}
