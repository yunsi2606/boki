'use client';

import { useMemo } from 'react';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './scheduleCalendarMatrix.module.css';

interface Props {
  year: number;
  month: number; // 1 - 12
  schedules: ReleaseScheduleItem[];
  onSelectDate?: (dateStr: string) => void;
}

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export function ScheduleCalendarMatrix({ year, month, schedules, onSelectDate }: Props) {
  const { calendarDays, todayStr } = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    // Map schedules by date YYYY-MM-DD
    const scheduleByDate = new Map<string, ReleaseScheduleItem[]>();
    schedules.forEach((s) => {
      if (!s.releaseDate) return;
      const list = scheduleByDate.get(s.releaseDate) || [];
      list.push(s);
      scheduleByDate.set(s.releaseDate, list);
    });

    // Calendar generation
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Monday is 0, Sunday is 6
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6;

    const days: Array<{
      dayNum: number | null;
      dateStr: string | null;
      items: ReleaseScheduleItem[];
      isCurrentMonth: boolean;
    }> = [];

    // Pad previous month days
    for (let i = 0; i < startingDay; i++) {
      days.push({ dayNum: null, dateStr: null, items: [], isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        items: scheduleByDate.get(dateStr) || [],
        isCurrentMonth: true,
      });
    }

    return { calendarDays: days, todayStr };
  }, [year, month, schedules]);

  return (
    <div className={styles.matrixContainer}>
      <div className={styles.weekdaysRow}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={styles.weekdayCol}>
            {wd}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth || !cell.dateStr) {
            return <div key={`empty-${idx}`} className={styles.emptyCell} />;
          }

          const isToday = cell.dateStr === todayStr;
          const hasItems = cell.items.length > 0;
          const sampleCover = cell.items[0]?.coverUrl || cell.items[0]?.editions?.[0]?.coverUrl;

          return (
            <div
              key={cell.dateStr}
              className={`${styles.dayCell} ${isToday ? styles.todayCell : ''} ${
                hasItems ? styles.activeCell : ''
              }`}
              onClick={() => hasItems && onSelectDate && onSelectDate(cell.dateStr!)}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayNum}>{cell.dayNum}</span>
                {hasItems && <span className={styles.dotIndicator} />}
              </div>

              {sampleCover && (
                <div
                  className={styles.cellBgCover}
                  style={{ backgroundImage: `url(${sampleCover})` }}
                />
              )}

              {hasItems && (
                <div className={styles.itemsList}>
                  {cell.items.slice(0, 2).map((item) => (
                    <div key={item.id} className={styles.miniItemTitle}>
                      {item.volumeNumber ? `Tập ${item.volumeNumber}` : item.title}
                    </div>
                  ))}
                  {cell.items.length > 2 && (
                    <div className={styles.moreCount}>+{cell.items.length - 2} khác</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
