'use client';

import React from 'react';
import type { EmailStats } from '@/services/adminScheduleEmailService';
import styles from './emailOverviewCards.module.css';

interface Props {
  stats: EmailStats | null;
}

export function EmailOverviewCards({ stats }: Props) {
  if (!stats) return null;

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.label}>Chờ gửi (Pending)</span>
        <span className={`${styles.value} ${styles.pending}`}>{stats.pendingJobs}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}>Đã gửi thành công</span>
        <span className={`${styles.value} ${styles.sent}`}>{stats.sentJobs}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}>Lỗi (Failed)</span>
        <span className={`${styles.value} ${styles.failed}`}>{stats.failedJobs}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}>Hỏng hòm thư (Bounced)</span>
        <span className={`${styles.value} ${styles.bounced}`}>{stats.bouncedJobs}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}>Người đăng ký nhận</span>
        <span className={`${styles.value} ${styles.subscribers}`}>{stats.totalSubscribers}</span>
      </div>
    </div>
  );
}
