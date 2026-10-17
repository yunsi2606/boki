'use client';

import type { ScheduleTimelineGroup as GroupType } from '@/types/schedule';
import { ScheduleBookCard } from './ScheduleBookCard';
import styles from './scheduleTimelineGroup.module.css';

interface Props {
  group: GroupType;
}

export function ScheduleTimelineGroup({ group }: Props) {
  let dayOfWeek = '';
  let dayNum = '';
  let dayMonth = '';

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const isToday = group.dateKey === todayStr;

  if (group.dateKey && group.dateKey.includes('-')) {
    const d = new Date(group.dateKey + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      const weekdays = ['CHỦ NHẬT', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];
      dayOfWeek = weekdays[d.getDay()];
      dayNum = String(d.getDate());
      dayMonth = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  return (
    <section id={`date-${group.dateKey}`} className={styles.groupContainer}>
      {/* Left Date Card */}
      <div className={`${styles.dateBlock} ${isToday ? styles.todayDateBlock : ''}`}>
        {isToday && <div className={styles.todayPill}>HÔM NAY</div>}
        <div className={styles.dayOfWeek}>{dayOfWeek || 'NGÀY'}</div>
        <div className={styles.dayNum}>{dayNum || group.dateKey}</div>
        {dayMonth && <div className={styles.dayMonth}>{dayMonth}</div>}
        <div className={styles.countBadge}>{group.items.length} phát hành</div>
      </div>

      {/* Right Books Grid / Row */}
      <div className={styles.booksContainer}>
        <div className={styles.bookGrid}>
          {group.items.map((item, idx) => (
            <ScheduleBookCard
              key={`${item.schedule.id}-${idx}`}
              schedule={item.schedule}
              highlightDate={item.eventDate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
