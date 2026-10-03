import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import type { OrphanFile } from '@/types/storage';
import { formatDate } from '@/types/storage';
import styles from './StorageOrphanTable.module.css';

interface StorageOrphanTableProps {
  orphans: OrphanFile[];
  onSelectDelete: (file: OrphanFile) => void;
}

const ITEMS_PER_PAGE = 10;

export default function StorageOrphanTable({
  orphans,
  onSelectDelete,
}: StorageOrphanTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrphans = useMemo(() => {
    if (!searchTerm.trim()) return orphans;
    const term = searchTerm.toLowerCase();
    return orphans.filter((file) => file.key.toLowerCase().includes(term));
  }, [orphans, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrphans.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrphans = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrphans.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrphans, validCurrentPage]);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.headerTitleArea}>
          <h2 className={styles.headerTitle}>Danh sách tệp mồ côi cần dọn dẹp</h2>
          <span className={styles.badge}>{filteredOrphans.length} tệp</span>
        </div>

        <div className={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên file / key..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {filteredOrphans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ShieldCheck size={32} />
          </div>
          <h3 className={styles.emptyTitle}>Kho lưu trữ sạch sẽ!</h3>
          <p className={styles.emptyDesc}>
            {searchTerm
              ? 'Không tìm thấy tệp mồ côi nào khớp với từ khóa tìm kiếm.'
              : 'Không có tệp rác nào trên hệ thống. Tất cả các tệp đều được liên kết hợp lệ.'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: '80px' }}>Ảnh</th>
                  <th className={styles.th}>Đường dẫn / Tên tệp</th>
                  <th className={styles.th} style={{ width: '130px' }}>Dung lượng</th>
                  <th className={styles.th} style={{ width: '180px' }}>Thời gian tải lên</th>
                  <th className={styles.th} style={{ width: '110px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrphans.map((file) => (
                  <tr key={file.key} className={styles.row}>
                    <td className={styles.td}>
                      <div className={styles.thumbWrapper}>
                        {file.url ? (
                          <img
                            src={file.url}
                            alt={file.key}
                            className={styles.thumbImg}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon size={20} color="#94a3b8" />
                        )}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.keyCell}>
                        <span className={styles.keyText}>{file.key}</span>
                        <div className={styles.keyActions}>
                          <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={() => handleCopy(file.key)}
                            title="Sao chép tên key"
                          >
                            {copiedKey === file.key ? (
                              <>
                                <Check size={13} color="#16a34a" />
                                <span style={{ color: '#16a34a' }}>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                          {file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.actionLink}
                            >
                              <ExternalLink size={13} />
                              <span>Mở tệp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.sizeBadge}>{file.sizeFormatted}</span>
                    </td>
                    <td className={styles.td}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {formatDate(file.lastModified)}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onSelectDelete(file)}
                        title="Xóa tệp này"
                      >
                        <Trash2 size={14} />
                        <span>Xóa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Trang {validCurrentPage} / {totalPages} ({filteredOrphans.length} tệp)
              </span>
              <div className={styles.pageBtns}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Sau</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
