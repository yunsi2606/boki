import type { ReleaseScheduleItem, ScheduleTimelineGroup as GroupType } from '@/types/schedule';

export function buildTimelineGroups(
  schedules: ReleaseScheduleItem[],
  currentYear: number,
  currentMonth: number,
  selectedPublisher: string,
  searchQuery: string
): GroupType[] {
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const query = searchQuery.trim().toLowerCase();

  const filtered = schedules.filter((s) => {
    if (!s.releaseDate || !s.releaseDate.startsWith(monthPrefix)) return false;
    if (selectedPublisher !== 'ALL' && (s.imprint || s.publisher) !== selectedPublisher && s.publisher !== selectedPublisher) return false;
    if (query && !s.title.toLowerCase().includes(query) && !s.author?.toLowerCase().includes(query) && !s.imprint?.toLowerCase().includes(query) && !s.publisher.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });

  const map = new Map<string, GroupType>();
  filtered.forEach((schedule) => {
    const dateKey = schedule.releaseDate;
    if (!map.has(dateKey)) {
      map.set(dateKey, {
        dateKey,
        dateLabel: `Ngày phát hành: ${dateKey}`,
        items: [],
      });
    }
    map.get(dateKey)!.items.push({
      schedule,
      eventType: 'RELEASE',
      targetEditionIdx: 0,
      eventDate: dateKey,
    });
  });

  return Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}
