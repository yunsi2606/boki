'use client';

import React from 'react';
import type { CreateEditionPayload } from '@/services/scheduleService';
import SingleEditionFields from './SingleEditionFields';
import EditionFormItem from './EditionFormItem';
import styles from './adminScheduleFormModal.module.css';

interface Props {
  editions: CreateEditionPayload[];
  releaseDate: string;
  preOrderDate?: string;
  onAddEdition: () => void;
  onUpdateEdition: (idx: number, updated: CreateEditionPayload) => void;
  onUpdateSingleEdition: (fields: Partial<CreateEditionPayload>) => void;
  onRemoveEdition: (idx: number) => void;
}

export default function ScheduleEditionsSection({
  editions,
  releaseDate,
  preOrderDate,
  onAddEdition,
  onUpdateEdition,
  onUpdateSingleEdition,
  onRemoveEdition,
}: Props) {
  if (editions.length <= 1) {
    return (
      <SingleEditionFields
        edition={editions[0] || { editionName: 'Bản Phổ Thông', editionType: 'STANDARD' }}
        onChange={onUpdateSingleEdition}
        onEnableMultipleEditions={onAddEdition}
      />
    );
  }

  return (
    <>
      <div className={styles.editionsSectionHeader}>
        <div>
          <span className={styles.sectionHeader}>4. Các phiên bản phát hành ({editions.length})</span>
          <p className={styles.sectionSub}>
            Mỗi phiên bản có quà tặng, giá bìa và liên kết sản phẩm trên sàn Boki riêng.
          </p>
        </div>
        <button type="button" className={styles.addEditionBtn} onClick={onAddEdition}>
          + Thêm phiên bản
        </button>
      </div>

      <div className={styles.editionsList}>
        {editions.map((ed, idx) => (
          <EditionFormItem
            key={ed.id || idx}
            index={idx}
            edition={ed}
            parentReleaseDate={releaseDate}
            parentPreOrderDate={preOrderDate}
            onChange={(updated) => onUpdateEdition(idx, updated)}
            onRemove={() => onRemoveEdition(idx)}
            canRemove={true}
          />
        ))}
      </div>
    </>
  );
}
