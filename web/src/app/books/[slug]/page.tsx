import type { Metadata } from 'next';
import { Suspense } from 'react';
import { extractBookId } from '@/lib/slug';
import { BookDetailSkeleton } from '@/components/ui/Skeleton';
import BookDetailClient from '@/components/features/books/BookDetailClient';
import { fetchWithFailover } from '@/services/apiEndpoint';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const id = extractBookId(slug);
    if (!id) throw new Error('No book id found');

    const res = await fetchWithFailover(`/books/${id}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const book = await res.json();
      const cover = book.categoryCoverUrl || (book.images && book.images[0]?.imageUrl);
      const title = `${book.title}${book.author ? ` — ${book.author}` : ''}`;
      const description = book.description
        ? book.description.slice(0, 160).replace(/\n/g, ' ')
        : `Mua sách ${book.title} chính hãng tại Boki với giá ưu đãi.`;

      return {
        title,
        description,
        openGraph: {
          title: `${title} | Boki`,
          description,
          images: cover ? [{ url: cover, alt: book.title }] : undefined,
        },
      };
    }
  } catch {
    // Graceful fallback without blocking SSR or throwing
  }

  return {
    title: 'Chi Tiết Sách',
    description: 'Mua sách và truyện tranh bản quyền chính hãng tại Boki.',
  };
}

export default function BookDetailPage() {
  return (
    <Suspense fallback={<BookDetailSkeleton />}>
      <BookDetailClient />
    </Suspense>
  );
}
