'use client';

import React, { useState } from 'react';
import { bookService } from '@/services/bookService';
import type { BookExcelImportResult } from '@/types/bookExcel';
import BookExcelDropzone from './BookExcelDropzone';
import BookExcelErrorList from './BookExcelErrorList';
import BookExcelPreviewTable from './BookExcelPreviewTable';
import styles from './bookExcelModal.module.css';

interface BookExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BookExcelImportModalProps) {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<BookExcelImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      await bookService.downloadExcelTemplate();
    } catch {
      window.open('/templates/boki_bieu_mau_them_sach.xlsx', '_blank');
    }
  };

  const handlePreview = async () => {
    if (!excelFile) {
      setErrorMessage('Vui lòng chọn tệp Excel trước khi kiểm tra');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      imageFiles.forEach((img) => formData.append('images', img));

      const result = await bookService.importBookExcel(formData, true);
      setImportResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi kiểm tra tệp Excel. Vui lòng kiểm tra định dạng.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!excelFile) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      imageFiles.forEach((img) => formData.append('images', img));

      const result = await bookService.importBookExcel(formData, false);
      setSuccessMessage(`Đã thêm thành công ${result.validBooksCount} cuốn sách vào kho lưu trữ!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi nhập sách vào hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Nhập Sách Hàng Loạt Từ Excel</h2>
            <p className={styles.subtitle}>
              Tải biểu mẫu, điền thông tin và tải lên để tự động đưa sách cùng phân loại vào kho
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            X
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Download Template Banner */}
          <div className={styles.downloadBanner}>
            <div className={styles.downloadText}>
              <strong>Chưa có biểu mẫu Excel?</strong> Tải tệp mẫu chuẩn (.xlsx) gồm danh mục có sẵn và hướng dẫn chi tiết.
            </div>
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownloadTemplate}
            >
              Tải Biểu Mẫu Excel
            </button>
          </div>

          {/* Dropzone for Excel and optional images */}
          <BookExcelDropzone
            excelFile={excelFile}
            onExcelSelect={(file) => {
              setExcelFile(file);
              setImportResult(null);
            }}
            imageFiles={imageFiles}
            onImagesSelect={(files) => {
              setImageFiles(files);
              setImportResult(null);
            }}
          />

          {/* Error Message Alert */}
          {errorMessage && (
            <div style={{ color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
              {errorMessage}
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div style={{ color: '#16a34a', background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              {successMessage}
            </div>
          )}

          {/* Preview Statistics & Table */}
          {importResult && (
            <>
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  Tổng số sách: <span className={styles.statItemStrong}>{importResult.totalBooks}</span>
                </div>
                <div className={styles.statItem}>
                  Sách hợp lệ: <span className={styles.statItemSuccess}>{importResult.validBooksCount}</span>
                </div>
                {importResult.errorCount > 0 && (
                  <div className={styles.statItem}>
                    Lỗi phát hiện: <span className={styles.statItemError}>{importResult.errorCount}</span>
                  </div>
                )}
              </div>

              <BookExcelErrorList errors={importResult.errors} />
              <BookExcelPreviewTable books={importResult.books} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Hủy Bỏ
          </button>

          {!importResult ? (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handlePreview}
              disabled={loading || !excelFile}
            >
              {loading ? 'Đang kiểm tra...' : 'Kiểm Tra & Xem Trước'}
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleConfirmImport}
              disabled={loading || importResult.validBooksCount === 0}
            >
              {loading
                ? 'Đang nhập sách vào kho...'
                : `Xác Nhận Nhập ${importResult.validBooksCount} Sách Vào Kho`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
