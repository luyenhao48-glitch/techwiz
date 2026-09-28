import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { dataService } from '../services/dataService.js';
import { CATEGORY_LIST } from '../constants.js';
import VideoModal from '../components/interactive/VideoModal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useDataSync } from '../hooks/useDataSync.js';

export default function TrailersHub() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTrailer, setActiveTrailer] = useState(null);
  const dataVersion = useDataSync();

  const CATEGORY_LIST_LOCALIZED = CATEGORY_LIST.map((cat) => ({
    ...cat,
    label: t(`categories.${cat.id}.label`),
  }));

  const trailers = useMemo(() => {
    return dataService.getTrailersByCategory(selectedCategory, {
      status: selectedStatus,
    });
  }, [selectedCategory, selectedStatus, dataVersion]);

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-heading display-6 fw-bold text-dark mb-2 d-flex align-items-center gap-2">
          <i className="bi bi-play-btn-fill text-danger"></i> {t('trailersHub.title')}
        </h1>
        <p className="text-secondary">
          {t('trailersHub.subtitle')}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-light rounded-4 border mb-4 d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-lg-between">
        {/* Category Pills */}
        <div className="fv-chips-scroll">
          <span className="small fw-semibold text-secondary me-2">{t('trailersHub.categoryLabel')}</span>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 ${
              selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-secondary bg-white'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            {t('navbar.all')}
          </button>
          {CATEGORY_LIST_LOCALIZED.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 ${
                selectedCategory === c.id ? 'btn-primary' : 'btn-outline-secondary bg-white'
              }`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status Toggle */}
        <div className="fv-chips-scroll">
          <span className="small fw-semibold text-secondary">{t('trailersHub.statusLabel')}</span>
          <div className="btn-group btn-group-sm flex-shrink-0" role="group">
            <button
              type="button"
              className={`btn ${selectedStatus === 'all' ? 'btn-dark' : 'btn-outline-secondary bg-white'}`}
              onClick={() => setSelectedStatus('all')}
            >
              {t('navbar.all')}
            </button>
            <button
              type="button"
              className={`btn ${selectedStatus === 'upcoming' ? 'btn-warning text-dark fw-semibold' : 'btn-outline-secondary bg-white'}`}
              onClick={() => setSelectedStatus('upcoming')}
            >
              {t('trailersHub.statusUpcoming')}
            </button>
            <button
              type="button"
              className={`btn ${selectedStatus === 'released' ? 'btn-success text-white' : 'btn-outline-secondary bg-white'}`}
              onClick={() => setSelectedStatus('released')}
            >
              {t('trailersHub.statusReleased')}
            </button>
          </div>
        </div>
      </div>

      {/* Trailers Grid */}
      {trailers.length === 0 ? (
        <EmptyState
          title={t('trailersHub.noTrailersTitle')}
          message={t('trailersHub.noTrailersMessage')}
          onAction={() => {
            setSelectedCategory('all');
            setSelectedStatus('all');
          }}
          actionLabel={t('trailersHub.clearFilters')}
        />
      ) : (
        <div className="row g-4">
          {trailers.map((t2) => (
            <div key={t2.id} className="col-xl-3 col-lg-4 col-md-6 col-12">
              <div
                className={`card fv-card h-100 border-0 shadow-sm rounded-4 overflow-hidden accent-border-${t2.category}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTrailer(t2)}
              >
                {/* Thumbnail with Play Icon */}
                <div className="position-relative overflow-hidden" style={{ height: '210px', backgroundColor: '#000' }}>
                  <img
                    src={t2.thumbnail}
                    alt={t2.title}
                    className="w-100 h-100 object-fit-cover opacity-85"
                    loading="lazy"
                  />
                  {/* Play Button Overlay */}
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div
                      className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center shadow-lg"
                      style={{ width: '56px', height: '56px' }}
                    >
                      <i className="bi bi-play-fill fs-2 ms-1"></i>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`position-absolute top-0 end-0 m-2 badge rounded-pill px-3 py-1 ${
                      t2.status === 'upcoming' ? 'bg-warning text-dark fw-bold' : 'bg-success text-white'
                    }`}
                  >
                    {t2.status === 'upcoming' ? t('trailersHub.badgeUpcoming') : t('trailersHub.badgeReleased')}
                  </span>
                </div>

                {/* Card Body */}
                <div className="card-body p-3 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className={`badge-category badge-category-${t2.category}`} style={{ fontSize: '0.7rem' }}>
                      {t2.category.toUpperCase()}
                    </span>
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-calendar-event me-1"></i>
                      {t2.releaseDate}
                    </span>
                  </div>

                  <h5 className="font-heading fs-6 fw-bold mb-3 text-dark line-clamp-2">
                    {t2.title}
                  </h5>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger w-100 rounded-pill mt-auto py-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-play-circle"></i> {t('trailersHub.watchTrailer')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {activeTrailer && (
        <VideoModal item={activeTrailer} onClose={() => setActiveTrailer(null)} />
      )}
    </div>
  );
}
