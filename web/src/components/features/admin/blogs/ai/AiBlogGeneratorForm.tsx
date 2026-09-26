'use client';

import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, X, FileText, Search } from 'lucide-react';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import type {
  AiBlogAction,
  AiBlogTone,
  AiBlogLength,
  AiBlogTargetAudience,
  AiGenerateBlogRequest,
} from '@/types/aiBlog';
import styles from './aiBlogAssistant.module.css';

interface AiBlogGeneratorFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: string;
  categories: string[];
  activeTab: 'CREATE' | 'IMPROVE';
  isGenerating: boolean;
  onGenerate: (request: AiGenerateBlogRequest) => void;
}

export default function AiBlogGeneratorForm({
  initialTitle = '',
  initialContent = '',
  initialCategory = 'Đánh giá sách',
  categories,
  activeTab,
  isGenerating,
  onGenerate,
}: AiBlogGeneratorFormProps) {
  const [action, setAction] = useState<AiBlogAction>(() =>
    activeTab === 'IMPROVE' ? 'POLISH' : 'FULL_ARTICLE'
  );
  const [topic, setTopic] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [bookList, setBookList] = useState<Book[]>([]);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const [category, setCategory] = useState(initialCategory || 'Đánh giá sách');
  const [tone, setTone] = useState<AiBlogTone>('INSPIRING');
  const [length, setLength] = useState<AiBlogLength>('MEDIUM');
  const [targetAudience, setTargetAudience] = useState<AiBlogTargetAudience>('BOOK_LOVERS');
  const [customPrompt, setCustomPrompt] = useState('');

  // Switch default action when activeTab changes
  useEffect(() => {
    if (activeTab === 'IMPROVE') {
      if (action !== 'POLISH' && action !== 'SEO_OPTIMIZE' && action !== 'GENERATE_EXCERPT') {
        setAction('POLISH');
      }
    } else {
      if (action !== 'FULL_ARTICLE' && action !== 'OUTLINE') {
        setAction('FULL_ARTICLE');
      }
    }
  }, [activeTab]);

  // Search catalog books
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!showBookDropdown) return;
      setIsSearchingBooks(true);
      bookService
        .getAdminBooks(bookSearch.trim() || undefined)
        .then((res) => {
          if (isMounted) {
            setBookList(res.slice(0, 10));
          }
        })
        .catch(() => {
          if (isMounted) setBookList([]);
        })
        .finally(() => {
          if (isMounted) setIsSearchingBooks(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [bookSearch, showBookDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      action,
      topic: topic.trim() || (selectedBook ? selectedBook.title : undefined),
      bookId: selectedBook ? selectedBook.id : undefined,
      category,
      tone,
      length,
      targetAudience,
      existingTitle: initialTitle,
      existingContent: initialContent,
      customPrompt: customPrompt.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formColumn}>
      {/* Action Selector */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Chế độ tạo nội dung</label>
        {activeTab === 'CREATE' ? (
          <div className={styles.actionGrid}>
            <button
              type="button"
              className={`${styles.actionOption} ${action === 'FULL_ARTICLE' ? styles.actionOptionActive : ''}`}
              onClick={() => setAction('FULL_ARTICLE')}
            >
              <span className={styles.actionOptionTitle}>
                <FileText size={14} />
                Toàn bộ bài viết
              </span>
              <span className={styles.actionOptionDesc}>
                Sinh bài hoàn chỉnh có mở đầu, thân bài, trích dẫn và kết luận.
              </span>
            </button>

            <button
              type="button"
              className={`${styles.actionOption} ${action === 'OUTLINE' ? styles.actionOptionActive : ''}`}
              onClick={() => setAction('OUTLINE')}
            >
              <span className={styles.actionOptionTitle}>
                <BookOpen size={14} />
                Dàn ý chi tiết
              </span>
              <span className={styles.actionOptionDesc}>
                Sinh khung sườn các mục và luận điểm để tự do triển khai.
              </span>
            </button>
          </div>
        ) : (
          <div className={styles.actionGrid}>
            <button
              type="button"
              className={`${styles.actionOption} ${action === 'POLISH' ? styles.actionOptionActive : ''}`}
              onClick={() => setAction('POLISH')}
            >
              <span className={styles.actionOptionTitle}>
                <Sparkles size={14} />
                Trau chuốt câu từ
              </span>
              <span className={styles.actionOptionDesc}>
                Hiệu đính bài viết, sửa lỗi và nâng cao cảm xúc.
              </span>
            </button>

            <button
              type="button"
              className={`${styles.actionOption} ${action === 'SEO_OPTIMIZE' ? styles.actionOptionActive : ''}`}
              onClick={() => setAction('SEO_OPTIMIZE')}
            >
              <span className={styles.actionOptionTitle}>
                <Search size={14} />
                Tối ưu SEO & Thẻ
              </span>
              <span className={styles.actionOptionDesc}>
                Tạo tiêu đề chuẩn SEO, thẻ tags và tóm tắt lôi cuốn.
              </span>
            </button>

            <button
              type="button"
              className={`${styles.actionOption} ${action === 'GENERATE_EXCERPT' ? styles.actionOptionActive : ''}`}
              onClick={() => setAction('GENERATE_EXCERPT')}
              style={{ gridColumn: 'span 2' }}
            >
              <span className={styles.actionOptionTitle}>
                <FileText size={14} />
                Tạo tóm tắt ngắn (Excerpt)
              </span>
              <span className={styles.actionOptionDesc}>
                Rút trích 1-2 câu tóm lược ấn tượng nhất từ nội dung bài viết.
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Reference Book Selector */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Liên kết sách từ kho Boki
          <span className={styles.labelHint}>(Tùy chọn)</span>
        </label>

        {selectedBook ? (
          <div className={styles.bookSelectorCard}>
            <div className={styles.bookSelectorLeft}>
              {selectedBook.imageUrls && selectedBook.imageUrls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedBook.imageUrls[0]}
                  alt={selectedBook.title}
                  className={styles.bookThumbnail}
                />
              ) : (
                <div className={styles.bookThumbnail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} color="#94a3b8" />
                </div>
              )}
              <div className={styles.bookInfo}>
                <div className={styles.bookTitle} title={selectedBook.title}>
                  {selectedBook.title}
                </div>
                <div className={styles.bookAuthor}>
                  {selectedBook.author} &bull; {selectedBook.price.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.bookClearBtn}
              onClick={() => setSelectedBook(null)}
              title="Hủy chọn sách"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Nhập tên sách để tìm trong kho..."
              value={bookSearch}
              onFocus={() => setShowBookDropdown(true)}
              onChange={(e) => {
                setBookSearch(e.target.value);
                setShowBookDropdown(true);
              }}
              className={styles.input}
            />
            {showBookDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 20,
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {isSearchingBooks && (
                  <div style={{ padding: '10px 14px', fontSize: '12px', color: '#64748b' }}>
                    Đang tìm kiếm sách...
                  </div>
                )}
                {!isSearchingBooks && bookList.length === 0 && (
                  <div style={{ padding: '10px 14px', fontSize: '12px', color: '#94a3b8' }}>
                    Không tìm thấy cuốn sách nào phù hợp.
                  </div>
                )}
                {!isSearchingBooks &&
                  bookList.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBook(b);
                        setShowBookDropdown(false);
                        if (!topic) setTopic(`Review & Cảm nhận sách: ${b.title}`);
                      }}
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f8fafc',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <BookOpen size={14} color="#EE4D2D" />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {b.author}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topic or Title */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Chủ đề / Tiêu đề gợi ý
          {activeTab === 'CREATE' && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <input
          type="text"
          placeholder="Ví dụ: Top 5 cuốn sách chữa lành tâm hồn, Review Sách..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={styles.input}
        />
      </div>

      {/* Category & Tone */}
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Thể loại bài viết</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.select}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giọng văn</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as AiBlogTone)}
            className={styles.select}
          >
            <option value="INSPIRING">Truyền cảm hứng</option>
            <option value="PROFESSIONAL">Chuyên nghiệp & Sâu sắc</option>
            <option value="CONVERSATIONAL">Gần gũi & Thân mật</option>
            <option value="ANALYTICAL">Phân tích & Học thuật</option>
            <option value="HUMOROUS">Hài hước & Sôi nổi</option>
          </select>
        </div>
      </div>

      {/* Length & Target Audience */}
      <div className={styles.grid2}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Độ dài dự kiến</label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as AiBlogLength)}
            className={styles.select}
          >
            <option value="SHORT">Ngắn (~500 từ)</option>
            <option value="MEDIUM">Tiêu chuẩn (~1000 từ)</option>
            <option value="DETAILED">Chuyên sâu (~1800 từ)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Độc giả mục tiêu</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value as AiBlogTargetAudience)}
            className={styles.select}
          >
            <option value="BOOK_LOVERS">Người yêu sách</option>
            <option value="STUDENTS">Học sinh / Sinh viên</option>
            <option value="PROFESSIONALS">Dân văn phòng / Chuyên gia</option>
            <option value="GENERAL">Đại chúng</option>
          </select>
        </div>
      </div>

      {/* Custom Prompt / Notes */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Ghi chú hoặc yêu cầu riêng cho AI
          <span className={styles.labelHint}>(Tùy chọn)</span>
        </label>
        <textarea
          placeholder="Ví dụ: Nhấn mạnh vào bài học quản lý tài chính, thêm trích dẫn hay nhất..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className={styles.textarea}
          rows={2}
        />
      </div>

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={isGenerating || (activeTab === 'CREATE' && !topic.trim() && !selectedBook)}
        className={styles.generateBtn}
      >
        <Sparkles size={16} />
        {isGenerating ? 'Đang phân tích & tạo nội dung...' : 'Tạo nội dung với AI'}
      </button>
    </form>
  );
}
