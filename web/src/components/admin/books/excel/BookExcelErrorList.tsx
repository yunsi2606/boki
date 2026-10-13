'use client';

import React from 'react';
import type { BookExcelRowError } from '@/types/bookExcel';

interface BookExcelErrorListProps {
  errors: BookExcelRowError[];
}

export default function BookExcelErrorList({ errors }: BookExcelErrorListProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <div
      style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        padding: '14px 18px',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: '#991b1b',
          fontSize: '0.88rem',
          marginBottom: '8px',
        }}
      >
        Phát hiện {errors.length} lỗi cần lưu ý trong tệp Excel:
      </div>
      <ul
        style={{
          margin: 0,
          paddingLeft: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '0.82rem',
          color: '#b91c1c',
          maxHeight: '140px',
          overflowY: 'auto',
        }}
      >
        {errors.map((err, idx) => (
          <li key={idx}>
            <strong>Dòng {err.rowNumber}</strong> ({err.field}): {err.errorMessage}
          </li>
        ))}
      </ul>
    </div>
  );
}
