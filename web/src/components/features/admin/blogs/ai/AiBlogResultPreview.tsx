'use client';

import { useState } from 'react';
import {
  Sparkles,
  Clock,
  Copy,
  Check,
  Code,
  Eye,
  FileCheck,
  Tag,
} from 'lucide-react';
import type { AiGenerateBlogResponse, AiBlogAppliedData } from '@/types/aiBlog';
import styles from './aiBlogAssistant.module.css';

interface AiBlogResultPreviewProps {
  result: AiGenerateBlogResponse | null;
  isGenerating: boolean;
  onApply: (data: AiBlogAppliedData) => void;
  onRegenerate: () => void;
}

export default function AiBlogResultPreview({
  result,
  isGenerating,
  onApply,
  onRegenerate,
}: AiBlogResultPreviewProps) {
  const [viewMode, setViewMode] = useState<'RENDERED' | 'CODE'>('RENDERED');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (isGenerating) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <h4 className={styles.loadingText}>AI đang biên soạn bài viết...</h4>
        <p className={styles.loadingSubtext}>
          Hệ thống đang phân tích ngữ cảnh, lựa chọn văn phong và xây dựng cấu trúc bài viết chuẩn mực.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.iconBadge} style={{ width: 48, height: 48, borderRadius: 16 }}>
          <Sparkles size={24} />
        </div>
        <h4 className={styles.emptyStateTitle}>Sẵn sàng đồng hành cùng bạn</h4>
        <p className={styles.emptyStateText}>
          Chọn chủ đề hoặc liên kết sách bên trái, sau đó nhấn <strong>&ldquo;Tạo nội dung với AI&rdquo;</strong> để xem kết quả bản nháp thông minh tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.previewColumn}>
      {/* Top Bar with Badges & Tab switcher */}
      <div className={styles.previewTopBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.providerBadge}>
            <Sparkles size={12} />
            {result.providerName || 'Boki AI'}
          </span>
          <span className={styles.timeBadge}>
            <Clock size={12} />
            {result.estimatedReadingTime || 3} phút đọc
          </span>
          {result.category && (
            <span className={styles.timeBadge}>
              <Tag size={12} />
              {result.category}
            </span>
          )}
        </div>

        <div className={styles.previewTabs}>
          <button
            type="button"
            className={`${styles.previewTabItem} ${viewMode === 'RENDERED' ? styles.previewTabItemActive : ''}`}
            onClick={() => setViewMode('RENDERED')}
          >
            <Eye size={12} style={{ display: 'inline', marginRight: 4 }} />
            Xem trước
          </button>
          <button
            type="button"
            className={`${styles.previewTabItem} ${viewMode === 'CODE' ? styles.previewTabItemActive : ''}`}
            onClick={() => setViewMode('CODE')}
          >
            <Code size={12} style={{ display: 'inline', marginRight: 4 }} />
            Mã HTML
          </button>
        </div>
      </div>

      {/* Main Preview Card */}
      <div className={styles.previewCard}>
        {/* Title */}
        {result.title && (
          <div className={styles.previewTitleBox}>
            <h3 className={styles.previewTitle}>{result.title}</h3>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(result.title, 'title')}
              title="Sao chép tiêu đề"
            >
              {copiedType === 'title' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              {copiedType === 'title' ? 'Đã chép' : 'Chép'}
            </button>
          </div>
        )}

        {/* Excerpt */}
        {result.excerpt && (
          <div className={styles.previewExcerptBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, paddingRight: 8 }}>{result.excerpt}</div>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyToClipboard(result.excerpt, 'excerpt')}
                title="Sao chép tóm tắt"
              >
                {copiedType === 'excerpt' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'RENDERED' ? (
          <div
            className={styles.renderedContent}
            dangerouslySetInnerHTML={{ __html: result.content }}
          />
        ) : (
          <pre className={styles.rawCodeViewer}>
            <code>{result.content}</code>
          </pre>
        )}

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className={styles.tagsBox}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Thẻ tags:</span>
            {result.tags.map((tag, idx) => (
              <span key={idx} className={styles.tagChip}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={() => copyToClipboard(result.content, 'all_html')}
          >
            {copiedType === 'all_html' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            {copiedType === 'all_html' ? 'Đã sao chép HTML' : 'Sao chép HTML'}
          </button>
        </div>

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={() =>
              onApply({
                content: result.content,
              })
            }
            title="Chỉ áp dụng phần nội dung vào bài viết"
          >
            Chỉ áp dụng nội dung
          </button>

          <button
            type="button"
            className={styles.applyAllBtn}
            onClick={() =>
              onApply({
                title: result.title || undefined,
                excerpt: result.excerpt || undefined,
                content: result.content,
                category: result.category || undefined,
                tags: result.tags && result.tags.length > 0 ? result.tags : undefined,
              })
            }
          >
            <FileCheck size={16} />
            Áp dụng vào bài viết
          </button>
        </div>
      </div>
    </div>
  );
}
