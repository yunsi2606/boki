'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, Wand2, RefreshCw } from 'lucide-react';
import AiBlogGeneratorForm from './AiBlogGeneratorForm';
import AiBlogResultPreview from './AiBlogResultPreview';
import { aiBlogService } from '@/services/aiBlogService';
import type {
  AiGenerateBlogRequest,
  AiGenerateBlogResponse,
  AiBlogAppliedData,
} from '@/types/aiBlog';
import styles from './aiBlogAssistant.module.css';

interface AiBlogAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: string;
  categories: string[];
  onApply: (data: AiBlogAppliedData) => void;
}

export default function AiBlogAssistantModal({
  isOpen,
  onClose,
  initialTitle = '',
  initialContent = '',
  initialCategory = 'Đánh giá sách',
  categories,
  onApply,
}: AiBlogAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'IMPROVE'>(() => {
    // If user already has content typed, default to IMPROVE tab
    return initialContent && initialContent.trim() !== '<p></p>' ? 'IMPROVE' : 'CREATE';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<AiGenerateBlogResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<AiGenerateBlogRequest | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleGenerate = async (request: AiGenerateBlogRequest) => {
    setIsGenerating(true);
    setErrorMsg('');
    setLastRequest(request);

    try {
      const res = await aiBlogService.generate(request);
      setResult(res);
    } catch (err: any) {
      console.error('AI blog generation failed:', err);
      setErrorMsg(
        err?.message || 'Có lỗi xảy ra trong quá trình sinh nội dung. Vui lòng thử lại.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (lastRequest) {
      handleGenerate(lastRequest);
    }
  };

  const handleApplyContent = (data: AiBlogAppliedData) => {
    onApply(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBadge}>
              <Sparkles size={20} />
            </div>
            <div className={styles.titleArea}>
              <h2>Trợ lý AI Viết Bài Thông Minh</h2>
              <p>Khởi tạo ý tưởng, cấu trúc dàn ý và trau chuốt bài viết tự động cùng AI</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'CREATE' ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setActiveTab('CREATE');
              setErrorMsg('');
            }}
          >
            <Wand2 size={15} />
            Tạo bài viết mới
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'IMPROVE' ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setActiveTab('IMPROVE');
              setErrorMsg('');
            }}
          >
            <RefreshCw size={15} />
            Cải thiện & Tối ưu bài hiện tại
          </button>
        </div>

        {/* Error Banner if any */}
        {errorMsg && (
          <div style={{ padding: '12px 24px 0 24px' }}>
            <div className={styles.errorBanner}>{errorMsg}</div>
          </div>
        )}

        {/* Modal Body */}
        <div className={styles.body}>
          <AiBlogGeneratorForm
            initialTitle={initialTitle}
            initialContent={initialContent}
            initialCategory={initialCategory}
            categories={categories}
            activeTab={activeTab}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />

          <AiBlogResultPreview
            result={result}
            isGenerating={isGenerating}
            onApply={handleApplyContent}
            onRegenerate={handleRegenerate}
          />
        </div>
      </div>
    </div>
  );
}
