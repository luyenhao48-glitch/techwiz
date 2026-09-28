import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LightboxGallery({ images = [], initialIndex = 0, title = '', onClose }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation: Esc to close, ArrowLeft/ArrowRight to navigate
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  if (!images || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-3"
      style={{
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        zIndex: 1080,
      }}
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="d-flex align-items-center justify-content-between text-white px-3 py-2" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-images text-warning fs-5"></i>
          <span className="fw-semibold text-truncate" style={{ maxWidth: '60vw' }}>{title || t('lightboxGallery.defaultTitle')}</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-secondary rounded-pill px-3 py-1 font-monospace">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            className="btn btn-outline-light rounded-circle p-2"
            onClick={onClose}
            aria-label={t('lightboxGallery.closeAria')}
            title={t('lightboxGallery.closeTitle')}
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="d-flex align-items-center justify-content-center flex-grow-1 position-relative my-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={t('lightboxGallery.imageAlt', { index: currentIndex + 1 })}
          className="rounded-3 shadow-lg"
          style={{
            maxHeight: '80vh',
            maxWidth: '90vw',
            objectFit: 'contain',
          }}
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle shadow p-3"
            onClick={handlePrev}
            aria-label={t('lightboxGallery.prevAria')}
            title={t('lightboxGallery.prevTitle')}
          >
            <i className="bi bi-chevron-left fs-4"></i>
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle shadow p-3"
            onClick={handleNext}
            aria-label={t('lightboxGallery.nextAria')}
            title={t('lightboxGallery.nextTitle')}
          >
            <i className="bi bi-chevron-right fs-4"></i>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="d-flex justify-content-center gap-2 overflow-x-auto py-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              className={`border-0 p-0 rounded-2 overflow-hidden shadow-sm ${
                currentIndex === idx ? 'ring-2 ring-primary border border-2 border-primary' : 'opacity-50'
              }`}
              style={{ width: '60px', height: '45px', cursor: 'pointer' }}
              onClick={() => setCurrentIndex(idx)}
            >
              <img src={img} alt={t('lightboxGallery.thumbnailAlt', { index: idx + 1 })} className="w-100 h-100 object-fit-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
