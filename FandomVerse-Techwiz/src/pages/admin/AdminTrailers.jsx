import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../services/dataService.js';
import { resolveAdminImage, handleImageFallback } from '../../utils/adminImageHelper.js';
import AdminPagination from '../../components/common/AdminPagination.jsx';
import AdminCategoryTabs from '../../components/common/AdminCategoryTabs.jsx';
import AdminImageLightbox from '../../components/common/AdminImageLightbox.jsx';
import { ADMIN_CATEGORY_OPTIONS as CATEGORIES } from '../../constants.js';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

export default function AdminTrailers({ onShowToast }) {
  const [items, setItems] = useState(() => dataService.getRawTrailers());
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
    thumbnail: '',
    videoId: '',
    videoUrl: '',
    releaseDate: '',
    status: 'released',
    duration: '2:30',
  });

  const reloadData = () => setItems(dataService.getRawTrailers());

  useEffect(() => {
    const handleDataChange = () => reloadData();
    window.addEventListener('fv_data_change', handleDataChange);
    return () => window.removeEventListener('fv_data_change', handleDataChange);
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach((item) => {
      const cat = item.category || 'anime';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCat === 'all' || item.category === selectedCat;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

      const titleVi = item.title?.vi || item.title || '';
      const titleEn = item.title?.en || '';
      const matchSearch =
        !searchTerm.trim() ||
        titleVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCat && matchStatus && matchSearch;
    });
  }, [items, searchTerm, selectedCat, selectedStatus]);

  // Reset page when filter changes
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
      id: `trailer-${Date.now()}`,
      category: 'anime',
      titleVi: '',
      titleEn: '',
      thumbnail: '/image/chansawman.jpg',
      videoId: 'dQw4w9WgXcQ',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'upcoming',
      duration: '2:15',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const resolvedImg = item.thumbnail || item.image || resolveAdminImage(item, item.category);
    setFormData({
      id: item.id,
      category: item.category || 'anime',
      titleVi: item.title?.vi || (typeof item.title === 'string' ? item.title : ''),
      titleEn: item.title?.en || (typeof item.title === 'string' ? item.title : ''),
      thumbnail: resolvedImg,
      videoId: item.videoId || '',
      videoUrl: item.videoUrl || '',
      releaseDate: item.releaseDate || '',
      status: item.status || 'released',
      duration: item.duration || '2:30',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    setConfirmState({
      title: 'Xóa trailer?',
      message: `Bạn có chắc chắn muốn xóa trailer "${title}" (ID: ${id}) không? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa trailer',
      variant: 'danger',
      onConfirm: () => {
        dataService.deleteTrailer(id);
        reloadData();
        if (onShowToast) onShowToast(`Đã xóa trailer "${title}" thành công.`, 'success');
        setConfirmState(null);
      },
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.titleVi.trim()) {
      if (onShowToast) onShowToast('Vui lòng nhập tên trailer.', 'error');
      return;
    }

    const finalImage = formData.thumbnail.trim() || resolveAdminImage({ category: formData.category, id: formData.id });

    const savedItem = {
      id: formData.id,
      category: formData.category,
      title: {
        vi: formData.titleVi.trim(),
        en: formData.titleEn.trim() || formData.titleVi.trim(),
        hi: formData.titleEn.trim() || formData.titleVi.trim(),
      },
      thumbnail: finalImage,
      image: finalImage,
      videoId: formData.videoId.trim() || 'dQw4w9WgXcQ',
      videoUrl: formData.videoUrl.trim() || `https://www.youtube.com/watch?v=${formData.videoId.trim()}`,
      releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
      status: formData.status,
      duration: formData.duration.trim() || '2:30',
    };

    dataService.saveTrailer(savedItem);
    reloadData();
    setIsModalOpen(false);
    if (onShowToast) {
      onShowToast(`Đã lưu trailer "${savedItem.title.vi}" thành công!`, 'success');
    }
  };

  return (
    <div className="admin-trailers-module">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-film" style={{ color: '#00f5d4' }}></i>
            Quản lý Trailers & Teasers Bom Tấn
          </h3>
          <p className="text-secondary small mb-0">
            Hiển thị <strong className="text-white">{filteredItems.length}</strong> / {items.length} đoạn phim giới thiệu chính thức.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* View Switcher */}
          <div className="fv-admin-view-switcher">
            <button
              type="button"
              className={`fv-admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới ảnh trailer"
            >
              <i className="bi bi-grid-fill"></i> Lưới Trailer
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
            <i className="bi bi-plus-lg"></i> Thêm trailer mới
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
                placeholder="Tìm kiếm trailer theo tên, ID..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="released">🎬 Đã ra mắt</option>
              <option value="upcoming">⚡ Sắp chiếu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Grid View OR Table View */}
      {viewMode === 'grid' ? (
        /* VISUAL TRAILER CARDS WITH 16:9 PREVIEWS */
        <div className="mb-4">
          {filteredItems.length === 0 ? (
            <div className="fv-admin-card text-center py-5 text-secondary">
              <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
              Không tìm thấy trailer nào phù hợp.
            </div>
          ) : (
            <div className="row g-3">
              {paginatedItems.map((item) => {
                const titleVi = item.title?.vi || item.title;
                const imgSrc = resolveAdminImage(item, item.category);

                return (
                  <div key={item.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div className="fv-admin-grid-card">
                      {/* Video Poster Thumbnail */}
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
                        {/* Play button indicator */}
                        <div
                          className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center bg-danger text-white shadow"
                          style={{ width: '42px', height: '42px', opacity: 0.9 }}
                        >
                          <i className="bi bi-play-fill fs-4 ms-0.5"></i>
                        </div>

                        {/* Status & Duration badges */}
                        <span
                          className={`badge position-absolute top-0 start-0 m-2 ${
                            item.status === 'upcoming'
                              ? 'bg-warning text-dark'
                              : 'bg-success text-white'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {item.status === 'upcoming' ? '⚡ Sắp chiếu' : '🎬 Đã ra mắt'}
                        </span>

                        <span className="badge bg-black bg-opacity-75 text-white position-absolute bottom-0 end-0 m-2 font-monospace" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-clock me-1"></i>{item.duration || '2:30'}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="fv-admin-grid-body">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className={`fv-badge-cat fv-cat-${item.category}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                            {item.category}
                          </span>
                          <span className="text-secondary small font-monospace" style={{ fontSize: '0.72rem' }}>
                            {item.releaseDate || '2026'}
                          </span>
                        </div>

                        <h6 className="fw-bold text-white mb-2 text-truncate" title={titleVi}>
                          {titleVi}
                        </h6>

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
                  <th style={{ width: '70px' }}>Thumbnail (Zoom)</th>
                  <th>Tiêu Đề Trailer</th>
                  <th>Danh mục</th>
                  <th>Thời lượng</th>
                  <th>Ngày phát hành</th>
                  <th>Trạng thái</th>
                  <th className="text-end" style={{ width: '130px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                      Không tìm thấy trailer nào.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const titleVi = item.title?.vi || item.title;
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
                        <td className="text-secondary small font-monospace">
                          {item.duration || '2:30'}
                        </td>
                        <td className="text-secondary small">
                          {item.releaseDate || 'N/A'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === 'upcoming'
                                ? 'bg-warning-subtle text-warning border border-warning'
                                : 'bg-success-subtle text-success border border-success'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {item.status === 'upcoming' ? '⚡ Sắp chiếu' : '🎬 Đã ra mắt'}
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
          <span className="text-secondary small">{previewImage.category} • {previewImage.duration}</span>
        </AdminImageLightbox>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fv-admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="fv-admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-header">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <i className="bi bi-film text-info"></i>
                {editingItem ? 'Chỉnh sửa Trailer' : 'Thêm Trailer mới'}
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
                      <label className="fv-admin-label">ID Trailer</label>
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
                      <label className="fv-admin-label">Tiêu đề Trailer (Tiếng Việt) *</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.titleVi}
                        onChange={(e) => setFormData({ ...formData, titleVi: e.target.value })}
                        placeholder="VD: Chainsaw Man: Reze Arc Movie - Official Teaser..."
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tiêu đề Trailer (English)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="Enter trailer title in English..."
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Trạng thái</label>
                      <select
                        className="fv-admin-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="released">🎬 Đã phát hành</option>
                        <option value="upcoming">⚡ Sắp chiếu</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Thời lượng</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="VD: 2:30"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Ngày công chiếu</label>
                      <input
                        type="date"
                        className="fv-admin-input"
                        value={formData.releaseDate}
                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">YouTube Video ID</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.videoId}
                        onChange={(e) => setFormData({ ...formData, videoId: e.target.value })}
                        placeholder="VD: dQw4w9WgXcQ"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">URL Ảnh Thumbnail</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="/image/chansawman.jpg hoặc https://..."
                      />
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {formData.thumbnail && (
                    <div className="col-12">
                      <label className="fv-admin-label mb-1">Xem trước ảnh bìa trailer:</label>
                      <div
                        className="rounded border border-secondary border-opacity-25 overflow-hidden d-flex align-items-center justify-content-center bg-black"
                        style={{ height: '140px' }}
                      >
                        <img
                          src={formData.thumbnail}
                          alt="Preview"
                          style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                          onError={(e) => handleImageFallback(e, formData.category)}
                        />
                      </div>
                    </div>
                  )}
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
