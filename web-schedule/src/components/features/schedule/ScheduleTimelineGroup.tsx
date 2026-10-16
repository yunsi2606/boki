'use client';

import type { ScheduleTimelineGroup as GroupType } from '@/types/schedule';
import { ScheduleBookCard } from './ScheduleBookCard';
import styles from './scheduleTimelineGroup.module.css';

interface Props {
  group: GroupType;
}

export function ScheduleTimelineGroup({ group }: Props) {
  return (
    <section className={styles.groupContainer}>
      <div className={styles.dateHeader}>
        <div className={styles.dateBadge}>{group.dateKey}</div>
        <div className={styles.dateLabel}>{group.dateLabel}</div>
        <div className={styles.itemCount}>{group.items.length} tập truyện</div>
      </div>

      <div className={styles.bookGrid}>
        {group.items.map((item, idx) => (
          <ScheduleBookCard
            key={`${item.schedule.id}-${idx}`}
            schedule={item.schedule}
            highlightDate={item.eventDate}
          />
        ))}
      </div>
    </section>
  );
}
