import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MerchCard from '../cards/MerchCard.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * MerchandiseContentRow - Component hiển thị từng hàng sản phẩm dạng trượt (Slider Row)
 * Được thiết kế chuẩn giao diện FandomVerse với Badge phân loại, Tiêu đề, Phụ đề,
 * nút điều hướng chuyển slide (< >) và kéo chuột mượt mà 60fps.
 */
export default function MerchandiseContentRow({
  title,
  subtitle,
  icon = 'bi-bag-fill',
  color = '#6C5CE7',
  badgeText,
  items = [],
  cardWidth = '290px',
  onToast,
  onFilterSelf,
}) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const { isDark } = useTheme();
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = useCallback(() => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const handleResize = () => checkScrollBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollBounds, items]);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 * 1.5 : 320 * 1.5;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollBounds, 350);
    }
  };

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
    sliderRef.current.classList.add('is-dragging');
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScrollBounds();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    if (sliderRef.current) {
      sliderRef.current.classList.remove('is-dragging');
      checkScrollBounds();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="fv-merchandise-content-row mb-5">
      {/* Row Header giống hệt ảnh 2 */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-pill px-2.5 py-1 text-white small fw-bold d-inline-flex align-items-center gap-1.5"
              style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}
            >
              <i className={`bi ${icon}`}></i> {badgeText || (isVi ? `${items.length} Món` : `${items.length} Items`)}
            </span>
            <h3
              className={`font-heading fw-bold mb-0 fs-5 ${isDark ? 'text-white' : 'text-dark'}`}
            >
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className={`small mb-0 mt-1 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Row Controls */}
        <div className="d-flex align-items-center gap-2 align-self-end align-self-sm-center">
          {onFilterSelf && (
            <button
              type="button"
              className="btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 border-0"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? '#cbd5e1' : '#475569',
                fontSize: '0.8rem',
              }}
              onClick={onFilterSelf}
            >
              <span>{isVi ? 'Xem riêng mục này' : 'View only this section'}</span>
              <i className="bi bi-arrow-right"></i>
            </button>
          )}
          <button
            type="button"
            className="fv-slider-nav-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => scrollSlider('left')}
            disabled={!canScrollLeft}
            aria-label={isVi ? 'Cuộn sang trái' : 'Scroll left'}
            title={isVi ? 'Cuộn sang trái' : 'Scroll left'}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            type="button"
            className="fv-slider-nav-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => scrollSlider('right')}
            disabled={!canScrollRight}
            aria-label={isVi ? 'Cuộn sang phải' : 'Scroll right'}
            title={isVi ? 'Cuộn sang phải' : 'Scroll right'}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Interactive Sliding Track */}
      <div className="fv-trailer-slider-container">
        <div
          ref={sliderRef}
          className="fv-trailer-slider-track"
          onScroll={checkScrollBounds}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{ paddingBottom: '0.75rem', gap: '1.25rem' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="fv-trailer-card-item"
              style={{ flex: `0 0 ${cardWidth}`, maxWidth: cardWidth }}
            >
              <MerchCard item={item} onToast={onToast} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
