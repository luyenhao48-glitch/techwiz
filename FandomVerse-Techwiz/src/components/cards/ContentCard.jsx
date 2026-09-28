import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBookmarks } from '../../context/BookmarkContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CATEGORY_LIST } from '../../constants.js';

export default function ContentCard({ item, onOpenMedia, onOpenGallery }) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bookmarked = isBookmarked(item.id);
  const hasAutoBookmarkedRef = useRef(false);

  const category = CATEGORY_LIST.find((c) => c.id === item.category);
  const categoryLabel = category ? t(`categories.${category.id}.label`) : item.category;
  const categoryColor = `var(--accent-${item.category}, #6C5CE7)`;

  useEffect(() => {
    if (
      isAuthenticated &&
      location.state?.autoBookmarkId === item.id &&
      !hasAutoBookmarkedRef.current
    ) {
      hasAutoBookmarkedRef.current = true;
      if (!isBookmarked(item.id)) {
        toggleBookmark(item);
      }
    }
  }, [isAuthenticated, location.state, item.id]);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          autoBookmarkId: item.id,
        },
      });
      return;
    }
    toggleBookmark(item);
  };

  const handleCardClick = () => {
    if ((item.type === 'video' || item.type === 'audio') && onOpenMedia) {
      onOpenMedia(item);
    } else if (item.type === 'gallery' && onOpenGallery) {
      onOpenGallery(item);
    } else if (item.type === 'article') {
      navigate(`/category/${item.category}/article/${item.id}`);
    }
  };

  // Type-specific icons & colors with full internationalization
  const typeConfig = {
    video: {
      label: 'VIDEO',
      color: '#ff4757',
      bgGlow: 'rgba(255, 71, 87, 0.45)',
      icon: 'bi-play-fill',
      actionText: isVi ? 'Xem video' : 'Watch video',
      actionIcon: 'bi-play-circle',
    },
    gallery: {
      label: isVi ? `BỘ ẢNH (${item.images?.length || 2})` : `GALLERY (${item.images?.length || 2})`,
      color: '#feca57',
      bgGlow: 'rgba(254, 202, 87, 0.45)',
      icon: 'bi-images',
      actionText: isVi ? 'Xem bộ ảnh' : 'View gallery',
      actionIcon: 'bi-eye',
    },
    audio: {
      label: 'AUDIO / PODCAST',
      color: '#00cec9',
      bgGlow: 'rgba(0, 206, 201, 0.45)',
      icon: 'bi-soundwave',
      actionText: isVi ? 'Nghe audio' : 'Listen audio',
      actionIcon: 'bi-headphones',
    },
    article: {
      label: isVi ? 'BÀI VIẾT' : 'ARTICLE',
      color: '#a29bfe',
      bgGlow: 'rgba(108, 92, 231, 0.45)',
      icon: 'bi-book-half',
      actionText: isVi ? 'Đọc chi tiết' : 'Read more',
      actionIcon: 'bi-arrow-right-circle',
    },
  }[item.type] || {
    label: isVi ? 'NỘI DUNG' : 'CONTENT',
    color: '#6C5CE7',
    bgGlow: 'rgba(108, 92, 231, 0.45)',
    icon: 'bi-star-fill',
    actionText: isVi ? 'Khám phá' : 'Explore',
    actionIcon: 'bi-arrow-right',
  };

  // Thời gian đọc ước tính (dựa trên độ dài nội dung thật, không phải số liệu ảo)
  const readTimeMinutes = item.type === 'article'
    ? Math.max(1, Math.round((item.shortDescription?.length || 0) / 90) + 2)
    : null;

  return (
    <div
      className={`card fv-card fv-content-card w-100 h-100 overflow-hidden accent-border-${item.category}`}
      style={{
        cursor: 'pointer',
        width: '100%',
        maxWidth: '100%',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '1.25rem',
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.06)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onClick={handleCardClick}
    >
      {/* Thumbnail with Trailer-like Dark Gradient & Centered Icon */}
      <div
        className="position-relative overflow-hidden fv-trailer-thumb-wrap"
        style={{ backgroundColor: '#000', height: 'clamp(190px, 15vw, 235px)' }}
      >
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-100 h-100 object-fit-cover"
          style={{
            opacity: 0.96,
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          loading="lazy"
        />

        {/* Cinematic Vignette Overlay — chỉ tối dần ở rìa để lộ rõ ảnh thật */}
        <div
          className="position-absolute inset-0 w-100 h-100 top-0 start-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(10,13,26,0.08) 40%, rgba(10,13,26,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Centered Trailer-style Glowing Play/Action Button với vòng pulse */}
        <div
          className="position-absolute top-50 start-50 translate-middle fv-content-icon-ring"
          style={{ pointerEvents: 'none', zIndex: 3, '--fv-ring-color': typeConfig.color }}
        >
          <div
            className="fv-trailer-play-icon"
            style={{
              width: '54px',
              height: '54px',
              background: typeConfig.color,
              boxShadow: `0 8px 24px ${typeConfig.bgGlow}`,
              color: item.type === 'gallery' ? '#000' : '#ffffff',
            }}
          >
            <i className={`bi ${typeConfig.icon} fs-3`}></i>
          </div>
        </div>

        {/* Category Badge Top-Left */}
        <span
          className="position-absolute top-0 start-0 m-3 badge rounded-pill px-3 py-1.5 text-white text-uppercase"
          style={{
            backgroundColor: categoryColor,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 4,
          }}
        >
          {categoryLabel}
        </span>

        {/* Format / Type Badge Top-Right */}
        <div
          className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
          style={{ zIndex: 4 }}
        >
          <span
            className="badge rounded-pill px-3 py-1.5 text-white small"
            style={{
              background: 'rgba(10, 13, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${typeConfig.color}50`,
              color: typeConfig.color,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {typeConfig.label}
          </span>

          {/* Bookmark Button */}
          <button
            type="button"
            className="btn btn-sm p-1 rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(10, 13, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              color: bookmarked ? '#ff4757' : '#ffffff',
            }}
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? t('common.unsave') : t('common.save')}
            title={bookmarked ? t('common.unsave') : t('common.save')}
          >
            <i className={`bi ${bookmarked ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '0.95rem' }}></i>
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 p-xl-4 d-flex flex-column flex-grow-1 justify-content-between fv-trailer-card-body">
        <div>
          <h6
            className={`font-heading fw-bold mb-2.5 ${isDark ? 'text-white' : 'text-dark'}`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.1rem',
              lineHeight: 1.35,
              fontSize: '1.14rem',
            }}
            title={item.title}
          >
            {item.title}
          </h6>

          {item.shortDescription && (
            <p
              className={`small mb-3 ${isDark ? 'text-white-50' : 'text-secondary'}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.92rem',
                lineHeight: 1.55,
              }}
            >
              {item.shortDescription}
            </p>
          )}

          {/* Subtags */}
          {item.subTags && item.subTags.length > 0 && (
            <div className="d-flex flex-wrap gap-1.5 mb-3">
              {item.subTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="badge rounded-pill small"
                  style={{
                    fontSize: '0.74rem',
                    padding: '0.35rem 0.7rem',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(108,92,231,0.08)',
                    color: isDark ? '#cbd5e1' : '#6C5CE7',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(108,92,231,0.15)',
                  }}
                >
                  #{typeof tag === 'object' ? tag.vi || tag.en : tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar matching Trailer Card */}
        <div className="d-flex align-items-center justify-content-between pt-3 border-top border-white-50 border-opacity-10 small mt-auto">
          <span className={`${isDark ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-calendar3 me-1"></i> {item.dateAdded || '2026'}
            {readTimeMinutes && (
              <>
                <span className="mx-1.5">•</span>
                <i className="bi bi-clock-history me-1"></i>{readTimeMinutes} {isVi ? 'phút đọc' : 'min read'}
              </>
            )}
          </span>
          <span
            className="fw-bold d-inline-flex align-items-center gap-1.5"
            style={{ color: typeConfig.color, fontSize: '0.9rem' }}
          >
            <span>{typeConfig.actionText}</span>
            <i className={`bi ${typeConfig.actionIcon} fs-6`}></i>
          </span>
        </div>
      </div>
    </div>
  );
}
