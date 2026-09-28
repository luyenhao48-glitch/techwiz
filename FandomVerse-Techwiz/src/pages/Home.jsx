import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_LIST } from '../constants.js';
import { dataService } from '../services/dataService.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import ContentCard from '../components/cards/ContentCard.jsx';
import EventCard from '../components/cards/EventCard.jsx';
import LightboxGallery from '../components/interactive/LightboxGallery.jsx';
import VideoModal from '../components/interactive/VideoModal.jsx';
import { useVideoVisibilityAutoplay } from '../hooks/useVideoVisibilityAutoplay.js';
import { useDataSync } from '../hooks/useDataSync.js';

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const dataVersion = useDataSync();

  const featuredContents = useMemo(() => dataService.getFeaturedContents(), [language, dataVersion]);
  const allTrailers = useMemo(() => dataService.getAllTrailers(), [language, dataVersion]);
  const upcomingEvents = useMemo(() => dataService.getAllEvents().filter((e) => e.date >= new Date().toISOString().split('T')[0]).slice(0, 3), [language, dataVersion]);

  const CATEGORY_LIST_LOCALIZED = useMemo(() => CATEGORY_LIST.map((cat) => ({
    ...cat,
    label: t(`categories.${cat.id}.label`) || cat.label,
    description: t(`categories.${cat.id}.description`) || cat.description,
  })), [t, language]);

  const [lightboxImages, setLightboxImages] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [trailerCategory, setTrailerCategory] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);

  const trailerSliderRef = useRef(null);
  const heroVideoRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const isTrailerHoveredRef = useRef(false);

  const checkScrollBounds = useCallback(() => {
    if (trailerSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trailerSliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  }, []);

  // Hiệu ứng lướt tự động mượt mà cho phần trailer
  useEffect(() => {
    if (!isAutoScrollActive) return;

    const interval = setInterval(() => {
      if (
        isTrailerHoveredRef.current ||
        isDraggingRef.current ||
        !trailerSliderRef.current ||
        activeVideo
      ) {
        return;
      }
      const slider = trailerSliderRef.current;
      const cardWidth = 360;
      const maxScroll = slider.scrollWidth - slider.clientWidth;

      if (slider.scrollLeft >= maxScroll - 30) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
      setTimeout(checkScrollBounds, 350);
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoScrollActive, checkScrollBounds, activeVideo]);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => { });
    }
  }, []);

  // Tự dừng video hero khi cuộn ra khỏi màn hình hoặc khi rời trang, để web mượt hơn
  useVideoVisibilityAutoplay(heroVideoRef);

  const filteredTrailers = useMemo(() => {
    if (trailerCategory === 'all') return allTrailers;
    return allTrailers.filter((t) => t.category === trailerCategory);
  }, [allTrailers, trailerCategory]);

  useEffect(() => {
    checkScrollBounds();
    const handleResize = () => checkScrollBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollBounds, filteredTrailers]);

  const scrollSlider = (direction) => {
    if (trailerSliderRef.current) {
      const cardWidth = 360;
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
      trailerSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollBounds, 350);
    }
  };

  const handleMouseDown = (e) => {
    if (!trailerSliderRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - trailerSliderRef.current.offsetLeft;
    scrollLeftRef.current = trailerSliderRef.current.scrollLeft;
    trailerSliderRef.current.classList.add('is-dragging');
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !trailerSliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - trailerSliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 6) {
      hasMovedRef.current = true;
    }
    trailerSliderRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScrollBounds();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    if (trailerSliderRef.current) {
      trailerSliderRef.current.classList.remove('is-dragging');
      checkScrollBounds();
    }
  };

  const scrollToCategories = () => {
    const el = document.getElementById('category-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: isDark ? '#0c0f1d' : '#F8F9FC', transition: 'background-color 0.3s ease' }}>
      {/* 1. CINEMATIC 1280x720 VIDEO HERO SECTION WITH DARK STAGE BACKDROP */}
      <div className="hero-stage-container hero-pull-under-nav">
        <section className="hero-video-wrapper position-relative text-white">
          {/* SVG unsharp-mask filter to counter the blur from upscaling a 720p source */}
          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <defs>
              <filter id="hero-video-sharpen">
                <feConvolveMatrix
                  order="3"
                  kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"
                  preserveAlpha="true"
                />
              </filter>
            </defs>
          </svg>

          {/* Fullscreen Video Background */}
          <video
            ref={heroVideoRef}
            key="hero-video-active"
            className="hero-video-element"
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-poster.png"
            src="/hero-video.mp4"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Cinematic Vignette Overlay */}
          <div className="hero-video-overlay" />

          {/* Hero Center Section */}
          <div
            className="position-relative flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-3 px-md-4"
            style={{
              zIndex: 10,
              maxWidth: '1100px',
              margin: '0 auto',
              paddingTop: '1.5rem',
              paddingBottom: '1rem',
            }}
          >
            {/* H1 */}
            <h1
              className="text-foreground animate-fade-rise fw-bold mb-0"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 'clamp(2rem, 4.8vw, 3.8rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
                maxWidth: '1000px',
              }}
            >
              {t('home.heroTitleWhere')}{' '}
              <em className="fst-normal text-muted-foreground">{t('home.heroTitleDreams')}</em>{' '}
              {t('home.heroTitleRise')}{' '}
              <em className="fst-normal text-muted-foreground">{t('home.heroTitleThrough')}</em>
            </h1>

            {/* Subtext */}
            <p
              className="animate-fade-rise-delay mt-2 mt-md-3 mb-0"
              style={{
                maxWidth: '38rem',
                fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
                lineHeight: 1.5,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.92)',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.75), 0 1px 16px rgba(0, 0, 0, 0.5)',
              }}
            >
              {t('home.heroSubtext')}
            </p>

            {/* CTA Button */}
            <button
              type="button"
              onClick={scrollToCategories}
              className="liquid-glass hero-cta-btn rounded-pill text-foreground animate-fade-rise-delay-2 mt-3 mt-md-4"
              style={{
                padding: '0.8rem 2.5rem',
                fontSize: '0.95rem',
                fontWeight: 550,
              }}
            >
              {t('home.heroCta')}
            </button>
          </div>

          {/* Bottom Indicator */}
          <div className="position-relative pb-2 pb-md-3 text-center" style={{ zIndex: 10 }}>
            <button
              type="button"
              onClick={scrollToCategories}
              className="btn btn-link text-muted-foreground hover-text-foreground text-decoration-none p-0 d-inline-flex flex-column align-items-center gap-1 opacity-75"
              style={{ fontSize: '0.72rem', letterSpacing: '0.12em' }}
            >
              <span className="text-uppercase">{t('home.exploreUniverse')}</span>
              <i className="bi bi-chevron-down animate-float-bounce"></i>
            </button>
          </div>
        </section>
      </div>

      {/* 2. 7 CATEGORY HUBS GRID - DYNAMIC THEME */}
      <section
        id="category-grid-section"
        className="py-4"
        style={{
          backgroundColor: isDark ? '#0e1224' : '#F1F2F9',
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
              <span className="small fw-bold text-uppercase">{t('home.discoverBadge')}</span>
            </div>
            <h2 className={`font-heading fw-bold display-6 mb-2 ${isDark ? 'text-white' : 'text-dark'}`}>
              {t('home.categoriesTitle')}
            </h2>
            <p className={`mx-auto ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ maxWidth: '580px' }}>
              {t('home.categoriesSubtitle')}
            </p>
          </div>

          <div className="row g-2 g-md-4">
            {CATEGORY_LIST_LOCALIZED.map((cat) => {
              const categoryImages = {
                anime: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
                gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
                movies: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=500&auto=format&fit=crop&q=80',
                tvshows: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80',
                kpop: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
                comics: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
                manga: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
              };

              return (
                <div key={cat.id} className="col-xl-3 col-lg-4 col-md-6 col-6">
                  <Link
                    to={`/category/${cat.id}`}
                    className={`category-visual-card h-100 accent-border-${cat.id}`}
                    style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                    }}
                  >
                    {/* Visible Category Illustration */}
                    {categoryImages[cat.id] && (
                      <div className="category-image-banner">
                        <img src={categoryImages[cat.id]} alt={cat.label} />
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
                            {t('home.exploreUniverse')}
                          </span>
                        </div>
                      </div>

                      <p className={`small mb-3 flex-grow-1 leading-relaxed position-relative ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ zIndex: 2 }}>
                        {cat.description}
                      </p>

                      <div className="d-flex align-items-center justify-content-between small fw-bold pt-2 border-top border-white-50 border-opacity-10 position-relative" style={{ color: `var(--accent-${cat.id})`, zIndex: 2 }}>
                        <span>{t('home.viewContentCharacters')}</span>
                        <i className="bi bi-arrow-right"></i>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}

            {/* 8th Card: Quick Link to Merchandise */}
            <div className="col-xl-3 col-lg-4 col-md-6 col-6">
              <Link
                to="/merchandise"
                className="category-visual-card h-100 text-white position-relative"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B81 100%)',
                  border: 'none',
                }}
              >
                <div className="category-image-banner">
                  <img
                    src="https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80"
                    alt="Merchandise Store"
                  />
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex align-items-center gap-3 mb-3 position-relative" style={{ zIndex: 2 }}>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm"
                      style={{ width: '54px', height: '54px' }}
                    >
                      <i className="bi bi-bag-check-fill fs-3" style={{ color: '#6C5CE7' }}></i>
                    </div>
                    <div>
                      <h4 className="font-heading fw-bold text-white mb-0">{t('home.merchCardTitle')}</h4>
                      <span className="badge bg-warning text-dark rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                        {t('home.merchCardBadge')}
                      </span>
                    </div>
                  </div>
                  <p className="text-white-50 small mb-3 flex-grow-1 leading-relaxed position-relative" style={{ zIndex: 2 }}>
                    {t('home.merchCardDesc')}
                  </p>
                  <div className="d-flex align-items-center justify-content-between text-white small fw-bold pt-2 border-top border-white-50 position-relative" style={{ zIndex: 2 }}>
                    <span>{t('home.enterMerchShop')}</span>
                    <i className="bi bi-arrow-right"></i>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CONTENTS SHOWCASE - DYNAMIC THEME */}
      <section
        className="py-5"
        style={{
          backgroundColor: isDark ? '#0c0f1d' : '#f5f6fa',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-color)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-color)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-md-4 px-xl-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-warning text-dark fw-bold">{t('home.spotlightBadge')}</span>
                <h2 className={`font-heading fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>{t('home.featuredTitle')}</h2>
              </div>
              <p className={`small mb-0 ${isDark ? 'text-white-50' : 'text-secondary'}`}>{t('home.featuredSubtitle')}</p>
            </div>
          </div>

          <div className="row g-3 g-xl-4">
            {featuredContents.slice(0, 8).map((item) => (
              <div key={item.id} className="col-xl-3 col-lg-3 col-md-6 col-12 d-flex">
                <div className="w-100 h-100">
                  <ContentCard
                    item={item}
                    onOpenGallery={(g) => setLightboxImages(g.images)}
                    onOpenMedia={(v) => setActiveVideo(v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LATEST TRAILERS SECTION - CAROUSEL SLIDER ("LƯỚT") */}
      <section className="py-5" style={{ backgroundColor: isDark ? '#0a0d1a' : '#F8F9FC', transition: 'background-color 0.3s ease' }}>
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          {/* Header & Controls */}
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge rounded-pill bg-danger px-2.5 py-1 text-white small fw-bold d-inline-flex align-items-center gap-1">
                  <i className="bi bi-play-circle-fill"></i> {t('home.trailersBadge')}
                </span>
                <h2 className={`font-heading fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('home.trailersTitle')}
                </h2>
              </div>
              <p className={`small mb-0 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                {t('home.trailersSubtitle')}
              </p>
            </div>

            {/* Slider Navigation Arrows & View All Link & Auto-scroll Toggle */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 border-0 fv-autoscroll-toggle"
                onClick={() => setIsAutoScrollActive(!isAutoScrollActive)}
                title={isAutoScrollActive ? 'Bấm để tạm dừng lướt tự động' : 'Bấm để bật lướt tự động'}
                style={{
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  // Đặt màu trực tiếp thay vì dùng class bg-opacity-* của Bootstrap
                  // (class đó bị lỗi không giảm được độ mờ trong dự án này, khiến nút bị đặc màu che mất chữ)
                  backgroundColor: isAutoScrollActive
                    ? 'rgba(220, 53, 69, 0.18)'
                    : isDark
                    ? 'rgba(148, 163, 184, 0.18)'
                    : 'rgba(100, 116, 139, 0.1)',
                  color: isAutoScrollActive ? '#dc3545' : isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
                }}
              >
                <i className={`bi ${isAutoScrollActive ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'}`}></i>
                <span>{isAutoScrollActive ? 'Tự động lướt: Bật' : 'Tự động lướt: Tắt'}</span>
              </button>
              <button
                type="button"
                className="fv-slider-nav-btn"
                onClick={() => scrollSlider('left')}
                disabled={!canScrollLeft}
                aria-label={t('home.scrollLeftAria')}
                title={t('home.scrollLeftAria')}
              >
                <i className="bi bi-chevron-left fs-5"></i>
              </button>
              <button
                type="button"
                className="fv-slider-nav-btn"
                onClick={() => scrollSlider('right')}
                disabled={!canScrollRight}
                aria-label={t('home.scrollRightAria')}
                title={t('home.scrollRightAria')}
              >
                <i className="bi bi-chevron-right fs-5"></i>
              </button>
              <Link
                to="/trailers"
                className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1 ms-1"
              >
                <span>{t('home.viewAllTrailers', { count: allTrailers.length })}</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Category Filter Chips for Quick Sliding */}
          <div className="d-flex align-items-center gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              type="button"
              className={`fv-trailer-filter-chip ${trailerCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setTrailerCategory('all');
                if (trailerSliderRef.current) trailerSliderRef.current.scrollLeft = 0;
              }}
            >
              {t('home.allChip', { count: allTrailers.length })}
            </button>
            {CATEGORY_LIST_LOCALIZED.map((cat) => {
              const count = allTrailers.filter((t2) => t2.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`fv-trailer-filter-chip ${trailerCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setTrailerCategory(cat.id);
                    if (trailerSliderRef.current) trailerSliderRef.current.scrollLeft = 0;
                  }}
                >
                  <i className={`bi ${cat.icon} me-1`}></i>
                  {t('home.categoryChip', { label: cat.label, count })}
                </button>
              );
            })}
          </div>

          {/* Interactive Sliding Track ("Lướt") */}
          <div
            className="fv-trailer-slider-container"
            onMouseEnter={() => {
              isTrailerHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isTrailerHoveredRef.current = false;
              handleMouseUpOrLeave();
            }}
          >
            <div
              ref={trailerSliderRef}
              className="fv-trailer-slider-track"
              onScroll={checkScrollBounds}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {filteredTrailers.map((tItem) => {
                const categoryColor = `var(--accent-${tItem.category}, #6C5CE7)`;
                return (
                  <div key={tItem.id} className="fv-trailer-card-item">
                    <div
                      className="card fv-card h-100 overflow-hidden shadow-sm"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                      }}
                      onClick={() => {
                        if (hasMovedRef.current) return;
                        setActiveVideo(tItem);
                      }}
                    >
                      {/* Video Thumbnail with Hover Zoom */}
                      <div className="position-relative overflow-hidden fv-trailer-thumb-wrap" style={{ backgroundColor: '#000' }}>
                        <img
                          src={tItem.thumbnail}
                          alt={tItem.title}
                          className="w-100 h-100 object-fit-cover"
                          style={{
                            opacity: 0.88,
                            transition: 'transform 0.4s ease',
                          }}
                          loading="lazy"
                        />
                        <div
                          className="position-absolute inset-0 w-100 h-100 top-0 start-0"
                          style={{
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(10,13,26,0.7) 100%)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* Centered Play Button */}
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <div className="fv-trailer-play-icon">
                            <i className="bi bi-play-fill fs-3 ms-0.5"></i>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <span
                          className="position-absolute top-0 start-0 m-2.5 badge rounded-pill px-2.5 py-1 text-white text-uppercase"
                          style={{
                            backgroundColor: categoryColor,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          }}
                        >
                          {tItem.category}
                        </span>

                        {/* Status Badge */}
                        <span
                          className="position-absolute top-0 end-0 m-2.5 badge rounded-pill px-2 py-1 text-white small"
                          style={{
                            background: tItem.status === 'released' ? 'rgba(0, 184, 148, 0.9)' : 'rgba(108, 92, 231, 0.9)',
                            backdropFilter: 'blur(6px)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          {tItem.status === 'released' ? t('home.newRelease') : t('home.comingSoon')}
                        </span>
                      </div>

                      {/* Card Info */}
                      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between fv-trailer-card-body">
                        <div>
                          <h6
                            className={`font-heading fw-bold mb-2 ${isDark ? 'text-white' : 'text-dark'}`}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '2.5rem',
                              lineHeight: 1.3,
                              fontSize: '0.95rem',
                            }}
                            title={tItem.title}
                          >
                            {tItem.title}
                          </h6>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top border-white-50 border-opacity-10 small">
                          <span className={`${isDark ? 'text-white-50' : 'text-muted'}`}>
                            <i className="bi bi-calendar3 me-1"></i> {tItem.releaseDate}
                          </span>
                          <span
                            className="fw-bold d-inline-flex align-items-center gap-1"
                            style={{ color: '#ff4757', fontSize: '0.8rem' }}
                          >
                            <span>{t('home.watchNow')}</span>
                            <i className="bi bi-play-circle"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Swipe Hint */}
            <div className="d-flex align-items-center justify-content-between mt-2 px-1">
              <span className={`small ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-arrows-expand me-1"></i> {t('home.swipeHint', { count: filteredTrailers.length })}
              </span>
              <div className="d-flex align-items-center gap-1.5">
                <span className={`small fw-semibold ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.78rem' }}>
                  {t('home.trailersAvailable', { count: filteredTrailers.length })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. UPCOMING EVENTS HIGHLIGHT - DYNAMIC THEME */}
      <section
        className="py-4"
        style={{
          backgroundColor: isDark ? '#0c0f1d' : '#FFFFFF',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-color)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
            <div>
              <h2 className={`font-heading fw-bold mb-1 d-flex align-items-center gap-2 ${isDark ? 'text-white' : 'text-dark'}`}>
                <i className="bi bi-calendar-event" style={{ color: '#a29bfe' }}></i> {t('home.eventsTitle')}
              </h2>
              <p className={`small mb-0 ${isDark ? 'text-white-50' : 'text-secondary'}`}>{t('home.eventsSubtitle')}</p>
            </div>
          </div>

          <div className="row g-3">
            {upcomingEvents.map((evt) => (
              <div key={evt.id} className="col-lg-4 col-md-6 col-12">
                <EventCard event={evt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {lightboxImages && (
        <LightboxGallery
          images={lightboxImages}
          title={t('home.featuredGalleryTitle')}
          onClose={() => setLightboxImages(null)}
        />
      )}

      {activeVideo && (
        <VideoModal item={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
