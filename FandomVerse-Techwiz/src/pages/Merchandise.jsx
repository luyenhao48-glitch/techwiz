import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService.js';
import { CATEGORY_LIST, PRODUCT_TYPES } from '../constants.js';
import MerchCard from '../components/cards/MerchCard.jsx';
import MerchandiseContentRow from '../components/interactive/MerchandiseContentRow.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ToastNotification from '../components/common/ToastNotification.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useDataSync } from '../hooks/useDataSync.js';

// 5 phân loại sản phẩm tương ứng với từng hàng trượt giống Ảnh 2
const PRODUCT_TYPE_SECTIONS = [
  {
    type: 'figure',
    titleVi: 'Mô Hình & Action Figures Chính Hãng',
    titleEn: 'Official Figures & Collectible Statues',
    subtitleVi: 'Các mô hình Scale 1/7, Nendoroid và tượng nhân vật anime & gaming tinh xảo',
    subtitleEn: 'Scale 1/7 figures, Nendoroids, and finely crafted gaming & anime statues',
    icon: 'bi-trophy-fill',
    color: '#ff4757',
    badgeTextVi: 'Mô hình',
    badgeTextEn: 'Figure',
  },
  {
    type: 'apparel',
    titleVi: 'Trang Phục, Áo Hoodie & Kimono Fandom',
    titleEn: 'Fandom Apparel, Hoodies & Kimonos',
    subtitleVi: 'Áo thun oversize, áo hoodie chất liệu cao cấp và haori kimono đậm chất văn hóa fandom',
    subtitleEn: 'Oversize tees, premium hoodies, and kimono haori in authentic fandom styles',
    icon: 'bi-bag-check-fill',
    color: '#00b894',
    badgeTextVi: 'Trang phục',
    badgeTextEn: 'Apparel',
  },
  {
    type: 'plushie',
    titleVi: 'Gấu Bông & Thú Nhồi Bông Chibi',
    titleEn: 'Chibi Plushies & Soft Toys',
    subtitleVi: 'Thú nhồi bông siêu êm ái, búp bê chibi và linh vật siêu đáng yêu từ các series đình đám',
    subtitleEn: 'Ultra-soft plushies, chibi dolls, and adorable mascots from hit series',
    icon: 'bi-heart-fill',
    color: '#fd79a8',
    badgeTextVi: 'Gấu bông',
    badgeTextEn: 'Plushie',
  },
  {
    type: 'accessory',
    titleVi: 'Phụ Kiện, Thiết Bị & Gear Fandom',
    titleEn: 'Accessories, Gear & Gadgets',
    subtitleVi: 'Tay cầm chơi game, móc khóa acrylic, pin cài áo và phụ kiện công nghệ độc quyền',
    subtitleEn: 'Gaming controllers, acrylic keychains, enamel pins, and exclusive tech accessories',
    icon: 'bi-controller',
    color: '#0984e3',
    badgeTextVi: 'Phụ kiện',
    badgeTextEn: 'Accessory',
  },
  {
    type: 'collectible',
    titleVi: 'Đồ Sưu Tầm, Artbook & Bản Giới Hạn',
    titleEn: 'Collectibles, Artbooks & Limited Editions',
    subtitleVi: 'Sách tranh minh họa gốc, huy hiệu giới hạn và ấn phẩm kỷ niệm độc quyền',
    subtitleEn: 'Original illustration artbooks, limited badges, and exclusive anniversary editions',
    icon: 'bi-gem',
    color: '#f1c40f',
    badgeTextVi: 'Đồ sưu tầm',
    badgeTextEn: 'Collectible',
  },
];

export default function Merchandise() {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('slider'); // 'slider' (chia theo hàng ảnh 2) hoặc 'grid'
  const [toast, setToast] = useState(null);

  const isVi = i18n.language === 'vi';
  const { setIsCartOpen, cartCount, cartTotal } = useCart();
  const dataVersion = useDataSync();

  const CATEGORY_LIST_LOCALIZED = CATEGORY_LIST.map((cat) => ({
    ...cat,
    label: t(`categories.${cat.id}.label`),
  }));

  const PRODUCT_TYPES_LOCALIZED = PRODUCT_TYPES.map((pt) => ({
    ...pt,
    label: t(`productTypes.${pt.id}`),
  }));

  // Lấy toàn bộ sản phẩm thỏa mãn bộ lọc danh mục và loại
  const allFilteredMerchandise = useMemo(() => {
    let result = dataService.getMerchandiseByCategory(selectedCategory, {
      productType: selectedType,
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.shortDescription && m.shortDescription.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [selectedCategory, selectedType, searchQuery, sortBy, dataVersion]);

  // Gom nhóm sản phẩm theo 5 phân loại để render từng hàng trượt riêng biệt
  const categorizedSections = useMemo(() => {
    return PRODUCT_TYPE_SECTIONS.map((sec) => {
      let items = dataService.getMerchandiseByCategory(selectedCategory, {
        productType: sec.type,
      });

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        items = items.filter(
          (m) =>
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.shortDescription && m.shortDescription.toLowerCase().includes(q))
        );
      }

      if (sortBy === 'price-asc') {
        items = [...items].sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        items = [...items].sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name') {
        items = [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }

      return {
        ...sec,
        title: isVi ? sec.titleVi : sec.titleEn,
        subtitle: isVi ? sec.subtitleVi : sec.subtitleEn,
        badgeText: `${items.length} ${isVi ? sec.badgeTextVi : sec.badgeTextEn}`,
        items,
      };
    }).filter((sec) => sec.items.length > 0);
  }, [selectedCategory, searchQuery, sortBy, isVi, dataVersion]);

  const handleShowToast = (message) => {
    setToast({
      message,
      type: 'success',
      icon: 'bi-bag-check-fill',
      id: Date.now(),
      duration: 2000,
    });
  };

  const selectedCategoryLabel =
    selectedCategory === 'all'
      ? (isVi ? 'Tất cả 7 Fandom' : 'All 7 Fandoms')
      : CATEGORY_LIST_LOCALIZED.find((c) => c.id === selectedCategory)?.label || selectedCategory;

  const selectedTypeLabel =
    selectedType === 'all'
      ? (isVi ? 'Tất cả loại sản phẩm' : 'All Product Types')
      : PRODUCT_TYPES_LOCALIZED.find((p) => p.id === selectedType)?.label || selectedType;

  const isFiltered =
    selectedCategory !== 'all' || selectedType !== 'all' || searchQuery.trim() !== '' || sortBy !== 'default';

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSearchQuery('');
    setSortBy('default');
    setViewMode('slider');
  };

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-3">
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small mb-0 align-items-center">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-secondary d-inline-flex align-items-center gap-1">
              <i className="bi bi-house-door"></i>
              <span>{t('common.home', 'Trang chủ')}</span>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <span className="fw-semibold text-primary">
              {t('merchandise.title', 'Gian Hàng Fandom Merchandise')}
            </span>
          </li>
          {selectedCategory !== 'all' && (
            <li className="breadcrumb-item active text-secondary" aria-current="page">
              {selectedCategoryLabel}
            </li>
          )}
          {selectedType !== 'all' && (
            <li className="breadcrumb-item active text-secondary" aria-current="page">
              {selectedTypeLabel}
            </li>
          )}
        </ol>
      </nav>

      {/* 2. Ultra-Premium Storefront Hero Banner */}
      <div className="fv-merch-hero-banner">
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-4 position-relative" style={{ zIndex: 2 }}>
          {/* Left Column: Title & Highlights */}
          <div className="flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2.5">
              <span className="fv-merch-tag-badge">
                <i className="bi bi-patch-check-fill text-primary"></i>
                <span>{isVi ? 'BẢN QUYỀN CHÍNH HÃNG 100%' : '100% OFFICIAL LICENSED'}</span>
              </span>
              <span className="fv-merch-highlight-pill">
                <i className="bi bi-stars text-warning"></i>
                <span>{isVi ? 'Bộ Sưu Tập Giới Hạn' : 'Limited Collection'}</span>
              </span>
            </div>

            <h1 className="fv-merch-hero-title display-5 mb-2">
              {t('merchandise.title', 'Gian Hàng Fandom Merchandise')}
            </h1>

            <p className={`fs-6 mb-3 max-w-750 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
              {t(
                'merchandise.subtitle',
                'Khám phá các mô hình Figure, trang phục cao cấp, gấu bông chibi và ấn phẩm độc quyền từ 7 vũ trụ fandom đỉnh cao thế giới.'
              )}
            </p>

            {/* Quality Commitment Badges */}
            <div className="d-flex flex-wrap gap-2">
              <span className="fv-merch-highlight-pill">
                <i className="bi bi-shield-check text-success"></i>
                <span>{isVi ? 'Hàng Chuẩn Seal' : 'Sealed Mint Box'}</span>
              </span>
              <span className="fv-merch-highlight-pill">
                <i className="bi bi-truck text-info"></i>
                <span>{isVi ? 'Giao Hàng Siêu Tốc' : 'Express Delivery'}</span>
              </span>
              <span className="fv-merch-highlight-pill">
                <i className="bi bi-gift text-danger"></i>
                <span>{isVi ? 'Tặng Kèm Card Fandom' : 'Bonus Collectible Card'}</span>
              </span>
            </div>
          </div>

          {/* Right Column: View Switcher & VIP Cart Action */}
          <div className="d-flex flex-column flex-sm-row flex-lg-column align-items-start align-items-sm-center align-items-lg-end gap-3 align-self-stretch align-self-lg-center">
            {/* View Mode Toggle: Chia Hàng Slider (Ảnh 2) vs Dạng Lưới */}
            <div className="fv-merch-view-switcher" role="group" aria-label="Chế độ hiển thị">
              <button
                type="button"
                className={`btn-switch-item ${viewMode === 'slider' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('slider');
                  setSelectedType('all');
                }}
                title="Hiển thị theo từng hàng trượt riêng cho mỗi loại sản phẩm giống Ảnh 2"
              >
                <i className="bi bi-collection-play-fill"></i>
                <span>{isVi ? 'Chia Hàng Slider (Ảnh 2)' : 'Divided Rows'}</span>
              </button>
              <button
                type="button"
                className={`btn-switch-item ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Hiển thị dạng lưới phẳng tất cả sản phẩm"
              >
                <i className="bi bi-grid-3x3-gap-fill"></i>
                <span>{isVi ? 'Dạng Lưới' : 'Grid View'}</span>
              </button>
            </div>

            {/* Floating VIP Cart Button */}
            <button
              type="button"
              className="fv-merch-cart-btn"
              onClick={() => setIsCartOpen(true)}
              title="Mở giỏ hàng FandomVerse"
            >
              <i className="bi bi-bag-heart-fill fs-5"></i>
              <span>{t('merchandise.viewCart', { count: cartCount })}</span>
              {cartTotal > 0 && (
                <span className="badge bg-white text-dark font-monospace rounded-pill px-2.5 py-1 ms-1 shadow-sm">
                  ${cartTotal.toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Universe Fandom Selector Chips Bar */}
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className={`small fw-bold text-uppercase letter-spacing-1 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
            <i className="bi bi-compass me-1.5 text-primary"></i>
            {isVi ? 'Khám phá theo Vũ Trụ Fandom' : 'Browse by Fandom Universe'}
          </span>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none p-0 text-primary small fw-semibold"
              onClick={() => setSelectedCategory('all')}
            >
              <i className="bi bi-x-circle me-1"></i>
              {isVi ? 'Xem tất cả Fandom' : 'Reset Fandom'}
            </button>
          )}
        </div>

        <div className="fv-fandom-universe-bar">
          <button
            type="button"
            className={`fv-fandom-chip-btn ${selectedCategory === 'all' ? 'active chip-all' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <i className="bi bi-globe2"></i>
            <span>{t('merchandise.allFandoms', 'Tất cả 7 Fandom')}</span>
          </button>

          {CATEGORY_LIST_LOCALIZED.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`fv-fandom-chip-btn ${
                selectedCategory === c.id ? `active chip-${c.id}` : ''
              }`}
              onClick={() => setSelectedCategory(c.id)}
            >
              <i className={`bi ${c.icon}`}></i>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Sleek Floating Filter & Control Deck */}
      <div className="fv-merch-control-deck">
        <div className="row g-3 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-md-4">
            <div className="deck-select-group">
              <i className="bi bi-search deck-icon-label"></i>
              <input
                type="text"
                className="form-control deck-search-input"
                placeholder={isVi ? 'Tìm kiếm mô hình, áo, phụ kiện...' : 'Search figure, apparel, accessories...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-secondary position-absolute end-0 me-2 text-decoration-none"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="col-6 col-md-2.5 col-lg-2">
            <div className="deck-select-group">
              <i className="bi bi-filter deck-icon-label"></i>
              <select
                className="form-select deck-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Lọc Fandom"
              >
                <option value="all">{isVi ? 'Tất cả Fandom' : 'All Fandoms'}</option>
                {CATEGORY_LIST_LOCALIZED.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Type Dropdown */}
          <div className="col-6 col-md-2.5 col-lg-2">
            <div className="deck-select-group">
              <i className="bi bi-box-seam deck-icon-label"></i>
              <select
                className="form-select deck-select"
                value={selectedType}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedType(val);
                  if (val !== 'all') {
                    setViewMode('grid');
                  }
                }}
                aria-label="Lọc loại sản phẩm"
              >
                {PRODUCT_TYPES_LOCALIZED.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="col-6 col-md-3 col-lg-2">
            <div className="deck-select-group">
              <i className="bi bi-arrow-down-up deck-icon-label"></i>
              <select
                className="form-select deck-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sắp xếp sản phẩm"
              >
                <option value="default">{isVi ? 'Mặc định (Nổi bật)' : 'Default (Featured)'}</option>
                <option value="price-asc">{isVi ? 'Giá: Thấp đến Cao' : 'Price: Low to High'}</option>
                <option value="price-desc">{isVi ? 'Giá: Cao đến Thấp' : 'Price: High to Low'}</option>
                <option value="name">{isVi ? 'Tên: A đến Z' : 'Name: A-Z'}</option>
              </select>
            </div>
          </div>

          {/* Active Count & Reset Button */}
          <div className="col-6 col-md-auto ms-auto d-flex align-items-center justify-content-end gap-2">
            <span className="fv-merch-count-badge">
              <i className="bi bi-gem"></i>
              <span>{allFilteredMerchandise.length} {isVi ? 'Sản phẩm' : 'Items'}</span>
            </span>

            {isFiltered && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1"
                onClick={resetAllFilters}
                title="Xóa tất cả các bộ lọc đang chọn"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                <span className="d-none d-lg-inline">{isVi ? 'Đặt lại' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Active Filter Indicator Bar (when a single product type or search is active) */}
      {(selectedType !== 'all' || searchQuery.trim() !== '') && (
        <div
          className="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-4 mb-4 gap-2 shadow-sm"
          style={{
            background: isDark ? 'rgba(99, 102, 241, 0.12)' : '#eef2ff',
            border: '1px solid rgba(99, 102, 241, 0.28)',
          }}
        >
          <div className="d-flex flex-wrap align-items-center gap-2">
            <i className="bi bi-funnel-fill text-primary"></i>
            <span className={`small ${isDark ? 'text-white' : 'text-dark'}`}>
              {isVi ? 'Đang lọc:' : 'Active filters:'}
            </span>
            {selectedType !== 'all' && (
              <span className="badge rounded-pill bg-primary px-3 py-1.5 fw-semibold">
                {selectedTypeLabel}
              </span>
            )}
            {searchQuery.trim() && (
              <span className="badge rounded-pill bg-secondary px-3 py-1.5 fw-semibold">
                "{searchQuery}"
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
            onClick={() => {
              setSelectedType('all');
              setSearchQuery('');
              setViewMode('slider');
            }}
          >
            <i className="bi bi-arrow-left"></i>
            <span>{isVi ? 'Quay lại chia hàng (Ảnh 2)' : 'Back to divided rows'}</span>
          </button>
        </div>
      )}

      {/* 6. Main Product Content Area */}
      {allFilteredMerchandise.length === 0 ? (
        <EmptyState
          title={t('merchandise.noProductsTitle', 'Không tìm thấy sản phẩm')}
          message={t(
            'merchandise.noProductsMessage',
            'Không có sản phẩm nào phù hợp với bộ lọc danh mục và từ khóa tìm kiếm đã chọn.'
          )}
          onAction={resetAllFilters}
          actionLabel={t('trailersHub.clearFilters', 'Xóa bộ lọc')}
        />
      ) : viewMode === 'slider' && selectedType === 'all' ? (
        /* CHẾ ĐỘ 1: CHIA RA TỪNG HÀNG TRƯỢT THEO PHÂN LOẠI GIỐNG ẢNH 2 */
        <div className="fv-merchandise-divided-sections">
          {categorizedSections.map((section) => (
            <MerchandiseContentRow
              key={section.type}
              title={section.title}
              subtitle={section.subtitle}
              icon={section.icon}
              color={section.color}
              badgeText={section.badgeText}
              items={section.items}
              cardWidth="290px"
              onToast={handleShowToast}
              onFilterSelf={() => {
                setSelectedType(section.type);
                setViewMode('grid');
              }}
            />
          ))}
        </div>
      ) : (
        /* CHẾ ĐỘ 2: LƯỚI PHẲNG (Khi chọn 1 loại hoặc chọn chế độ Grid) */
        <div className="row g-3 g-md-4 fv-merch-grid">
          {allFilteredMerchandise.map((item) => (
            <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-6">
              <MerchCard item={item} onToast={handleShowToast} />
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
