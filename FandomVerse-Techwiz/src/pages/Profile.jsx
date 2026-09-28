import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { useBookmarks } from '../context/BookmarkContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { CATEGORY_LIST } from '../constants.js';
import { storageService } from '../services/storageService.js';

export default function Profile() {
  const { t } = useTranslation();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { bookmarkCount } = useBookmarks();
  const { cartCount, cartTotal, setIsCartOpen } = useCart();
  const { isDark, setTheme } = useTheme();
  const { language, setLanguage, languages, bcp47 } = useLanguage();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [orders, setOrders] = useState(() => storageService.loadOrders());

  // Auto-refresh orders whenever an order is placed or storage changes
  useEffect(() => {
    const refreshOrders = () => {
      setOrders(storageService.loadOrders());
    };
    window.addEventListener('storage', refreshOrders);
    window.addEventListener('fv_order_created', refreshOrders);
    refreshOrders();
    return () => {
      window.removeEventListener('storage', refreshOrders);
      window.removeEventListener('fv_order_created', refreshOrders);
    };
  }, []);

  const interestCategory = CATEGORY_LIST.find((c) => c.id === currentUser?.fandomInterest);
  const joinedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(bcp47 || (language === 'vi' ? 'vi-VN' : language === 'hi' ? 'hi-IN' : 'en-US'), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  // Filter user orders to calculate order count
  const userOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    if (!isAuthenticated || !currentUser) return orders;

    const currentEmail = currentUser.email?.toLowerCase().trim();
    const matched = orders.filter((o) => {
      if (!o.userEmail || o.userEmail === 'guest') return true;
      const orderEmail = o.userEmail?.toLowerCase().trim();
      const shipEmail = o.shippingInfo?.email?.toLowerCase().trim();
      return orderEmail === currentEmail || shipEmail === currentEmail;
    });

    return matched.length > 0 ? matched : orders;
  }, [orders, isAuthenticated, currentUser]);

  return (
    <div
      className="container-fluid px-3 px-md-4 px-lg-5 py-4"
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 1. Profile / Account Header Card */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4"
        style={{
          backgroundColor: isDark ? '#12162a' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
        }}
      >
        {isAuthenticated && currentUser ? (
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
              style={{
                width: '84px',
                height: '84px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B81 100%)',
                fontSize: '2.5rem',
              }}
            >
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                <h4 className={`font-heading fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {currentUser.name}
                </h4>
                {interestCategory && (
                  <span className={`badge-category badge-category-${interestCategory.id} d-inline-flex align-items-center gap-1`}>
                    <i className={`bi ${interestCategory.icon}`}></i> {t(`categories.${interestCategory.id}.label`) || interestCategory.label}
                  </span>
                )}
              </div>
              <p className={`small mb-1 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                <i className="bi bi-envelope me-1"></i> {currentUser.email}
              </p>
              {joinedDate && (
                <p className={`small mb-0 ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-calendar3 me-1"></i> {t('profile.joinedDate', { date: joinedDate })}
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-semibold mt-2 mt-sm-0"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right me-1"></i> {t('auth.logout')}
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
              style={{
                width: '74px',
                height: '74px',
                background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                fontSize: '2.2rem',
              }}
            >
              <i className="bi bi-person"></i>
            </div>
            <div className="flex-grow-1">
              <h5 className={`font-heading fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>
                {t('profile.guestTitle')}
              </h5>
              <p className={`small mb-0 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                {t('profile.guestSubtitle')}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
              <Link to="/login" className="btn btn-sm btn-primary-fv rounded-pill px-3 py-1.5 fw-semibold">
                {t('auth.login')}
              </Link>
              <Link to="/signup" className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold">
                {t('auth.signup')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2. Core Activities: Giỏ hàng, Yêu thích & Lịch sử giao dịch */}
      <h6 className={`text-uppercase small fw-bold mb-3 ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ letterSpacing: '0.08em' }}>
        {t('profile.activitiesTitle')}
      </h6>
      <div className="row g-3 mb-4">
        {/* Giỏ Hàng (Cart) */}
        <div className="col-lg-4 col-sm-6 col-12">
          <div
            className="p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-between h-100"
            style={{
              backgroundColor: isDark ? '#12162a' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onClick={() => setIsCartOpen(true)}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(108, 92, 231, 0.05))',
                  color: '#6C5CE7',
                  border: '1px solid rgba(108, 92, 231, 0.3)',
                }}
              >
                <i className="bi bi-cart3 fs-4"></i>
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('profile.cartTitle')}
                </h6>
                <span className="small text-muted">
                  {cartCount > 0 ? t('profile.cartCount', { count: cartCount, total: cartTotal.toFixed(2) }) : t('profile.cartEmpty')}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary-fv rounded-pill px-3 py-1 font-monospace"
              onClick={(e) => {
                e.stopPropagation();
                setIsCartOpen(true);
              }}
            >
              {t('profile.openCart')}
            </button>
          </div>
        </div>

        {/* Mục Yêu Thích (Bookmarks) */}
        <div className="col-lg-4 col-sm-6 col-12">
          <Link
            to="/bookmarks"
            className="p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-between text-decoration-none h-100"
            style={{
              backgroundColor: isDark ? '#12162a' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(255, 71, 87, 0.05))',
                  color: '#ff4757',
                  border: '1px solid rgba(255, 71, 87, 0.3)',
                }}
              >
                <i className="bi bi-heart-fill fs-4"></i>
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('profile.bookmarksTitle')}
                </h6>
                <span className="small text-muted">
                  {bookmarkCount > 0 ? t('profile.bookmarksCount', { count: bookmarkCount }) : t('profile.bookmarksEmpty')}
                </span>
              </div>
            </div>
            <i className="bi bi-chevron-right text-secondary fs-5"></i>
          </Link>
        </div>

        {/* Lịch Sử Đơn Hàng & Giao Dịch (Dedicated Page inside) */}
        <div className="col-lg-4 col-sm-12 col-12">
          <Link
            to="/orders"
            className="p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-between text-decoration-none h-100"
            style={{
              backgroundColor: isDark ? '#12162a' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.2), rgba(0, 206, 201, 0.05))',
                  color: '#00b894',
                  border: '1px solid rgba(0, 184, 148, 0.3)',
                }}
              >
                <i className="bi bi-receipt-cutoff fs-4"></i>
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('profile.ordersTitle')}
                </h6>
                <span className="small text-muted">
                  {t('profile.ordersCount', { count: userOrders.length })}
                </span>
              </div>
            </div>
            <i className="bi bi-chevron-right text-secondary fs-5"></i>
          </Link>
        </div>
      </div>

      {/* 3. Cài Đặt Hệ Thống: Chế Độ Giao Diện & Ngôn Ngữ Dạng Xổ Xuống */}
      <h6 className={`text-uppercase small fw-bold mb-3 ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ letterSpacing: '0.08em' }}>
        {t('profile.settingsTitle')}
      </h6>
      <div className="d-flex flex-column gap-3 mb-4">
        {/* Item 1: Chế Độ Giao Diện (Accordion) */}
        <div
          className="rounded-4 shadow-sm overflow-hidden"
          style={{
            backgroundColor: isDark ? '#12162a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
            transition: 'border-color 0.2s ease',
          }}
        >
          {/* Header Row */}
          <div
            className="p-3 d-flex align-items-center justify-content-between"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsThemeOpen((prev) => !prev)}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '50px',
                  height: '50px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(162, 155, 254, 0.2), rgba(108, 92, 231, 0.1))'
                    : 'linear-gradient(135deg, rgba(255, 177, 66, 0.2), rgba(255, 159, 26, 0.1))',
                  color: isDark ? '#a29bfe' : '#e67e22',
                  border: isDark ? '1px solid rgba(162, 155, 254, 0.3)' : '1px solid rgba(255, 177, 66, 0.4)',
                }}
              >
                <i className={`bi ${isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill'} fs-4`}></i>
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('profile.themeTitle')}
                </h6>
                <span className="small text-muted">
                  {isDark ? `🌙 ${t('profile.darkTheme')}` : `☀️ ${t('profile.lightTheme')}`}
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill px-2.5 py-1 small"
                style={{
                  backgroundColor: isDark ? 'rgba(162, 155, 254, 0.15)' : 'rgba(230, 126, 34, 0.15)',
                  color: isDark ? '#a29bfe' : '#d35400',
                }}
              >
                {isDark ? t('profile.darkBadge') : t('profile.lightBadge')}
              </span>
              <i className={`bi bi-chevron-${isThemeOpen ? 'up' : 'down'} text-secondary fs-5`}></i>
            </div>
          </div>

          {/* Collapsible Options List */}
          {isThemeOpen && (
            <div className="px-3 pb-3 pt-1 border-top border-secondary border-opacity-10">
              <div className="d-flex flex-column gap-2 mt-2">
                {/* Dark Mode Choice */}
                <div
                  className={`p-2.5 rounded-3 d-flex align-items-center justify-content-between ${
                    isDark
                      ? 'bg-primary bg-opacity-20 border border-primary'
                      : (isDark ? 'bg-white bg-opacity-5' : 'bg-light')
                  }`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setTheme('dark')}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="fs-5">🌙</span>
                    <div>
                      <div className={`fw-semibold small ${isDark ? 'text-white' : 'text-dark'}`}>
                        {t('profile.darkTheme')}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {t('profile.darkSubtitle')}
                      </div>
                    </div>
                  </div>
                  {isDark && <i className="bi bi-check2-circle text-primary fs-5"></i>}
                </div>

                {/* Light Mode Choice */}
                <div
                  className={`p-2.5 rounded-3 d-flex align-items-center justify-content-between ${
                    !isDark
                      ? 'bg-primary bg-opacity-15 border border-primary'
                      : (isDark ? 'bg-white bg-opacity-5' : 'bg-light')
                  }`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setTheme('light')}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="fs-5">☀️</span>
                    <div>
                      <div className={`fw-semibold small ${isDark ? 'text-white' : 'text-dark'}`}>
                        {t('profile.lightTheme')}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {t('profile.lightSubtitle')}
                      </div>
                    </div>
                  </div>
                  {!isDark && <i className="bi bi-check2-circle text-primary fs-5"></i>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Item 2: Ngôn Ngữ Hiển Thị (Accordion) */}
        <div
          className="rounded-4 shadow-sm overflow-hidden"
          style={{
            backgroundColor: isDark ? '#12162a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
            transition: 'border-color 0.2s ease',
          }}
        >
          {/* Header Row */}
          <div
            className="p-3 d-flex align-items-center justify-content-between"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsLanguageOpen((prev) => !prev)}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.2), rgba(0, 206, 201, 0.1))',
                  color: '#00b894',
                  border: '1px solid rgba(0, 184, 148, 0.3)',
                }}
              >
                <i className="bi bi-translate fs-4"></i>
              </div>
              <div>
                <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('profile.languageTitle')}
                </h6>
                <span className="small text-muted">
                  {languages.find((l) => l.code === language)?.flag}{' '}
                  {languages.find((l) => l.code === language)?.label}
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill bg-success bg-opacity-10 text-success small">
                {languages.find((l) => l.code === language)?.label || language}
              </span>
              <i className={`bi bi-chevron-${isLanguageOpen ? 'up' : 'down'} text-secondary fs-5`}></i>
            </div>
          </div>

          {/* Collapsible Options List */}
          {isLanguageOpen && (
            <div className="px-3 pb-3 pt-1 border-top border-secondary border-opacity-10">
              <div className="d-flex flex-column gap-2 mt-2">
                {languages.map((l) => {
                  const isActive = language === l.code;
                  const languageDescriptions = {
                    vi: t('profile.langViDesc'),
                    en: t('profile.langEnDesc'),
                    hi: t('profile.langHiDesc'),
                  };
                  return (
                    <div
                      key={l.code}
                      className={`p-2.5 rounded-3 d-flex align-items-center justify-content-between ${
                        isActive
                          ? 'bg-primary bg-opacity-15 border border-primary'
                          : (isDark ? 'bg-white bg-opacity-5' : 'bg-light')
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setLanguage(l.code)}
                    >
                      <div className="d-flex align-items-center gap-2.5">
                        <span className="fs-4">{l.flag}</span>
                        <div>
                          <div className={`fw-semibold small ${isDark ? 'text-white' : 'text-dark'}`}>
                            {l.label}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {languageDescriptions[l.code] || l.label}
                          </div>
                        </div>
                      </div>
                      {isActive && <i className="bi bi-check2-circle text-primary fs-5"></i>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Khám phá & Tiện ích khác */}
      <h6 className={`text-uppercase small fw-bold mb-3 ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ letterSpacing: '0.08em' }}>
        {t('profile.exploreTitle')}
      </h6>
      <div
        className="rounded-4 shadow-sm overflow-hidden mb-4"
        style={{
          backgroundColor: isDark ? '#12162a' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
        }}
      >
        <Link
          to="/merchandise"
          className={`d-flex align-items-center justify-content-between p-3 text-decoration-none border-bottom ${isDark ? 'border-secondary border-opacity-25 text-white' : 'text-dark'}`}
        >
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-shop fs-5 text-success"></i>
            <span className="fw-semibold small">{t('profile.merchShop')}</span>
          </div>
          <i className="bi bi-chevron-right text-secondary"></i>
        </Link>
        <Link
          to="/trailers"
          className={`d-flex align-items-center justify-content-between p-3 text-decoration-none border-bottom ${isDark ? 'border-secondary border-opacity-25 text-white' : 'text-dark'}`}
        >
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-play-circle-fill fs-5 text-danger"></i>
            <span className="fw-semibold small">{t('profile.trailersHub')}</span>
          </div>
          <i className="bi bi-chevron-right text-secondary"></i>
        </Link>
        <Link
          to="/about"
          className={`d-flex align-items-center justify-content-between p-3 text-decoration-none border-bottom ${isDark ? 'border-secondary border-opacity-25 text-white' : 'text-dark'}`}
        >
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-info-circle-fill fs-5 text-info"></i>
            <span className="fw-semibold small">{t('profile.aboutUs')}</span>
          </div>
          <i className="bi bi-chevron-right text-secondary"></i>
        </Link>
        <Link
          to="/contact"
          className={`d-flex align-items-center justify-content-between p-3 text-decoration-none ${isDark ? 'text-white' : 'text-dark'}`}
        >
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-envelope-fill fs-5 text-warning"></i>
            <span className="fw-semibold small">{t('profile.contactSupport')}</span>
          </div>
          <i className="bi bi-chevron-right text-secondary"></i>
        </Link>
      </div>
    </div>
  );
}
