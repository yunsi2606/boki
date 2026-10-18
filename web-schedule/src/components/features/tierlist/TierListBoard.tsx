'use client';

import React from 'react';
import { TierRow } from './TierRow';
import type { TierDefinition, TierRankedMangaItem } from '@/types/tierList';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './tierListBoard.module.css';

interface TierListBoardProps {
  tiers: TierDefinition[];
  assigned: Record<string, TierRankedMangaItem[]>;
  isEditable?: boolean;
  onDragStart?: (item: TierRankedMangaItem | ReleaseScheduleItem, source: string) => void;
  onDropOnTier?: (tierName: string) => void;
  onRemoveItem?: (tierName: string, scheduleId: string) => void;
  onEditTierTrigger?: (tier: TierDefinition) => void;
}

export function TierListBoard({
  tiers,
  assigned,
  isEditable = true,
  onDragStart,
  onDropOnTier,
  onRemoveItem,
  onEditTierTrigger,
}: TierListBoardProps) {
  return (
    <div className={styles.board}>
      {tiers.map((t) => (
        <TierRow
          key={t.id || t.name}
          tier={t}
          items={assigned[t.name] || []}
          isEditable={isEditable}
          onDragStart={onDragStart}
          onDropOnTier={onDropOnTier}
          onRemoveItem={onRemoveItem}
          onEditTierTrigger={onEditTierTrigger}
        />
      ))}
    </div>
  );
}
