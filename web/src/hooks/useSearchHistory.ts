'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'boki_search_history';
const MAX_HISTORY_ITEMS = 15;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistory(parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to read search history from localStorage:', e);
    }
  }, []);

  const saveToStorage = (newHistory: string[]) => {
    setHistory(newHistory);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      }
    } catch (e) {
      console.warn('Failed to save search history to localStorage:', e);
    }
  };

  const addHistory = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Failed to save search history:', e);
      }
      return updated;
    });
  }, []);

  const removeHistory = useCallback((keyword: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== keyword.toLowerCase());
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Failed to remove search history item:', e);
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    saveToStorage([]);
  }, []);

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  };
}
