import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function EventCard({ event }) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { bcp47 } = useLanguage();
  const eventDate = new Date(event.date);
  const day = eventDate.getDate().toString().padStart(2, '0');
  const month = eventDate.toLocaleDateString(bcp47, { month: 'short' });
  const year = eventDate.getFullYear();

  const today = new Date().toISOString().split('T')[0];
  const isUpcoming = event.date >= today;

  return (
    <div
      className={`card fv-card fv-event-card h-100 p-3 ${event.category === 'gaming' ? 'gaming-event-card' : ''} ${event.category === 'anime' ? 'anime-event-card' : ''} ${event.category === 'kpop' ? 'kpop-event-card' : ''} ${event.category === 'movies' ? 'movies-event-card' : ''} ${event.category === 'manga' ? 'manga-event-card' : ''} ${event.category === 'comics' ? 'comics-event-card' : ''} ${event.category === 'tvshows' ? 'tvshows-event-card' : ''}`}
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="d-flex gap-3 align-items-start fv-event-inner">
        {/* Date Block */}
        <div
          className="d-flex flex-column align-items-center justify-content-center rounded-3 p-2 text-center fv-event-date-block"
          style={{
            minWidth: '70px',
            backgroundColor: isDark ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.1)',
            border: isDark ? '1px solid rgba(108, 92, 231, 0.4)' : '1px solid rgba(108, 92, 231, 0.25)',
          }}
        >
          <span className="font-heading fw-bold fs-4 lh-1" style={{ color: isDark ? '#a29bfe' : '#6C5CE7' }}>{day}</span>
          <span className="fw-semibold small text-uppercase" style={{ fontSize: '0.75rem', color: isDark ? '#a29bfe' : '#6C5CE7' }}>{month}</span>
          <span className={`small ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>{year}</span>
        </div>

        {/* Content Block */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-1 gap-2">
            <span
              className={`badge rounded-pill small ${
                isUpcoming ? 'bg-warning text-dark' : 'bg-secondary text-white'
              }`}
              style={{ fontSize: '0.7rem' }}
            >
              {isUpcoming ? t('categoryHub.statusUpcoming') : t('categoryHub.statusPast')}
            </span>
            <span className={`small ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              {event.location.split(',')[0]}
            </span>
          </div>

          <h5 className={`font-heading fs-6 fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>
            {event.title}
          </h5>

          <p className={`small mb-2 line-clamp-2 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
            {event.description}
          </p>

          <div className={`small d-flex align-items-center gap-1 ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-pin-map" style={{ color: isDark ? '#a29bfe' : '#6C5CE7' }}></i>
            <span>{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

