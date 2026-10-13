'use client';

import React from 'react';
import type { BookExcelGroupedBook } from '@/types/bookExcel';

interface BookExcelPreviewTableProps {
  books: BookExcelGroupedBook[];
}

export default function BookExcelPreviewTable({ books }: BookExcelPreviewTableProps) {
  if (!books || books.length === 0) return null;

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        maxHeight: '360px',
        overflowY: 'auto',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.82rem',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '10px 14px', width: '60px' }}>Ảnh</th>
            <th style={{ padding: '10px 14px' }}>Thông tin sách</th>
            <th style={{ padding: '10px 14px' }}>Phân loại</th>
            <th style={{ padding: '10px 14px', width: '110px' }}>Giá bán</th>
            <th style={{ padding: '10px 14px', width: '80px' }}>Tồn kho</th>
            <th style={{ padding: '10px 14px', width: '90px' }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b, idx) => {
            const hasVariants = b.variants && b.variants.length > 0;
            const coverSrc =
              b.resolvedCoverUrl ||
              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=100';

            return (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                }}
              >
                {/* Thumbnail */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverSrc}
                    alt={b.title}
                    style={{
                      width: '44px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: '#f1f5f9',
                    }}
                  />
                </td>

                {/* Main Book Details */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    {b.title || '(Chưa có tiêu đề)'}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.78rem' }}>
                    Tác giả: {b.author || '---'}
                  </div>
                  {b.isbn && (
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      ISBN: {b.isbn}
                    </div>
                  )}
                  {b.categoryNames && b.categoryNames.length > 0 && (
                    <div style={{ color: '#ee4d2d', fontSize: '0.74rem', marginTop: '2px' }}>
                      Danh mục: {b.categoryNames.join(', ')}
                    </div>
                  )}
                </td>

                {/* Variants List */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                  {hasVariants ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {b.variants.map((v, vIdx) => (
                        <div
                          key={vIdx}
                          style={{
                            fontSize: '0.76rem',
                            background: '#f8fafc',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <strong>{v.name}</strong>
                          <span style={{ color: '#ee4d2d' }}>
                            {Number(v.price).toLocaleString('vi-VN')} đ
                          </span>
                          <span style={{ color: '#64748b' }}>({v.stockQuantity} cuốn)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      Không có phân loại
                    </span>
                  )}
                </td>

                {/* Price */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top', fontWeight: 600, color: '#0f172a' }}>
                  {b.price ? `${Number(b.price).toLocaleString('vi-VN')} đ` : '---'}
                </td>

                {/* Stock */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top', fontWeight: 600, color: '#475569' }}>
                  {b.stockQuantity}
                </td>

                {/* Status */}
                <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                  {b.validationErrors && b.validationErrors.length > 0 ? (
                    <span
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}
                    >
                      Có lỗi
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#f0fdf4',
                        color: '#16a34a',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}
                    >
                      Hợp lệ
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
