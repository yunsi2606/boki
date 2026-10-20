'use client';

import React, { useState, useEffect } from 'react';
import type { OcrParsedBookItem, OcrScheduleScanResponse } from '@/types/schedule';
import { scheduleService } from '@/services/scheduleService';
import OcrUploadStep from './OcrUploadStep';
import ScheduleBatchTextInputStep from './ScheduleBatchTextInputStep';
import OcrStagingTable from './OcrStagingTable';
import { groupStagingItemsToPayloads } from './batchScheduleGroupingHelper';
import styles from './adminScheduleOcrModal.module.css';

interface AdminScheduleOcrModalProps {
  isOpen: boolean;
  publishers: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminScheduleOcrModal({
  isOpen,
  publishers,
  onClose,
  onSuccess,
}: AdminScheduleOcrModalProps) {
  const [step, setStep] = useState<'UPLOAD' | 'REVIEW'>('UPLOAD');
  const [inputMode, setInputMode] = useState<'IMAGE' | 'TEXT'>('IMAGE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [plainText, setPlainText] = useState('');
  const [textPublisher, setTextPublisher] = useState('IPM');
  const [textMonth, setTextMonth] = useState(new Date().getMonth() + 1);
  const [textYear, setTextYear] = useState(new Date().getFullYear());
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scanResult, setScanResult] = useState<OcrScheduleScanResponse | null>(null);
  const [stagingItems, setStagingItems] = useState<OcrParsedBookItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('boki_gemini_api_key');
      if (savedKey) setGeminiApiKey(savedKey);
    }
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    try {
      setIsScanning(true);
      if (geminiApiKey.trim()) localStorage.setItem('boki_gemini_api_key', geminiApiKey.trim());
      const res = await scheduleService.scanScheduleImage(
        selectedFile,
        selectedPublisher,
        geminiApiKey.trim() || undefined
      );
      setScanResult(res);
      setStagingItems(res.items || []);
      setStep('REVIEW');
    } catch (err: unknown) {
      console.error('Scan error:', err);
      alert(err instanceof Error ? err.message : 'Không thể quét ảnh lịch.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartTextParse = async () => {
    if (!plainText.trim()) return;
    try {
      setIsScanning(true);
      if (geminiApiKey.trim()) localStorage.setItem('boki_gemini_api_key', geminiApiKey.trim());
      const res = await scheduleService.parseScheduleBatchText({
        text: plainText,
        publisher: textPublisher,
        month: textMonth,
        year: textYear,
        apiKey: geminiApiKey.trim() || undefined,
      });
      setScanResult(res);
      setStagingItems(res.items || []);
      setStep('REVIEW');
    } catch (err: unknown) {
      console.error('Text parse error:', err);
      alert(err instanceof Error ? err.message : 'Lỗi phân tích văn bản lịch.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateItem = (tempId: string, updated: Partial<OcrParsedBookItem>) => {
    setStagingItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, ...updated } : item))
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setStagingItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const handleSaveBatch = async () => {
    const selected = stagingItems.filter((i) => i.selected);
    if (selected.length === 0) {
      alert('Vui lòng chọn ít nhất 1 mục lịch để lưu.');
      return;
    }

    try {
      setIsSaving(true);
      const payloads = groupStagingItemsToPayloads(selected, scanResult);
      await scheduleService.batchCreateSchedules(payloads);
      alert(`Đã nhập thành công ${payloads.length} đầu sách (${selected.length} phiên bản) vào hệ thống!`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Batch save error:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi lưu danh sách mục lịch.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.headerTitle}>Nhập Lịch Phát Hành Hàng Loạt (AI)</h2>
            <p className={styles.headerDesc}>
              Hỗ trợ quét ảnh lịch (OCR Vision) hoặc dán đoạn văn bản (Plain Text từ IPM, Trẻ, Nhã Nam...).
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Đóng
          </button>
        </div>

        {step === 'UPLOAD' && (
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tabBtn} ${inputMode === 'IMAGE' ? styles.tabBtnActive : ''}`}
              onClick={() => setInputMode('IMAGE')}
            >
              Quét bằng Ảnh (OCR)
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${inputMode === 'TEXT' ? styles.tabBtnActive : ''}`}
              onClick={() => setInputMode('TEXT')}
            >
              Dán đoạn văn bản (Plain Text)
            </button>
          </div>
        )}

        <div className={styles.body}>
          {isScanning ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <p>AI đang phân tích và đối soát với cơ sở dữ liệu Boki...</p>
            </div>
          ) : step === 'UPLOAD' ? (
            inputMode === 'IMAGE' ? (
              <OcrUploadStep
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                publishers={publishers}
                selectedPublisher={selectedPublisher}
                geminiApiKey={geminiApiKey}
                onFileChange={handleFileChange}
                onPublisherChange={setSelectedPublisher}
                onApiKeyChange={setGeminiApiKey}
              />
            ) : (
              <ScheduleBatchTextInputStep
                text={plainText}
                onTextChange={setPlainText}
                publishers={publishers}
                selectedPublisher={textPublisher}
                onPublisherChange={setTextPublisher}
                month={textMonth}
                onMonthChange={setTextMonth}
                year={textYear}
                onYearChange={setTextYear}
                geminiApiKey={geminiApiKey}
                onApiKeyChange={setGeminiApiKey}
              />
            )
          ) : (
            <div>
              <div className={styles.scanBanner}>
                <div>
                  <span className={styles.scanBannerTitle}>
                    {scanResult?.detectedPublisher} — Tháng {scanResult?.month}/{scanResult?.year}
                  </span>
                </div>
                <div className={styles.scanBannerDetails}>
                  Phát hiện {stagingItems.length} đầu sách | Đối soát thông minh theo Nhà xuất bản
                </div>
              </div>

              <OcrStagingTable
                items={stagingItems}
                onUpdateItem={handleUpdateItem}
                onSelectAll={handleSelectAll}
              />
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {step === 'REVIEW' && !isScanning && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setStep('UPLOAD')}
            >
              Quay lại nhập khác
            </button>
          )}
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Hủy bỏ
          </button>
          {step === 'UPLOAD' ? (
            inputMode === 'IMAGE' ? (
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={!selectedFile || isScanning}
                onClick={handleStartScan}
              >
                Bắt đầu phân tích ảnh
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={!plainText.trim() || isScanning}
                onClick={handleStartTextParse}
              >
                Bắt đầu phân tích văn bản
              </button>
            )
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={isSaving || stagingItems.filter((i) => i.selected).length === 0}
              onClick={handleSaveBatch}
            >
              {isSaving ? 'Đang lưu...' : `Xác nhận tạo ${stagingItems.filter((i) => i.selected).length} mục lịch`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
