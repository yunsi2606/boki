'use client';

import React from 'react';
import type { HomepageConfig } from '@/config/homepageConfig';
import styles from './HomepageLaunchModeCard.module.css';

interface HomepageLaunchModeCardProps {
  config: HomepageConfig;
  onChange: (updated: Partial<HomepageConfig>) => void;
}

export default function HomepageLaunchModeCard({
  config,
  onChange,
}: HomepageLaunchModeCardProps) {
  const isRedirect = Boolean(config.redirectToSchedule);
  const scheduleUrl =
    config.scheduleUrl ||
    process.env.NEXT_PUBLIC_SCHEDULE_URL ||
    'https://schedule.boki.nhatcuong.io.vn';

  const handleToggle = (checked: boolean) => {
    onChange({
      redirectToSchedule: checked,
      scheduleUrl: scheduleUrl,
    });
  };

  const handleUrlChange = (val: string) => {
    onChange({ scheduleUrl: val });
  };

  return (
    <div className={`${styles.card} ${isRedirect ? styles.cardActive : ''}`}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <div className={styles.titleWithBadge}>
            <span className={styles.title}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Chế độ điều hướng Trang chủ
            </span>
            {isRedirect ? (
              <span className={styles.badgeActive}>Đang chuyển hướng sang Lịch phát hành</span>
            ) : (
              <span className={styles.badgeNormal}>Trang chủ công khai bình thường</span>
            )}
          </div>
          <p className={styles.desc}>
            {isRedirect
              ? 'Trang chủ đang tạm ẩn. Khách truy cập vào boki.nhatcuong.io.vn sẽ tự động chuyển sang trang Lịch phát hành, đồng thời ẩn nút menu và đường dẫn về trang chủ.'
              : 'Trang chủ đang hiển thị công khai đầy đủ cho toàn bộ khách truy cập.'}
          </p>
        </div>

        <div className={styles.controlsArea}>
          <label className={styles.switchLabel} title="Bật/Tắt chuyển hướng sang Lịch phát hành">
            <input
              type="checkbox"
              checked={isRedirect}
              onChange={(e) => handleToggle(e.target.checked)}
              className={styles.switchInput}
            />
            <span className={styles.switchSlider} />
          </label>

          <a
            href="/?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.previewBtn}
            title="Mở trang chủ ở chế độ xem trước (không bị chuyển hướng)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Xem thử trang chủ</span>
          </a>
        </div>
      </div>

      {isRedirect && (
        <div className={styles.detailsBox}>
          <div className={styles.urlRow}>
            <label className={styles.urlLabel}>Domain đích chuyển hướng:</label>
            <input
              type="url"
              value={scheduleUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://schedule.boki.nhatcuong.io.vn"
              className={styles.urlInput}
            />
          </div>
          <p className={styles.hintText}>
            Lưu ý: Sau khi bật hoặc thay đổi URL, hãy bấm <strong>Lưu Thiết Kế</strong> ở góc phải để hệ thống áp dụng cấu hình ngay lập tức cho toàn bộ người dùng.
          </p>
        </div>
      )}
    </div>
  );
}

