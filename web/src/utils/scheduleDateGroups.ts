import type {
  ReleaseScheduleItem,
  ScheduleTimelineGroup,
  ScheduleTimelineItem,
  ScheduleEventType,
} from '@/types/schedule';

const DAY_OF_WEEK_NAMES = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

export function formatDayGroupLabel(dateStr: string): string {
  if (!dateStr) return 'Chưa xác định ngày';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);

    const formattedDate = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    const dayName = DAY_OF_WEEK_NAMES[dateObj.getDay()] || '';

    const today = new Date();
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    if (isToday) {
      return `Hôm nay — ${dayName}, ${formattedDate}`;
    }

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow =
      tomorrow.getFullYear() === year &&
      tomorrow.getMonth() === month &&
      tomorrow.getDate() === day;

    if (isTomorrow) {
      return `Ngày mai — ${dayName}, ${formattedDate}`;
    }

    return `${dayName}, ${formattedDate}`;
  } catch {
    return dateStr;
  }
}

interface ExtractedTimelineEvent {
  dateKey: string;
  schedule: ReleaseScheduleItem;
  eventType: ScheduleEventType;
  targetEditionIdx: number;
}

function extractTimelineEvents(items: ReleaseScheduleItem[]): ExtractedTimelineEvent[] {
  const events: ExtractedTimelineEvent[] = [];

  items.forEach((item) => {
    const editions = item.editions && item.editions.length > 0 ? item.editions : null;

    if (!editions) {
      const releaseDate = item.releaseDate ? item.releaseDate.trim() : '2026-10-01';
      const preOrderDate = item.preOrderDate ? item.preOrderDate.trim() : null;

      if (preOrderDate && preOrderDate !== releaseDate) {
        events.push({
          dateKey: preOrderDate,
          schedule: item,
          eventType: 'PRE_ORDER',
          targetEditionIdx: 0,
        });
      }
      events.push({
        dateKey: releaseDate,
        schedule: item,
        eventType: 'RELEASE',
        targetEditionIdx: 0,
      });
      return;
    }

    editions.forEach((ed, idx) => {
      const releaseDate = (ed.effectiveReleaseDate || ed.releaseDate || item.releaseDate || '2026-10-01').trim();
      const preOrderDate = (ed.effectivePreOrderDate || ed.preOrderDate || item.preOrderDate || '').trim();

      if (preOrderDate && preOrderDate !== releaseDate) {
        events.push({
          dateKey: preOrderDate,
          schedule: item,
          eventType: 'PRE_ORDER',
          targetEditionIdx: idx,
        });
      }

      if (releaseDate) {
        events.push({
          dateKey: releaseDate,
          schedule: item,
          eventType: 'RELEASE',
          targetEditionIdx: idx,
        });
      }
    });
  });

  return events;
}

export function groupSchedulesByDay(items: ReleaseScheduleItem[]): ScheduleTimelineGroup[] {
  const allEvents = extractTimelineEvents(items);
  const groupsMap = new Map<string, ScheduleTimelineItem[]>();
  const seenMap = new Map<string, Set<string>>();

  allEvents.forEach((ev) => {
    const { dateKey, schedule, eventType, targetEditionIdx } = ev;
    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, []);
      seenMap.set(dateKey, new Set<string>());
    }

    const seenSet = seenMap.get(dateKey)!;
    const dedupKey = `${schedule.id}-${eventType}`;
    if (!seenSet.has(dedupKey)) {
      seenSet.add(dedupKey);
      groupsMap.get(dateKey)!.push({
        schedule,
        eventType,
        targetEditionIdx,
        eventDate: dateKey,
      });
    }
  });

  const result: ScheduleTimelineGroup[] = [];
  groupsMap.forEach((groupItems, dayKey) => {
    result.push({
      dateKey: dayKey,
      dateLabel: formatDayGroupLabel(dayKey),
      items: groupItems,
    });
  });

  return result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function groupSchedulesByMonth(items: ReleaseScheduleItem[]): ScheduleTimelineGroup[] {
  const allEvents = extractTimelineEvents(items);
  const groupsMap = new Map<string, ScheduleTimelineItem[]>();
  const seenMap = new Map<string, Set<string>>();

  allEvents.forEach((ev) => {
    const monthKey = ev.dateKey.slice(0, 7) || '2026-10';
    if (!groupsMap.has(monthKey)) {
      groupsMap.set(monthKey, []);
      seenMap.set(monthKey, new Set<string>());
    }

    const seenSet = seenMap.get(monthKey)!;
    const dedupKey = ev.schedule.id;
    if (!seenSet.has(dedupKey)) {
      seenSet.add(dedupKey);
      groupsMap.get(monthKey)!.push({
        schedule: ev.schedule,
        eventType: ev.eventType,
        targetEditionIdx: ev.targetEditionIdx,
        eventDate: ev.dateKey,
      });
    }
  });

  const result: ScheduleTimelineGroup[] = [];
  groupsMap.forEach((groupItems, monthKey) => {
    const parts = monthKey.split('-');
    const label = parts.length === 2 ? `Kỳ xuất bản Tháng ${parts[1]}/${parts[0]}` : monthKey;
    result.push({
      dateKey: monthKey,
      dateLabel: label,
      items: groupItems,
    });
  });

  return result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
