'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Book } from '@/types';
import { searchService } from '@/services/searchService';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { activityTracker } from '@/services/activityTracker';
import SearchHistorySection from './SearchHistorySection';
import HotSearchSection from './HotSearchSection';
import SearchSuggestionsDropdown from './SearchSuggestionsDropdown';
import styles from './smartSearch.module.css';

export default function SmartSearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hotKeywords, setHotKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory();

  // Load hot keywords on mount
  useEffect(() => {
    let isMounted = true;
    searchService.getHotKeywords().then((data) => {
      if (isMounted) setHotKeywords(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search query for live suggestions
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      searchService.getSuggestions(trimmed, 5).then((books) => {
        setSuggestions(books);
        setIsLoading(false);
      });
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const executeSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      addHistory(trimmed);
      activityTracker.trackSearch(trimmed);
      setIsOpen(false);
      router.push(`/books?search=${encodeURIComponent(trimmed)}`);
    } else {
      setIsOpen(false);
      router.push('/books');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSelectKeyword = (keyword: string) => {
    setSearchQuery(keyword);
    executeSearch(keyword);
  };

  const handleSelectBook = (book: Book) => {
    if (searchQuery.trim()) {
      addHistory(searchQuery.trim());
    } else {
      addHistory(book.title);
    }
    activityTracker.trackSearch(book.title);
    setIsOpen(false);
    router.push(`/books/${book.slug}`);
  };

  const handleClearInput = () => {
    setSearchQuery('');
    setSuggestions([]);
  };

  const hasSearchText = searchQuery.trim().length > 0;

  return (
    <div ref={containerRef} className={styles.searchContainer}>
      <form
        className={`${styles.inputWrapper} ${isFocused ? styles.inputWrapperFocused : ''}`}
        onSubmit={handleSubmit}
      >
        <svg
          className={styles.searchIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          placeholder="Tìm kiếm sách, tác giả, NXB, thể loại..."
          className={styles.searchInput}
          value={searchQuery}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        />

        {searchQuery.length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClearInput}
            aria-label="Xóa nội dung tìm kiếm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <button type="submit" className={styles.submitBtn}>
          Tìm kiếm
        </button>
      </form>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {hasSearchText ? (
            <SearchSuggestionsDropdown
              query={searchQuery.trim()}
              books={suggestions}
              isLoading={isLoading}
              onSelectBook={handleSelectBook}
              onViewAll={() => executeSearch(searchQuery)}
            />
          ) : (
            <div className={styles.dropdownInner}>
              <SearchHistorySection
                history={history}
                onSelectKeyword={handleSelectKeyword}
                onRemoveKeyword={removeHistory}
                onClearAll={clearHistory}
              />
              <HotSearchSection
                keywords={hotKeywords}
                onSelectKeyword={handleSelectKeyword}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
