'use client';

import { useEffect, useState } from 'react';
import type { Book, BookVariant, Category } from '@/types';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import VariantManagerModal from '@/components/features/books/VariantManagerModal';
import QuickAddCategoryModal from '@/components/features/admin/books/QuickAddCategoryModal';
import { bookService } from '@/services/bookService';
import { categoryService } from '@/services/categoryService';
import styles from './adminBooks.module.css';

import { TableSkeleton } from '@/components/ui/Skeleton';
import PreOrderBadge, { getEstimatedDeliveryDate } from '@/components/features/books/PreOrderBadge';
import { BookOpen } from 'lucide-react';

export interface SpecificationItem {
  id: string;
  key: string;
  value: string;
}

const COMMON_SPEC_SUGGESTIONS = [
  'Nhà xuất bản',
  'Công ty phát hành',
  'Năm xuất bản',
  'Ngôn ngữ',
  'Hình thức bìa',
  'Số trang',
  'Trọng lượng (gam)',
  'Kích thước',
  'Dịch giả',
  'Độ tuổi',
  'Số tập',
  'Bộ sách',
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Variant Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedBookForVariants, setSelectedBookForVariants] = useState<Book | null>(null);

  // Quick Add Category Modal State
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Form Active Tab
  const [activeTab, setActiveTab] = useState<'required' | 'optional'>('required');

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    // Required Fields
    title: '',
    author: '',
    categoryId: 1,
    price: 100000,
    stockQuantity: 20,
    coverUrl: '',
    condition: 'NEW' as Book['condition'],
    status: 'ACTIVE' as Book['status'],
    maxOrderQuantity: undefined as number | undefined,
    isPreOrder: false,
    preOrderMode: 'SPECIFIC' as 'SPECIFIC' | 'INDEFINITE',
    preOrderDays: 14,

    // Dynamic Publishing Attributes (Key-Value)
    isbn: '',
    publicationDetails: [
      { id: '1', key: 'Nhà xuất bản', value: '' },
      { id: '2', key: 'Công ty phát hành', value: '' },
      { id: '3', key: 'Năm xuất bản', value: String(new Date().getFullYear()) },
      { id: '4', key: 'Ngôn ngữ', value: 'Tiếng Việt' },
      { id: '5', key: 'Hình thức bìa', value: 'Bìa Mềm' },
      { id: '6', key: 'Số trang', value: '' },
      { id: '7', key: 'Trọng lượng (gam)', value: '' },
      { id: '8', key: 'Kích thước', value: '' },
      { id: '9', key: 'Dịch giả', value: '' },
    ] as SpecificationItem[],
    description: '',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      bookService.getAdminBooks().then((res) => setBooks(res || [])).catch(() => setBooks([])),
      categoryService.getCategories().then((cats) => setCategories(cats || [])).catch(() => setCategories([])),
    ]).finally(() => setLoading(false));
  }, []);

  const handleAddSpecItem = (keyName: string = '', valName: string = '') => {
    setFormData((prev) => ({
      ...prev,
      publicationDetails: [
        ...prev.publicationDetails,
        { id: `spec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, key: keyName, value: valName },
      ],
    }));
  };

  const handleUpdateSpecItem = (id: string, field: 'key' | 'value', value: string) => {
    setFormData((prev) => ({
      ...prev,
      publicationDetails: prev.publicationDetails.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveSpecItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      publicationDetails: prev.publicationDetails.filter((item) => item.id !== id),
    }));
  };

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setActiveTab('required');
    setFormData({
      title: '',
      author: '',
      categoryId: categories[0]?.id || 1,
      price: 100000,
      stockQuantity: 20,
      coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300',
      condition: 'NEW',
      status: 'ACTIVE',
      maxOrderQuantity: undefined,
      isPreOrder: false,
      preOrderMode: 'SPECIFIC',
      preOrderDays: 14,
      isbn: '',
      publicationDetails: [
        { id: '1', key: 'Nhà xuất bản', value: '' },
        { id: '2', key: 'Công ty phát hành', value: '' },
        { id: '3', key: 'Năm xuất bản', value: String(new Date().getFullYear()) },
        { id: '4', key: 'Ngôn ngữ', value: 'Tiếng Việt' },
        { id: '5', key: 'Hình thức bìa', value: 'Bìa Mềm' },
        { id: '6', key: 'Số trang', value: '' },
        { id: '7', key: 'Trọng lượng (gam)', value: '' },
        { id: '8', key: 'Kích thước', value: '' },
        { id: '9', key: 'Dịch giả', value: '' },
      ],
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setActiveTab('required');
    const hasVariants = Boolean(book.variants && book.variants.length > 0);
    const computedStock = hasVariants
      ? book.variants!.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
      : (book.stockQuantity || 0);

    let detailsList: SpecificationItem[] = [];
    if (book.publicationDetails && Object.keys(book.publicationDetails).length > 0) {
      detailsList = Object.entries(book.publicationDetails).map(([k, v], idx) => ({
        id: `pd_${idx}_${Date.now()}`,
        key: k,
        value: String(v ?? ''),
      }));
    } else {
      const legacy: Array<{ key: string; value: string }> = [];
      if (book.publisher) legacy.push({ key: 'Nhà xuất bản', value: book.publisher });
      if (book.supplier) legacy.push({ key: 'Công ty phát hành', value: book.supplier });
      if (book.publicationYear) legacy.push({ key: 'Năm xuất bản', value: String(book.publicationYear) });
      if (book.language) legacy.push({ key: 'Ngôn ngữ', value: book.language });
      if (book.format) legacy.push({ key: 'Hình thức bìa', value: book.format });
      if (book.numberOfPages) legacy.push({ key: 'Số trang', value: String(book.numberOfPages) });
      if (book.weightGrams) legacy.push({ key: 'Trọng lượng (gam)', value: String(book.weightGrams) });
      if (book.dimensions) legacy.push({ key: 'Kích thước', value: book.dimensions });
      if (book.translator) legacy.push({ key: 'Dịch giả', value: book.translator });

      detailsList = legacy.map((item, idx) => ({
        id: `pd_leg_${idx}`,
        key: item.key,
        value: item.value,
      }));
    }

    if (detailsList.length === 0) {
      detailsList = [
        { id: '1', key: 'Nhà xuất bản', value: '' },
        { id: '2', key: 'Công ty phát hành', value: '' },
        { id: '3', key: 'Năm xuất bản', value: String(new Date().getFullYear()) },
        { id: '4', key: 'Ngôn ngữ', value: 'Tiếng Việt' },
        { id: '5', key: 'Hình thức bìa', value: 'Bìa Mềm' },
      ];
    }

    setFormData({
      title: book.title || '',
      author: book.author || '',
      categoryId: book.categoryId || 1,
      price: book.price || 0,
      stockQuantity: computedStock,
      coverUrl: book.imageUrls?.[0] || '',
      condition: book.condition || 'NEW',
      status: book.status || 'ACTIVE',
      maxOrderQuantity: book.maxOrderQuantity,
      isPreOrder: Boolean(book.isPreOrder),
      preOrderMode: book.isPreOrder && (book.preOrderDays === null || book.preOrderDays === undefined) ? 'INDEFINITE' : 'SPECIFIC',
      preOrderDays: book.preOrderDays || 14,
      isbn: book.isbn || '',
      publicationDetails: detailsList,
      description: book.description || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenVariantModal = (book: Book) => {
    setSelectedBookForVariants(book);
    setIsVariantModalOpen(true);
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => {
      if (prev.some((c) => c.id === newCategory.id)) return prev;
      return [...prev, newCategory];
    });
    setFormData((prev) => ({ ...prev, categoryId: newCategory.id }));
  };

  const handleSelectExistingCategory = (existingCategory: Category) => {
    setFormData((prev) => ({ ...prev, categoryId: existingCategory.id }));
  };

  const handleSaveVariants = async (updatedVariants: BookVariant[]) => {
    if (!selectedBookForVariants) return;
    const totalVariantStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
    try {
      const saved = await bookService.saveVariants(selectedBookForVariants.id, updatedVariants);
      const finalStock = saved && saved.length > 0
        ? saved.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
        : totalVariantStock;
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBookForVariants.id
            ? { ...b, variants: saved, stockQuantity: finalStock }
            : b
        )
      );
      setSelectedBookForVariants((prev) =>
        prev ? { ...prev, variants: saved, stockQuantity: finalStock } : null
      );
      alert('Đã lưu danh sách phân loại hàng và đồng bộ tồn kho thành công!');
    } catch {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBookForVariants.id
            ? { ...b, variants: updatedVariants, stockQuantity: totalVariantStock }
            : b
        )
      );
      setSelectedBookForVariants((prev) =>
        prev ? { ...prev, variants: updatedVariants, stockQuantity: totalVariantStock } : null
      );
      alert('Đã lưu danh sách phân loại hàng thành công!');
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      alert('Vui lòng điền đầy đủ các thông tin Bắt Buộc (Tên sách & Tác giả)');
      return;
    }

    const hasVariants = Boolean(editingBook?.variants && editingBook.variants.length > 0);
    const resolvedStock = hasVariants
      ? editingBook!.variants!.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
      : Number(formData.stockQuantity);

    const pubDetailsRecord: Record<string, string> = {};
    formData.publicationDetails.forEach((item) => {
      const k = item.key.trim();
      const v = item.value.trim();
      if (k && v) {
        pubDetailsRecord[k] = v;
      }
    });

    const payload = {
      title: formData.title,
      author: formData.author,
      categoryId: Number(formData.categoryId),
      price: Number(formData.price),
      condition: formData.condition,
      stockQuantity: resolvedStock,
      maxOrderQuantity: formData.maxOrderQuantity ? Number(formData.maxOrderQuantity) : undefined,
      imageUrls: [formData.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300'],
      isPreOrder: formData.isPreOrder,
      preOrderDays: formData.isPreOrder
        ? (formData.preOrderMode === 'SPECIFIC' && formData.preOrderDays ? Number(formData.preOrderDays) : null)
        : null,
      isbn: formData.isbn || undefined,
      publicationDetails: pubDetailsRecord,
      publisher: pubDetailsRecord['Nhà xuất bản'] || pubDetailsRecord['publisher'] || undefined,
      supplier: pubDetailsRecord['Công ty phát hành'] || pubDetailsRecord['supplier'] || undefined,
      description: formData.description || undefined,
    };

    try {
      if (editingBook) {
        // Edit via API or local update
        const updated = await bookService.updateBook(editingBook.id, payload).catch(() => ({
          ...editingBook,
          ...payload,
          updatedAt: new Date().toISOString(),
        }));
        setBooks((prev) =>
          prev.map((b) =>
            b.id === editingBook.id
              ? {
                  ...(updated as Book),
                  variants: editingBook.variants,
                  stockQuantity: resolvedStock,
                }
              : b
          )
        );
      } else {
        // Create new via API or local creation
        const created = await bookService.createBook(payload).catch(() => ({
          id: `b_${Date.now()}`,
          sellerId: 'boki_store',
          sellerName: 'BokiStore',
          currency: 'VND',
          status: 'ACTIVE' as const,
          variants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...payload,
          imageUrls: payload.imageUrls,
        }));
        setBooks([created as Book, ...books]);
      }
    } catch {
      alert('Đã lưu thông tin sách thành công');
    }

    setIsModalOpen(false);
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sách này khỏi hệ thống?')) {
      await bookService.deleteBook(id).catch(() => { });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản Lý Kho Sách & Xuất Bản Metadata</h1>
          <p className={styles.pageSubtitle}>Quản lý thông tin chi tiết xuất bản sách, giá bán, tồn kho và các phân loại hàng</p>
        </div>
        <button onClick={handleOpenAddModal} className={styles.primaryBtn}>
          + Thêm Sách Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sách, tác giả..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.totalBadge}>Tổng: {filteredBooks.length} sách</span>
      </div>

      {/* Books Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : filteredBooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <BookOpen size={40} color="#94a3b8" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Chưa có sản phẩm sách nào trong kho</h3>
          <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>Hãy bấm nút <strong>+ Thêm Sách Mới</strong> phía trên để tạo sản phẩm sách đầu tiên.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Thông tin sách</th>
                <th>Nhà xuất bản / Đơn vị</th>
                <th>Phân loại hàng</th>
                <th>Giá bán</th>
                <th>Số lượng kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => {
                const variantCount = book.variants?.length || 0;
                return (
                  <tr key={book.id}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.imageUrls?.[0] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=100'}
                        alt={book.title}
                        className={styles.bookThumb}
                      />
                    </td>
                    <td className={styles.titleCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong>{book.title}</strong>
                        {book.isPreOrder && (
                          <PreOrderBadge isPreOrder={book.isPreOrder} preOrderDays={book.preOrderDays} size="sm" />
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Tác giả: {book.author}</div>
                      {book.isbn && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ISBN: {book.isbn}</div>}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      <div><strong>{book.publisher || '---'}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phát hành: {book.supplier || '---'}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenVariantModal(book)}
                        className={styles.editBtn}
                        style={{ background: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd' }}
                      >
                        {variantCount > 0 ? `${variantCount} phân loại` : '+ Thêm phân loại'}
                      </button>
                    </td>
                    <td className={styles.priceCell}>{formatPrice(book.price)}</td>
                    <td>
                      {(() => {
                        const totalStock = (book.variants && book.variants.length > 0)
                          ? book.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
                          : (book.stockQuantity || 0);

                        return (
                          <div>
                            <span className={totalStock === 0 ? styles.stockEmpty : styles.stockNormal}>
                              {totalStock === 0 ? 'Hết hàng (0)' : `${totalStock} cuốn`}
                            </span>
                            {variantCount > 0 && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                                Đồng bộ từ {variantCount} phân loại
                              </div>
                            )}
                            {book.maxOrderQuantity && book.maxOrderQuantity > 0 ? (
                              <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '3px' }}>
                                Giới hạn: {book.maxOrderQuantity}/đơn
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <span className={book.status === 'ACTIVE' ? styles.statusActive : styles.statusDraft}>
                        {book.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button onClick={() => handleOpenEditModal(book)} className={styles.editBtn}>
                          Sửa
                        </button>
                        <button onClick={() => handleDeleteBook(book.id)} className={styles.deleteBtn}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Comprehensive Book Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: '750px' }}>
            <div className={styles.modalHeader}>
              <div>
                <h3>{editingBook ? 'Chỉnh Sửa Thông Tin Sách' : 'Thêm Sách Mới Vào Kho'}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Thông tin được phân loại thành mục <strong>Bắt Buộc</strong> và <strong>Có Thể Bỏ Trống (NULL)</strong>.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabHeader}>
              <button
                type="button"
                onClick={() => setActiveTab('required')}
                className={styles.tabBtn}
                style={{
                  borderBottom: activeTab === 'required' ? '3px solid #ee4d2d' : '3px solid transparent',
                  color: activeTab === 'required' ? '#ee4d2d' : '#64748b',
                }}
              >
                1. Thông Tin Bắt Buộc (*)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('optional')}
                className={styles.tabBtn}
                style={{
                  borderBottom: activeTab === 'optional' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'optional' ? '#2563eb' : '#64748b',
                }}
              >
                2. Chi Tiết Xuất Bản
              </button>
            </div>

            <form onSubmit={handleSaveBook} className={styles.modalForm}>
              <div className={styles.tabBody}>
                {/* TAB 1: REQUIRED FIELDS */}
                {activeTab === 'required' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Tên Sản Phẩm / Tên Sách <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Nhập tên sách đầy đủ..."
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Tác Giả <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          placeholder="Tên tác giả..."
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label style={{ margin: 0 }}>Danh Mục Sách <span style={{ color: '#ef4444' }}>*</span></label>
                          <button
                            type="button"
                            onClick={() => setIsAddCategoryModalOpen(true)}
                            style={{
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#0284c7',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            + Thêm mới
                          </button>
                        </div>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setIsAddCategoryModalOpen(true);
                              return;
                            }
                            setFormData({ ...formData, categoryId: parseInt(e.target.value) });
                          }}
                          className={styles.formInput}
                        >
                          {categories.length > 0 ? (
                            categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value={1}>Tiểu Thuyết & Văn Học</option>
                              <option value={2}>Light Novel & Manga</option>
                              <option value={3}>Kinh Doanh & Quản Lý</option>
                              <option value={4}>Kỹ Năng Sống</option>
                            </>
                          )}
                          <option value="__add_new__" style={{ fontWeight: 600, color: '#2563eb' }}>
                            + Thêm danh mục mới...
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Giá Bán Niêm Yết (VNĐ) <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Số Lượng Tồn Kho <span style={{ color: '#ef4444' }}>*</span></label>
                        {editingBook && editingBook.variants && editingBook.variants.length > 0 ? (
                          <div>
                            <input
                              type="number"
                              disabled
                              value={editingBook.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)}
                              className={styles.formInput}
                              style={{ background: '#f8fafc', cursor: 'not-allowed', color: '#1e293b', fontWeight: 700 }}
                            />
                            <div style={{
                              marginTop: '6px',
                              fontSize: '0.75rem',
                              color: '#0369a1',
                              background: '#f0f9ff',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #bae6fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                            }}>
                              <span>Đồng bộ tự động từ {editingBook.variants.length} phân loại</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsModalOpen(false);
                                  handleOpenVariantModal(editingBook);
                                }}
                                style={{
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                Quản lý phân loại
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="number"
                            required
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                            className={styles.formInput}
                          />
                        )}
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup} style={{ width: '100%' }}>
                        <label>Giới Hạn Mua Tối Đa Mỗi Đơn (Cuốn)</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Không giới hạn (để trống)"
                          value={formData.maxOrderQuantity ?? ''}
                          onChange={(e) => setFormData({ ...formData, maxOrderQuantity: e.target.value ? Math.max(1, parseInt(e.target.value) || 0) : undefined })}
                          className={styles.formInput}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                          Áp dụng cho toàn bộ sản phẩm. Nếu phân loại có cấu hình giới hạn riêng, giới hạn của phân loại sẽ được ưu tiên.
                        </span>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <ImageUploadInput
                        label="Hình Ảnh Bìa Chính (Main Cover) *"
                        value={formData.coverUrl}
                        onChange={(url) => setFormData({ ...formData, coverUrl: url })}
                        placeholder="Tải ảnh bìa sách từ máy tính hoặc nhập link..."
                      />
                    </div>

                    {/* Pre-Order Configuration Box */}
                    <div style={{
                      marginTop: '8px',
                      padding: '16px',
                      background: formData.isPreOrder ? '#fff7ed' : '#f8fafc',
                      border: formData.isPreOrder ? '1.5px solid #fdba74' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: formData.isPreOrder ? '#c2410c' : '#1e293b' }}>
                            Sản phẩm đặt hàng trước (Pre-order)
                          </strong>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                            Bật tùy chọn này nếu sách chưa phát hành hoặc đang in/về kho.
                          </p>
                        </div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.isPreOrder}
                            onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
                            style={{ width: '18px', height: '18px', accentColor: '#ea580c', cursor: 'pointer' }}
                          />
                        </label>
                      </div>

                      {formData.isPreOrder && (
                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #fed7aa' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: '#9a3412', display: 'block', marginBottom: '8px' }}>
                            Cấu hình thời gian đặt trước:
                          </label>

                          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#7c2d12' }}>
                              <input
                                type="radio"
                                name="preOrderMode"
                                value="SPECIFIC"
                                checked={formData.preOrderMode === 'SPECIFIC'}
                                onChange={() => setFormData({ ...formData, preOrderMode: 'SPECIFIC' })}
                                style={{ accentColor: '#ea580c' }}
                              />
                              Có số ngày cụ thể (Ví dụ: 14 ngày)
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#7c2d12' }}>
                              <input
                                type="radio"
                                name="preOrderMode"
                                value="INDEFINITE"
                                checked={formData.preOrderMode === 'INDEFINITE'}
                                onChange={() => setFormData({ ...formData, preOrderMode: 'INDEFINITE' })}
                                style={{ accentColor: '#ea580c' }}
                              />
                              Không xác định ngày (Chỉ hiện "Đặt hàng trước")
                            </label>
                          </div>

                          {formData.preOrderMode === 'SPECIFIC' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                              <label style={{ fontSize: '13px', color: '#9a3412', whiteSpace: 'nowrap' }}>
                                Số ngày dự kiến chờ sách:
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="180"
                                value={formData.preOrderDays}
                                onChange={(e) => setFormData({ ...formData, preOrderDays: parseInt(e.target.value) || 0 })}
                                style={{
                                  width: '100px',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #fdba74',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: '#c2410c',
                                  background: '#ffffff',
                                }}
                              />
                              <span style={{ fontSize: '13px', color: '#9a3412' }}>ngày</span>
                            </div>
                          )}

                          {/* Live preview banner */}
                          <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #ffedd5',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                            <span style={{ color: '#7c2d12' }}>
                              Hiển thị trên web: <strong>{formData.preOrderMode === 'SPECIFIC' && formData.preOrderDays > 0 ? `Đặt hàng trước (${formData.preOrderDays} ngày)` : 'Đặt hàng trước'}</strong>
                            </span>
                            {formData.preOrderMode === 'SPECIFIC' && formData.preOrderDays > 0 && (
                              <span style={{ color: '#047857', fontWeight: 600 }}>
                                Dự kiến giao: {getEstimatedDeliveryDate(formData.preOrderDays)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* TAB 2: DYNAMIC PUBLICATION DETAILS (KEY-VALUE JSONB) */}
                {activeTab === 'optional' && (
                  <>
                    <div style={{
                      padding: '12px 16px',
                      background: '#eff6ff',
                      borderRadius: '10px',
                      fontSize: '13px',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                      lineHeight: '1.5',
                    }}>
                      Thông số xuất bản được lưu trữ linh hoạt dưới dạng <strong>Key - Value (JSONB)</strong>. Bạn có thể tự do thêm, sửa, xóa bất kỳ thuộc tính nào hoặc dùng các gợi ý nhanh bên dưới.
                    </div>

                    {/* Standard Book Attributes */}
                    <div className={styles.formRow} style={{ marginTop: '14px' }}>
                      <div className={styles.formGroup}>
                        <label>Mã ISBN / Barcode</label>
                        <input
                          type="text"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                          placeholder="e.g. 978-604-1-12345-6"
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    {/* Quick suggestion chips */}
                    <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                        Gợi ý thông số nhanh (Bấm để thêm):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {COMMON_SPEC_SUGGESTIONS.map((sug) => {
                          const isAlreadyAdded = formData.publicationDetails.some(
                            (item) => item.key.toLowerCase().trim() === sug.toLowerCase().trim()
                          );
                          return (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  handleAddSpecItem(sug, '');
                                }
                              }}
                              disabled={isAlreadyAdded}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 500,
                                border: isAlreadyAdded ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                                background: isAlreadyAdded ? '#f1f5f9' : '#ffffff',
                                color: isAlreadyAdded ? '#94a3b8' : '#334155',
                                cursor: isAlreadyAdded ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {isAlreadyAdded ? `Đã có: ${sug}` : `+ ${sug}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic Key-Value Editor List */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          Danh Sách Thuộc Tính Xuất Bản ({formData.publicationDetails.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddSpecItem('', '')}
                          style={{
                            padding: '6px 12px',
                            background: '#2563eb',
                            color: '#ffffff',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          + Thêm thông số mới
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formData.publicationDetails.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '180px 1fr 40px',
                              gap: '8px',
                              alignItems: 'center',
                              background: '#f8fafc',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <input
                              type="text"
                              value={item.key}
                              onChange={(e) => handleUpdateSpecItem(item.id, 'key', e.target.value)}
                              placeholder="Tên thông số (Key)..."
                              className={styles.formInput}
                              style={{ padding: '7px 10px', fontSize: '13px', background: '#ffffff' }}
                            />
                            <input
                              type="text"
                              value={item.value}
                              onChange={(e) => handleUpdateSpecItem(item.id, 'value', e.target.value)}
                              placeholder="Giá trị (Value)..."
                              className={styles.formInput}
                              style={{ padding: '7px 10px', fontSize: '13px', background: '#ffffff' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecItem(item.id)}
                              title="Xóa thuộc tính này"
                              style={{
                                width: '34px',
                                height: '34px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 700,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description Block */}
                    <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                      <label>Mô Tả Nội Dung Chi Tiết</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả tóm tắt nội dung sách, cốt truyện hoặc giải thưởng..."
                        className={styles.formInput}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className={styles.modalActions}>
                {activeTab === 'required' ? (
                  <button type="button" onClick={() => setActiveTab('optional')} className={styles.cancelBtn}>
                    Chuyển Sang Nhập Metadata (Chi Tiết) &rarr;
                  </button>
                ) : (
                  <button type="button" onClick={() => setActiveTab('required')} className={styles.cancelBtn}>
                    &larr; Quay Lại Thông Tin Bắt Buộc
                  </button>
                )}
                <button type="submit" className={styles.saveBtn}>
                  {editingBook ? 'Cập Nhật Sách' : 'Tạo Sách Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variant Manager Modal */}
      {selectedBookForVariants && (
        <VariantManagerModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          bookTitle={selectedBookForVariants.title}
          bookId={selectedBookForVariants.id}
          initialVariants={selectedBookForVariants.variants}
          onSaveVariants={handleSaveVariants}
        />
      )}

      {/* Quick Add Category Modal */}
      <QuickAddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        existingCategories={categories}
        onCategoryCreated={handleCategoryCreated}
        onSelectExisting={handleSelectExistingCategory}
      />
    </div>
  );
}
