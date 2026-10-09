'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ScheduleTimelineGroup } from '@/types/schedule';

interface UseScheduleLazyGroupsOptions {
  batchSize?: number;
  initialCount?: number;
  resetDeps?: unknown[];
}

export function useScheduleLazyGroups(
  groups: ScheduleTimelineGroup[],
  options: UseScheduleLazyGroupsOptions = {}
) {
  const { batchSize = 4, initialCount = 5, resetDeps = [] } = options;
  const [visibleCount, setVisibleCount] = useState<number>(initialCount);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelElementRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination count when filter dependencies change
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount, ...resetDeps]);

  const hasMore = visibleCount < groups.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, groups.length));
  }, [batchSize, groups.length]);

  // Connect intersection observer to sentinel element
  const sentinelCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      sentinelElementRef.current = node;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: '250px 0px' }
      );

      observerRef.current.observe(node);
    },
    [loadMore]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const visibleGroups = groups.slice(0, visibleCount);

  return {
    visibleGroups,
    hasMore,
    loadMore,
    sentinelRef: sentinelCallbackRef,
    totalGroups: groups.length,
    visibleCount,
  };
}
