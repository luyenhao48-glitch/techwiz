import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_LIST } from '../constants.js';
import { useTheme } from '../context/ThemeContext.jsx';

const CATEGORY_IMAGES = {
  anime: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
  movies: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=500&auto=format&fit=crop&q=80',
  tvshows: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80',
  kpop: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
  comics: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
  manga: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
};

export default function About() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const CATEGORY_LIST_LOCALIZED = CATEGORY_LIST.map((cat) => ({
    ...cat,
    label: t(`categories.${cat.id}.label`),
    description: t(`categories.${cat.id}.description`),
  }));

  return (
    <div style={{ backgroundColor: isDark ? '#0c0f1d' : '#F8F9FC', transition: 'background-color 0.3s ease' }}>
      {/* 1. HERO */}
      <section className="container-fluid px-3 px-md-4 px-lg-5 pt-4 pb-2">
        <div className="about-hero text-center py-5 mb-2 rounded-4 px-3 position-relative overflow-hidden">
          <div className="about-hero-glow" aria-hidden="true"></div>

          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 animate-fade-rise"
            style={{
              background: isDark ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.1)',
              color: isDark ? '#a29bfe' : '#6C5CE7',
              border: isDark ? '1px solid rgba(108, 92, 231, 0.3)' : 'none',
            }}
          >
            <i className="bi bi-stars"></i>
            <span className="small fw-bold text-uppercase">{t('about.badgeLabel')}</span>
          </div>

          <h1 className="font-heading display-5 fw-bold text-primary mb-3 animate-fade-rise-delay">
            {t('about.title')}
          </h1>
          <p
            className={`lead mx-auto animate-fade-rise-delay-2 ${isDark ? 'text-white-50' : 'text-secondary'}`}
            style={{ maxWidth: '700px' }}
          >
            {t('about.subtitle')}
          </p>
          <div className="badge bg-primary px-3 py-2 fs-6 rounded-pill mt-2 animate-fade-rise-delay-2">
            {t('about.contestBadge')}
          </div>
        </div>
      </section>

      {/* 2. MISSION & TECH */}
      <section
        className="py-5"
        style={{
          backgroundColor: isDark ? '#0e1224' : '#F1F2F9',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-color)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <h2 className={`font-heading fw-bold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>
                {t('about.missionTitle')}
              </h2>
              <p className={isDark ? 'text-white-50' : 'text-secondary'}>{t('about.missionP1')}</p>
              <p className={isDark ? 'text-white-50' : 'text-secondary'}>
                <strong className={isDark ? 'text-white' : 'text-dark'}>FandomVerse</strong> {t('about.missionP2')}
              </p>
            </div>
            <div className="col-lg-6">
              <div
                className="p-4 rounded-4 shadow-sm"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                }}
              >
                <h4 className="font-heading fw-bold text-primary mb-3">{t('about.techTitle')}</h4>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-cpu text-primary fs-5 mt-1"></i>
                    <div className={isDark ? 'text-white-50' : 'text-secondary'}>
                      <strong className={isDark ? 'text-white' : 'text-dark'}>{t('about.tech1Title')}</strong> {t('about.tech1Desc')}
                    </div>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-robot text-success fs-5 mt-1"></i>
                    <div className={isDark ? 'text-white-50' : 'text-secondary'}>
                      <strong className={isDark ? 'text-white' : 'text-dark'}>{t('about.tech2Title')}</strong> {t('about.tech2Desc')}
                    </div>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-phone text-warning fs-5 mt-1"></i>
                    <div className={isDark ? 'text-white-50' : 'text-secondary'}>
                      <strong className={isDark ? 'text-white' : 'text-dark'}>{t('about.tech3Title')}</strong> {t('about.tech3Desc')}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 7 FANDOM UNIVERSES */}
      <section
        className="py-5"
        style={{
          backgroundColor: isDark ? '#0c0f1d' : '#FFFFFF',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-color)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2"
              style={{
                background: isDark ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.1)',
                color: isDark ? '#a29bfe' : '#6C5CE7',
                border: isDark ? '1px solid rgba(108, 92, 231, 0.3)' : 'none',
              }}
            >
              <i className="bi bi-compass-fill"></i>
              <span className="small fw-bold text-uppercase">{t('about.universesBadge')}</span>
            </div>
            <h3 className={`font-heading fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
              {t('about.universesTitle')}
            </h3>
          </div>

          <div className="row g-3 g-md-4">
            {CATEGORY_LIST_LOCALIZED.map((cat) => (
              <div key={cat.id} className="col-xl-3 col-lg-4 col-md-6 col-6">
                <Link
                  to={`/category/${cat.id}`}
                  className={`category-visual-card h-100 accent-border-${cat.id}`}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                  }}
                >
                  {CATEGORY_IMAGES[cat.id] && (
                    <div className="category-image-banner">
                      <img src={CATEGORY_IMAGES[cat.id]} alt={cat.label} />
                    </div>
                  )}

                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex align-items-center gap-3 mb-3 position-relative" style={{ zIndex: 2 }}>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center shadow-xs"
                        style={{
                          width: '54px',
                          height: '54px',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-surface-alt)',
                          border: `1.5px solid var(--accent-${cat.id})`,
                        }}
                      >
                        <i className={`bi ${cat.icon} fs-3`} style={{ color: `var(--accent-${cat.id})` }}></i>
                      </div>
                      <div>
                        <h4 className={`font-heading fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>{cat.label}</h4>
                        <span
                          className="badge rounded-pill px-2 py-0.5"
                          style={{
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(108, 92, 231, 0.08)',
                            color: `var(--accent-${cat.id})`,
                            fontSize: '0.7rem',
                          }}
                        >
                          {t('about.exploreCategory', { label: cat.label })}
                        </span>
                      </div>
                    </div>

                    <p className={`small mb-3 flex-grow-1 leading-relaxed position-relative ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ zIndex: 2 }}>
                      {cat.description}
                    </p>

                    <div
                      className="d-flex align-items-center justify-content-between small fw-bold pt-2 border-top border-white-50 border-opacity-10 position-relative"
                      style={{ color: `var(--accent-${cat.id})`, zIndex: 2 }}
                    >
                      <span>{t('home.viewContentCharacters')}</span>
                      <i className="bi bi-arrow-right"></i>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLOSING CTA */}
      <section
        className="py-5"
        style={{
          backgroundColor: isDark ? '#0e1224' : '#F1F2F9',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-color)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          <div
            className="p-5 rounded-4 text-center text-white position-relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B81 100%)' }}
          >
            <div
              className="about-hero-glow"
              aria-hidden="true"
              style={{ opacity: 0.5 }}
            ></div>
            <div className="position-relative" style={{ zIndex: 1 }}>
              <h5 className="font-heading fw-bold mb-2">{t('about.creditsTitle')}</h5>
              <p className="small mx-auto mb-4 text-white-50" style={{ maxWidth: '600px' }}>
                {t('about.creditsDesc')}
              </p>
              <Link
                to="/"
                className="btn liquid-glass rounded-pill fw-semibold text-white px-4 py-2"
              >
                {t('about.startJourney')} <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
