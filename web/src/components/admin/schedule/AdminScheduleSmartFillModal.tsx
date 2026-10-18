'use client';

import React, { useState, useEffect } from 'react';
import { parseSchedulePlainText, type ParsedScheduleData } from '@/utils/scheduleTextParser';
import { scheduleService } from '@/services/scheduleService';
import styles from './adminScheduleSmartFillModal.module.css';

interface AdminScheduleSmartFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ParsedScheduleData) => void;
}

export default function AdminScheduleSmartFillModal({
  isOpen,
  onClose,
  onApply,
}: AdminScheduleSmartFillModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedScheduleData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('boki_gemini_api_key');
      if (savedKey) setApiKey(savedKey);
    }
  }, []);

  if (!isOpen) return null;

  const handleFastParse = () => {
    if (!rawText.trim()) return;
    const res = parseSchedulePlainText(rawText);
    setParsedData(res);
  };

  const handleAiParse = async () => {
    if (!rawText.trim()) return;
    try {
      setIsAiLoading(true);
      const res = await scheduleService.parseScheduleText(rawText, apiKey || undefined);
      setParsedData(res);
    } catch (err: any) {
      console.error('AI parse error:', err);
      alert(err.message || 'Không thể phân tích bằng AI. Đang chuyển sang bóc tách cú pháp nhanh.');
      handleFastParse();
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsedData) return;
    onApply(parsedData);
    onClose();
  };

  const detectedCount = parsedData ? Object.values(parsedData).filter(Boolean).length : 0;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.headerSubtitle}>Trợ lý nhập liệu</span>
            <h3 className={styles.headerTitle}>Điền thông minh từ văn bản</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.instructionBox}>
            Dán đoạn văn bản thông tin phát hành (từ Fanpage, bài viết, hoặc ghi chú vắn tắt).
            Hệ thống sẽ <strong>chỉ cập nhật những thông tin tìm thấy</strong>, các trường không có trong văn bản sẽ giữ nguyên trên Form.
          </div>

          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>Nội dung văn bản:</label>
            <textarea
              className={styles.textarea}
              placeholder="VD: Frieren tập 10 - NXB Kim Đồng ngày 15/11 giá 45k bản thường, bản đặc biệt 85k tặng poster..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.parseFastBtn}
              onClick={handleFastParse}
              disabled={!rawText.trim()}
            >
              Phân tích cú pháp (Tức thì)
            </button>
            <button
              type="button"
              className={styles.parseAiBtn}
              onClick={handleAiParse}
              disabled={!rawText.trim() || isAiLoading}
            >
              {isAiLoading ? 'AI đang phân tích...' : 'AI Phân tích sâu'}
            </button>
          </div>

          {parsedData && (
            <div className={styles.previewSection}>
              <div className={styles.previewTitle}>
                Kết quả nhận diện ({detectedCount} mục tìm thấy)
              </div>
              <div className={styles.previewGrid}>
                <div className={styles.previewCard}>
                  <span className={styles.cardLabel}>Tựa đề:</span>
                  <span className={parsedData.title ? `${styles.cardValue} ${styles.cardValueFound}` : `${styles.cardValue} ${styles.cardValueMissing}`}>
                    {parsedData.title || '[Giữ nguyên hiện tại]'}
                  </span>
                </div>

                <div className={styles.previewCard}>
                  <span className={styles.cardLabel}>Nhà xuất bản:</span>
                  <span className={parsedData.publisher ? `${styles.cardValue} ${styles.cardValueFound}` : `${styles.cardValue} ${styles.cardValueMissing}`}>
                    {parsedData.publisher || '[Giữ nguyên hiện tại]'}
                  </span>
                </div>

                <div className={styles.previewCard}>
                  <span className={styles.cardLabel}>Tác giả / Họa sĩ:</span>
                  <span className={parsedData.author ? `${styles.cardValue} ${styles.cardValueFound}` : `${styles.cardValue} ${styles.cardValueMissing}`}>
                    {parsedData.author ? `${parsedData.author}${parsedData.artist ? ` / ${parsedData.artist}` : ''}` : '[Giữ nguyên hiện tại]'}
                  </span>
                </div>

                <div className={styles.previewCard}>
                  <span className={styles.cardLabel}>Ngày phát hành:</span>
                  <span className={parsedData.releaseDate ? `${styles.cardValue} ${styles.cardValueFound}` : `${styles.cardValue} ${styles.cardValueMissing}`}>
                    {parsedData.releaseDate || '[Giữ nguyên hiện tại]'}
                  </span>
                </div>

                <div className={styles.previewCard}>
                  <span className={styles.cardLabel}>Thông số kỹ thuật:</span>
                  <span className={parsedData.specs && Object.keys(parsedData.specs).length > 0 ? `${styles.cardValue} ${styles.cardValueFound}` : `${styles.cardValue} ${styles.cardValueMissing}`}>
                    {parsedData.specs && Object.keys(parsedData.specs).length > 0
                      ? Object.entries(parsedData.specs).map(([k, v]) => `${k}: ${v}`).join(' | ')
                      : '[Giữ nguyên hiện tại]'}
                  </span>
                </div>

                <div className={styles.previewCard}>
                  <span className={styles.cardLabel}>Phiên bản & Giá:</span>
                  <span className={parsedData.editions && parsedData.editions.length > 0 ? `${styles.cardValue} ${styles.cardValueFound}` : `${styles.cardValue} ${styles.cardValueMissing}`}>
                    {parsedData.editions && parsedData.editions.length > 0
                      ? parsedData.editions.map((e) => `${e.editionName}${e.estimatedPrice ? ` (${e.estimatedPrice.toLocaleString('vi-VN')}đ)` : ''}`).join('; ')
                      : '[Giữ nguyên hiện tại]'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className={styles.applyBtn}
            onClick={handleApply}
            disabled={!parsedData}
          >
            Áp dụng vào Form
          </button>
        </div>
      </div>
    </div>
  );
}
