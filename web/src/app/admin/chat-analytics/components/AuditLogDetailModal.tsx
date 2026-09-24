'use client';

import React from 'react';
import { X, User, Bot, ThumbsUp, ThumbsDown, Terminal, Clock } from 'lucide-react';
import styles from '../chatAnalytics.module.css';

export interface AuditLogItem {
  id: number;
  sessionId: string;
  userId?: string;
  clientIp?: string;
  userMessage: string;
  intentDetected?: string;
  toolsCalled?: string[];
  botResponse: string;
  latencyMs: number;
  tokenCount?: number;
  fallback: boolean;
  feedback?: 'LIKE' | 'DISLIKE' | null;
  feedbackReason?: string;
  createdAt: string;
}

interface AuditLogDetailModalProps {
  log: AuditLogItem | null;
  onClose: () => void;
}

export default function AuditLogDetailModal({ log, onClose }: AuditLogDetailModalProps) {
  if (!log) return null;

  const formatText = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const parts = line.split(/(<green>[^<]+<\/green>|<red>[^<]+<\/red>|\*\*[^*]+\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('<green>') && part.endsWith('</green>')) {
          return (
            <span key={pIdx} style={{ color: '#16a34a', fontWeight: 600 }}>
              {part.slice(7, -8)}
            </span>
          );
        }
        if (part.startsWith('<red>') && part.endsWith('</red>')) {
          return (
            <span key={pIdx} style={{ color: '#dc2626', fontWeight: 600 }}>
              {part.slice(5, -6)}
            </span>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <span key={idx}>
          {formattedLine}
          {idx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Chi tiết phiên tương tác #{log.id}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            title="Đóng"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Thời gian & Địa chỉ IP</span>
            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', gap: '16px' }}>
              <span>
                <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                {new Date(log.createdAt).toLocaleString('vi-VN')}
              </span>
              <span>IP: {log.clientIp || '127.0.0.1'}</span>
              <span>Session: <code>{log.sessionId}</code></span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>
              <User size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              Yêu cầu của người dùng
            </span>
            <div className={styles.detailBox}>
              {log.userMessage}
            </div>
          </div>

          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>
              <Terminal size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              Công cụ kích hoạt & Độ trễ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {log.toolsCalled && log.toolsCalled.length > 0 ? (
                log.toolsCalled.map((tool, idx) => (
                  <span key={idx} className={`${styles.badge} ${styles.badgeTool}`}>
                    {tool}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Không gọi công cụ (Direct reply / Fallback)</span>
              )}
              <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>
                Độ trễ: <strong>{log.latencyMs} ms</strong>
              </span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>
              <Bot size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              Phản hồi từ AI Orchestrator
            </span>
            <div className={styles.detailBox}>
              {formatText(log.botResponse)}
            </div>
          </div>

          {log.feedback && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Đánh giá của người dùng</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                {log.feedback === 'LIKE' ? (
                  <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ThumbsUp size={14} /> Hài lòng (Thích)
                  </span>
                ) : (
                  <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ThumbsDown size={14} /> Chưa hài lòng
                  </span>
                )}
                {log.feedbackReason && (
                  <span style={{ color: '#64748b' }}>- Lý do: {log.feedbackReason}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
