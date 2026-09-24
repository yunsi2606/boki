'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import EditorToolbar from './EditorToolbar';
import InsertImageModal from './InsertImageModal';
import InsertTableModal from './InsertTableModal';
import InsertLinkModal from './InsertLinkModal';
import styles from './editor.module.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Bắt đầu viết bài...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceView, setIsSourceView] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      updateStats(value);
    }
  }, [value]);

  const updateStats = useCallback((html: string) => {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateStats(html);
  }, [onChange, updateStats]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab key for indent
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '\t');
    }
  }, []);

  // Toggle source / visual view
  const handleToggleSourceView = useCallback(() => {
    if (isSourceView) {
      // Switch from source → visual
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceHtml;
        onChange(sourceHtml);
        updateStats(sourceHtml);
      }
    } else {
      // Switch from visual → source
      const html = editorRef.current?.innerHTML || '';
      setSourceHtml(html);
    }
    setIsSourceView(!isSourceView);
  }, [isSourceView, sourceHtml, onChange, updateStats]);

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceHtml(e.target.value);
  }, []);

  // Insert handlers
  const handleInsertImage = useCallback((url: string, alt: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const imgHtml = `<img src="${url}" alt="${alt}" />`;
    document.execCommand('insertHTML', false, imgHtml);
    handleInput();
  }, [handleInput]);

  const handleInsertTable = useCallback((rows: number, cols: number, hasHeader: boolean) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let tableHtml = '<table>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        if (r === 0 && hasHeader) {
          tableHtml += `<th>Tiêu đề ${c + 1}</th>`;
        } else {
          tableHtml += '<td>&nbsp;</td>';
        }
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    document.execCommand('insertHTML', false, tableHtml);
    handleInput();
  }, [handleInput]);

  const handleInsertLink = useCallback((url: string, text: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    document.execCommand('insertHTML', false, linkHtml);
    handleInput();
  }, [handleInput]);

  // Handle paste - clean up pasted content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    // Allow images to be pasted natively
    if (e.clipboardData.files.length > 0) return;

    // For text content, let browser handle it
  }, []);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={styles.editorContainer}>
      <EditorToolbar
        editorRef={editorRef}
        onInsertImage={() => setShowImageModal(true)}
        onInsertTable={() => setShowTableModal(true)}
        onInsertLink={() => setShowLinkModal(true)}
        isSourceView={isSourceView}
        onToggleSourceView={handleToggleSourceView}
      />

      <div className={styles.editorContentWrapper}>
        {isSourceView ? (
          <textarea
            className={styles.htmlSourceView}
            value={sourceHtml}
            onChange={handleSourceChange}
            spellCheck={false}
          />
        ) : (
          <div
            ref={editorRef}
            className={styles.editorContent}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            data-placeholder={placeholder}
          />
        )}
      </div>

      <div className={styles.editorFooter}>
        <div className={styles.editorStats}>
          <span>{wordCount} từ</span>
          <span>·</span>
          <span>{charCount} ký tự</span>
          <span>·</span>
          <span>~{readingTime} phút đọc</span>
        </div>
      </div>

      {/* Modals */}
      {showImageModal && (
        <InsertImageModal
          onClose={() => setShowImageModal(false)}
          onInsert={handleInsertImage}
        />
      )}
      {showTableModal && (
        <InsertTableModal
          onClose={() => setShowTableModal(false)}
          onInsert={handleInsertTable}
        />
      )}
      {showLinkModal && (
        <InsertLinkModal
          onClose={() => setShowLinkModal(false)}
          onInsert={handleInsertLink}
        />
      )}
    </div>
  );
}
