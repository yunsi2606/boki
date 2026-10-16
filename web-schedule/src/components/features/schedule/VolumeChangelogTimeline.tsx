'use client';

import type { ReleaseChangelogItem } from '@/types/schedule';
import styles from './volumeChangelogTimeline.module.css';

interface Props {
  changelogs?: ReleaseChangelogItem[];
}

export function VolumeChangelogTimeline({ changelogs }: Props) {
  if (!changelogs || changelogs.length === 0) return null;

  return (
    <div className={styles.changelogTimeline}>
      {changelogs.map((cl, i) => (
        <div key={cl.id || i} className={styles.changelogItem}>
          <div className={styles.changelogTitle}>{cl.title}</div>
          {cl.reason && <div className={styles.changelogReason}>{cl.reason}</div>}
          {cl.createdAt && (
            <div className={styles.changelogDate}>
              Cập nhật: {new Date(cl.createdAt).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
