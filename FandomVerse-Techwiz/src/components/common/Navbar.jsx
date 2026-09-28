import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CATEGORY_LIST } from '../../constants.js';
import { searchService } from '../../services/searchService.js';
import { useCart } from '../../context/CartContext.jsx';
import { useBookmarks } from '../../context/BookmarkContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTranslation } from 'react-i18next';

const CONTENT_FILTER_TYPES = [
  { id: 'character', label: 'Nhân vật', icon: 'bi-person-badge' },
  { id: 'article', label: 'Bài viết', icon: 'bi-file-earmark-text' },
  { id: 'trailer', label: 'Trailers & Teaser', icon: 'bi-play-btn-fill' },
  { id: 'merchandise', label: 'Vật phẩm & Shop', icon: 'bi-bag-heart-fill' },
  { id: 'event', label: 'Sự kiện Fandom', icon: 'bi-calendar-event' },
  { id: 'gallery', label: 'Bộ ảnh & Gallery', icon: 'bi-images' },
];

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState({
    kind: 'all',
    id: 'all',
    label: 'Tất cả',
    icon: 'bi-grid-fill',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [quickFilterType, setQuickFilterType] = useState('all');
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isOverHero, setIsOverHero] = useState(true);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const categoriesRef = useRef(null);
  const languageRef = useRef(null);
  const userMenuRef = useRef(null);
  const directionAnchorRef = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isTransparentHero = location.pathname === '/' && isOverHero;

  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const { bookmarkCount } = useBookmarks();
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();

  // Over transparent hero: always white text and contrast, immune to dark/light theme.
  // When scrolled past hero or on other pages: dynamically adapts to theme!
  const navTextColor = isTransparentHero ? 'text-white' : (isDark ? 'text-white' : 'text-dark');
  const navSubTextColor = isTransparentHero ? 'text-white-50' : (isDark ? 'text-white-50' : 'text-secondary');
  const navCartColor = isTransparentHero ? 'text-white' : (isDark ? 'text-white' : 'text-primary');
  const navDividerBorder = isTransparentHero ? 'rgba(255, 255, 255, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.12)');

  const CATEGORY_LIST_LOCALIZED = useMemo(() => CATEGORY_LIST.map((cat) => ({
    ...cat,
    label: t(`categories.${cat.id}.label`) || cat.label,
  })), [t, language]);

  const CONTENT_FILTER_TYPES_LOCALIZED = useMemo(() => CONTENT_FILTER_TYPES.map((f) => ({
    ...f,
    label: t(`navbar.filterTypes.${f.id}`) || f.label,
  })), [t, language]);

  useEffect(() => {
    const HIDE_THRESHOLD = 60;
    const checkHeroAndScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if navbar is overlaying the hero section
      if (location.pathname === '/') {
        const heroEl = document.querySelector('.hero-stage-container') || document.querySelector('.hero-video-wrapper');
        if (heroEl) {
          const rect = heroEl.getBoundingClientRect();
          // Navbar is ~76px high. If hero bottom is still below 80px, navbar is over hero!
          setIsOverHero(rect.bottom > 80);
        } else {
          setIsOverHero(currentScrollY < (window.innerHeight - 100));
        }
      } else {
        setIsOverHero(false);
      }

      if (currentScrollY < 80) {
        setIsNavVisible(true);
        directionAnchorRef.current = currentScrollY;
        return;
      }
      const delta = currentScrollY - directionAnchorRef.current;
      if (delta > HIDE_THRESHOLD) {
        setIsNavVisible(false);
        directionAnchorRef.current = currentScrollY;
      } else if (delta < -HIDE_THRESHOLD) {
        setIsNavVisible(true);
        directionAnchorRef.current = currentScrollY;
      }
    };

    // Run immediately on mount and route change
    checkHeroAndScroll();

    window.addEventListener('scroll', checkHeroAndScroll, { passive: true });
    window.addEventListener('resize', checkHeroAndScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkHeroAndScroll);
      window.removeEventListener('resize', checkHeroAndScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsFilterOpen(false);
        setIsSuggestionsOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setIsCategoriesOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target)) {
        setIsLanguageOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const liveResults = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return [];
    let cat = filterMode.kind === 'category' ? filterMode.id : 'all';
    let typ = filterMode.kind === 'type' ? filterMode.id : (quickFilterType !== 'all' ? quickFilterType : 'all');
    return searchService.search(term, { category: cat, type: typ }).slice(0, 6);
  }, [searchTerm, filterMode, quickFilterType]);

  const totalResultsCount = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return 0;
    let cat = filterMode.kind === 'category' ? filterMode.id : 'all';
    let typ = filterMode.kind === 'type' ? filterMode.id : (quickFilterType !== 'all' ? quickFilterType : 'all');
    return searchService.search(term, { category: cat, type: typ }).length;
  }, [searchTerm, filterMode, quickFilterType]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const term = searchTerm.trim();
    if (term || filterMode.id !== 'all') {
      const params = new URLSearchParams();
      if (term) params.set('q', term);
      if (filterMode.kind === 'category') params.set('category', filterMode.id);
      if (filterMode.kind === 'type') {
        params.set('type', filterMode.id);
      } else if (quickFilterType !== 'all') {
        params.set('type', quickFilterType);
      }
      navigate(`/search?${params.toString()}`);
      setIsNavCollapsed(true);
      setIsSuggestionsOpen(false);
      setIsFilterOpen(false);
    }
  };

  const handleSelectFilter = (kind, id, label, icon) => {
    setFilterMode({ kind, id, label, icon });
    setIsFilterOpen(false);
    setQuickFilterType('all');
    if (searchTerm.trim()) {
      setIsSuggestionsOpen(true);
    }
  };

  const handleSuggestionClick = (targetUrl) => {
    setIsSuggestionsOpen(false);
    setIsFilterOpen(false);
    setIsNavCollapsed(true);
    const cleanPath = targetUrl.replace(/^#/, '');
    navigate(cleanPath);
  };

  return (
    <nav
      className={`navbar navbar-expand-xxl fixed-top py-2.5 fv-navbar ${isTransparentHero ? 'fv-navbar-transparent' : ''}`}
      style={{
        zIndex: 1030,
        transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.35s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div className="container-fluid px-3 px-md-4 px-lg-5">
        {/* Brand Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-decoration-none"
          onClick={() => setIsNavCollapsed(true)}
        >
          <span className={`font-heading tracking-wide fw-bold ${navTextColor}`}>
            Fandom<span style={{ background: 'linear-gradient(135deg, #6C5CE7, #FF6B81)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>Verse</span>
          </span>
        </Link>

        {/* Mobile Search Toggle Button */}
        <button
          className={`navbar-toggler border-0 shadow-none d-xxl-none ${navTextColor}`}
          type="button"
          aria-controls="fandomNavbar"
          aria-expanded={!isNavCollapsed}
          aria-label={isNavCollapsed ? 'Mở tìm kiếm' : 'Đóng tìm kiếm'}
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
        >
          <i className={`bi ${isNavCollapsed ? 'bi-search' : 'bi-x-lg'} fs-4`}></i>
        </button>

        {/* Nav Content */}
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="fandomNavbar">
          {/* Main Links (Desktop Only) */}
          <ul
            className="navbar-nav d-none d-xxl-flex me-auto mb-2 mb-lg-0 align-items-lg-center"
          >
            {/* 7 Categories Dropdown */}
            <li
              ref={categoriesRef}
              className={`nav-item dropdown ${isCategoriesOpen ? 'show' : ''}`}
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                type="button"
                className={`nav-link dropdown-toggle fw-semibold px-2.5 d-flex align-items-center gap-1 bg-transparent border-0 fv-nav-item-link ${navTextColor}`}
                id="categoriesDropdown"
                aria-expanded={isCategoriesOpen}
                onClick={() => setIsCategoriesOpen((open) => !open)}
              >
                <span>{t('navbar.fandomUniverse')}</span>
              </button>
              <ul
                className={`dropdown-menu ${isDark ? 'dropdown-menu-dark' : ''} border-0 shadow-lg rounded-4 py-2 fv-categories-dropdown-menu ${isCategoriesOpen ? 'show' : ''}`}
                style={{
                  backgroundColor: isDark ? '#12162a' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark
                    ? '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 20px rgba(108, 92, 231, 0.15)'
                    : '0 16px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(108, 92, 231, 0.08)',
                  textShadow: 'none',
                }}
                aria-labelledby="categoriesDropdown"
              >
                {CATEGORY_LIST_LOCALIZED.map((cat) => {
                  const isActiveCategory = location.pathname === `/category/${cat.id}`;
                  return (
                    <li key={cat.id}>
                      <Link
                        to={`/category/${cat.id}`}
                        className={`dropdown-item d-flex align-items-center gap-2 py-2 px-3 fv-category-dropdown-item fv-cat-${cat.id} ${isActiveCategory ? 'active' : ''}`}
                        style={{
                          color: isDark ? '#cbd5e1' : '#2d3436',
                          fontWeight: isActiveCategory ? 700 : 550,
                          textShadow: 'none',
                        }}
                        onClick={() => {
                          setIsNavCollapsed(true);
                          setIsCategoriesOpen(false);
                        }}
                      >
                        <i className={`bi ${cat.icon}`} style={{ color: `var(--accent-${cat.id})` }}></i>
                        <span>{cat.label}</span>
                        {isActiveCategory && (
                          <i className="bi bi-check2 ms-auto small" style={{ color: `var(--accent-${cat.id})` }}></i>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li className="nav-item">
              <Link
                to="/trailers"
                className={`nav-link fw-semibold px-2.5 text-nowrap fv-nav-item-link ${navTextColor} ${location.pathname === '/trailers' ? 'active' : ''}`}
                onClick={() => setIsNavCollapsed(true)}
              >
                <span>{t('navbar.trailers')}</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/merchandise"
                className={`nav-link fw-semibold px-2.5 text-nowrap fv-nav-item-link ${navTextColor} ${location.pathname === '/merchandise' ? 'active' : ''}`}
                onClick={() => setIsNavCollapsed(true)}
              >
                <span>{t('navbar.merchandise')}</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/contact"
                className={`nav-link fw-semibold px-2.5 text-nowrap fv-nav-item-link ${navTextColor} ${location.pathname === '/contact' ? 'active' : ''}`}
                onClick={() => setIsNavCollapsed(true)}
              >
                <span>{t('navbar.contact')}</span>
              </Link>
            </li>
          </ul>

          {/* Enhanced Global Search Bar with Integrated Filter & Live Suggestions */}
          <div
            ref={searchContainerRef}
            className="fv-search-wrapper me-lg-3 my-2 my-lg-0"
          >
            <form onSubmit={handleSearchSubmit} className="w-100">
              <div className="fv-search-group">
                {/* Filter Selector Button */}
                <button
                  type="button"
                  className={`btn fv-search-filter-btn ${isFilterOpen ? 'active' : ''}`}
                  onClick={() => {
                    setIsFilterOpen((prev) => !prev);
                    setIsSuggestionsOpen(false);
                  }}
                  aria-expanded={isFilterOpen}
                  title={t('navbar.searchFilterTitle')}
                >
                  <i className={`bi ${filterMode.icon}`}></i>
                  <span className="fv-search-filter-text">
                    {filterMode.id === 'all' ? t('navbar.all') : filterMode.label}
                  </span>
                  <i className={`bi bi-chevron-${isFilterOpen ? 'up' : 'down'}`} style={{ fontSize: '0.62rem' }}></i>
                </button>

                <span className="fv-search-divider" aria-hidden="true"></span>

                {/* Search Text Input */}
                <input
                  type="search"
                  className="fv-search-input border-0 shadow-none"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  placeholder={
                    filterMode.id !== 'all'
                      ? t('navbar.searchPlaceholderIn', { label: filterMode.label })
                      : t('navbar.searchPlaceholderDefault')
                  }
                  aria-label={t('navbar.searchAriaLabel')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.trim().length > 0) {
                      setIsSuggestionsOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchTerm.trim().length > 0) {
                      setIsSuggestionsOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSuggestionsOpen(false);
                      setIsFilterOpen(false);
                    }
                  }}
                />

                {/* Clear Button */}
                {searchTerm && (
                  <button
                    type="button"
                    className="btn fv-search-clear-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setIsSuggestionsOpen(false);
                    }}
                    title={t('navbar.clearKeyword')}
                    aria-label={t('navbar.clearKeyword')}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}

                {/* Submit Search Button */}
                <button
                  className="btn fv-search-submit-btn"
                  type="submit"
                  aria-label={t('navbar.searchButton')}
                  title={t('navbar.search')}
                >
                  <i className="bi bi-search fs-6"></i>
                </button>
              </div>
            </form>

            {/* Filter Dropdown Menu */}
            {isFilterOpen && (
              <div className="fv-search-filter-dropdown shadow-lg">
                <div className="fv-filter-dropdown-scroll">
                  {/* Reset / All */}
                  <button
                    type="button"
                    className={`fv-filter-item ${filterMode.id === 'all' ? 'active' : ''}`}
                    onClick={() => handleSelectFilter('all', 'all', t('navbar.all'), 'bi-grid-fill')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <i className="bi bi-grid-fill text-primary"></i>
                      <span>{t('navbar.allUniverses')}</span>
                    </span>
                    {filterMode.id === 'all' && <i className="bi bi-check2 text-primary fw-bold"></i>}
                  </button>

                  <hr className="my-1 border-secondary opacity-25" />

                  {/* Section 1: Categories */}
                  <div className="fv-filter-section-title">
                    <i className="bi bi-compass me-1"></i> {t('navbar.byUniverseCategory')}
                  </div>
                  {CATEGORY_LIST_LOCALIZED.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`fv-filter-item ${filterMode.id === c.id ? 'active' : ''}`}
                      onClick={() => handleSelectFilter('category', c.id, c.label, c.icon)}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <i className={`bi ${c.icon}`} style={{ color: c.accentColor }}></i>
                        <span>{c.label}</span>
                      </span>
                      {filterMode.id === c.id && <i className="bi bi-check2 text-primary fw-bold"></i>}
                    </button>
                  ))}

                  <hr className="my-1 border-secondary opacity-25" />

                  {/* Section 2: Content Types */}
                  <div className="fv-filter-section-title">
                    <i className="bi bi-layers me-1"></i> {t('navbar.byContentType')}
                  </div>
                  {CONTENT_FILTER_TYPES_LOCALIZED.map((fItem) => (
                    <button
                      key={fItem.id}
                      type="button"
                      className={`fv-filter-item ${filterMode.id === fItem.id ? 'active' : ''}`}
                      onClick={() => handleSelectFilter('type', fItem.id, fItem.label, fItem.icon)}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <i className={`bi ${fItem.icon} text-info`}></i>
                        <span>{fItem.label}</span>
                      </span>
                      {filterMode.id === fItem.id && <i className="bi bi-check2 text-primary fw-bold"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instant Live Suggestions Dropdown */}
            {isSuggestionsOpen && searchTerm.trim() && (
              <div className="fv-search-suggestions-dropdown shadow-xl">
                {/* Quick Type Filter Bar inside live suggestions */}
                <div className="fv-suggestions-quick-filters">
                  <span
                    className={`fv-quick-chip ${quickFilterType === 'all' ? 'active' : ''}`}
                    onClick={() => setQuickFilterType('all')}
                  >
                    {t('navbar.all')}
                  </span>
                  <span
                    className={`fv-quick-chip ${quickFilterType === 'character' ? 'active' : ''}`}
                    onClick={() => setQuickFilterType('character')}
                  >
                    👤 {t('navbar.filterTypes.character')}
                  </span>
                  <span
                    className={`fv-quick-chip ${quickFilterType === 'article' ? 'active' : ''}`}
                    onClick={() => setQuickFilterType('article')}
                  >
                    📰 {t('navbar.filterTypes.article')}
                  </span>
                  <span
                    className={`fv-quick-chip ${quickFilterType === 'trailer' ? 'active' : ''}`}
                    onClick={() => setQuickFilterType('trailer')}
                  >
                    🎥 {t('navbar.filterTypes.trailer')}
                  </span>
                  <span
                    className={`fv-quick-chip ${quickFilterType === 'merchandise' ? 'active' : ''}`}
                    onClick={() => setQuickFilterType('merchandise')}
                  >
                    🛍️ {t('navbar.filterTypes.merchandise')}
                  </span>
                </div>

                {/* Suggestions List */}
                <div className="fv-suggestions-list">
                  {liveResults.length === 0 ? (
                    <div className="p-3 text-center text-secondary small">
                      <i className="bi bi-search fs-4 d-block mb-1 opacity-50"></i>
                      {t('navbar.noResultsFor', { term: searchTerm })}
                    </div>
                  ) : (
                    liveResults.map((item) => (
                      <div
                        key={`${item.resultType}-${item.id}`}
                        className="fv-suggestion-item"
                        onClick={() => handleSuggestionClick(item.targetUrl)}
                      >
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="fv-suggestion-thumb"
                          />
                        ) : (
                          <div className="fv-suggestion-icon-thumb">
                            <i className="bi bi-file-earmark-text"></i>
                          </div>
                        )}
                        <div className="fv-suggestion-info">
                          <div className="fv-suggestion-title">{item.title}</div>
                          <div className="fv-suggestion-meta">
                            <span className={`badge-category badge-category-${item.category}`} style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
                              {item.category?.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span className={isDark ? 'text-white-50' : 'text-secondary'}>{item.resultType}</span>
                          </div>
                        </div>
                        <i className="bi bi-arrow-up-left small text-secondary opacity-75"></i>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer with Full Results Link */}
                <div className="fv-suggestions-footer">
                  <span className="text-secondary small">
                    {t('navbar.resultsFound', { count: totalResultsCount })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                  >
                    {t('navbar.viewAll')} <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Icons & Theme Switcher (Desktop Only) */}
          <div className="d-none d-xxl-flex flex-wrap align-items-center gap-2 mt-2 mt-lg-0">
            {/* Language Switcher Dropdown - Permanent styling from photo, immune to light/dark mode */}
            <div ref={languageRef} className={`dropdown ${isLanguageOpen ? 'show' : ''} position-relative`}>
              <button
                type="button"
                className="btn fv-lang-btn"
                title={t('navbar.chooseLanguage')}
                aria-label={t('navbar.language')}
                aria-expanded={isLanguageOpen}
                onClick={() => setIsLanguageOpen((open) => !open)}
              >
                <span>{language === 'vi' ? 'VN' : language.toUpperCase()}</span>
              </button>
              <ul
                className={`dropdown-menu dropdown-menu-end fv-lang-dropdown shadow-lg ${isLanguageOpen ? 'show' : ''}`}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  left: 'auto',
                  zIndex: 1050,
                }}
              >
                {languages.map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      className={`dropdown-item fv-lang-item ${language === l.code ? 'active' : ''}`}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLanguageOpen(false);
                      }}
                    >
                      <span style={{ fontSize: '1.15rem' }}>{l.flag}</span>
                      <span>{l.label}</span>
                      <span className={`badge ${isDark ? 'bg-white bg-opacity-10 text-white-50' : 'bg-secondary bg-opacity-10 text-secondary'} ms-auto small`} style={{ fontSize: '0.68rem' }}>
                        {l.code === 'vi' ? 'VN' : l.code.toUpperCase()}
                      </span>
                      {language === l.code && <i className="bi bi-check2 text-primary fw-bold ms-1"></i>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              type="button"
              className="btn fv-action-circle-btn position-relative shadow-xs"
              onClick={toggleTheme}
              title={isDark ? t('navbar.switchToLight') : t('navbar.switchToDark')}
              aria-label={t('navbar.toggleTheme')}
            >
              {isDark ? (
                <i className="bi bi-sun-fill fs-5" style={{ color: '#fdcb6e' }}></i>
              ) : (
                <i className="bi bi-moon-stars-fill fs-5" style={{ color: '#6C5CE7' }}></i>
              )}
            </button>

            {/* Bookmarks Icon Button */}
            <Link
              to="/bookmarks"
              className="btn fv-action-circle-btn position-relative shadow-xs"
              title={t('navbar.bookmarksTitle')}
              aria-label={t('navbar.bookmarksAriaLabel')}
              onClick={() => setIsNavCollapsed(true)}
            >
              <i className="bi bi-heart-fill fs-5" style={{ color: '#ff4757' }}></i>
              {bookmarkCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                  {bookmarkCount}
                </span>
              )}
            </Link>

            {/* Cart Icon Button */}
            <button
              type="button"
              className="btn fv-action-circle-btn position-relative shadow-xs"
              title={t('navbar.cartTitle')}
              aria-label={t('navbar.cartAriaLabel')}
              onClick={() => {
                setIsCartOpen(true);
                setIsNavCollapsed(true);
              }}
            >
              <i className={`bi bi-cart3 fs-5 ${navCartColor}`}></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: '0.7rem' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Section: Login/Signup or User Profile & Logout */}
            <div
              className="fv-auth-divider d-flex align-items-center gap-2.5 ms-2 border-start ps-3"
              style={{ borderColor: navDividerBorder }}
            >
              {isAuthenticated ? (
                <div ref={userMenuRef} className={`dropdown ${isUserMenuOpen ? 'show' : ''} position-relative`}>
                  <button
                    type="button"
                    className="btn d-flex align-items-center border-0 bg-transparent px-2 py-1 rounded-pill fv-user-nav-btn"
                    style={{ maxWidth: '200px', gap: '8px' }}
                    title={currentUser?.name}
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                  >
                    <i className="bi bi-person-circle fs-5 me-1" style={{ color: '#00a8ff', flexShrink: 0 }}></i>
                    <span className={`fv-username-text fw-bold fs-6 text-truncate ${navTextColor}`}>{currentUser?.name}</span>
                    <i className={`fv-user-chevron bi bi-chevron-${isUserMenuOpen ? 'up' : 'down'} ${navSubTextColor} ms-1`} style={{ fontSize: '0.65rem', flexShrink: 0 }}></i>
                  </button>

                  <ul
                    className={`dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 py-2 ${isDark ? 'dropdown-menu-dark' : ''} ${isUserMenuOpen ? 'show' : ''}`}
                    style={{
                      backgroundColor: isDark ? '#12162a' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                      width: '220px',
                      maxWidth: 'calc(100vw - 24px)',
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      left: 'auto',
                      zIndex: 1050,
                      textShadow: 'none',
                    }}
                  >
                    <li className="px-3 py-2">
                      <div className={`fw-bold text-truncate ${isDark ? 'text-white' : 'text-dark'}`}>{currentUser?.name}</div>
                      <div className={`small text-truncate ${isDark ? 'text-white-50' : 'text-secondary'}`}>{currentUser?.email}</div>
                    </li>
                    <li><hr className="dropdown-divider my-1" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} /></li>
                    <li>
                      <Link
                        to="/profile"
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                        style={{ color: isDark ? '#cbd5e1' : '#4b5563', fontWeight: 500 }}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsNavCollapsed(true);
                        }}
                      >
                        <i className="bi bi-person-fill" style={{ color: '#00a8ff' }}></i>
                        <span>{t('navbar.account') || 'Tài khoản'}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/orders"
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                        style={{ color: isDark ? '#cbd5e1' : '#4b5563', fontWeight: 500 }}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsNavCollapsed(true);
                        }}
                      >
                        <i className="bi bi-receipt-cutoff" style={{ color: '#00b894' }}></i>
                        <span>{t('navbar.orderHistory') || 'Lịch sử đơn hàng'}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/bookmarks"
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                        style={{ color: isDark ? '#cbd5e1' : '#4b5563', fontWeight: 500 }}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsNavCollapsed(true);
                        }}
                      >
                        <i className="bi bi-heart-fill" style={{ color: '#ff4757' }}></i>
                        <span>{t('navbar.bookmarksTitle')}</span>
                        {bookmarkCount > 0 && (
                          <span className="badge bg-danger rounded-pill ms-auto">{bookmarkCount}</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 w-100 text-start border-0 bg-transparent"
                        style={{ color: isDark ? '#cbd5e1' : '#4b5563', fontWeight: 500 }}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsNavCollapsed(true);
                          setIsCartOpen(true);
                        }}
                      >
                        <i className="bi bi-cart3" style={{ color: '#6C5CE7' }}></i>
                        <span>{t('navbar.cartTitle')}</span>
                        {cartCount > 0 && (
                          <span className="badge bg-primary rounded-pill ms-auto">{cartCount}</span>
                        )}
                      </button>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link
                          to="/admin"
                          className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                          style={{ color: '#00f5d4', fontWeight: 600 }}
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsNavCollapsed(true);
                          }}
                        >
                          <i className="bi bi-shield-lock-fill" style={{ color: '#00f5d4' }}></i>
                          <span>{t('navbar.adminPortal')}</span>
                          <span className="badge bg-success-subtle text-success border border-success-subtle ms-auto" style={{ fontSize: '0.65rem' }}>ADMIN</span>
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider my-1" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} /></li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 w-100 text-start border-0 bg-transparent text-danger fw-semibold"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsNavCollapsed(true);
                          logout();
                        }}
                      >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>{t('navbar.logout')}</span>
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ from: location.pathname + location.search }}
                    className="btn rounded-pill px-3 py-1 fw-semibold"
                    style={{
                      border: isTransparentHero
                        ? '1.5px solid rgba(255, 255, 255, 0.85)'
                        : (isDark ? '1.5px solid rgba(255, 255, 255, 0.85)' : '1.5px solid #6C5CE7'),
                      color: isTransparentHero
                        ? '#ffffff'
                        : (isDark ? '#ffffff' : '#6C5CE7'),
                      background: 'transparent',
                      fontSize: '0.875rem',
                    }}
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    {t('navbar.login')}
                  </Link>
                  <Link
                    to="/signup"
                    state={{ from: location.pathname + location.search }}
                    className="btn rounded-pill px-3 py-1 text-white fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B81 100%)',
                      fontSize: '0.875rem',
                      border: 'none',
                    }}
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    {t('navbar.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

