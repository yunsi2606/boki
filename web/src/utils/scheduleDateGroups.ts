import type { ReleaseScheduleItem, ScheduleTimelineGroup } from '@/types/schedule';

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

export function groupSchedulesByDay(items: ReleaseScheduleItem[]): ScheduleTimelineGroup[] {
  const groupsMap = new Map<string, ReleaseScheduleItem[]>();

  items.forEach((item) => {
    const dayKey = item.releaseDate ? item.releaseDate.trim() : '2026-10-01';
    if (!groupsMap.has(dayKey)) {
      groupsMap.set(dayKey, []);
    }
    groupsMap.get(dayKey)!.push(item);
  });

  const result: ScheduleTimelineGroup[] = [];
  groupsMap.forEach((groupItems, dayKey) => {
    result.push({
      dateKey: dayKey,
      dateLabel: formatDayGroupLabel(dayKey),
      items: groupItems,
    });
  });

  // Sort ascending by release date
  return result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function groupSchedulesByMonth(items: ReleaseScheduleItem[]): ScheduleTimelineGroup[] {
  const groupsMap = new Map<string, ReleaseScheduleItem[]>();

  items.forEach((item) => {
    const monthKey = item.releaseDate ? item.releaseDate.slice(0, 7) : '2026-10';
    if (!groupsMap.has(monthKey)) {
      groupsMap.set(monthKey, []);
    }
    groupsMap.get(monthKey)!.push(item);
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

  // Sort descending by month key
  return result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
