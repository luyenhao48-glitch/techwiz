import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_LIST } from '../../constants.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isDark } = useTheme();
  const [isFandomSheetOpen, setIsFandomSheetOpen] = useState(false);

  const isCategoryActive = location.pathname.startsWith('/category');

  const getNavLabel = (key, fallback) => {
    const val = t(key);
    if (!val || typeof val !== 'string' || val.startsWith('navbar.') || val === key) {
      return fallback;
    }
    return val;
  };

  return (
    <>
      {/* Quick Fandoms Bottom Sheet Modal */}
      {isFandomSheetOpen && (
        <div
          className="fv-mobile-sheet-backdrop"
          onClick={() => setIsFandomSheetOpen(false)}
        >
          <div
            className={`fv-mobile-sheet ${isDark ? 'dark' : 'light'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fv-mobile-sheet-handle"></div>
            <div className="d-flex align-items-center justify-content-between px-3 pt-2 pb-3 border-bottom border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-grid-3x3-gap-fill text-primary"></i>
                <h6 className="mb-0 fw-bold font-heading">{getNavLabel('navbar.fandomUniverse', 'Vũ Trụ Fandom')}</h6>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white-filter btn-sm"
                aria-label="Close"
                onClick={() => setIsFandomSheetOpen(false)}
              ></button>
            </div>

            <div className="p-3">
              <div className="row g-2">
                {CATEGORY_LIST.map((cat) => (
                  <div key={cat.id} className="col-4">
                    <NavLink
                      to={`/category/${cat.id}`}
                      className="fv-mobile-sheet-item"
                      onClick={() => setIsFandomSheetOpen(false)}
                    >
                      <div
                        className="fv-mobile-sheet-icon"
                        style={{
                          backgroundColor: `rgba(var(--accent-rgb-${cat.id}, 108, 92, 231), 0.15)`,
                          color: `var(--accent-${cat.id}, #6C5CE7)`,
                          border: `1.5px solid var(--accent-${cat.id}, #6C5CE7)`,
                        }}
                      >
                        <i className={`bi ${cat.icon}`}></i>
                      </div>
                      <span className="fv-mobile-sheet-label">{t(`categories.${cat.id}.label`)}</span>
                    </NavLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Fixed Bottom Navigation Bar */}
      <nav
        className={`fv-mobile-bottom-nav d-xxl-none ${isDark ? 'dark' : 'light'}`}
        aria-label="Mobile Bottom Navigation"
      >
        <div className="fv-mobile-nav-container">
          {/* 1. Trang chủ */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `fv-mobile-nav-tab ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-house-door-fill fv-mobile-nav-icon"></i>
            <span className="fv-mobile-nav-text">{getNavLabel('navbar.home', 'Trang chủ')}</span>
          </NavLink>

          {/* 2. Fandom Universe (Mở Sheet chọn nhanh) */}
          <button
            type="button"
            className={`fv-mobile-nav-tab ${isCategoryActive || isFandomSheetOpen ? 'active' : ''}`}
            onClick={() => setIsFandomSheetOpen((prev) => !prev)}
            aria-label="Khám phá vũ trụ"
          >
            <div className="position-relative">
              <i className="bi bi-grid-fill fv-mobile-nav-icon"></i>
              <span className="fv-mobile-nav-dot"></span>
            </div>
            <span className="fv-mobile-nav-text">{getNavLabel('navbar.fandomUniverseShort', 'Vũ trụ')}</span>
          </button>

          {/* 3. Trailers */}
          <NavLink
            to="/trailers"
            className={({ isActive }) =>
              `fv-mobile-nav-tab ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-play-circle-fill fv-mobile-nav-icon text-danger-nav"></i>
            <span className="fv-mobile-nav-text">{getNavLabel('navbar.trailersShort', 'Trailer')}</span>
          </NavLink>

          {/* 4. Shop / Merchandise */}
          <NavLink
            to="/merchandise"
            className={({ isActive }) =>
              `fv-mobile-nav-tab ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-bag-check-fill fv-mobile-nav-icon text-success-nav"></i>
            <span className="fv-mobile-nav-text">{getNavLabel('navbar.merchandiseShort', 'Cửa hàng')}</span>
          </NavLink>

          {/* 5. Tài khoản người dùng */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `fv-mobile-nav-tab position-relative ${isActive ? 'active' : ''}`
            }
          >
            <div className="position-relative">
              <i className="bi bi-person-circle fv-mobile-nav-icon"></i>
            </div>
            <span className="fv-mobile-nav-text">{getNavLabel('navbar.account', 'Tài khoản')}</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
}
