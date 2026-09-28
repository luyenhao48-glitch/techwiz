import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dataService } from '../services/dataService.js';
import { useDataSync } from '../hooks/useDataSync.js';
import { CATEGORY_LIST } from '../constants.js';
import { useBookmarks } from '../context/BookmarkContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ContentCard from '../components/cards/ContentCard.jsx';
import LightboxGallery from '../components/interactive/LightboxGallery.jsx';
import VideoModal from '../components/interactive/VideoModal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function ContentDetail() {
  const { t } = useTranslation();
  const { categoryId, contentId } = useParams();
  useDataSync(); // re-render when admin edits this item
  const content = dataService.getContentById(contentId);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bookmarked = content ? isBookmarked(content.id) : false;

  // Auto bookmark after login redirect if requested
  useEffect(() => {
    if (isAuthenticated && content && location.state?.autoBookmarkId === content.id) {
      if (!isBookmarked(content.id)) {
        toggleBookmark(content);
      }
    }
  }, [isAuthenticated, location.state, content]);

  const handleBookmarkToggle = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          autoBookmarkId: content?.id,
        },
      });
      return;
    }
    toggleBookmark(content);
  };

  const [lightboxImages, setLightboxImages] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  if (!content) {
    return (
      <div className="container-fluid px-3 px-md-4 px-lg-5 py-5">
        <EmptyState
          title={t('contentDetail.notFoundTitle')}
          message={t('contentDetail.notFoundMessage')}
          actionLabel={t('contentDetail.backToCategory')}
          onAction={() => (window.location.hash = `#/category/${categoryId || 'anime'}`)}
        />
      </div>
    );
  }

  const category = CATEGORY_LIST.find((c) => c.id === content.category);
  const categoryLabel = category ? t(`categories.${category.id}.label`) : content.category;
  const related = dataService.getRelatedContents(content.category, content.id, 3);

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
      <div className="row g-4 justify-content-center">
        {/* Main Article Content */}
        <div className="col-lg-9 col-12">
          {/* Article Header */}
          <div className="mb-4">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <Link
                to={`/category/${content.category}`}
                className={`badge-category badge-category-${content.category} text-decoration-none`}
              >
                {categoryLabel}
              </Link>
              <span className="text-muted small">
                <i className="bi bi-calendar3 me-1"></i> {content.dateAdded}
              </span>
              <span className="text-muted small">
                <i className="bi bi-person-fill me-1"></i> {t('contentDetail.editorialTeam')}
              </span>
            </div>

            <h1 className="font-heading display-6 fw-bold text-dark mb-3">
              {content.title}
            </h1>

            <p className="lead text-secondary fw-normal mb-4">
              {content.shortDescription}
            </p>

            {/* Action Bar (Bookmark & Share) */}
            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border mb-4">
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${
                  bookmarked ? 'btn-danger text-white' : 'btn-outline-danger'
                }`}
                onClick={handleBookmarkToggle}
              >
                <i className={`bi ${bookmarked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                <span>{bookmarked ? t('contentDetail.bookmarked') : t('contentDetail.notBookmarked')}</span>
              </button>

              <Link
                to={`/category/${content.category}`}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2"
              >
                <i className="bi bi-arrow-left me-1"></i> {t('contentDetail.backTo', { label: categoryLabel })}
              </Link>
            </div>
          </div>

          {/* Main Featured Image */}
          <div className="rounded-4 overflow-hidden shadow-sm mb-4" style={{ maxHeight: '480px' }}>
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-100 h-100 object-fit-cover"
            />
          </div>

          {/* Article Body */}
          <div className="article-body bg-white p-4 p-md-5 rounded-4 shadow-sm border mb-5">
            {content.body ? (
              content.body.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="fs-5 leading-relaxed text-secondary mb-4">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="fs-5 text-secondary">{content.shortDescription}</p>
            )}

            {/* Additional Gallery if available */}
            {content.images && content.images.length > 0 && (
              <div className="mt-5 pt-4 border-top">
                <h4 className="font-heading fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-images text-warning"></i> {t('contentDetail.galleryTitle', { count: content.images.length })}
                </h4>
                <div className="row g-2">
                  {content.images.map((img, i) => (
                    <div key={img + i} className="col-md-4 col-6">
                      <div
                        className="rounded-3 overflow-hidden shadow-xs position-relative"
                        style={{ height: '140px', cursor: 'pointer' }}
                        onClick={() => setLightboxImages(content.images)}
                      >
                        <img src={img} alt={t('contentDetail.imageAlt', { index: i + 1 })} className="w-100 h-100 object-fit-cover hover-scale" />
                        <div className="position-absolute bottom-0 end-0 m-1 badge bg-dark bg-opacity-75 text-white small">
                          <i className="bi bi-zoom-in"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub Tags */}
            {content.subTags && (
              <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
                <span className="small text-muted me-2 align-self-center">{t('contentDetail.tagsLabel')}</span>
                {content.subTags.map((tag) => (
                  <span key={tag} className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Related Contents */}
          {related.length > 0 && (
            <div className="mb-5">
              <h3 className="font-heading fw-bold text-dark mb-4">{t('contentDetail.relatedTitle', { label: categoryLabel })}</h3>
              <div className="row g-3">
                {related.map((item) => (
                  <div key={item.id} className="col-md-4 col-12">
                    <ContentCard
                      item={item}
                      onOpenGallery={(g) => setLightboxImages(g.images)}
                      onOpenMedia={(v) => setActiveVideo(v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Gallery Modal */}
      {lightboxImages && (
        <LightboxGallery
          images={lightboxImages}
          title={content.title}
          onClose={() => setLightboxImages(null)}
        />
      )}

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal item={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
