'use client';

import React, { useEffect, useState } from 'react';
import { scheduleService } from '@/services/scheduleService';

interface ScheduleDuplicateAlertProps {
  title: string;
  isEditing?: boolean;
}

export default function ScheduleDuplicateAlert({
  title,
  isEditing = false,
}: ScheduleDuplicateAlertProps) {
  const [duplicateInfo, setDuplicateInfo] = useState<{
    exists: boolean;
    slug?: string;
    existingTitle?: string;
    releaseDate?: string;
    editionsCount?: number;
  } | null>(null);

  useEffect(() => {
    if (isEditing || !title || title.trim().length < 3) {
      setDuplicateInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await scheduleService.checkDuplicate(title.trim());
        if (res && res.exists) {
          setDuplicateInfo(res);
        } else {
          setDuplicateInfo(null);
        }
      } catch {
        setDuplicateInfo(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, isEditing]);

  if (!duplicateInfo || !duplicateInfo.exists) return null;

  return (
    <div
      style={{
        marginTop: '6px',
        padding: '8px 12px',
        backgroundColor: '#FFFBEB',
        border: '1px solid #FCD34D',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#B45309',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <div style={{ fontWeight: 700 }}>
        Cảnh báo: Tập truyện này đã tồn tại trong lịch phát hành
      </div>
      <div>
        Đã có: <strong>{duplicateInfo.existingTitle}</strong> (Slug: {duplicateInfo.slug})
        {duplicateInfo.releaseDate && ` — Ngày: ${duplicateInfo.releaseDate}`}
        {duplicateInfo.editionsCount ? ` (${duplicateInfo.editionsCount} phiên bản)` : ''}
      </div>
    </div>
  );
}
