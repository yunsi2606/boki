'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    assignItemToTier, removeItemFromTier,
    handleDragStart, handleDropOnTier, handleSave,
  } = useTierMaker();

  const tierNames = tiers.map((t) => t.name);

  return (
    <main className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className={styles.separator}>/</span>
        <Link href="/tier-list">Manga Tier List</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>Tạo bảng xếp hạng mới</span>
      </nav>

      {/* Page Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Studio Tạo Manga Tier List</h1>
          <p className={styles.pageSubtitle}>
            Tự do sắp xếp các bộ truyện theo thang bậc từ S đến F hoặc tùy biến thang điểm của riêng bạn.
          </p>
        </div>
      </div>

      {/* Action Bar (Title, Visibility, Save, Custom Tiers) */}
      <TierListActionsBar
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        saving={saving}
        error={error}
        onOpenCustomModal={() => setCustomModalOpen(true)}
        onReset={resetTiers}
        onSave={handleSave}
      />

      {/* The Visual Tier List Board */}
      <TierListBoard
        tiers={tiers}
        assigned={assigned}
        isEditable={true}
        onDragStart={handleDragStart}
        onDropOnTier={handleDropOnTier}
        onRemoveItem={removeItemFromTier}
        onEditTierTrigger={() => setCustomModalOpen(true)}
      />

      {/* Shelf of Manga Available to Drag / Search */}
      <MangaSearchShelf
        shelfItems={shelfPool}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        availableTiers={tierNames}
        onDragStart={handleDragStart}
        onAssignToTier={assignItemToTier}
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
    </main>
  );
}
