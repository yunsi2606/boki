'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import styles from './bookPreviewLink.module.css';

interface BookPreviewLinkProps {
  bookIdOrSlug: string;
}

export default function BookPreviewLink({ bookIdOrSlug }: BookPreviewLinkProps) {
  const [previews, setPreviews] = useState<BlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!bookIdOrSlug) return;
    let isMounted = true;

    blogService
      .getBookPreviews(bookIdOrSlug)
      .then((data) => {
        if (isMounted) {
          setPreviews(data || []);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Could not load book previews:', err);
        if (isMounted) setLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [bookIdOrSlug]);

  if (!loaded || previews.length === 0) return null;

  const firstPreview = previews[0];

  return (
    <div className={styles.previewBox}>
      <div className={styles.leftInfo}>
        <div className={styles.iconWrapper}>
          <BookOpen size={20} />
        </div>
        <div className={styles.textGroup}>
          <span className={styles.title}>Đọc thử bản xem trước miễn phí</span>
          <span className={styles.subtitle}>
            {previews.length > 1
              ? `Có ${previews.length} trích đoạn / chương đọc thử trực tuyến`
              : firstPreview.title}
          </span>
        </div>
      </div>

      <Link href={`/preview/${firstPreview.slug}`} className={styles.previewBtn}>
        <span>Đọc thử ngay</span>
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
