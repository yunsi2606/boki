import type { ReleaseScheduleItem } from '@/types/schedule';
import type { MonthPeriodOption } from './AdminScheduleFilterBar';

export function getAvailablePeriods(items: ReleaseScheduleItem[]): MonthPeriodOption[] {
  const periodSet = new Set<string>();
  const now = new Date();

  for (let offset = -4; offset <= 4; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    periodSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  items.forEach((item) => {
    if (item.releaseDate && item.releaseDate.length >= 7) {
      periodSet.add(item.releaseDate.slice(0, 7));
    }
    item.editions?.forEach((ed) => {
      if (ed.releaseDate && ed.releaseDate.length >= 7) {
        periodSet.add(ed.releaseDate.slice(0, 7));
      }
    });
  });

  const sorted = Array.from(periodSet).sort((a, b) => b.localeCompare(a));
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return sorted.map((val) => {
    const [y, m] = val.split('-');
    return {
      value: val,
      label: `Tháng ${m}/${y}${val === nowKey ? ' (Hiện tại)' : ''}`,
    };
  });
}

export function getPrevPeriod(selectedPeriod: string): string {
  const now = new Date();
  const base = selectedPeriod !== 'ALL'
    ? selectedPeriod
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [y, m] = base.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
}

export function getNextPeriod(selectedPeriod: string): string {
  const now = new Date();
  const base = selectedPeriod !== 'ALL'
    ? selectedPeriod
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [y, m] = base.split('-').map(Number);
  const nextDate = new Date(y, m, 1);
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
}

export function matchesSchedulePeriod(item: ReleaseScheduleItem, period: string): boolean {
  if (period === 'ALL') return true;
  const matchesMain = Boolean(item.releaseDate && item.releaseDate.startsWith(period));
  const matchesEd = Boolean(item.editions?.some((e) => e.releaseDate && e.releaseDate.startsWith(period)));
  return matchesMain || matchesEd;
}
