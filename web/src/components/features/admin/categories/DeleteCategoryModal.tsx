'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import type { Category } from '@/types';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onConfirm: (category: Category) => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteCategoryModal({
  isOpen,
  category,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteCategoryModalProps) {
  if (!isOpen || !category || typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100010,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Xác Nhận Xóa Danh Mục
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Thao tác không thể hoàn tác
              </p>
            </div>
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
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: '0 0 16px' }}>
            Bạn có chắc chắn muốn xóa danh mục{' '}
            <strong style={{ color: '#0f172a', fontWeight: 700 }}>"{category.name}"</strong> (ID: #{category.id})?
          </p>

          {/* Safety Guarantee Notice */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ fontSize: '12.5px', color: '#166534', lineHeight: 1.5 }}>
              <strong>Bảo vệ dữ liệu sách:</strong> Hành động này chỉ xóa danh mục và gỡ liên kết thể loại khỏi các cuốn sách liên quan. Toàn bộ sách trong danh mục này sẽ <strong>được giữ nguyên 100%</strong>, không bị xóa khỏi hệ thống.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(category)}
            disabled={isDeleting}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
            }}
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
