'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { activityTracker } from '@/services/activityTracker';

function ActivityTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string>('');

  useEffect(() => {
    const searchString = searchParams?.toString();
    const currentUrl = pathname + (searchString ? `?${searchString}` : '');

    // Prevent duplicate pageview fires for the same URL in the same render
    if (currentUrl !== lastTrackedUrl.current) {
      lastTrackedUrl.current = currentUrl;

      // Defer slightly to ensure document.title is populated by Next.js metadata
      const timeout = setTimeout(() => {
        activityTracker.trackPageView(
          currentUrl,
          document.title,
          document.referrer || undefined
        );
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams]);

  return null;
}

export default function ActivityTrackerListener() {
  return (
    <Suspense fallback={null}>
      <ActivityTrackerInner />
    </Suspense>
  );
}
