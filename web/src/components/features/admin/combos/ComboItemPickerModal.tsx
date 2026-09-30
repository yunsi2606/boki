'use client';

import React, { useState } from 'react';
import type { Book, BookVariant } from '@/types';
import { Search, Plus, Check, X, BookOpen, Layers } from 'lucide-react';
import styles from './comboItemPickerModal.module.css';
import { getBookPriceDisplay } from '@/utils/bookPrice';

export interface SelectedComboItem {
  singleBookId: string;
  variantId?: string | null;
  variantName?: string | null;
  title: string;
  author: string;
  price: number;
  coverImage?: string;
  quantity: number;
}

interface Props {
  isOpen: boolean;
  books: Book[];
  selectedItems: SelectedComboItem[];
  onSelect: (item: SelectedComboItem) => void;
  onClose: () => void;
}

export default function ComboItemPickerModal({
  isOpen,
  books,
  selectedItems,
  onSelect,
  onClose,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  // Filter out combos from the picker so users don't nest combos recursively
  const filteredBooks = books.filter(
    (b) =>
      !b.isCombo &&
      (b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getQty = (key: string) => quantities[key] || 1;

  const setQty = (key: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [key]: Math.max(1, val) }));
  };

  const isSelected = (bookId: string, variantId?: string | null) => {
    return selectedItems.some(
      (it) => it.singleBookId === bookId && (variantId ? it.variantId === variantId : !it.variantId)
    );
  };

  const handleAddBaseBook = (book: Book) => {
    const key = `${book.id}_base`;
    onSelect({
      singleBookId: book.id,
      variantId: null,
      variantName: null,
      title: book.title,
      author: book.author,
      price: book.price,
      coverImage: book.imageUrls?.[0],
      quantity: getQty(key),
    });
  };

  const handleAddVariant = (book: Book, variant: BookVariant) => {
    const key = `${book.id}_${variant.id}`;
    onSelect({
      singleBookId: book.id,
      variantId: variant.id,
      variantName: variant.name,
      title: book.title,
      author: book.author,
      price: variant.price,
      coverImage: variant.imageUrl || book.imageUrls?.[0],
      quantity: getQty(key),
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <BookOpen size={20} />
            <span>Chọn sản phẩm lẻ vào combo</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên sách hoặc tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.list}>
          {filteredBooks.length === 0 ? (
            <div className={styles.emptyState}>Không tìm thấy sách phù hợp</div>
          ) : (
            filteredBooks.map((book) => {
              const baseKey = `${book.id}_base`;
              const baseSelected = isSelected(book.id, null);
              const hasVariants = Boolean(book.variants && book.variants.length > 0);

              return (
                <div key={book.id} className={styles.bookCard}>
                  <div className={styles.bookMain}>
                    {book.imageUrls?.[0] ? (
                      <img
                        src={book.imageUrls[0]}
                        alt={book.title}
                        className={styles.cover}
                      />
                    ) : (
                      <div className={styles.coverPlaceholder}>
                        <BookOpen size={20} />
                      </div>
                    )}

                    <div className={styles.bookInfo}>
                      <div className={styles.bookTitle}>{book.title}</div>
                      <div className={styles.bookMeta}>
                        <span>{book.author}</span>
                        <span>•</span>
                        <span className={styles.price}>
                          {(() => {
                            const p = getBookPriceDisplay(book);
                            return p.isRange ? p.compactDisplayPrice : `${p.currentPrice.toLocaleString('vi-VN')}đ`;
                          })()}
                        </span>
                        <span>•</span>
                        <span>Kho: {book.stockQuantity}</span>
                      </div>
                    </div>

                    <div className={styles.actionArea}>
                      <input
                        type="number"
                        min="1"
                        value={getQty(baseKey)}
                        onChange={(e) => setQty(baseKey, parseInt(e.target.value, 10) || 1)}
                        className={styles.qtyInput}
                        title="Số lượng trong combo"
                      />
                      {baseSelected ? (
                        <button type="button" className={styles.addedBtn}>
                          <Check size={14} /> Đã thêm
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.addBtn}
                          onClick={() => handleAddBaseBook(book)}
                        >
                          <Plus size={14} /> Thêm lẻ
                        </button>
                      )}
                    </div>
                  </div>

                  {hasVariants && (
                    <div className={styles.variantsSection}>
                      <div className={styles.variantLabel}>
                        <Layers size={13} style={{ display: 'inline', marginRight: 4 }} />
                        Phân loại có sẵn:
                      </div>
                      <div className={styles.variantList}>
                        {book.variants?.map((v) => {
                          const vKey = `${book.id}_${v.id}`;
                          const vSelected = isSelected(book.id, v.id);
                          return (
                            <div key={v.id} className={styles.variantRow}>
                              <div>
                                <span className={styles.variantName}>{v.name}</span>
                                <span className={styles.variantPrice}>
                                  {v.price?.toLocaleString('vi-VN')}đ
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 8 }}>
                                  (Kho: {v.stockQuantity})
                                </span>
                              </div>
                              <div className={styles.actionArea}>
                                <input
                                  type="number"
                                  min="1"
                                  value={getQty(vKey)}
                                  onChange={(e) => setQty(vKey, parseInt(e.target.value, 10) || 1)}
                                  className={styles.qtyInput}
                                  title="Số lượng phân loại trong combo"
                                />
                                {vSelected ? (
                                  <button type="button" className={styles.addedBtn}>
                                    <Check size={14} /> Đã thêm
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className={styles.addBtn}
                                    onClick={() => handleAddVariant(book, v)}
                                  >
                                    <Plus size={14} /> Thêm bản này
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
