'use client';

import { useState, useEffect } from 'react';
import type { ReleaseScheduleItem, ScheduleTimelineGroup as GroupType } from '@/types/schedule';
import ScheduleTimelineGroup from './ScheduleTimelineGroup';
import styles from './schedulePastSection.module.css';

interface SchedulePastSectionProps {
  pastGroups: GroupType[];
  isAllPast: boolean;
  onOpenDetail: (item: ReleaseScheduleItem, selectedEditionIdx?: number) => void;
}

export default function SchedulePastSection({
  pastGroups,
  isAllPast,
  onOpenDetail,
}: SchedulePastSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isAllPast);

  useEffect(() => {
    if (isAllPast) {
      setIsExpanded(true);
    }
  }, [isAllPast]);

  if (pastGroups.length === 0) return null;

  const totalBooks = pastGroups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className={styles.pastSectionContainer}>
      <div
        className={styles.toggleHeader}
        onClick={() => setIsExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className={styles.infoColumn}>
          <div className={styles.mainTitleRow}>
            <span className={styles.mainTitle}>Lịch sử phát hành trước đó</span>
            <span className={styles.countBadge}>{totalBooks} tựa sách</span>
          </div>
          <span className={styles.subtitle}>
            Xem lại các tác phẩm đã ra mắt trong những ngày và kỳ phát hành trước
          </span>
        </div>

        <button
          type="button"
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
        >
          <span>{isExpanded ? 'Thu gọn lịch sử' : 'Xem danh sách đã phát hành'}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${styles.chevronIcon} ${isExpanded ? styles.chevronIconExpanded : ''}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className={styles.pastGroupsList}>
          {pastGroups.map((group) => (
            <ScheduleTimelineGroup
              key={group.dateKey}
              group={group}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
