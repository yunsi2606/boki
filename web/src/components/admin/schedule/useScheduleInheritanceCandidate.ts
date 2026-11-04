import { useMemo } from 'react';
import type { ReleaseScheduleItem } from '@/types/schedule';
import {
  findPreviousVolume,
  findPreviousVolumeWithLinks,
  cloneStoreLinks,
  extractInheritedAttributes,
} from './scheduleLinkInheritHelper';

export function useScheduleInheritanceCandidate(
  initialItem?: ReleaseScheduleItem | null,
  allItems: ReleaseScheduleItem[] = []
) {
  const prevSource = useMemo(() => {
    const draftSource = (initialItem as { previousVolumeSource?: ReleaseScheduleItem })?.previousVolumeSource;
    if (draftSource) return draftSource;
    if (initialItem && allItems.length > 0) return findPreviousVolume(initialItem, allItems);
    return null;
  }, [initialItem, allItems]);

  const prevWithLinks = useMemo(() => {
    const draftSource = (initialItem as { previousVolumeSource?: ReleaseScheduleItem })?.previousVolumeSource;
    if (draftSource?.storeLinks && draftSource.storeLinks.length > 0) return draftSource;
    if (initialItem && allItems.length > 0) return findPreviousVolumeWithLinks(initialItem, allItems);
    return null;
  }, [initialItem, allItems]);

  const candidateAttributes = useMemo(
    () => (prevSource ? extractInheritedAttributes(prevSource) : null),
    [prevSource]
  );

  const candidateLinks = useMemo(
    () => (prevWithLinks?.storeLinks ? cloneStoreLinks(prevWithLinks.storeLinks) : undefined),
    [prevWithLinks]
  );

  return { candidateAttributes, candidateLinks };
}

