import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../services/dataService.js';
import { resolveAdminImage, handleImageFallback } from '../../utils/adminImageHelper.js';
import AdminPagination from '../../components/common/AdminPagination.jsx';
import AdminCategoryTabs from '../../components/common/AdminCategoryTabs.jsx';
import AdminImageLightbox from '../../components/common/AdminImageLightbox.jsx';
import { ADMIN_CATEGORY_OPTIONS as CATEGORIES } from '../../constants.js';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

export default function AdminEvents({ onShowToast }) {
  const [items, setItems] = useState(() => dataService.getRawEvents());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    category: 'anime',
    titleVi: '',
    titleEn: '',
    locationVi: '',
    locationEn: '',
    date: '',
    imageUrl: '',
    descVi: '',
    descEn: '',
  });

  const reloadData = () => setItems(dataService.getRawEvents());

  useEffect(() => {
    const handleDataChange = () => reloadData();
    window.addEventListener('fv_data_change', handleDataChange);
    return () => window.removeEventListener('fv_data_change', handleDataChange);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach((item) => {
      const cat = item.category || 'anime';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Filter items based on category, status, and search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCat === 'all' || item.category === selectedCat;
      const matchStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'upcoming' && item.date >= today) ||
        (selectedStatus === 'past' && item.date < today);

      const titleVi = item.title?.vi || item.title || '';
      const titleEn = item.title?.en || '';
      const loc = item.location?.vi || item.location || '';
      const matchSearch =
        !searchTerm.trim() ||
        titleVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCat && matchStatus && matchSearch;
    });
  }, [items, searchTerm, selectedCat, selectedStatus, today]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCat, selectedStatus]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `event-${Date.now()}`,
      category: 'anime',
      titleVi: '',
      titleEn: '',
      locationVi: 'Tokyo Big Sight, Nhật Bản',
      locationEn: 'Tokyo Big Sight, Japan',
      date: '2026-10-15',
      imageUrl: '/image/onepice_thamnail.jpg',
      descVi: '',
      descEn: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      category: item.category || 'anime',
      titleVi: item.title?.vi || (typeof item.title === 'string' ? item.title : ''),
      titleEn: item.title?.en || (typeof item.title === 'string' ? item.title : ''),
      locationVi: item.location?.vi || (typeof item.location === 'string' ? item.location : ''),
      locationEn: item.location?.en || (typeof item.location === 'string' ? item.location : ''),
      date: item.date || '',
      imageUrl: item.imageUrl || resolveAdminImage(item, item.category),
      descVi: item.description?.vi || (typeof item.description === 'string' ? item.description : ''),
      descEn: item.description?.en || (typeof item.description === 'string' ? item.description : ''),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    setConfirmState({
      title: 'Xóa sự kiện?',
      message: `Bạn có chắc chắn muốn xóa sự kiện "${title}" (ID: ${id}) không? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa sự kiện',
      variant: 'danger',
      onConfirm: () => {
        dataService.deleteEvent(id);
        reloadData();
        if (onShowToast) onShowToast(`Đã xóa sự kiện "${title}" thành công.`, 'success');
        setConfirmState(null);
      },
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.titleVi.trim()) {
      if (onShowToast) onShowToast('Vui lòng nhập tên sự kiện.', 'error');
      return;
    }

    const savedItem = {
      id: formData.id,
      category: formData.category,
      title: {
        vi: formData.titleVi.trim(),
        en: formData.titleEn.trim() || formData.titleVi.trim(),
        hi: formData.titleEn.trim() || formData.titleVi.trim(),
      },
      location: {
        vi: formData.locationVi.trim(),
        en: formData.locationEn.trim() || formData.locationVi.trim(),
        hi: formData.locationEn.trim() || formData.locationVi.trim(),
      },
      date: formData.date || '2026-10-15',
      imageUrl: formData.imageUrl.trim() || resolveAdminImage({ category: formData.category, id: formData.id }),
      description: {
        vi: formData.descVi.trim(),
        en: formData.descEn.trim() || formData.descVi.trim(),
        hi: formData.descEn.trim() || formData.descVi.trim(),
      },
    };

    dataService.saveEvent(savedItem);
    reloadData();
    setIsModalOpen(false);
    if (onShowToast) {
      onShowToast(`Đã lưu sự kiện "${savedItem.title.vi}" thành công!`, 'success');
    }
  };

  return (
    <div className="admin-events-module">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-calendar-event" style={{ color: '#00f5d4' }}></i>
            Quản lý Sự Kiện Fandom
          </h3>
          <p className="text-secondary small mb-0">
            Hiển thị <strong className="text-white">{filteredItems.length}</strong> / {items.length} đại nhạc hội, triển lãm và hội chợ văn hóa.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* View Mode Switcher */}
          <div className="fv-admin-view-switcher">
            <button
              type="button"
              className={`fv-admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Chế độ thẻ ảnh sự kiện trực quan"
            >
              <i className="bi bi-grid-fill"></i> Thẻ Sự Kiện
            </button>
            <button
              type="button"
              className={`fv-admin-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Chế độ danh sách bảng"
            >
              <i className="bi bi-list-ul"></i> Bảng
            </button>
          </div>

          <button type="button" className="fv-admin-btn-primary" onClick={handleOpenAdd}>
            <i className="bi bi-plus-lg"></i> Thêm sự kiện mới
          </button>
        </div>
      </div>

      {/* Category Tabs Filter */}
      <AdminCategoryTabs
        categories={CATEGORIES}
        selectedCategory={selectedCat}
        onSelectCategory={(catId) => setSelectedCat(catId)}
        itemCounts={categoryCounts}
        totalCount={items.length}
      />

      {/* Filter and Search Bar */}
      <div className="fv-admin-card mb-4 p-3">
        <div className="row g-2">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 translate-middle-y text-secondary ms-3"></i>
              <input
                type="text"
                className="fv-admin-input ps-5"
                placeholder="Tìm kiếm theo tên hoặc địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-4">
            <select
              className="fv-admin-select"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} {c.id === 'all' ? `(${items.length})` : `(${categoryCounts[c.id] || 0})`}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="fv-admin-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="upcoming">⚡ Sắp diễn ra (Upcoming)</option>
              <option value="past">🕰️ Đã diễn ra (Past)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Grid View OR Table View */}
      {viewMode === 'grid' ? (
        /* VISUAL EVENT CARDS */
        <div className="mb-4">
          {filteredItems.length === 0 ? (
            <div className="fv-admin-card text-center py-5 text-secondary">
              <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
              Không có sự kiện nào phù hợp.
            </div>
          ) : (
            <div className="row g-3">
              {paginatedItems.map((item) => {
                const titleVi = item.title?.vi || item.title;
                const locVi = item.location?.vi || item.location;
                const isUpcoming = item.date >= today;
                const imgSrc = resolveAdminImage(item, item.category);

                return (
                  <div key={item.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div className="fv-admin-grid-card">
                      {/* Event Banner */}
                      <div
                        className="fv-admin-grid-img-wrap cursor-pointer position-relative"
                        style={{ height: '175px', cursor: 'zoom-in' }}
                        onClick={() => setPreviewImage({ ...item, resolvedImg: imgSrc })}
                        title="Bấm để xem ảnh phóng to"
                      >
                        <img
                          src={imgSrc}
                          alt={titleVi}
                          className="fv-admin-grid-img"
                          onError={(e) => handleImageFallback(e, item.category)}
                        />

                        {/* Category & Status badges */}
                        <span className={`fv-badge-cat fv-cat-${item.category} position-absolute top-0 start-0 m-2`} style={{ fontSize: '0.65rem' }}>
                          {item.category}
                        </span>

                        <span
                          className={`badge position-absolute top-0 end-0 m-2 ${
                            isUpcoming
                              ? 'bg-warning text-dark'
                              : 'bg-secondary text-white'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {isUpcoming ? '⚡ Sắp diễn ra' : '🕰️ Đã qua'}
                        </span>

                        <span className="badge bg-black bg-opacity-75 text-white position-absolute bottom-0 start-0 m-2 font-monospace" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-calendar3 me-1"></i>{item.date}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="fv-admin-grid-body">
                        <h6 className="fw-bold text-white mb-1 text-truncate" title={titleVi}>
                          {titleVi}
                        </h6>

                        <div className="text-secondary small mb-3 text-truncate" title={locVi} style={{ fontSize: '0.78rem' }}>
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>{locVi}
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-25 mt-auto">
                          <button
                            type="button"
                            className="fv-admin-btn-edit flex-grow-1 justify-content-center"
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => handleOpenEdit(item)}
                          >
                            <i className="bi bi-pencil-square"></i> Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            className="fv-admin-btn-danger"
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => handleDelete(item.id, titleVi)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="fv-admin-table-container">
          <div className="table-responsive">
            <table className="fv-admin-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Ảnh (Zoom)</th>
                  <th>Tên Sự Kiện</th>
                  <th>Danh mục</th>
                  <th>Địa điểm</th>
                  <th>Ngày tổ chức</th>
                  <th>Trạng thái</th>
                  <th className="text-end" style={{ width: '130px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                      Không có sự kiện nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const titleVi = item.title?.vi || item.title;
                    const locVi = item.location?.vi || item.location;
                    const isUpcoming = item.date >= today;
                    const imgSrc = resolveAdminImage(item, item.category);

                    return (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={imgSrc}
                            alt={titleVi}
                            className="fv-admin-thumb"
                            onClick={() => setPreviewImage({ ...item, resolvedImg: imgSrc })}
                            title="Bấm để xem ảnh to"
                            onError={(e) => handleImageFallback(e, item.category)}
                          />
                        </td>
                        <td>
                          <div className="fw-bold text-white text-truncate" style={{ maxWidth: '300px' }}>
                            {titleVi}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            ID: <code>{item.id}</code>
                          </div>
                        </td>
                        <td>
                          <span className={`fv-badge-cat fv-cat-${item.category}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="text-secondary small" style={{ maxWidth: '200px' }}>
                          <i className="bi bi-geo-alt me-1 text-danger"></i>
                          <span className="text-truncate d-inline-block align-middle" style={{ maxWidth: '170px' }}>
                            {locVi}
                          </span>
                        </td>
                        <td className="text-secondary small">
                          {item.date}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isUpcoming
                                ? 'bg-warning-subtle text-warning border border-warning'
                                : 'bg-secondary-subtle text-secondary border border-secondary'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {isUpcoming ? '⚡ Sắp diễn ra' : '🕰️ Đã qua'}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="fv-admin-btn-edit"
                              onClick={() => handleOpenEdit(item)}
                              title="Sửa"
                            >
                              <i className="bi bi-pencil-square"></i> Sửa
                            </button>
                            <button
                              type="button"
                              className="fv-admin-btn-danger"
                              onClick={() => handleDelete(item.id, titleVi)}
                              title="Xóa"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <AdminPagination
        currentPage={currentPage}
        totalItems={filteredItems.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[8, 12, 24, 48]}
      />

      {/* Lightbox Modal */}
      {previewImage && (
        <AdminImageLightbox
          item={previewImage}
          title={previewImage.title?.vi || previewImage.title}
          onClose={() => setPreviewImage(null)}
        >
          <span className="text-secondary small">{previewImage.location?.vi || previewImage.location} • {previewImage.date}</span>
        </AdminImageLightbox>
      )}

      {/* Modal Edit/Add */}
      {isModalOpen && (
        <div className="fv-admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="fv-admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-header">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <i className="bi bi-calendar-check text-info"></i>
                {editingItem ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện mới'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setIsModalOpen(false)}
              ></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="fv-admin-modal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">ID Sự kiện</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.id}
                        disabled={!!editingItem}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Danh mục (Category)</label>
                      <select
                        className="fv-admin-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tên Sự Kiện (Tiếng Việt) *</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.titleVi}
                        onChange={(e) => setFormData({ ...formData, titleVi: e.target.value })}
                        placeholder="VD: AnimeJapan Festival 2026..."
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tên Sự Kiện (English)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="Enter event name in English..."
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Địa điểm (Tiếng Việt)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.locationVi}
                        onChange={(e) => setFormData({ ...formData, locationVi: e.target.value })}
                        placeholder="VD: Tokyo Big Sight, Nhật Bản"
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Địa điểm (English)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.locationEn}
                        onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                        placeholder="VD: Tokyo Big Sight, Japan"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Ngày tổ chức</label>
                      <input
                        type="date"
                        className="fv-admin-input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">URL Ảnh Bìa Sự Kiện</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="/image/ghibili.jpg hoặc https://..."
                      />
                    </div>
                  </div>

                  {/* Live Image Preview in Modal */}
                  {formData.imageUrl && (
                    <div className="col-12">
                      <label className="fv-admin-label mb-1">Xem trước ảnh bìa:</label>
                      <div className="rounded overflow-hidden border border-secondary border-opacity-25" style={{ maxHeight: '140px' }}>
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                          onError={(e) => handleImageFallback(e, formData.category)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mô tả sự kiện (Tiếng Việt)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.descVi}
                        onChange={(e) => setFormData({ ...formData, descVi: e.target.value })}
                        placeholder="Thông tin chi tiết về lễ hội, triển lãm, diễn giả..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mô tả sự kiện (English)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.descEn}
                        onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                        placeholder="Event details, exhibits, guest speakers..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="fv-admin-modal-footer">
                <button
                  type="button"
                  className="fv-admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="fv-admin-btn-primary">
                  <i className="bi bi-check-lg"></i> {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmModal
        show={!!confirmState}
        {...confirmState}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
