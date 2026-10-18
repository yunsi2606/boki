'use client';

import React, { useState, useEffect } from 'react';
import type { OcrParsedBookItem, OcrScheduleScanResponse } from '@/types/schedule';
import { scheduleService } from '@/services/scheduleService';
import type { CreateSchedulePayload } from '@/services/scheduleService';
import OcrUploadStep from './OcrUploadStep';
import OcrStagingTable from './OcrStagingTable';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
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
      if (geminiApiKey.trim()) {
        localStorage.setItem('boki_gemini_api_key', geminiApiKey.trim());
      }
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
      const msg = err instanceof Error ? err.message : 'Không thể quét ảnh lịch. Vui lòng kiểm tra lại ảnh hoặc API Key.';
      alert(msg);
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
      const groupedMap = new Map<string, CreateSchedulePayload>();

      for (const item of selected) {
        const key = item.computedSlug || item.title.trim().toLowerCase();
        const editionPayload = {
          editionName: item.editionName || 'Bản thường',
          editionType: item.editionType || 'STANDARD',
          releaseDate: item.releaseDate,
          estimatedPrice: item.estimatedPrice,
          gifts: item.gifts || undefined,
          coverUrl: item.coverUrl || undefined,
          status: 'SCHEDULED' as const,
          bookId: item.matchedBookId || null,
        };

        if (groupedMap.has(key)) {
          groupedMap.get(key)!.editions?.push(editionPayload);
        } else {
          groupedMap.set(key, {
            title: item.title.trim(),
            originalTitle: item.originalTitle?.trim() || undefined,
            publisher: item.publisher || scanResult?.detectedPublisher || 'NXB Kim Đồng',
            author: item.author?.trim() || undefined,
            releaseDate: item.releaseDate,
            coverUrl: item.coverUrl || undefined,
            description: item.description || undefined,
            status: 'SCHEDULED',
            editions: [editionPayload],
          });
        }
      }

      const payloads: CreateSchedulePayload[] = Array.from(groupedMap.values());
      await scheduleService.batchCreateSchedules(payloads);
      alert(`Đã nhập thành công ${payloads.length} đầu sách (${selected.length} phiên bản) vào hệ thống!`);
      onSuccess();
      onClose();

    } catch (err: unknown) {
      console.error('Batch save error:', err);
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu danh sách mục lịch.';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.headerTitle}>Quét Ảnh Lịch Phát Hành (AI Vision)</h2>
            <p className={styles.headerDesc}>
              Tự động nhận diện mọi bố cục (Kim Đồng, Trẻ, IPM...), trích xuất ngày, giá và chống lẫn lộn.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className={styles.body}>
          {isScanning ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <p>AI đang phân tích ảnh và đối soát với cơ sở dữ liệu...</p>
            </div>
          ) : step === 'UPLOAD' ? (
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
              Quét lại ảnh khác
            </button>
          )}
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Hủy bỏ
          </button>
          {step === 'UPLOAD' ? (
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
