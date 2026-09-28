import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../services/dataService.js';
import { resolveAdminImage, handleImageFallback } from '../../utils/adminImageHelper.js';
import AdminPagination from '../../components/common/AdminPagination.jsx';
import AdminCategoryTabs from '../../components/common/AdminCategoryTabs.jsx';
import AdminImageLightbox from '../../components/common/AdminImageLightbox.jsx';
import { ADMIN_CATEGORY_OPTIONS as CATEGORIES } from '../../constants.js';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const TYPES = [
  { id: 'all', label: 'Tất cả loại bài viết' },
  { id: 'article', label: 'Bài viết (Article)' },
  { id: 'gallery', label: 'Bộ sưu tập ảnh (Gallery)' },
  { id: 'video', label: 'Video Clip' },
  { id: 'audio', label: 'Podcast / Audio' },
];

export default function AdminContents({ onShowToast }) {
  const [items, setItems] = useState(() => dataService.getRawContents());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFeatured, setSelectedFeatured] = useState('all');
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
    type: 'article',
    titleVi: '',
    titleEn: '',
    shortDescVi: '',
    shortDescEn: '',
    imageUrl: '',
    videoUrl: '',
    audioUrl: '',
    subTags: '',
    featured: false,
  });

  const reloadData = () => {
    setItems(dataService.getRawContents());
  };

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
      const matchType = selectedType === 'all' || item.type === selectedType;
      const matchFeatured =
        selectedFeatured === 'all' ||
        (selectedFeatured === 'featured' && item.featured) ||
        (selectedFeatured === 'standard' && !item.featured);

      const titleVi = item.title?.vi || item.title || '';
      const titleEn = item.title?.en || '';
      const matchSearch =
        !searchTerm.trim() ||
        titleVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCat && matchType && matchFeatured && matchSearch;
    });
  }, [items, searchTerm, selectedCat, selectedType, selectedFeatured]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCat, selectedType, selectedFeatured]);

  // Sliced paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const DEMO_ARTICLE_DATA = {
    category: 'anime',
    type: 'article',
    titleVi: 'One Piece: Tiết lộ chấn động về kho báu bí ẩn tại Đảo Elbaf',
    titleEn: 'One Piece: Shocking Revelation About The Legendary Treasure on Elbaf',
    shortDescVi: 'Tổng hợp toàn bộ phân tích cốt truyện, sức mạnh của các chiến binh Elbaf và manh mối mới nhất về kho báu One Piece.',
    shortDescEn: 'Comprehensive story breakdown, giant warrior abilities, and the newest clues regarding the legendary One Piece treasure.',
    imageUrl: '/image/onepice_thamnail.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_laser_burst.ogg',
    subTags: 'One Piece, Anime, Elbaf, Tin Nóng, Arc Mới',
    featured: true,
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ id: `content-${Date.now()}`, ...DEMO_ARTICLE_DATA });
    setIsModalOpen(true);
  };

  const handleFillDemoData = () => {
    setFormData((prev) => ({ ...prev, ...DEMO_ARTICLE_DATA }));
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const resolvedImg = item.imageUrl || item.thumbnail || resolveAdminImage(item, item.category);
    setFormData({
      id: item.id,
      category: item.category || 'anime',
      type: item.type || 'article',
      titleVi: item.title?.vi || (typeof item.title === 'string' ? item.title : ''),
      titleEn: item.title?.en || (typeof item.title === 'string' ? item.title : ''),
      shortDescVi: item.shortDescription?.vi || (typeof item.shortDescription === 'string' ? item.shortDescription : ''),
      shortDescEn: item.shortDescription?.en || (typeof item.shortDescription === 'string' ? item.shortDescription : ''),
      imageUrl: resolvedImg,
      videoUrl: item.videoUrl || '',
      audioUrl: item.audioUrl || '',
      subTags: Array.isArray(item.subTags) ? item.subTags.map(t => typeof t === 'object' ? t.vi || t.en : t).join(', ') : '',
      featured: !!item.featured,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    setConfirmState({
      title: 'Xóa bài viết?',
      message: `Bạn có chắc chắn muốn xóa bài viết "${title}" (ID: ${id}) không? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa bài viết',
      variant: 'danger',
      onConfirm: () => {
        dataService.deleteContent(id);
        reloadData();
        if (onShowToast) onShowToast(`Đã xóa bài viết "${title}" thành công.`, 'success');
        setConfirmState(null);
      },
    });
  };

  const handleToggleFeatured = (item) => {
    const updated = { ...item, featured: !item.featured };
    dataService.saveContent(updated);
    reloadData();
    if (onShowToast) {
      onShowToast(`Đã ${updated.featured ? 'bật' : 'tắt'} trạng thái Nổi bật cho "${item.title?.vi || item.title}".`, 'info');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.titleVi.trim()) {
      if (onShowToast) onShowToast('Vui lòng nhập tiêu đề tiếng Việt.', 'error');
      return;
    }

    const tagsArray = formData.subTags
      ? formData.subTags.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const finalImage = formData.imageUrl.trim() || resolveAdminImage({ category: formData.category, id: formData.id });

    const savedItem = {
      id: formData.id,
      category: formData.category,
      type: formData.type,
      featured: formData.featured,
      title: {
        vi: formData.titleVi.trim(),
        en: formData.titleEn.trim() || formData.titleVi.trim(),
        hi: formData.titleEn.trim() || formData.titleVi.trim(),
      },
      shortDescription: {
        vi: formData.shortDescVi.trim(),
        en: formData.shortDescEn.trim() || formData.shortDescVi.trim(),
        hi: formData.shortDescEn.trim() || formData.shortDescVi.trim(),
      },
      body: {
        vi: formData.shortDescVi.trim() + '\n\n' + (formData.shortDescVi.trim() ? `${formData.shortDescVi.trim()} Chi tiết diễn biến và phân tích chuyên sâu sẽ được liên tục cập nhật theo các diễn biến mới nhất từ tác giả và studio sản xuất.` : ''),
        en: formData.shortDescEn.trim() || formData.shortDescVi.trim(),
        hi: formData.shortDescEn.trim() || formData.shortDescVi.trim(),
      },
      imageUrl: finalImage,
      thumbnail: finalImage,
      images: [finalImage],
      videoUrl: formData.videoUrl.trim() || null,
      audioUrl: formData.audioUrl.trim() || null,
      subTags: tagsArray,
      dateAdded: editingItem?.dateAdded || new Date().toISOString().split('T')[0],
    };

    dataService.saveContent(savedItem);
    reloadData();
    setIsModalOpen(false);
    if (onShowToast) {
      onShowToast(`Đã lưu bài viết "${savedItem.title.vi}" thành công!`, 'success');
    }
  };

  return (
    <div className="admin-contents-module">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-newspaper" style={{ color: '#00f5d4' }}></i>
            Quản lý Bài viết & Nội dung Media
          </h3>
          <p className="text-secondary small mb-0">
            Hiển thị <strong className="text-white">{filteredItems.length}</strong> / {items.length} bài viết và nội dung Fandom.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* View Switcher Button */}
          <div className="fv-admin-view-switcher">
            <button
              type="button"
              className={`fv-admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới ảnh trực quan"
            >
              <i className="bi bi-grid-fill"></i> Lưới Ảnh
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
            <i className="bi bi-plus-lg"></i> Viết bài mới
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
          <div className="col-12 col-md-4">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 translate-middle-y text-secondary ms-3"></i>
              <input
                type="text"
                className="fv-admin-input ps-5"
                placeholder="Tìm kiếm bài viết, hashtag, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select
              className="fv-admin-select"
              value={selectedFeatured}
              onChange={(e) => setSelectedFeatured(e.target.value)}
            >
              <option value="all">Tất cả bài viết</option>
              <option value="featured">⭐ Bài nổi bật (Featured)</option>
              <option value="standard">Tiêu chuẩn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Grid View OR Table View */}
      {viewMode === 'grid' ? (
        /* VISUAL GRID VIEW WITH LARGE 16:9 IMAGES */
        <div className="mb-4">
          {filteredItems.length === 0 ? (
            <div className="fv-admin-card text-center py-5 text-secondary">
              <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
              Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="row g-3">
              {paginatedItems.map((item) => {
                const titleVi = item.title?.vi || item.title;
                const descVi = item.shortDescription?.vi || item.shortDescription || '';
                const imgSrc = resolveAdminImage(item, item.category);

                return (
                  <div key={item.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div className="fv-admin-grid-card">
                      {/* Banner Cover Image */}
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
                        {/* Format & Category Badges */}
                        <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                          <span className={`fv-badge-cat fv-cat-${item.category}`} style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                            {item.category}
                          </span>
                          <span className="badge bg-dark bg-opacity-75 text-light border border-secondary" style={{ fontSize: '0.65rem' }}>
                            <i className={`bi me-1 ${
                              item.type === 'video' ? 'bi-play-circle' :
                              item.type === 'audio' ? 'bi-mic' :
                              item.type === 'gallery' ? 'bi-images' : 'bi-file-text'
                            }`}></i>
                            {item.type}
                          </span>
                        </div>

                        {/* Featured Star toggle */}
                        <button
                          type="button"
                          className="btn btn-sm position-absolute top-0 end-0 m-1 text-white border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFeatured(item);
                          }}
                          title="Bấm để bật/tắt nổi bật"
                        >
                          <i className={`bi ${item.featured ? 'bi-star-fill text-warning fs-5' : 'bi-star text-white opacity-75 fs-5'}`}></i>
                        </button>

                        {/* Date badge */}
                        <span className="badge bg-black bg-opacity-75 text-secondary position-absolute bottom-0 start-0 m-2 small" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-clock me-1"></i>{item.dateAdded || 'N/A'}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="fv-admin-grid-body">
                        <h6 className="fw-bold text-white mb-1 text-truncate" title={titleVi}>
                          {titleVi}
                        </h6>
                        <p className="text-secondary small mb-3 text-truncate-2" style={{ fontSize: '0.78rem', minHeight: '38px', lineHeight: '1.4' }}>
                          {descVi}
                        </p>

                        <div className="d-flex align-items-center justify-content-between text-muted small mt-auto pt-2 border-top border-secondary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                          <span>ID: <code>{item.id}</code></span>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="fv-admin-btn-edit py-1 px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleOpenEdit(item)}
                              title="Chỉnh sửa"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              type="button"
                              className="fv-admin-btn-danger py-1 px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleDelete(item.id, titleVi)}
                              title="Xóa"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
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
                  <th>Tiêu đề & Tóm tắt</th>
                  <th>Danh mục</th>
                  <th>Định dạng</th>
                  <th>Ngày đăng</th>
                  <th className="text-center">Nổi bật</th>
                  <th className="text-end" style={{ width: '130px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                      Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const titleVi = item.title?.vi || item.title;
                    const descVi = item.shortDescription?.vi || item.shortDescription || '';
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
                        <td style={{ maxWidth: '360px' }}>
                          <div className="fw-bold text-white text-truncate" title={titleVi}>
                            {titleVi}
                          </div>
                          <div className="text-secondary small text-truncate" style={{ maxWidth: '340px' }}>
                            {descVi}
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
                        <td>
                          <span className="badge bg-secondary-subtle text-light border border-secondary" style={{ fontSize: '0.75rem' }}>
                            <i className={`bi me-1 ${
                              item.type === 'video' ? 'bi-play-circle' :
                              item.type === 'audio' ? 'bi-mic' :
                              item.type === 'gallery' ? 'bi-images' : 'bi-file-text'
                            }`}></i>
                            {item.type}
                          </span>
                        </td>
                        <td className="text-secondary small">
                          {item.dateAdded || 'N/A'}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm border-0 p-1 bg-transparent"
                            onClick={() => handleToggleFeatured(item)}
                            title="Bấm để bật/tắt nổi bật"
                          >
                            <i
                              className={`bi ${item.featured ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
                              style={{ fontSize: '1.2rem' }}
                            ></i>
                          </button>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="fv-admin-btn-edit"
                              onClick={() => handleOpenEdit(item)}
                              title="Chỉnh sửa bài viết"
                            >
                              <i className="bi bi-pencil-square"></i> Sửa
                            </button>
                            <button
                              type="button"
                              className="fv-admin-btn-danger"
                              onClick={() => handleDelete(item.id, titleVi)}
                              title="Xóa bài viết"
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
          <span className="text-secondary small">{previewImage.category} • {previewImage.type}</span>
        </AdminImageLightbox>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fv-admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="fv-admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-header">
              <div className="d-flex align-items-center gap-3">
                <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                  <i className={`bi ${editingItem ? 'bi-pencil-square text-info' : 'bi-plus-circle text-success'}`}></i>
                  {editingItem ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
                </h5>
                {!editingItem && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 py-1 px-2"
                    style={{ fontSize: '0.78rem', borderRadius: '20px' }}
                    onClick={handleFillDemoData}
                    title="Bấm để tự động điền lại mẫu demo chuẩn quay video"
                  >
                    <i className="bi bi-lightning-charge-fill"></i> Điền mẫu demo
                  </button>
                )}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setIsModalOpen(false)}
              ></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="fv-admin-modal-body">
                <div className="row g-3">
                  {/* ID & Category */}
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mã ID bài viết</label>
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
                  <div className="col-6 col-md-3">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Danh mục (Category)</label>
                      <select
                        className="fv-admin-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Loại nội dung (Type)</label>
                      <select
                        className="fv-admin-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        {TYPES.filter((t) => t.id !== 'all').map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Title VI & EN */}
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tiêu đề (Tiếng Việt) *</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.titleVi}
                        onChange={(e) => setFormData({ ...formData, titleVi: e.target.value })}
                        placeholder="VD: Tổng hợp thông tin One Piece Arc mới..."
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tiêu đề (English)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="Enter English title..."
                      />
                    </div>
                  </div>

                  {/* Short Desc VI & EN */}
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mô tả ngắn (Tiếng Việt)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.shortDescVi}
                        onChange={(e) => setFormData({ ...formData, shortDescVi: e.target.value })}
                        placeholder="Tóm tắt nội dung bài viết..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mô tả ngắn (English)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.shortDescEn}
                        onChange={(e) => setFormData({ ...formData, shortDescEn: e.target.value })}
                        placeholder="Short summary in English..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Image URL & Preview */}
                  <div className="col-12 col-md-8">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">URL Ảnh Thumbnail</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="/image/onepice_thamnail.jpg hoặc https://..."
                      />
                    </div>
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Thẻ / Phân loại (phân cách bằng dấu phẩy)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.subTags}
                        onChange={(e) => setFormData({ ...formData, subTags: e.target.value })}
                        placeholder="One Piece, Shounen, Phân tích"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="fv-admin-label">Xem trước ảnh:</label>
                    <div
                      className="rounded border border-secondary border-opacity-25 overflow-hidden d-flex align-items-center justify-content-center bg-black"
                      style={{ height: '115px' }}
                    >
                      {formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => handleImageFallback(e, formData.category)}
                        />
                      ) : (
                        <span className="text-secondary small">Chưa có ảnh</span>
                      )}
                    </div>
                  </div>

                  {/* Optional Media URLs */}
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">URL Video Embed (nếu có)</label>
                      <input
                        type="url"
                        className="fv-admin-input"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">URL Audio (nếu có)</label>
                      <input
                        type="url"
                        className="fv-admin-input"
                        value={formData.audioUrl}
                        onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                        placeholder="https://.../podcast.mp3"
                      />
                    </div>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="col-12">
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="featuredSwitch"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      />
                      <label className="form-check-label text-white small" htmlFor="featuredSwitch">
                        Đánh dấu bài viết nổi bật (Hiển thị trang chủ / Hero slider)
                      </label>
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
                  <i className="bi bi-check-lg"></i> {editingItem ? 'Lưu thay đổi' : 'Đăng bài viết'}
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
