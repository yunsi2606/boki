'use client';

import { useCallback } from 'react';
import styles from './editor.module.css';

interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInsertImage: () => void;
  onInsertTable: () => void;
  onInsertLink: () => void;
  isSourceView: boolean;
  onToggleSourceView: () => void;
}

export default function EditorToolbar({
  editorRef,
  onInsertImage,
  onInsertTable,
  onInsertLink,
  isSourceView,
  onToggleSourceView,
}: EditorToolbarProps) {
  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, [editorRef]);

  const handleBlockFormat = (tag: string) => {
    exec('formatBlock', tag);
  };

  return (
    <div className={styles.toolbar}>
      {/* Block format */}
      <div className={styles.toolbarGroup}>
        <select
          className={styles.toolbarSelect}
          onChange={(e) => handleBlockFormat(e.target.value)}
          defaultValue=""
          title="Kiểu đoạn"
        >
          <option value="" disabled>Kiểu đoạn</option>
          <option value="p">Văn bản</option>
          <option value="h1">Tiêu đề 1</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
          <option value="blockquote">Trích dẫn</option>
          <option value="pre">Đoạn mã</option>
        </select>
      </div>

      {/* Text formatting */}
      <div className={styles.toolbarGroup}>
        <button className={styles.toolbarBtn} onClick={() => exec('bold')} title="Đậm (Ctrl+B)">
          <strong>B</strong>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('italic')} title="Nghiêng (Ctrl+I)">
          <em>I</em>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('underline')} title="Gạch dưới (Ctrl+U)">
          <u>U</u>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('strikeThrough')} title="Gạch ngang">
          <s>S</s>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('superscript')} title="Chỉ số trên">
          X²
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('subscript')} title="Chỉ số dưới">
          X₂
        </button>
      </div>

      {/* Colors */}
      <div className={styles.toolbarGroup}>
        <div className={styles.colorPickerWrapper} title="Màu chữ">
          <input
            type="color"
            className={styles.colorInput}
            defaultValue="#1e293b"
            onChange={(e) => exec('foreColor', e.target.value)}
          />
        </div>
        <div className={styles.colorPickerWrapper} title="Màu nền">
          <input
            type="color"
            className={styles.colorInput}
            defaultValue="#ffffff"
            onChange={(e) => exec('hiliteColor', e.target.value)}
          />
        </div>
      </div>

      {/* Alignment */}
      <div className={styles.toolbarGroup}>
        <button className={styles.toolbarBtn} onClick={() => exec('justifyLeft')} title="Căn trái">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('justifyCenter')} title="Căn giữa">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="10" x2="6" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="18" y1="18" x2="6" y2="18" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('justifyRight')} title="Căn phải">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="10" x2="7" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="7" y2="18" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('justifyFull')} title="Căn đều">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="3" y2="18" />
          </svg>
        </button>
      </div>

      {/* Lists */}
      <div className={styles.toolbarGroup}>
        <button className={styles.toolbarBtn} onClick={() => exec('insertUnorderedList')} title="Danh sách">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="2" fill="currentColor" />
            <circle cx="4" cy="12" r="2" fill="currentColor" />
            <circle cx="4" cy="18" r="2" fill="currentColor" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('insertOrderedList')} title="Danh sách số">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1v4" />
            <path d="M4 10h2" />
          </svg>
        </button>
      </div>

      {/* Insert */}
      <div className={styles.toolbarGroup}>
        <button className={styles.toolbarBtn} onClick={onInsertImage} title="Chèn ảnh">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={onInsertTable} title="Chèn bảng">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={onInsertLink} title="Chèn liên kết">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('insertHorizontalRule')} title="Đường kẻ ngang">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
        </button>
      </div>

      {/* Utilities */}
      <div className={styles.toolbarGroup}>
        <button className={styles.toolbarBtn} onClick={() => exec('undo')} title="Hoàn tác (Ctrl+Z)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('redo')} title="Làm lại (Ctrl+Y)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
        <button className={styles.toolbarBtn} onClick={() => exec('removeFormat')} title="Xóa định dạng">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          className={`${styles.toolbarBtn} ${isSourceView ? styles.active : ''}`}
          onClick={onToggleSourceView}
          title="Xem mã HTML"
        >
          &lt;/&gt;
        </button>
      </div>
    </div>
  );
}
