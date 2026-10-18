'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { scheduleService } from '@/services/scheduleService';
import { mangaTierListService } from '@/services/mangaTierListService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { DEFAULT_TIERS, type TierDefinition, type TierRankedMangaItem } from '@/types/tierList';

export function useTierMaker(initialId?: string) {
  const router = useRouter();
  const { user, isAuthenticated, redirectToLogin } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tiers, setTiers] = useState<TierDefinition[]>(DEFAULT_TIERS);
  const [assigned, setAssigned] = useState<Record<string, TierRankedMangaItem[]>>({});
  const [shelfPool, setShelfPool] = useState<ReleaseScheduleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag state
  const [draggedItem, setDraggedItem] = useState<{
    item: ReleaseScheduleItem | TierRankedMangaItem;
    source: 'shelf' | string;
  } | null>(null);

  // Load shelf schedules
  useEffect(() => {
    async function loadPool() {
      setLoading(true);
      try {
        const schedules = await scheduleService.getSchedules();
        setShelfPool(schedules || []);
      } catch (err) {
        console.error('Failed to load schedules for tier maker:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPool();
  }, []);

  // Load initial tier list if editing
  useEffect(() => {
    if (!initialId) return;
    const currentId = initialId;
    async function loadExisting() {
      try {
        setLoading(true);
        const data = await mangaTierListService.getTierListDetail(currentId);
        if (data) {
          setTitle(data.title);
          setDescription(data.description || '');
          setIsPublic(data.isPublic);
          if (data.tiersConfig) {
            try {
              const parsed = JSON.parse(data.tiersConfig);
              if (Array.isArray(parsed) && parsed.length > 0) setTiers(parsed);
            } catch {}
          }
          const grouped: Record<string, TierRankedMangaItem[]> = {};
          data.items.forEach((it) => {
            if (!grouped[it.tierRank]) grouped[it.tierRank] = [];
            grouped[it.tierRank].push(it);
          });
          setAssigned(grouped);
        }
      } catch (err) {
        console.error('Failed to load tier list to edit:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExisting();
  }, [initialId]);

  const addTier = useCallback((name: string, color: string) => {
    setTiers((prev) => [
      ...prev,
      { id: `tier-${Date.now()}`, name: name.trim() || 'New', color: color || '#EE4D2D', order: prev.length },
    ]);
  }, []);

  const updateTier = useCallback((tierId: string, newName: string, newColor: string) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, name: newName.trim(), color: newColor } : t))
    );
  }, []);

  const removeTier = useCallback((tierName: string) => {
    setTiers((prev) => prev.filter((t) => t.name !== tierName));
    setAssigned((prev) => {
      const clone = { ...prev };
      delete clone[tierName];
      return clone;
    });
  }, []);

  const resetTiers = useCallback(() => {
    setTiers(DEFAULT_TIERS);
    setAssigned({});
  }, []);

  const assignItemToTier = useCallback((manga: ReleaseScheduleItem, targetTier: string) => {
    setAssigned((prev) => {
      const next = { ...prev };
      // Remove from any existing tier first
      Object.keys(next).forEach((rank) => {
        next[rank] = (next[rank] || []).filter((it) => it.scheduleId !== manga.id);
      });
      if (!next[targetTier]) next[targetTier] = [];
      next[targetTier].push({
        id: `ti-${Date.now()}-${manga.id}`,
        scheduleId: manga.id,
        title: manga.title,
        coverUrl: manga.coverUrl,
        publisher: manga.publisher,
        tierRank: targetTier,
        sortOrder: next[targetTier].length + 1,
      });
      return next;
    });
  }, []);

  const removeItemFromTier = useCallback((tierName: string, scheduleId: string) => {
    setAssigned((prev) => ({
      ...prev,
      [tierName]: (prev[tierName] || []).filter((it) => it.scheduleId !== scheduleId),
    }));
  }, []);

  const handleDragStart = useCallback((item: ReleaseScheduleItem | TierRankedMangaItem, source: 'shelf' | string) => {
    setDraggedItem({ item, source });
  }, []);

  const handleDropOnTier = useCallback((targetTierName: string) => {
    if (!draggedItem) return;
    const { item, source } = draggedItem;
    const schedId = 'scheduleId' in item ? item.scheduleId : item.id;
    const itemTitle = item.title;
    const itemCover = item.coverUrl;
    const itemPublisher = item.publisher;

    setAssigned((prev) => {
      const next = { ...prev };
      if (source !== 'shelf') {
        next[source] = (next[source] || []).filter((it) => it.scheduleId !== schedId);
      }
      Object.keys(next).forEach((k) => {
        next[k] = (next[k] || []).filter((it) => it.scheduleId !== schedId);
      });
      if (!next[targetTierName]) next[targetTierName] = [];
      next[targetTierName].push({
        id: `item-${Date.now()}-${schedId}`,
        scheduleId: schedId,
        title: itemTitle,
        coverUrl: itemCover,
        publisher: itemPublisher,
        tierRank: targetTierName,
        sortOrder: next[targetTierName].length + 1,
      });
      return next;
    });
    setDraggedItem(null);
  }, [draggedItem]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tên cho bảng Tier List');
      return;
    }
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('boki_pending_tierlist', JSON.stringify({ title, description, isPublic, tiers, assigned }));
      }
      redirectToLogin(window.location.href);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const rankedItems: { scheduleId: string; tierRank: string; sortOrder: number }[] = [];
      Object.entries(assigned).forEach(([rank, items]) => {
        items.forEach((it, idx) => {
          rankedItems.push({ scheduleId: it.scheduleId, tierRank: rank, sortOrder: idx + 1 });
        });
      });

      const payload = {
        title: title.trim(),
        description: description.trim(),
        isPublic,
        tiersConfig: JSON.stringify(tiers),
        rankedItems,
      };

      if (initialId) {
        await mangaTierListService.updateTierList(initialId, payload);
        router.push(`/tier-list/${initialId}`);
      } else {
        const res = await mangaTierListService.createTierList(payload);
        router.push(`/tier-list/${res.id}`);
      }
    } catch (err: any) {
      console.error('Failed to save tier list:', err);
      setError(err.message || 'Không thể lưu bảng xếp hạng. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const filteredShelf = shelfPool.filter((m) =>
    searchQuery.trim() ? m.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) : true
  );

  return {
    title, setTitle,
    description, setDescription,
    isPublic, setIsPublic,
    tiers, setTiers,
    assigned,
    shelfPool: filteredShelf,
    searchQuery, setSearchQuery,
    loading, saving, error,
    draggedItem,
    addTier, updateTier, removeTier, resetTiers,
    assignItemToTier, removeItemFromTier,
    handleDragStart, handleDropOnTier, handleSave,
  };
}
