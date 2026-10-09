import type { Metadata } from 'next';
import { Suspense } from 'react';
import { extractBookId } from '@/lib/slug';
import { BookDetailSkeleton } from '@/components/ui/Skeleton';
import BookDetailClient from '@/components/features/books/BookDetailClient';
import { API_BASE_URL } from '@/lib/constants';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = extractBookId(params.slug);
  try {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
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
  } catch (err) {
    console.error('Failed to generate metadata for book:', err);
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
