import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { resolveAdminImage, handleImageFallback } from '../../utils/adminImageHelper.js';

const CATEGORY_NAMES = {
  anime: { name: 'Anime', color: '#ff5e8c', icon: 'bi-stars' },
  gaming: { name: 'Gaming', color: '#00f5d4', icon: 'bi-controller' },
  movies: { name: 'Movies', color: '#00a8ff', icon: 'bi-film' },
  tvshows: { name: 'TV Shows', color: '#a29bfe', icon: 'bi-tv' },
  kpop: { name: 'K-Pop', color: '#fd79a8', icon: 'bi-music-note-beamed' },
  comics: { name: 'Comics', color: '#feca57', icon: 'bi-book' },
  manga: { name: 'Manga', color: '#ff6b6b', icon: 'bi-journal-bookmark' },
};

export default function AdminDashboard({ onNavigateTab }) {
  const [stats, setStats] = useState(() => dataService.getStats());
  const { users, currentUser } = useAuth();

  // Visual showcase state
  const [recentMerch, setRecentMerch] = useState(() => dataService.getRawMerchandise().slice(0, 4));
  const [recentContents, setRecentContents] = useState(() => dataService.getRawContents().slice(0, 4));
  const [recentTrailers, setRecentTrailers] = useState(() => dataService.getRawTrailers().slice(0, 4));
  const [recentCharacters, setRecentCharacters] = useState(() => dataService.getRawCharacters().slice(0, 6));

  const reloadAll = () => {
    setStats(dataService.getStats());
    setRecentMerch(dataService.getRawMerchandise().slice(0, 4));
    setRecentContents(dataService.getRawContents().slice(0, 4));
    setRecentTrailers(dataService.getRawTrailers().slice(0, 4));
    setRecentCharacters(dataService.getRawCharacters().slice(0, 6));
  };

  useEffect(() => {
    const handleDataChange = () => reloadAll();
    window.addEventListener('fv_data_change', handleDataChange);
    return () => window.removeEventListener('fv_data_change', handleDataChange);
  }, []);

  const statCards = [
    {
      label: 'Bài viết & Media',
      value: stats.totalContents,
      icon: 'bi-file-earmark-richtext',
      color: '#00f5d4',
      bg: 'rgba(0, 245, 212, 0.1)',
      tab: 'contents',
    },
    {
      label: 'Trailer bom tấn',
      value: stats.totalTrailers,
      icon: 'bi-play-btn',
      color: '#ff5e8c',
      bg: 'rgba(255, 94, 140, 0.1)',
      tab: 'trailers',
    },
    {
      label: 'Sự kiện Fandom',
      value: stats.totalEvents,
      icon: 'bi-calendar-event',
      color: '#00a8ff',
      bg: 'rgba(0, 168, 255, 0.1)',
      tab: 'events',
    },
    {
      label: 'Vật phẩm Merch',
      value: stats.totalMerchandise,
      icon: 'bi-bag-check',
      color: '#feca57',
      bg: 'rgba(254, 202, 87, 0.1)',
      tab: 'merchandise',
    },
    {
      label: 'Nhân vật biểu tượng',
      value: stats.totalCharacters,
      icon: 'bi-person-badge',
      color: '#a29bfe',
      bg: 'rgba(162, 155, 254, 0.1)',
      tab: 'characters',
    },
    {
      label: 'Thành viên hệ thống',
      value: users.length,
      icon: 'bi-people',
      color: '#2ecc71',
      bg: 'rgba(46, 204, 113, 0.1)',
      tab: 'users',
    },
  ];

  return (
    <div className="admin-dashboard-view">
      {/* Welcome Banner with Cyber Neon Accents */}
      <div
        className="fv-admin-card mb-4 p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 23, 43, 0.95) 0%, rgba(35, 22, 65, 0.85) 100%)',
          border: '1px solid rgba(0, 245, 212, 0.25)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i> Hệ thống hoạt động hoàn hảo
            </span>
            <span className="text-secondary small">| Cập nhật hình ảnh trực quan V2.0</span>
          </div>
          <h2 className="fw-bold mb-1 text-white">
            Chào mừng trở lại, <span style={{ color: '#00f5d4' }}>{currentUser?.name || 'Quản trị viên'}</span> 👋
          </h2>
          <p className="text-secondary mb-0 small">
            Bảng điều khiển quản lý toàn diện đa vũ trụ FandomVerse với kho tư liệu trực quan, ảnh sản phẩm, bài viết và trailer độ phân giải cao.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/" className="fv-admin-btn-secondary text-decoration-none">
            <i className="bi bi-globe"></i> Xem trang chính
          </Link>
          <button
            type="button"
            className="fv-admin-btn-primary"
            onClick={() => onNavigateTab('settings')}
          >
            <i className="bi bi-gear-fill"></i> Cài đặt & Sao lưu
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="row g-3 mb-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-4">
            <div
              className="fv-admin-card fv-admin-stat-card cursor-pointer"
              onClick={() => onNavigateTab(card.tab)}
              style={{ cursor: 'pointer' }}
              title={`Quản lý ${card.label}`}
            >
              <div
                className="fv-admin-stat-icon"
                style={{ background: card.bg, color: card.color }}
              >
                <i className={`bi ${card.icon}`}></i>
              </div>
              <div className="flex-grow-1">
                <div className="fv-admin-stat-val">{card.value}</div>
                <div className="fv-admin-stat-label">{card.label}</div>
              </div>
              <i className="bi bi-chevron-right text-muted opacity-50"></i>
            </div>
          </div>
        ))}
      </div>

      {/* VISUAL IMAGE SHOWCASE 1: SẢN PHẨM MERCHANDISE ĐANG QUẢN LÝ */}
      <div className="fv-admin-card mb-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-bag-check-fill text-warning"></i>
              Vật Phẩm & Sản Phẩm Cửa Hàng (Hình Ảnh Trực Quan)
            </h5>
            <p className="text-secondary small mb-0">
              Xem trước hình ảnh mô hình figure, trang phục và đồ sưu tầm hiển thị ngoài gian hàng.
            </p>
          </div>
          <button
            type="button"
            className="fv-admin-btn-secondary py-1 px-3"
            style={{ fontSize: '0.82rem' }}
            onClick={() => onNavigateTab('merchandise')}
          >
            Xem tất cả ({stats.totalMerchandise}) <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>

        <div className="row g-3">
          {recentMerch.map((item) => {
            const nameVi = item.name?.vi || item.name;
            return (
              <div key={item.id} className="col-6 col-md-3">
                <div className="fv-admin-grid-card">
                  <div className="fv-admin-grid-img-wrap" style={{ height: '160px' }}>
                    <img
                      src={resolveAdminImage(item, item.category)}
                      alt={nameVi}
                      className="fv-admin-grid-img"
                      onError={(e) => handleImageFallback(e, item.category)}
                    />
                    <span
                      className={`badge position-absolute top-0 end-0 m-2 ${
                        item.inStock !== false ? 'bg-success' : 'bg-danger'
                      }`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {item.inStock !== false ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                    <span className="badge bg-dark bg-opacity-75 text-warning position-absolute bottom-0 start-0 m-2" style={{ fontSize: '0.72rem' }}>
                      <i className="bi bi-star-fill me-1"></i>{item.rating || 4.9}
                    </span>
                  </div>
                  <div className="fv-admin-grid-body p-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className={`fv-badge-cat fv-cat-${item.category}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {item.category}
                      </span>
                      <strong className="text-warning font-monospace small">
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                      </strong>
                    </div>
                    <div className="fw-bold text-white small text-truncate" title={nameVi}>
                      {nameVi}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                      ID: <code>{item.id}</code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VISUAL IMAGE SHOWCASE 2: BÀI VIẾT MEDIA & TRAILERS */}
      <div className="row g-4 mb-4">
        {/* Recent Articles Showcase */}
        <div className="col-12 col-lg-6">
          <div className="fv-admin-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-image-fill text-info"></i>
                Bài Viết & Media Nổi Bật
              </h5>
              <button
                type="button"
                className="fv-admin-btn-secondary py-1 px-2.5"
                style={{ fontSize: '0.8rem' }}
                onClick={() => onNavigateTab('contents')}
              >
                Quản lý ({stats.totalContents})
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {recentContents.map((c) => {
                const titleVi = c.title?.vi || c.title;
                return (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-3 d-flex gap-3 align-items-center"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                  >
                    <img
                      src={resolveAdminImage(c, c.category)}
                      alt={titleVi}
                      className="rounded-3 object-fit-cover flex-shrink-0"
                      style={{ width: '80px', height: '56px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      onError={(e) => handleImageFallback(e, c.category)}
                    />
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className={`fv-badge-cat fv-cat-${c.category}`} style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                          {c.category}
                        </span>
                        <span className="badge bg-secondary-subtle text-light" style={{ fontSize: '0.62rem' }}>
                          {c.type}
                        </span>
                        {c.featured && <span className="badge bg-warning text-dark" style={{ fontSize: '0.6rem' }}>⭐ Nổi bật</span>}
                      </div>
                      <div className="fw-semibold text-white small text-truncate" title={titleVi}>
                        {titleVi}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                        {c.dateAdded || 'Mới cập nhật'} • {c.author || 'Editorial'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Trailers Showcase */}
        <div className="col-12 col-lg-6">
          <div className="fv-admin-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-play-circle-fill text-danger"></i>
                Trailers Bom Tấn Mới Nhất
              </h5>
              <button
                type="button"
                className="fv-admin-btn-secondary py-1 px-2.5"
                style={{ fontSize: '0.8rem' }}
                onClick={() => onNavigateTab('trailers')}
              >
                Quản lý ({stats.totalTrailers})
              </button>
            </div>

            <div className="row g-2">
              {recentTrailers.map((t) => {
                const titleVi = t.title?.vi || t.title;
                return (
                  <div key={t.id} className="col-6">
                    <div className="fv-admin-grid-card">
                      <div className="fv-admin-grid-img-wrap" style={{ height: '105px' }}>
                        <img
                          src={resolveAdminImage(t, t.category)}
                          alt={titleVi}
                          className="fv-admin-grid-img"
                          onError={(e) => handleImageFallback(e, t.category)}
                        />
                        <div
                          className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center bg-danger text-white shadow"
                          style={{ width: '32px', height: '32px', opacity: 0.9 }}
                        >
                          <i className="bi bi-play-fill fs-5 ms-0.5"></i>
                        </div>
                        <span className="badge bg-black bg-opacity-75 text-white position-absolute bottom-0 end-0 m-1 font-monospace" style={{ fontSize: '0.65rem' }}>
                          {t.duration || '2:30'}
                        </span>
                      </div>
                      <div className="p-2">
                        <div className="fw-semibold text-white small text-truncate" title={titleVi} style={{ fontSize: '0.8rem' }}>
                          {titleVi}
                        </div>
                        <span className={`fv-badge-cat fv-cat-${t.category} mt-1`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                          {t.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL IMAGE SHOWCASE 3: NHÂN VẬT BIỂU TƯỢNG */}
      <div className="fv-admin-card mb-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-person-bounding-box" style={{ color: '#a29bfe' }}></i>
              Hồ Sơ Nhân Vật Biểu Tượng (Avatars & Visuals)
            </h5>
            <p className="text-secondary small mb-0">
              Nhân vật trung tâm của từng vũ trụ FandomVerse với hình ảnh đại diện đặc sắc.
            </p>
          </div>
          <button
            type="button"
            className="fv-admin-btn-secondary py-1 px-3"
            style={{ fontSize: '0.82rem' }}
            onClick={() => onNavigateTab('characters')}
          >
            Quản lý nhân vật ({stats.totalCharacters}) <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>

        <div className="row g-3">
          {recentCharacters.map((char) => {
            const nameVi = char.name?.vi || char.name;
            return (
              <div key={char.id} className="col-4 col-md-2 text-center">
                <div
                  className="p-3 rounded-4 transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <div
                    className="rounded-circle overflow-hidden mx-auto mb-2"
                    style={{
                      width: '74px',
                      height: '74px',
                      border: '2px solid rgba(0, 245, 212, 0.5)',
                      boxShadow: '0 0 16px rgba(0, 245, 212, 0.25)',
                    }}
                  >
                    <img
                      src={resolveAdminImage(char, char.category)}
                      alt={nameVi}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => handleImageFallback(e, char.category)}
                    />
                  </div>
                  <div className="fw-bold text-white small text-truncate" title={nameVi}>
                    {nameVi}
                  </div>
                  <div className="text-secondary text-truncate" style={{ fontSize: '0.7rem' }}>
                    {char.franchise}
                  </div>
                  <span className={`fv-badge-cat fv-cat-${char.category} mt-1`} style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                    {char.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Quick Actions */}
      <div className="row g-4 mb-4">
        {/* Category Breakdown */}
        <div className="col-12 col-lg-8">
          <div className="fv-admin-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <i className="bi bi-pie-chart-fill" style={{ color: '#00f5d4' }}></i>
                Phân bổ dữ liệu theo 7 Fandom
              </h5>
              <span className="badge bg-dark border border-secondary text-secondary">
                13 mục / phần
              </span>
            </div>
            <p className="text-secondary small mb-4">
              Mỗi danh mục được cân bằng đồng đều về bài viết, trailers bom tấn, sự kiện toàn cầu, nhân vật tiêu biểu và sản phẩm độc quyền.
            </p>

            <div className="d-flex flex-column gap-3">
              {Object.entries(stats.byCategory).map(([catKey, counts]) => {
                const info = CATEGORY_NAMES[catKey] || { name: catKey, color: '#fff', icon: 'bi-tag' };
                const pct = Math.round((counts.total / (stats.grandTotal || 1)) * 100);
                return (
                  <div key={catKey}>
                    <div className="d-flex justify-content-between align-items-center mb-1 small">
                      <span className="fw-bold d-flex align-items-center gap-2" style={{ color: info.color }}>
                        <i className={`bi ${info.icon}`}></i> {info.name}
                      </span>
                      <span className="text-secondary">
                        <strong className="text-white">{counts.total}</strong> mục ({counts.contents} bài viết, {counts.trailers} trailers, {counts.events} sự kiện, {counts.characters} nhân vật, {counts.merchandise} merch)
                      </span>
                    </div>
                    <div className="progress" style={{ height: '7px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: info.color,
                          borderRadius: '4px',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions & System Info */}
        <div className="col-12 col-lg-4">
          <div className="fv-admin-card h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                <i className="bi bi-lightning-charge-fill" style={{ color: '#feca57' }}></i>
                Thao tác nhanh
              </h5>
              <div className="d-flex flex-column gap-2 mb-4">
                <button
                  type="button"
                  className="fv-admin-btn-secondary justify-content-start w-100"
                  onClick={() => onNavigateTab('contents')}
                >
                  <i className="bi bi-plus-circle text-info"></i> Thêm bài viết / media mới
                </button>
                <button
                  type="button"
                  className="fv-admin-btn-secondary justify-content-start w-100"
                  onClick={() => onNavigateTab('trailers')}
                >
                  <i className="bi bi-plus-circle text-danger"></i> Thêm trailer bom tấn
                </button>
                <button
                  type="button"
                  className="fv-admin-btn-secondary justify-content-start w-100"
                  onClick={() => onNavigateTab('events')}
                >
                  <i className="bi bi-plus-circle text-primary"></i> Đăng lịch sự kiện mới
                </button>
                <button
                  type="button"
                  className="fv-admin-btn-secondary justify-content-start w-100"
                  onClick={() => onNavigateTab('merchandise')}
                >
                  <i className="bi bi-plus-circle text-warning"></i> Thêm vật phẩm shop
                </button>
                <button
                  type="button"
                  className="fv-admin-btn-secondary justify-content-start w-100"
                  onClick={() => onNavigateTab('characters')}
                >
                  <i className="bi bi-plus-circle text-purple" style={{ color: '#a29bfe' }}></i> Thêm hồ sơ nhân vật
                </button>
              </div>
            </div>

            <div
              className="p-3 rounded-3 mt-auto"
              style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div className="small text-secondary mb-1">Cơ chế lưu trữ:</div>
              <div className="fw-bold small text-white d-flex align-items-center gap-2">
                <i className="bi bi-hdd-network text-success"></i> LocalStorage + Live State Broadcast
              </div>
              <div className="small text-secondary mt-1" style={{ fontSize: '0.75rem' }}>
                Mọi thay đổi cập nhật tức thì ra ngoài giao diện người dùng.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
