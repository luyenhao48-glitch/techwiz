import React from 'react';

export default function AdminPagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 12,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 12, 24, 48],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems === 0) return null;

  const startIdx = (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(safePage * pageSize, totalItems);

  // Generate pagination page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Number of pages to show around current page

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

  return (
    <div className="fv-admin-pagination-bar d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4 pt-3 border-top border-secondary border-opacity-25">
      {/* Items info */}
      <div className="d-flex align-items-center gap-3 text-secondary small">
        <span>
          Hiển thị <strong className="text-white">{startIdx} - {endIdx}</strong> trên{' '}
          <strong className="text-info">{totalItems}</strong> mục
        </span>

        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-1.5 ms-2">
            <span className="d-none d-sm-inline">Hiển thị:</span>
            <select
              className="fv-admin-pagination-select form-select form-select-sm"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                if (onPageChange) onPageChange(1);
              }}
              style={{
                width: 'auto',
                padding: '2px 24px 2px 8px',
                fontSize: '0.8rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#e2e8f0',
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page controls */}
      <div className="d-flex align-items-center gap-1.5 fv-admin-page-btns">
        {/* First & Prev */}
        <button
          type="button"
          className="fv-admin-page-btn"
          disabled={safePage <= 1}
          onClick={() => onPageChange(1)}
          title="Trang đầu"
        >
          <i className="bi bi-chevron-double-left"></i>
        </button>
        <button
          type="button"
          className="fv-admin-page-btn"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          title="Trang trước"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* Numeric Buttons */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="fv-admin-page-ellipsis">
                ...
              </span>
            );
          }
          const isCurrent = p === safePage;
          return (
            <button
              key={p}
              type="button"
              className={`fv-admin-page-btn ${isCurrent ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          );
        })}

        {/* Next & Last */}
        <button
          type="button"
          className="fv-admin-page-btn"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          title="Trang sau"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
        <button
          type="button"
          className="fv-admin-page-btn"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Trang cuối"
        >
          <i className="bi bi-chevron-double-right"></i>
        </button>
      </div>
    </div>
  );
}
