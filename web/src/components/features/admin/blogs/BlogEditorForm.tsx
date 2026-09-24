'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/components/features/editor/RichTextEditor';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import QuickAddBlogCategoryModal from './QuickAddBlogCategoryModal';
import { blogService } from '@/services/blogService';
import type { BlogPost, CreateBlogPayload, UpdateBlogPayload, BlogCategory } from '@/types/blog';
import styles from './adminBlogs.module.css';

interface BlogEditorFormProps {
  initialBlog?: BlogPost;
  isEditing?: boolean;
}

const DEFAULT_CATEGORIES = [
  'Tin tức',
  'Đánh giá sách',
  'Góc đọc',
  'Kinh nghiệm',
  'Giới thiệu tác giả',
  'Sự kiện & Khuyến mãi',
  'Review',
  'Hướng dẫn',
  'Chung',
];

export default function BlogEditorForm({ initialBlog, isEditing = false }: BlogEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialBlog?.title || '');
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || '');
  const [content, setContent] = useState(initialBlog?.content || '');
  const [coverImage, setCoverImage] = useState<string | null>(initialBlog?.coverImage || null);
  const [category, setCategory] = useState(initialBlog?.category || 'Chung');
  const [categories, setCategories] = useState<string[]>(() => {
    const list = [...DEFAULT_CATEGORIES];
    if (initialBlog?.category && !list.includes(initialBlog.category)) {
      list.push(initialBlog.category);
    }
    return list;
  });
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [tags, setTags] = useState<string[]>(initialBlog?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<string>(initialBlog?.status || 'DRAFT');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch dynamic categories
  useEffect(() => {
    let isMounted = true;
    blogService.getCategories()
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;
        setCategories((prev) => {
          const names = data.map((c) => c.name);
          const merged = Array.from(new Set([...names, ...prev]));
          return merged;
        });
      })
      .catch((err) => {
        console.warn('Could not load dynamic blog categories, using defaults:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryCreated = (newCat: BlogCategory) => {
    setCategories((prev) => (prev.includes(newCat.name) ? prev : [newCat.name, ...prev]));
    setCategory(newCat.name);
  };

  // Tag Handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Handler
  const handleSubmit = async (publishNow: boolean) => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!content.trim() || content.trim() === '<p></p>') {
      setErrorMsg('Vui lòng nhập nội dung bài viết');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (isEditing && initialBlog) {
        const payload: UpdateBlogPayload = {
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
          coverImage: coverImage || null,
          category,
          tags,
          status: publishNow ? 'PUBLISHED' : status,
        };
        await blogService.updateBlog(initialBlog.id, payload);
      } else {
        const payload: CreateBlogPayload = {
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
          coverImage: coverImage || null,
          category,
          tags,
          publish: publishNow,
        };
        await blogService.createBlog(payload);
      }

      router.push('/admin/blogs');
    } catch (err: any) {
      console.error('Failed to save blog:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <Link href="/admin/blogs" className={styles.secondaryBtn} style={{ marginBottom: '12px', display: 'inline-flex' }}>
            &larr; Quay lại danh sách
          </Link>
          <h1>{isEditing ? `Chỉnh sửa: ${initialBlog?.title}` : 'Viết bài mới'}</h1>
          <p>Sử dụng thanh công cụ rich text để soạn thảo nội dung phong phú cho bài viết.</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '14px 20px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', marginBottom: '24px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className={styles.formGrid}>
        {/* Left Column: Title, Excerpt, Content */}
        <div className={styles.mainColumn}>
          {/* Title & Excerpt Card */}
          <div className={styles.card}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tiêu đề bài viết *</label>
              <input
                type="text"
                placeholder="Ví dụ: Top 10 cuốn sách hay nhất để bắt đầu năm mới"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                style={{ fontSize: '16px', fontWeight: 600 }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tóm tắt ngắn (Excerpt)</label>
              <textarea
                placeholder="Mô tả tóm tắt nội dung bài viết hiển thị ở trang danh sách..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          {/* Content Card with RichTextEditor */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Nội dung bài viết *</h3>
            <RichTextEditor
              value={content}
              onChange={(html) => setContent(html)}
              placeholder="Bắt đầu viết nội dung bài viết tại đây..."
            />
          </div>
        </div>

        {/* Right Column: Actions, Category, Tags, Cover Image */}
        <div className={styles.sideColumn}>
          {/* Actions Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Hành động</h3>
            <div className={styles.actionCardActions}>
              <button
                type="button"
                className={styles.publishBtn}
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
              >
                {isSubmitting ? 'Đang lưu...' : 'Xuất bản ngay'}
              </button>
              <button
                type="button"
                className={styles.draftBtn}
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu bản nháp'}
              </button>
            </div>
            {isEditing && (
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
                Trạng thái hiện tại:{' '}
                <span className={`${styles.statusBadge} ${status === 'PUBLISHED' ? styles.statusPublished : styles.statusDraft}`}>
                  {status === 'PUBLISHED' ? 'Đã xuất bản' : status === 'ARCHIVED' ? 'Đã lưu trữ' : 'Bản nháp'}
                </span>
              </div>
            )}
          </div>

          {/* Cover Image Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Ảnh bìa (Cover Image)</h3>
            <ImageUploadInput
              value={coverImage || ''}
              onChange={(url) => setCoverImage(url || null)}
              placeholder="Chọn hoặc kéo thả ảnh bìa"
            />
            {coverImage && (
              <div className={styles.coverPreviewBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover preview" className={styles.coverImg} />
                <button
                  type="button"
                  className={styles.coverRemoveBtn}
                  onClick={() => setCoverImage(null)}
                >
                  Xóa ảnh bìa
                </button>
              </div>
            )}
            <p className={styles.coverNote}>
              <strong>Gợi ý:</strong> Nếu để trống, hệ thống sẽ tự động lấy ảnh đầu tiên trong bài viết làm ảnh bìa. Nếu bài viết không có ảnh, ảnh bìa mặc định của cửa hàng sẽ được sử dụng.
            </p>
          </div>

          {/* Category & Tags Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Phân loại</h3>
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className={styles.label} style={{ margin: 0 }}>
                  Thể loại / Chuyên mục <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  style={{
                    background: '#FFF5F2',
                    border: '1px solid rgba(238, 77, 45, 0.25)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#EE4D2D',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  title="Thêm danh mục bài viết mới"
                >
                  + Thêm mới
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setIsAddCategoryModalOpen(true);
                    return;
                  }
                  setCategory(e.target.value);
                }}
                className={styles.select}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__add_new__" style={{ color: '#EE4D2D', fontWeight: 600 }}>
                  + Thêm danh mục mới...
                </option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Thẻ tags (Gõ Enter hoặc phẩy để thêm)</label>
              <div className={styles.tagInputWrapper}>
                {tags.map((tag, idx) => (
                  <span key={idx} className={styles.tagChip}>
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className={styles.tagRemoveBtn}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? 'Ví dụ: reviewsach, tieuthuyet...' : ''}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className={styles.tagInputField}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuickAddBlogCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        existingCategories={categories}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
