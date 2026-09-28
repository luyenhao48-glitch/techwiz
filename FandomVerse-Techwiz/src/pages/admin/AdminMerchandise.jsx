import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../services/dataService.js';
import { resolveAdminImage, handleImageFallback } from '../../utils/adminImageHelper.js';
import AdminPagination from '../../components/common/AdminPagination.jsx';
import AdminCategoryTabs from '../../components/common/AdminCategoryTabs.jsx';
import AdminImageLightbox from '../../components/common/AdminImageLightbox.jsx';
import { ADMIN_CATEGORY_OPTIONS as CATEGORIES } from '../../constants.js';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const PRODUCT_TYPES = [
  { id: 'all', label: 'Tất cả loại sản phẩm' },
  { id: 'figure', label: 'Mô hình (Figure)' },
  { id: 'apparel', label: 'Trang phục & Áo (Apparel)' },
  { id: 'accessory', label: 'Phụ kiện & Trang sức (Accessory)' },
  { id: 'stationery', label: 'Văn phòng phẩm (Stationery)' },
  { id: 'collectible', label: 'Vật phẩm sưu tầm (Collectible)' },
];

export default function AdminMerchandise({ onShowToast }) {
  const [items, setItems] = useState(() => dataService.getRawMerchandise());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
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
    productType: 'figure',
    price: 49.99,
    imageUrl: '',
    inStock: true,
    rating: 4.8,
    descVi: '',
    descEn: '',
  });

  const reloadData = () => setItems(dataService.getRawMerchandise());

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
      const matchType = selectedType === 'all' || item.productType === selectedType;
      const matchStock =
        selectedStock === 'all' ||
        (selectedStock === 'in_stock' && item.inStock !== false) ||
        (selectedStock === 'out_of_stock' && item.inStock === false);

      const nameVi = item.name?.vi || item.name || '';
      const nameEn = item.name?.en || '';
      const matchSearch =
        !searchTerm.trim() ||
        nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCat && matchType && matchStock && matchSearch;
    });
  }, [items, searchTerm, selectedCat, selectedType, selectedStock]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCat, selectedType, selectedStock]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const DEMO_MERCH_DATA = {
    category: 'anime',
    nameVi: 'Mô hình Monkey D. Luffy Gear 5 - Thần Mặt Trời Nika (Bản Giới Hạn)',
    nameEn: 'Monkey D. Luffy Gear 5 Figure - Sun God Nika Special Edition',
    productType: 'figure',
    price: 59.99,
    imageUrl: '/image/logo_luffy.jpg',
    inStock: true,
    rating: 5.0,
    descVi: 'Mô hình PVC cao cấp tái hiện hoàn hảo trạng thái Gear 5 huyền thoại với hiệu ứng mây khói tinh xảo và đế trưng bày độc quyền.',
    descEn: 'Premium collector PVC figure depicting the legendary Gear 5 transformation with dynamic effects and exclusive display stand.',
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ id: `merch-${Date.now()}`, ...DEMO_MERCH_DATA });
    setIsModalOpen(true);
  };

  const handleFillDemoData = () => {
    setFormData((prev) => ({ ...prev, ...DEMO_MERCH_DATA }));
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const resolvedImg = item.imageUrl || item.image || resolveAdminImage(item, item.category);
    setFormData({
      id: item.id,
      category: item.category || 'anime',
      nameVi: item.name?.vi || (typeof item.name === 'string' ? item.name : ''),
      nameEn: item.name?.en || (typeof item.name === 'string' ? item.name : ''),
      productType: item.productType || 'figure',
      price: item.price ?? 49.99,
      imageUrl: resolvedImg,
      inStock: item.inStock !== false,
      rating: item.rating ?? 4.8,
      descVi: item.shortDescription?.vi || (typeof item.shortDescription === 'string' ? item.shortDescription : ''),
      descEn: item.shortDescription?.en || (typeof item.shortDescription === 'string' ? item.shortDescription : ''),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setConfirmState({
      title: 'Xóa sản phẩm?',
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${name}" (ID: ${id}) không? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa sản phẩm',
      variant: 'danger',
      onConfirm: () => {
        dataService.deleteMerchandise(id);
        reloadData();
        if (onShowToast) onShowToast(`Đã xóa sản phẩm "${name}" thành công.`, 'success');
        setConfirmState(null);
      },
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.nameVi.trim()) {
      if (onShowToast) onShowToast('Vui lòng nhập tên sản phẩm.', 'error');
      return;
    }

    const finalImage = formData.imageUrl.trim() || resolveAdminImage({ category: formData.category, id: formData.id });

    const savedItem = {
      id: formData.id,
      category: formData.category,
      name: {
        vi: formData.nameVi.trim(),
        en: formData.nameEn.trim() || formData.nameVi.trim(),
        hi: formData.nameEn.trim() || formData.nameVi.trim(),
      },
      productType: formData.productType,
      price: parseFloat(formData.price) || 0,
      image: finalImage,
      imageUrl: finalImage,
      inStock: formData.inStock,
      rating: parseFloat(formData.rating) || 4.5,
      shortDescription: {
        vi: formData.descVi.trim(),
        en: formData.descEn.trim() || formData.descVi.trim(),
        hi: formData.descEn.trim() || formData.descVi.trim(),
      },
    };

    dataService.saveMerchandise(savedItem);
    reloadData();
    setIsModalOpen(false);
    if (onShowToast) {
      onShowToast(`Đã lưu sản phẩm "${savedItem.name.vi}" thành công!`, 'success');
    }
  };

  return (
    <div className="admin-merch-module">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-bag-check" style={{ color: '#00f5d4' }}></i>
            Quản lý Cửa Hàng Vật Phẩm Fandom
          </h3>
          <p className="text-secondary small mb-0">
            Hiển thị <strong className="text-white">{filteredItems.length}</strong> / {items.length} mô hình, phụ kiện và trang phục chính hãng.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* View Switcher */}
          <div className="fv-admin-view-switcher">
            <button
              type="button"
              className={`fv-admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới ảnh sản phẩm"
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
            <i className="bi bi-plus-lg"></i> Thêm sản phẩm
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
                placeholder="Tìm tên sản phẩm, mã ID..."
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
              {PRODUCT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select
              className="fv-admin-select"
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
            >
              <option value="all">Tất cả kho hàng</option>
              <option value="in_stock">✅ Còn hàng</option>
              <option value="out_of_stock">❌ Hết hàng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Grid View OR Table View */}
      {viewMode === 'grid' ? (
        /* VISUAL GRID VIEW WITH LARGE IMAGES */
        <div className="mb-4">
          {filteredItems.length === 0 ? (
            <div className="fv-admin-card text-center py-5 text-secondary">
              <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="row g-3">
              {paginatedItems.map((item) => {
                const nameVi = item.name?.vi || item.name;
                const imgSrc = resolveAdminImage(item, item.category);

                return (
                  <div key={item.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div className="fv-admin-grid-card">
                      {/* Product Image Cover */}
                      <div
                        className="fv-admin-grid-img-wrap cursor-pointer position-relative"
                        style={{ height: '210px', cursor: 'zoom-in' }}
                        onClick={() => setPreviewImage({ ...item, resolvedImg: imgSrc })}
                        title="Bấm để xem ảnh phóng to"
                      >
                        <img
                          src={imgSrc}
                          alt={nameVi}
                          className="fv-admin-grid-img"
                          onError={(e) => handleImageFallback(e, item.category)}
                        />
                        {/* Status Badges */}
                        <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                          <span className={`fv-badge-cat fv-cat-${item.category}`} style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                            {item.category}
                          </span>
                          <span className="badge bg-dark bg-opacity-75 text-light border border-secondary" style={{ fontSize: '0.65rem' }}>
                            {item.productType}
                          </span>
                        </div>

                        {/* Stock Badge */}
                        <span
                          className={`badge position-absolute top-0 end-0 m-2 ${
                            item.inStock !== false ? 'bg-success text-white' : 'bg-danger text-white'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {item.inStock !== false ? 'Còn hàng' : 'Hết hàng'}
                        </span>

                        {/* Price Badge */}
                        <div
                          className="position-absolute bottom-0 end-0 m-2 px-2 py-1 rounded fw-bold text-white shadow-sm"
                          style={{ background: 'rgba(0, 0, 0, 0.8)', border: '1px solid #00f5d4', color: '#00f5d4' }}
                        >
                          ${item.price}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="fv-admin-grid-body">
                        <h6 className="fw-bold text-white mb-1 text-truncate" title={nameVi}>
                          {nameVi}
                        </h6>

                        <div className="d-flex align-items-center justify-content-between text-secondary small mb-3">
                          <span>
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            {item.rating || 4.8} / 5
                          </span>
                          <span>ID: <code>{item.id}</code></span>
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
                            onClick={() => handleDelete(item.id, nameVi)}
                            title="Xóa sản phẩm"
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
        /* TABLE VIEW WITH ENLARGED THUMBNAIL */
        <div className="fv-admin-table-container">
          <div className="table-responsive">
            <table className="fv-admin-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Ảnh (Zoom)</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Danh mục</th>
                  <th>Phân loại</th>
                  <th>Giá ($)</th>
                  <th>Tình trạng</th>
                  <th>Đánh giá</th>
                  <th className="text-end" style={{ width: '130px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                      Không tìm thấy sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const nameVi = item.name?.vi || item.name;
                    const imgSrc = resolveAdminImage(item, item.category);

                    return (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={imgSrc}
                            alt={nameVi}
                            className="fv-admin-thumb"
                            onClick={() => setPreviewImage({ ...item, resolvedImg: imgSrc })}
                            title="Bấm để xem ảnh to"
                            onError={(e) => handleImageFallback(e, item.category)}
                          />
                        </td>
                        <td>
                          <div className="fw-bold text-white text-truncate" style={{ maxWidth: '280px' }}>
                            {nameVi}
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
                          <span className="badge bg-secondary-subtle text-light border border-secondary" style={{ fontSize: '0.72rem' }}>
                            {item.productType}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold text-info">${item.price}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.inStock !== false
                                ? 'bg-success-subtle text-success border border-success'
                                : 'bg-danger-subtle text-danger border border-danger'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {item.inStock !== false ? 'Còn hàng' : 'Hết hàng'}
                          </span>
                        </td>
                        <td className="text-secondary small">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          {item.rating || 4.8}
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="fv-admin-btn-edit"
                              onClick={() => handleOpenEdit(item)}
                              title="Chỉnh sửa"
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
          <span className="text-info fw-bold">${previewImage.price}</span>
          <span className="text-secondary small ms-2">• {previewImage.category} ({previewImage.productType})</span>
        </AdminImageLightbox>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fv-admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="fv-admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-header">
              <div className="d-flex align-items-center gap-3">
                <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                  <i className="bi bi-bag-plus text-info"></i>
                  {editingItem ? 'Chỉnh sửa Sản Phẩm' : 'Thêm Sản Phẩm mới'}
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
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">ID Sản Phẩm</label>
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
                      <label className="fv-admin-label">Tên Sản Phẩm (Tiếng Việt) *</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.nameVi}
                        onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                        placeholder="VD: Mô hình Luffy Gear 5..."
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Tên Sản Phẩm (English)</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="Enter English product name..."
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-4">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Phân loại sản phẩm</label>
                      <select
                        className="fv-admin-select"
                        value={formData.productType}
                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                      >
                        {PRODUCT_TYPES.filter((t) => t.id !== 'all').map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Giá tiền ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="fv-admin-input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Điểm đánh giá (1-5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        className="fv-admin-input"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-8">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">URL Ảnh Sản Phẩm</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="/image/logo_luffy.jpg hoặc https://..."
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Trạng thái kho</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="stockSwitch"
                          checked={formData.inStock}
                          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        />
                        <label className="form-check-label text-white small" htmlFor="stockSwitch">
                          {formData.inStock ? 'Còn hàng trong kho' : 'Đã hết hàng'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview in Modal */}
                  {formData.imageUrl && (
                    <div className="col-12">
                      <label className="fv-admin-label mb-1">Xem trước ảnh sản phẩm:</label>
                      <div
                        className="rounded border border-secondary border-opacity-25 overflow-hidden d-flex align-items-center justify-content-center bg-black"
                        style={{ height: '140px' }}
                      >
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          style={{ maxHeight: '140px', objectFit: 'contain' }}
                          onError={(e) => handleImageFallback(e, formData.category)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mô tả sản phẩm (Tiếng Việt)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.descVi}
                        onChange={(e) => setFormData({ ...formData, descVi: e.target.value })}
                        placeholder="Mô tả chất liệu, kích thước, đặc tính sản phẩm..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mô tả sản phẩm (English)</label>
                      <textarea
                        className="fv-admin-textarea"
                        rows="2"
                        value={formData.descEn}
                        onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                        placeholder="Product specifications, materials, dimensions..."
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
