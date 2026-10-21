'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type {
  EmailJobItem,
  EmailStats,
  SmtpConfig,
  SubscriptionItem,
} from '@/services/adminScheduleEmailService';
import { adminScheduleEmailService } from '@/services/adminScheduleEmailService';
import { EmailOverviewCards } from '@/components/admin/schedule/email/EmailOverviewCards';
import { EmailQueueTable } from '@/components/admin/schedule/email/EmailQueueTable';
import { EmailSmtpSettingsForm } from '@/components/admin/schedule/email/EmailSmtpSettingsForm';
import { EmailComposeModal } from '@/components/admin/schedule/email/EmailComposeModal';
import { EmailSubscriptionTable } from '@/components/admin/schedule/email/EmailSubscriptionTable';
import styles from './adminScheduleEmail.module.css';

export default function AdminScheduleEmailPage() {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'SMTP' | 'SUBSCRIBERS'>('QUEUE');
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig | null>(null);
  const [jobs, setJobs] = useState<EmailJobItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [subTotalElements, setSubTotalElements] = useState(0);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, smtpData, jobsData, subsData] = await Promise.all([
        adminScheduleEmailService.getStats().catch(() => null),
        adminScheduleEmailService.getSmtpConfig().catch(() => null),
        adminScheduleEmailService.getJobs(statusFilter, typeFilter, 0, 50).catch(() => null),
        adminScheduleEmailService.getSubscriptions(0, 50).catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (smtpData) setSmtpConfig(smtpData);
      if (jobsData) setJobs(jobsData.content || []);
      if (subsData) {
        setSubscriptions(subsData.content || []);
        setSubTotalElements(subsData.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load email admin data', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <Link href="/admin/schedule" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Quay lại Quản lý Lịch</span>
          </Link>
          <h1 className={styles.title}>Quản Lý Email Thông Báo Lịch Phát Hành</h1>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className={styles.composeBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Soạn email gửi thông báo</span>
          </button>
        </div>
      </div>

      <EmailOverviewCards stats={stats} />

      <div className={styles.tabsRow}>
        <button
          type="button"
          onClick={() => setActiveTab('QUEUE')}
          className={`${styles.tabBtn} ${activeTab === 'QUEUE' ? styles.tabBtnActive : ''}`}
        >
          Hàng đợi Outbox & Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SMTP')}
          className={`${styles.tabBtn} ${activeTab === 'SMTP' ? styles.tabBtnActive : ''}`}
        >
          Cấu hình SMTP & DNS Uy Tín
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SUBSCRIBERS')}
          className={`${styles.tabBtn} ${activeTab === 'SUBSCRIBERS' ? styles.tabBtnActive : ''}`}
        >
          Danh sách Người đăng ký ({subTotalElements})
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>Đang tải dữ liệu thông báo email...</div>
      ) : (
        <>
          {activeTab === 'QUEUE' && (
            <EmailQueueTable
              jobs={jobs}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onChangeStatusFilter={setStatusFilter}
              onChangeTypeFilter={setTypeFilter}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'SMTP' && smtpConfig && (
            <EmailSmtpSettingsForm
              initialConfig={smtpConfig}
              onSaved={loadData}
            />
          )}

          {activeTab === 'SUBSCRIBERS' && (
            <EmailSubscriptionTable
              items={subscriptions}
              totalElements={subTotalElements}
            />
          )}
        </>
      )}

      <EmailComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
