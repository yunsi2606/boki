'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTierMaker } from '@/hooks/useTierMaker';
import { TierListBoard } from '@/components/features/tierlist/TierListBoard';
import { MangaSearchShelf } from '@/components/features/tierlist/MangaSearchShelf';
import { TierListActionsBar } from '@/components/features/tierlist/TierListActionsBar';
import { TierCustomModal } from '@/components/features/tierlist/TierCustomModal';
import styles from './tierListCreate.module.css';

function TierListStudio() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') || undefined;
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
  } = useTierMaker(editId);

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

export default function CreateTierListPage() {
  return (
    <Suspense fallback={<div className={styles.pageWrapper}><div className={styles.mainContainer}>Đang tải studio...</div></div>}>
      <TierListStudio />
    </Suspense>
  );
}
