import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 12, 16, 24],
  itemLabel,
  className = '',
}) {
  const { t } = useTranslation();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems <= 0) return null;

  const startIdx = (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;

    const left = safePage - delta;
    const right = safePage + delta + 1;

    let prev = 0;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        if (prev && i - prev === 2) {
          pages.push(prev + 1);
        } else if (prev && i - prev > 2) {
          pages.push('...');
        }
        pages.push(i);
        prev = i;
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  const labelText = itemLabel || t('pagination.items', 'mục');

  return (
    <nav
      className={`fv-pagination-bar d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4 pt-3 ${className}`}
      aria-label="Page navigation"
    >
      {/* Items range info & page size picker */}
      <div className="d-flex align-items-center flex-wrap gap-2 text-secondary small">
        <span className="fv-pagination-info">
          {t('pagination.showing', 'Hiển thị')}{' '}
          <strong className="text-body fw-bold">{startIdx} - {endIdx}</strong>{' '}
          {t('pagination.of', 'trên')}{' '}
          <strong className="text-danger fw-bold">{totalItems}</strong> {labelText}
        </span>

        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-1 ms-sm-2">
            <select
              className="fv-pagination-select form-select form-select-sm"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                if (onPageChange) onPageChange(1);
              }}
              aria-label="Items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} {t('pagination.perPage', '/ trang')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="d-flex align-items-center gap-1 fv-pagination-controls">
          {/* First page button */}
          <button
            type="button"
            className="fv-page-btn fv-page-nav-btn"
            disabled={safePage <= 1}
            onClick={() => onPageChange(1)}
            title={t('pagination.first', 'Trang đầu')}
            aria-label={t('pagination.first', 'Trang đầu')}
          >
            <i className="bi bi-chevron-double-left"></i>
          </button>

          {/* Previous page button */}
          <button
            type="button"
            className="fv-page-btn fv-page-nav-btn"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            title={t('pagination.prev', 'Trước')}
            aria-label={t('pagination.prev', 'Trước')}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          {/* Page number buttons */}
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="fv-page-ellipsis">
                  •••
                </span>
              );
            }
            const isCurrent = p === safePage;
            return (
              <button
                key={p}
                type="button"
                className={`fv-page-btn fv-page-num-btn ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {p}
              </button>
            );
          })}

          {/* Next page button */}
          <button
            type="button"
            className="fv-page-btn fv-page-nav-btn"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            title={t('pagination.next', 'Sau')}
            aria-label={t('pagination.next', 'Sau')}
          >
            <i className="bi bi-chevron-right"></i>
          </button>

          {/* Last page button */}
          <button
            type="button"
            className="fv-page-btn fv-page-nav-btn"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            title={t('pagination.last', 'Trang cuối')}
            aria-label={t('pagination.last', 'Trang cuối')}
          >
            <i className="bi bi-chevron-double-right"></i>
          </button>
        </div>
      )}
    </nav>
  );
}
