import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../services/dataService.js';
import { resolveAdminImage, handleImageFallback } from '../../utils/adminImageHelper.js';
import AdminPagination from '../../components/common/AdminPagination.jsx';
import AdminCategoryTabs from '../../components/common/AdminCategoryTabs.jsx';
import AdminImageLightbox from '../../components/common/AdminImageLightbox.jsx';
import { ADMIN_CATEGORY_OPTIONS as CATEGORIES } from '../../constants.js';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

export default function AdminCharacters({ onShowToast }) {
  const [items, setItems] = useState(() => dataService.getRawCharacters());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
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
    nameVi: '',
    nameEn: '',
    franchise: '',
    avatarUrl: '',
    traits: '',
    bioVi: '',
    bioEn: '',
  });

  const reloadData = () => setItems(dataService.getRawCharacters());

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

      const nameVi = item.name?.vi || item.name || '';
      const nameEn = item.name?.en || '';
      const fran = item.franchise || '';
      const matchSearch =
        !searchTerm.trim() ||
        nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fran.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [items, searchTerm, selectedCat]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCat]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `char-${Date.now()}`,
      category: 'anime',
      nameVi: '',
      nameEn: '',
      franchise: 'One Piece',
      avatarUrl: '/image/luffy.jpg',
      traits: 'Lãnh đạo, Chiến binh, Quyết đoán',
      bioVi: '',
      bioEn: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const resolvedImg = item.avatarUrl || item.image || resolveAdminImage(item, item.category);
    setFormData({
      id: item.id,
      category: item.category || 'anime',
      nameVi: item.name?.vi || (typeof item.name === 'string' ? item.name : ''),
      nameEn: item.name?.en || (typeof item.name === 'string' ? item.name : ''),
      franchise: item.franchise || '',
      avatarUrl: resolvedImg,
      traits: Array.isArray(item.traits)
        ? item.traits.map(t => typeof t === 'object' ? t.vi || t.en : t).join(', ')
        : '',
      bioVi: item.biography?.vi || (typeof item.biography === 'string' ? item.biography : ''),
      bioEn: item.biography?.en || (typeof item.biography === 'string' ? item.biography : ''),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setConfirmState({
      title: 'Xóa nhân vật?',
      message: `Bạn có chắc chắn muốn xóa nhân vật "${name}" (ID: ${id}) không? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa nhân vật',
      variant: 'danger',
      onConfirm: () => {
        dataService.deleteCharacter(id);
        reloadData();
        if (onShowToast) onShowToast(`Đã xóa nhân vật "${name}" thành công.`, 'success');
        setConfirmState(null);
      },
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.nameVi.trim()) {
      if (onShowToast) onShowToast('Vui lòng nhập tên nhân vật.', 'error');
      return;
    }

    const traitsArray = formData.traits
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalImage = formData.avatarUrl.trim() || resolveAdminImage({ category: formData.category, id: formData.id });

    const savedItem = {
      id: formData.id,
      category: formData.category,
      name: {
        vi: formData.nameVi.trim(),
        en: formData.nameEn.trim() || formData.nameVi.trim(),
        hi: formData.nameEn.trim() || formData.nameVi.trim(),
      },
      franchise: formData.franchise.trim(),
      avatarUrl: finalImage,
      image: finalImage,
      traits: traitsArray.length > 0 ? traitsArray : ['Biểu tượng'],
      biography: {
        vi: formData.bioVi.trim(),
        en: formData.bioEn.trim() || formData.bioVi.trim(),
        hi: formData.bioEn.trim() || formData.bioVi.trim(),
      },
    };

    dataService.saveCharacter(savedItem);
    reloadData();
    setIsModalOpen(false);
    if (onShowToast) {
      onShowToast(`Đã lưu nhân vật "${savedItem.name.vi}" thành công!`, 'success');
    }
  };

  return (
    <div className="admin-characters-module">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-person-badge" style={{ color: '#00f5d4' }}></i>
            Quản lý Nhân Vật Biểu Tượng
          </h3>
          <p className="text-secondary small mb-0">
            Hiển thị <strong className="text-white">{filteredItems.length}</strong> / {items.length} nhân vật fandom đa vũ trụ.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* View Switcher */}
          <div className="fv-admin-view-switcher">
            <button
              type="button"
              className={`fv-admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Chế độ thẻ bài nhân vật trực quan"
            >
              <i className="bi bi-grid-fill"></i> Thẻ Bài
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
            <i className="bi bi-plus-lg"></i> Thêm nhân vật
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

      {/* Search Bar */}
      <div className="fv-admin-card mb-4 p-3">
        <div className="row g-2">
          <div className="col-12 col-md-7">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 translate-middle-y text-secondary ms-3"></i>
              <input
                type="text"
                className="fv-admin-input ps-5"
                placeholder="Tìm theo tên nhân vật, vũ trụ (franchise)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-5">
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
        </div>
      </div>

      {/* Main Content: Grid View OR Table View */}
      {viewMode === 'grid' ? (
        /* VISUAL CHARACTER TRADING CARDS */
        <div className="mb-4">
          {filteredItems.length === 0 ? (
            <div className="fv-admin-card text-center py-5 text-secondary">
              <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
              Không tìm thấy nhân vật nào phù hợp.
            </div>
          ) : (
            <div className="row g-3">
              {paginatedItems.map((item) => {
                const nameVi = item.name?.vi || item.name;
                const traits = Array.isArray(item.traits)
                  ? item.traits.map(t => typeof t === 'object' ? t.vi || t.en : t)
                  : [];
                const imgSrc = resolveAdminImage(item, item.category);

                return (
                  <div key={item.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div className="fv-admin-grid-card text-center p-3">
                      {/* Character Avatar with Glow Ring */}
                      <div
                        className="rounded-circle overflow-hidden mx-auto my-2 cursor-pointer position-relative"
                        style={{
                          width: '100px',
                          height: '100px',
                          border: '2.5px solid #00f5d4',
                          boxShadow: '0 0 20px rgba(0, 245, 212, 0.35)',
                          cursor: 'zoom-in',
                        }}
                        onClick={() => setPreviewImage({ ...item, resolvedImg: imgSrc })}
                        title="Bấm để xem ảnh phóng to"
                      >
                        <img
                          src={imgSrc}
                          alt={nameVi}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => handleImageFallback(e, item.category)}
                        />
                      </div>

                      {/* Info */}
                      <div className="mt-2">
                        <span className={`fv-badge-cat fv-cat-${item.category} mb-1`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                          {item.category}
                        </span>
                        <h6 className="fw-bold text-white mb-0 text-truncate" title={nameVi}>
                          {nameVi}
                        </h6>
                        <span className="badge bg-dark border border-secondary text-info my-1 small" style={{ fontSize: '0.72rem' }}>
                          {item.franchise || 'FandomVerse'}
                        </span>
                      </div>

                      {/* Traits */}
                      <div className="d-flex flex-wrap justify-content-center gap-1 my-2" style={{ minHeight: '38px' }}>
                        {traits.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.68rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-25 mt-auto">
                        <button
                          type="button"
                          className="fv-admin-btn-edit flex-grow-1 justify-content-center"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleOpenEdit(item)}
                        >
                          <i className="bi bi-pencil-square"></i> Sửa
                        </button>
                        <button
                          type="button"
                          className="fv-admin-btn-danger"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleDelete(item.id, nameVi)}
                          title="Xóa"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
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
                  <th style={{ width: '70px' }}>Avatar (Zoom)</th>
                  <th>Tên Nhân Vật</th>
                  <th>Danh mục</th>
                  <th>Vũ trụ / Franchise</th>
                  <th>Đặc trưng nổi bật</th>
                  <th className="text-end" style={{ width: '130px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                      Không tìm thấy nhân vật nào.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const nameVi = item.name?.vi || item.name;
                    const traits = Array.isArray(item.traits)
                      ? item.traits.map(t => typeof t === 'object' ? t.vi || t.en : t)
                      : [];
                    const imgSrc = resolveAdminImage(item, item.category);

                    return (
                      <tr key={item.id}>
                        <td>
                          <div
                            className="rounded-circle overflow-hidden mx-auto cursor-pointer"
                            style={{ width: '50px', height: '50px', border: '1.5px solid #00f5d4' }}
                            onClick={() => setPreviewImage({ ...item, resolvedImg: imgSrc })}
                            title="Bấm để xem to"
                          >
                            <img
                              src={imgSrc}
                              alt={nameVi}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => handleImageFallback(e, item.category)}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-white">{nameVi}</div>
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
                          <span className="text-info fw-semibold small">
                            {item.franchise || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {traits.slice(0, 3).map((t, idx) => (
                              <span key={idx} className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.7rem' }}>
                                {t}
                              </span>
                            ))}
                          </div>
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
                              onClick={() => handleDelete(item.id, nameVi)}
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
          title={previewImage.name?.vi || previewImage.name}
          onClose={() => setPreviewImage(null)}
        >
          <span className="text-secondary small">{previewImage.franchise} • {previewImage.category}</span>
        </AdminImageLightbox>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fv-admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="fv-admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-header">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <i className="bi bi-person-plus text-info"></i>
                {editingItem ? 'Chỉnh sửa Nhân vật' : 'Thêm Nhân vật mới'}
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
                      <label className="fv-admin-label">ID Nhân vật</label>
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

                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tên Nhân Vật (Tiếng Việt) *</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.nameVi}
                        onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                        placeholder="VD: Monkey D. Luffy..."
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tên Nhân Vật (English)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="VD: Monkey D. Luffy..."
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Vũ trụ / Tác phẩm (Franchise)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.franchise}
                        onChange={(e) => setFormData({ ...formData, franchise: e.target.value })}
                        placeholder="VD: One Piece, Elden Ring, Marvel..."
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">URL Ảnh Avatar</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        placeholder="/image/luffy.jpg hoặc https://..."
                      />
                    </div>
                  </div>

                  {/* Avatar preview */}
                  {formData.avatarUrl && (
                    <div className="col-12 text-center">
                      <label className="fv-admin-label d-block mb-1">Xem trước Avatar:</label>
                      <div
                        className="rounded-circle overflow-hidden mx-auto border border-info"
                        style={{ width: '80px', height: '80px' }}
                      >
                        <img
                          src={formData.avatarUrl}
                          alt="Avatar preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => handleImageFallback(e, formData.category)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Đặc trưng nổi bật (phân cách bằng dấu phẩy)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.traits}
                        onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
                        placeholder="Dũng cảm, Kiên định, Hài hước..."
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tiểu sử (Tiếng Việt)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.bioVi}
                        onChange={(e) => setFormData({ ...formData, bioVi: e.target.value })}
                        placeholder="Tiểu sử tóm tắt về nhân vật..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tiểu sử (English)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.bioEn}
                        onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                        placeholder="Character biography in English..."
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
