import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_LIST } from '../../constants.js';
import { useRealTimeClock } from '../../hooks/useRealTimeClock.js';
import { useVisitorCounter } from '../../hooks/useVisitorCounter.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Footer() {
  const { t } = useTranslation();
  const { bcp47 } = useLanguage();
  const { formattedTime, formattedDate } = useRealTimeClock();
  const visitorCount = useVisitorCounter();
  const { isDark } = useTheme();
  const CATEGORY_LIST_LOCALIZED = CATEGORY_LIST.map((cat) => ({
    ...cat,
    label: t(`categories.${cat.id}.label`),
  }));

  return (
    <footer className="dark-universe-footer mt-auto py-5">
      <div className="container-fluid px-3 px-md-4 px-lg-5">
        <div className="row g-4 g-xl-5 mb-4 justify-content-between">
          {/* Brand & Introduction */}
          <div className="col-xl-4 col-lg-4 col-md-12">
            <Link to="/" className={`d-flex align-items-center gap-2 text-decoration-none fs-4 fw-bold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>
              <span
                className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B81 100%)',
                  fontSize: '1.15rem',
                }}
              >
                🌌
              </span>
              <span className="font-heading">Fandom<span style={{ color: '#a29bfe' }}>Verse</span></span>
            </Link>
            <p className="small mb-3" style={{ maxWidth: '440px', lineHeight: '1.6' }}>
              {t('brand.tagline')}
            </p>
            {/* Live Clock & Visitor Counter Badge */}
            <div
              className="p-3 rounded-4"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                maxWidth: '440px',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className={`small d-flex align-items-center gap-1.5 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  <i className="bi bi-clock-history" style={{ color: '#a29bfe' }}></i> {t('footer.realTime')}
                </span>
                <span className="badge font-monospace" style={{ background: 'rgba(108, 92, 231, 0.25)', color: '#a29bfe', border: '1px solid rgba(108, 92, 231, 0.4)' }}>
                  {formattedTime}
                </span>
              </div>
              <div className={isDark ? 'text-white-50' : 'text-secondary'} style={{ fontSize: '0.75rem' }}>
                {formattedDate}
              </div>
              <hr className="my-2" style={{ opacity: 0.25, borderColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)' }} />
              <div className="d-flex align-items-center justify-content-between">
                <span className={`small d-flex align-items-center gap-1.5 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  <i className="bi bi-people-fill text-success"></i> {t('footer.totalVisitors')}
                </span>
                <span className="badge bg-success font-monospace">
                  {visitorCount.toLocaleString(bcp47)}
                </span>
              </div>
            </div>
          </div>

          {/* 7 Fandom Categories */}
          <div className="col-xl-4 col-lg-4 col-md-6">
            <h6 className={`font-heading fw-bold mb-3 d-flex align-items-center gap-2 ${isDark ? 'text-white' : 'text-dark'}`}>
              <i className="bi bi-grid-fill" style={{ color: '#a29bfe' }}></i> {t('footer.fandomUniverse')}
            </h6>
            <div className="row g-2">
              {CATEGORY_LIST_LOCALIZED.map((cat) => (
                <div key={cat.id} className="col-6 col-sm-6">
                  <Link
                    to={`/category/${cat.id}`}
                    className={`text-decoration-none small d-flex align-items-center gap-2 py-1.5 px-2 rounded-2 fv-footer-category-link ${isDark ? 'text-white-50' : 'text-secondary'}`}
                  >
                    <i className={`bi ${cat.icon}`} style={{ color: `var(--accent-${cat.id})` }}></i>
                    <span>{cat.label}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Useful Navigation & Info */}
          <div className="col-xl-2 col-lg-2 col-md-3 col-6">
            <h6 className={`font-heading fw-bold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>{t('footer.explore')}</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2">
                <Link to="/trailers" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.trailerHub')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/merchandise" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.merchandiseShop')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/bookmarks" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.savedContent')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/search" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.globalSearch')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Static */}
          <div className="col-xl-2 col-lg-2 col-md-3 col-6">
            <h6 className={`font-heading fw-bold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>{t('footer.info')}</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2">
                <Link to="/about" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.contactCoordinates')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.login')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/signup" className={`text-decoration-none ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                  {t('footer.createAccount')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`pt-4 mt-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 small ${isDark ? 'text-white-50' : 'text-secondary'}`}
          style={{ borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)' }}
        >
          <div>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>{t('footer.contest')} <strong style={{ color: '#a29bfe' }}>{t('footer.contestName')}</strong></span>
            <span className="badge rounded-pill" style={{ background: 'rgba(255,255,255,0.08)', color: '#a29bfe' }}>
              SPA v2.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
