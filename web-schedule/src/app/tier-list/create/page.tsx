'use client';

import React, { useState } from 'react';
import { useTierMaker } from '@/hooks/useTierMaker';
import { TierListBoard } from '@/components/features/tierlist/TierListBoard';
import { MangaSearchShelf } from '@/components/features/tierlist/MangaSearchShelf';
import { TierListActionsBar } from '@/components/features/tierlist/TierListActionsBar';
import { TierCustomModal } from '@/components/features/tierlist/TierCustomModal';
import styles from './tierListCreate.module.css';

export default function CreateTierListPage() {
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const {
    title, setTitle,
    description, setDescription,
    isPublic, setIsPublic,
    tiers,
    assigned,
    shelfPool,
    searchQuery, setSearchQuery,
    saving, error,
    addTier, updateTier, removeTier, resetTiers,
    handleDragStart, handleDropOnTier, handleSave,
  } = useTierMaker();

  const totalAssigned = Object.values(assigned).reduce((acc, list) => acc + list.length, 0);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {/* Title & Description Header */}
        <div className={styles.headerArea}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          <input
            type="text"
            className={styles.titleInput}
            placeholder="Nhập tên bảng xếp hạng của bạn..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            className={styles.descInput}
            placeholder="Thêm mô tả ngắn hoặc tiêu chí đánh giá (tùy chọn)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 2-Column Split Studio: Left = Tier Board, Right = Fixed Search & Manga List */}
        <div className={styles.studioLayout}>
          <div className={styles.boardColumn}>
            <TierListBoard
              tiers={tiers}
              assigned={assigned}
              isEditable={true}
              onDragStart={handleDragStart}
              onDropOnTier={handleDropOnTier}
              onEditTierTrigger={() => setCustomModalOpen(true)}
            />
          </div>

          <div className={styles.shelfColumn}>
            <MangaSearchShelf
              shelfItems={shelfPool}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onDragStart={handleDragStart}
            />
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <TierListActionsBar
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        saving={saving}
        totalAssigned={totalAssigned}
        onOpenCustomModal={() => setCustomModalOpen(true)}
        onReset={resetTiers}
        onSave={handleSave}
      />

      {/* Tier Customization Modal */}
      <TierCustomModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        tiers={tiers}
        onAddTier={addTier}
        onUpdateTier={updateTier}
        onRemoveTier={removeTier}
        onResetTiers={resetTiers}
      />
    </div>
  );
}
