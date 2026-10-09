'use client';

import React from 'react';
import { BarChartIcon } from '@/components/ui/LineIcons';
import ClickableMetadata from '@/components/features/books/ClickableMetadata';
import { getSpecFilterParam } from '@/utils/entityMatch';
import styles from '@/app/books/[slug]/page.module.css';

interface BookDetailSpecsTableProps {
  displaySpecs: [string, string][];
}

export default function BookDetailSpecsTable({ displaySpecs }: BookDetailSpecsTableProps) {
  if (displaySpecs.length === 0) return null;

  return (
    <div className={styles.specsSection}>
      <h3 className={styles.specsTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChartIcon size={20} color="#0284c7" />
        <span>Thông Số Xuất Bản Chi Tiết</span>
      </h3>
      <div className={styles.specsGrid}>
        {displaySpecs.map(([label, value]) => {
          const paramName = getSpecFilterParam(label);
          return (
            <div key={label} className={styles.specRow}>
              <span className={styles.specLabel}>{label}:</span>
              <strong className={styles.specValue}>
                {paramName ? (
                  <ClickableMetadata
                    value={value}
                    paramName={paramName}
                    linkClassName={styles.specLink}
                  />
                ) : (
                  value
                )}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
