'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { chatService } from '@/services/chatService';

interface MessageFeedbackProps {
  logId?: number;
}

export default function MessageFeedback({ logId }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const [showReasons, setShowReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  if (!logId) return null;

  const handleThumb = (type: 'LIKE' | 'DISLIKE') => {
    setFeedback(type);
    if (type === 'DISLIKE') {
      setShowReasons(true);
    } else {
      chatService.sendFeedback(logId, 'LIKE').catch(() => {});
    }
  };

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setShowReasons(false);
    chatService.sendFeedback(logId, 'DISLIKE', reason).catch(() => {});
  };

  return (
    <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Hữu ích?</span>
        <button
          type="button"
          onClick={() => handleThumb('LIKE')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: feedback === 'LIKE' ? '#16a34a' : '#94a3b8',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Câu trả lời hữu ích"
        >
          <ThumbsUp size={12} />
        </button>

        <button
          type="button"
          onClick={() => handleThumb('DISLIKE')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: feedback === 'DISLIKE' ? '#dc2626' : '#94a3b8',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Chưa hài lòng"
        >
          <ThumbsDown size={12} />
        </button>

        {feedback === 'LIKE' && (
          <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Check size={11} /> Cảm ơn bạn!
          </span>
        )}
      </div>

      {showReasons && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '6px 8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginTop: '2px'
        }}>
          <span style={{ width: '100%', fontSize: '10.5px', color: '#64748b' }}>Bạn chưa hài lòng vì:</span>
          {['Thông tin chưa đúng', 'Không tìm thấy sách', 'Trả lời khó hiểu', 'Khác'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleReasonSelect(r)}
              style={{
                fontSize: '10px',
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '2px 8px',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {selectedReason && (
        <span style={{ color: '#64748b', fontSize: '10.5px' }}>
          Đã ghi nhận: {selectedReason}
        </span>
      )}
    </div>
  );
}
