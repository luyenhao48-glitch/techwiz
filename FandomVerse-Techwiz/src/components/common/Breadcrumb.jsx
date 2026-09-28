import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_LIST } from '../../constants.js';
import { dataService } from '../../services/dataService.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Breadcrumb() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;
  const { isDark } = useTheme();

  // Don't show breadcrumb on Home page
  if (path === '/' || path === '') {
    return null;
  }

  const parts = path.split('/').filter(Boolean);
  const crumbs = [{ label: t('breadcrumb.home'), to: '/' }];

  if (parts[0] === 'category') {
    const categoryId = parts[1];
    const cat = CATEGORY_LIST.find((c) => c.id === categoryId);
    const catLabel = cat ? t(`categories.${cat.id}.label`) : categoryId;
    crumbs.push({ label: catLabel, to: `/category/${categoryId}` });

    if (parts[2] === 'article' && parts[3]) {
      const contentId = parts[3];
      const content = dataService.getContentById(contentId);
      crumbs.push({
        label: content ? content.title : t('breadcrumb.articleDetail'),
        to: `/category/${categoryId}/article/${contentId}`,
      });
    }
  } else if (parts[0] === 'trailers') {
    crumbs.push({ label: t('breadcrumb.trailersHub'), to: '/trailers' });
  } else if (parts[0] === 'merchandise') {
    crumbs.push({ label: t('breadcrumb.merchandiseShop'), to: '/merchandise' });
  } else if (parts[0] === 'checkout') {
    crumbs.push({ label: t('breadcrumb.merchandiseShop'), to: '/merchandise' });
    crumbs.push({ label: t('breadcrumb.checkout'), to: '/checkout' });
  } else if (parts[0] === 'bookmarks') {
    crumbs.push({ label: t('breadcrumb.bookmarksNotes'), to: '/bookmarks' });
  } else if (parts[0] === 'search') {
    crumbs.push({ label: t('breadcrumb.searchResults'), to: '/search' });
  } else if (parts[0] === 'contact') {
    crumbs.push({ label: t('breadcrumb.contact'), to: '/contact' });
  } else if (parts[0] === 'about') {
    crumbs.push({ label: t('breadcrumb.about'), to: '/about' });
  } else if (parts[0] === 'login') {
    crumbs.push({ label: t('breadcrumb.login'), to: '/login' });
  } else if (parts[0] === 'signup') {
    crumbs.push({ label: t('breadcrumb.signup'), to: '/signup' });
  } else if (['orders', 'order-history', 'history', 'transactions'].includes(parts[0])) {
    crumbs.push({ label: t('breadcrumb.profile'), to: '/profile' });
    crumbs.push({ label: t('orders.title') || t('profile.ordersTitle'), to: '/orders' });
  } else if (['profile', 'account', 'my-account'].includes(parts[0])) {
    crumbs.push({ label: t('breadcrumb.profile'), to: '/profile' });
  } else {
    crumbs.push({ label: t('breadcrumb.genericPage'), to: path });
  }

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 pt-3">
      <nav
        aria-label="breadcrumb"
        className="py-2.5 px-3.5 rounded-4 mb-4"
        style={{
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 2px 12px rgba(15, 23, 42, 0.04)',
        }}
      >
        <ol className="breadcrumb mb-0 align-items-center">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li
              key={crumb.to + idx}
              className={`breadcrumb-item ${isLast ? 'fw-bold' : 'fw-medium'}`}
              aria-current={isLast ? 'page' : undefined}
              style={isLast ? { color: isDark ? '#e2e8f0' : '#1e293b' } : undefined}
            >
              {isLast ? (
                <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="text-decoration-none"
                  style={{ color: isDark ? '#a29bfe' : '#6C5CE7' }}
                >
                  {idx === 0 && <i className="bi bi-house-door me-1"></i>}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  </div>
);
}
