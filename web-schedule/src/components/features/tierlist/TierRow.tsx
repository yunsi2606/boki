'use client';

import React, { useState } from 'react';
import { TierItemCard } from './TierItemCard';
import type { TierDefinition, TierRankedMangaItem } from '@/types/tierList';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './tierRow.module.css';

interface TierRowProps {
  tier: TierDefinition;
  items: TierRankedMangaItem[];
  isEditable?: boolean;
  onDragStart?: (item: TierRankedMangaItem | ReleaseScheduleItem, source: string) => void;
  onDropOnTier?: (tierName: string) => void;
  onRemoveItem?: (tierName: string, scheduleId: string) => void;
  onEditTierTrigger?: (tier: TierDefinition) => void;
}

export function TierRow({
  tier,
  items,
  isEditable = true,
  onDragStart,
  onDropOnTier,
  onRemoveItem,
  onEditTierTrigger,
}: TierRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    setIsDragOver(false);
    if (onDropOnTier) {
      onDropOnTier(tier.name);
    }
  };

  return (
    <div className={styles.row}>
      {/* Tier Label badge */}
      <div
        className={styles.tierBadge}
        style={{ backgroundColor: tier.color }}
        onClick={() => isEditable && onEditTierTrigger && onEditTierTrigger(tier)}
        title={isEditable ? 'Nhấn để chỉnh sửa bậc này' : undefined}
      >
        <span className={styles.tierName}>{tier.name}</span>
        {isEditable && (
          <span className={styles.editHint}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
        )}
      </div>

      {/* Drop Zone / Manga Card Items List */}
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {items.length === 0 ? (
          <div className={styles.emptySlot}>
            {isEditable ? 'Kéo truyện thả vào đây' : 'Chưa có truyện ở bậc này'}
          </div>
        ) : (
          items.map((it) => (
            <TierItemCard
              key={it.id || it.scheduleId}
              item={it}
              source={tier.name}
              onDragStart={(item, source) => onDragStart && onDragStart(item, source)}
              onRemove={isEditable && onRemoveItem ? (schedId) => onRemoveItem(tier.name, schedId) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
