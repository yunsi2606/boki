'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Category, CategoryCheckResult } from '@/types';
import { categoryService } from '@/services/categoryService';

interface QuickAddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: Category[];
  onCategoryCreated: (newCategory: Category) => void;
  onSelectExisting?: (category: Category) => void;
}

export default function QuickAddCategoryModal({
  isOpen,
  onClose,
  existingCategories,
  onCategoryCreated,
  onSelectExisting,
}: QuickAddCategoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CategoryCheckResult | null>(null);
  const [allowSimilarCreation, setAllowSimilarCreation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setParentId(null);
      setChecking(false);
      setCheckResult(null);
      setAllowSimilarCreation(false);
      setSubmitting(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Real-time debounce check
  useEffect(() => {
    if (!name || name.trim().length === 0) {
      setCheckResult(null);
      setChecking(false);
      setAllowSimilarCreation(false);
      return;
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setCheckResult({
        isValid: false,
        suitabilityMessage: 'Tên danh mục cần tối thiểu 2 ký tự.',
        isExactDuplicate: false,
        similarCategories: [],
      });
      return;
    }

    setChecking(true);
    setAllowSimilarCreation(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await categoryService.checkCategory(trimmed);
        setCheckResult(res);
      } catch (err) {
        // Fallback client-side check if backend offline
        const lower = trimmed.toLowerCase();
        const exact = existingCategories.find((c) => c.name.toLowerCase().trim() === lower);
        if (exact) {
          setCheckResult({
            isValid: false,
            suitabilityMessage: `Danh mục '${exact.name}' đã tồn tại trong hệ thống. Vui lòng chọn danh mục có sẵn thay vì tạo mới.`,
            isExactDuplicate: true,
            similarCategories: [exact],
          });
        } else {
          const similar = existingCategories.filter((c) => {
            const cLower = c.name.toLowerCase();
            return lower.includes(cLower) || cLower.includes(lower);
          });
          setCheckResult({
            isValid: true,
            suitabilityMessage: similar.length > 0
              ? `Phát hiện ${similar.length} danh mục có tên tương tự đã có sẵn.`
              : 'Tên danh mục hợp lệ và phù hợp cho ngành sách.',
            isExactDuplicate: false,
            similarCategories: similar,
          });
        }
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [name, existingCategories]);

  if (!isOpen || !mounted) return null;

  const handleUseExisting = (category: Category) => {
    if (onSelectExisting) {
      onSelectExisting(category);
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (checkResult && !checkResult.isValid) {
      setErrorMessage(checkResult.suitabilityMessage);
      return;
    }

    if (checkResult && checkResult.isExactDuplicate) {
      setErrorMessage(checkResult.suitabilityMessage);
      return;
    }

    if (checkResult && checkResult.similarCategories.length > 0 && !allowSimilarCreation) {
      setErrorMessage('Vui lòng chọn danh mục tương tự có sẵn hoặc tích xác nhận tạo danh mục riêng biệt.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const created = await categoryService.createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
      });

      onCategoryCreated(created);
      onClose();
    } catch (err: any) {
      const msg = err?.message || err?.error || 'Có lỗi xảy ra khi tạo danh mục mới.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(
    name.trim().length >= 2 &&
    checkResult &&
    checkResult.isValid &&
    !checkResult.isExactDuplicate &&
    (checkResult.similarCategories.length === 0 || allowSimilarCreation) &&
    !submitting &&
    !checking
  );

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100005, // strictly higher than book modal (z-index: 99999)
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          zIndex: 100006,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Thêm Danh Mục Sách Mới
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
              Hệ thống tự động kiểm tra trùng lặp, mức độ tương đồng và tính phù hợp trước khi tạo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {errorMessage && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tên danh mục */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Tên danh mục <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Trinh Thám & Kinh Dị, Light Novel, Kỹ Năng Sống..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
              />
              {checking && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  <span>Đang phân tích...</span>
                </div>
              )}
            </div>
          </div>

          {/* Analysis & Verification Result Box */}
          {checkResult && (
            <div style={{ marginBottom: '18px' }}>
              {/* 1. Exact Duplicate Alert */}
              {checkResult.isExactDuplicate ? (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#fef2f2',
                    border: '1.5px solid #fca5a5',
                    color: '#991b1b',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>Trùng lặp: Danh mục đã tồn tại trong hệ thống!</span>
                  </div>
                  <p style={{ margin: '6px 0 10px', fontSize: '12.5px', lineHeight: 1.4 }}>
                    {checkResult.suitabilityMessage}
                  </p>
                  {checkResult.similarCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleUseExisting(checkResult.similarCategories[0])}
                      style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sử dụng danh mục "{checkResult.similarCategories[0].name}" ngay
                    </button>
                  )}
                </div>
              ) : !checkResult.isValid ? (
                /* 2. Invalid / Unsuitable Name */
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    color: '#92400e',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>Chưa phù hợp làm tên danh mục sách</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12.5px', lineHeight: 1.4 }}>
                    {checkResult.suitabilityMessage}
                  </p>
                </div>
              ) : checkResult.similarCategories.length > 0 ? (
                /* 3. Similar Categories Found */
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: '#fff7ed',
                    border: '1.5px solid #fed7aa',
                    color: '#9a3412',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Phát hiện danh mục tương tự có sẵn:</span>
                  </div>
                  <p style={{ margin: '6px 0 10px', fontSize: '12px', color: '#7c2d12' }}>
                    Hệ thống nhận thấy tên bạn nhập có liên quan hoặc tương đồng với các danh mục dưới đây:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {checkResult.similarCategories.map((sim) => (
                      <div
                        key={sim.id}
                        style={{
                          background: '#ffffff',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #ffedd5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '13px', color: '#1e293b' }}>{sim.name}</strong>
                          {sim.description && (
                            <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: '6px' }}>
                              ({sim.description.slice(0, 45)}...)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUseExisting(sim)}
                          style={{
                            background: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Chọn danh mục này
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Confirmation checkbox to allow creating distinct new subcategory */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      color: '#431407',
                      cursor: 'pointer',
                      paddingTop: '6px',
                      borderTop: '1px dashed #fed7aa',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allowSimilarCreation}
                      onChange={(e) => setAllowSimilarCreation(e.target.checked)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span>Tôi xác nhận "{name.trim()}" là một phân loại riêng biệt, vẫn tiếp tục tạo mới.</span>
                  </label>
                </div>
              ) : (
                /* 4. Perfect Match & Highly Suitable */
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontWeight: 600 }}>Tên danh mục hợp lệ và phù hợp cho ngành sách.</span>
                </div>
              )}
            </div>
          )}

          {/* Mô tả ngắn */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Mô tả danh mục (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phạm vi các đầu sách thuộc thể loại này..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13.5px',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Danh mục cha (nếu có) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Danh mục cha (Tùy chọn)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
              }}
            >
              <option value="">-- Là danh mục chính (Không có danh mục cha) --</option>
              {existingCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: '9px 22px',
                borderRadius: '10px',
                border: 'none',
                background: canSubmit ? '#2563eb' : '#94a3b8',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: canSubmit ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {submitting ? 'Đang tạo danh mục...' : '+ Tạo Danh Mục Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
