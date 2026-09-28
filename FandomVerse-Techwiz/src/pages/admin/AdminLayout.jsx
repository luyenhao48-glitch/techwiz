import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { dataService } from '../../services/dataService.js';
import '../../styles/admin.css';

// Admin Submodules
import AdminDashboard from './AdminDashboard.jsx';
import AdminContents from './AdminContents.jsx';
import AdminTrailers from './AdminTrailers.jsx';
import AdminEvents from './AdminEvents.jsx';
import AdminMerchandise from './AdminMerchandise.jsx';
import AdminCharacters from './AdminCharacters.jsx';
import AdminUsers from './AdminUsers.jsx';
import AdminSettings from './AdminSettings.jsx';

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Tab management: read from url hash or query or internal state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState(() => dataService.getStats());

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    const handleDataChange = () => setStats(dataService.getStats());
    window.addEventListener('fv_data_change', handleDataChange);
    return () => window.removeEventListener('fv_data_change', handleDataChange);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan hệ thống', icon: 'bi-grid-1x2-fill' },
    { id: 'contents', label: 'Bài viết & Media', icon: 'bi-file-earmark-richtext-fill', badge: stats.totalContents },
    { id: 'trailers', label: 'Trailers Bom Tấn', icon: 'bi-play-btn-fill', badge: stats.totalTrailers },
    { id: 'events', label: 'Sự kiện Fandom', icon: 'bi-calendar-event-fill', badge: stats.totalEvents },
    { id: 'merchandise', label: 'Cửa hàng Merch', icon: 'bi-bag-check-fill', badge: stats.totalMerchandise },
    { id: 'characters', label: 'Nhân vật biểu tượng', icon: 'bi-person-badge-fill', badge: stats.totalCharacters },
    { id: 'users', label: 'Quản lý thành viên', icon: 'bi-people-fill' },
    { id: 'settings', label: 'Cài đặt & Sao lưu', icon: 'bi-gear-fill' },
  ];

  return (
    <div className="fv-admin-wrapper">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="position-fixed top-0 bottom-0 start-0 end-0 bg-black bg-opacity-75 z-index-1030 d-lg-none"
          style={{ zIndex: 1030 }}
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fv-admin-sidebar ${isMobileSidebarOpen ? 'show' : ''}`}>
        {/* Brand header */}
        <div className="fv-admin-sidebar-brand justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="fv-admin-brand-icon">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div>
              <div className="fw-bold text-white lh-1 fs-6">FANDOMVERSE</div>
              <div className="text-secondary small" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                ADMIN PORTAL
              </div>
            </div>
          </div>
          <span className="badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: '0.65rem' }}>
            V2.0
          </span>
        </div>

        {/* Navigation list */}
        <div className="fv-admin-nav-group">
          <div className="fv-admin-nav-label">QUẢN LÝ DỮ LIỆU</div>

          {navItems.map((item) => (
            <div
              key={item.id}
              className={`fv-admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: '1.05rem' }}></i>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`badge ${
                    activeTab === item.id ? 'bg-dark text-info' : 'bg-secondary-subtle text-secondary'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <div className="fv-admin-nav-label mt-4">ĐIỀU HƯỚNG NHANH</div>
          <Link to="/" className="fv-admin-nav-item text-decoration-none">
            <i className="bi bi-box-arrow-left text-warning"></i>
            <span>Về trang chủ Website</span>
          </Link>
          <Link to="/trailers" className="fv-admin-nav-item text-decoration-none">
            <i className="bi bi-film text-danger"></i>
            <span>Xem Trailers Hub</span>
          </Link>
          <Link to="/merchandise" className="fv-admin-nav-item text-decoration-none">
            <i className="bi bi-shop text-success"></i>
            <span>Xem Cửa hàng Merch</span>
          </Link>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="fv-admin-sidebar-footer">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '34px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #00f5d4 0%, #7b2cbf 100%)',
                  color: '#060911',
                  flexShrink: 0,
                  fontSize: '0.85rem',
                }}
              >
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <div className="text-white small fw-bold text-truncate">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                  {currentUser?.role === 'admin' ? '🛡️ Quản trị viên' : '👤 Người dùng'}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger p-1 border-0"
              title="Đăng xuất Admin"
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="fv-admin-main">
        {/* Topbar */}
        <header className="fv-admin-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-lg-none"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small d-none d-sm-inline">Admin</span>
              <span className="text-secondary small d-none d-sm-inline">/</span>
              <span className="fw-bold text-white small">
                {navItems.find((n) => n.id === activeTab)?.label || 'Bảng điều khiển'}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="fv-admin-btn-secondary text-decoration-none py-1 px-3 d-none d-sm-inline-flex" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-box-arrow-up-right me-1"></i> Xem Website
            </Link>
            <div className="d-flex align-items-center gap-2 ps-2 border-start border-secondary">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#1a2035',
                  color: '#00f5d4',
                  border: '1px solid rgba(0, 245, 212, 0.4)',
                  fontSize: '0.8rem',
                }}
              >
                <i className="bi bi-person-check-fill"></i>
              </div>
              <span className="small text-white fw-semibold d-none d-md-inline me-2">
                {currentUser?.name || 'Admin'}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2.5 rounded-pill"
                style={{ fontSize: '0.78rem' }}
                onClick={() => {
                  logout();
                  navigate('/admin/login');
                }}
                title="Đăng xuất khỏi trung tâm quản trị"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-sm-inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Body Views */}
        <div className="fv-admin-body">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'contents' && <AdminContents onShowToast={showToast} />}
          {activeTab === 'trailers' && <AdminTrailers onShowToast={showToast} />}
          {activeTab === 'events' && <AdminEvents onShowToast={showToast} />}
          {activeTab === 'merchandise' && <AdminMerchandise onShowToast={showToast} />}
          {activeTab === 'characters' && <AdminCharacters onShowToast={showToast} />}
          {activeTab === 'users' && <AdminUsers onShowToast={showToast} />}
          {activeTab === 'settings' && <AdminSettings onShowToast={showToast} />}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fv-admin-toast">
          <i
            className={`bi ${
              toast.type === 'success' ? 'bi-check-circle-fill text-success fs-5' :
              toast.type === 'danger' ? 'bi-exclamation-triangle-fill text-danger fs-5' :
              'bi-info-circle-fill text-info fs-5'
            }`}
          ></i>
          <span className="small text-white fw-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
