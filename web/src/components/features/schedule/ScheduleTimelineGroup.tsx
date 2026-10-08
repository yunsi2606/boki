'use client';

import type { ReleaseScheduleItem, ScheduleTimelineGroup as GroupType } from '@/types/schedule';
import ScheduleBookCard from './ScheduleBookCard';
import styles from './scheduleTimelineGroup.module.css';

interface ScheduleTimelineGroupProps {
  group: GroupType;
  onOpenDetail: (item: ReleaseScheduleItem) => void;
}

export default function ScheduleTimelineGroup({ group, onOpenDetail }: ScheduleTimelineGroupProps) {
  if (group.items.length === 0) return null;

  return (
    <div className={styles.groupContainer}>
      <div className={styles.groupHeader}>
        <h3 className={styles.dateHeading}>
          <span>{group.dateLabel}</span>
          <span className={styles.countTag}>{group.items.length} tựa sách</span>
        </h3>
      </div>

      <div className={styles.cardsGrid}>
        {group.items.map((item) => (
          <ScheduleBookCard
            key={item.id}
            item={item}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
}
