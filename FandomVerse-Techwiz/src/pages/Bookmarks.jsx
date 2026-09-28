import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBookmarks } from '../context/BookmarkContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ToastNotification from '../components/common/ToastNotification.jsx';

export default function Bookmarks() {
  const { t } = useTranslation();
  const { bcp47 } = useLanguage();
  const {
    bookmarks,
    notes,
    removeBookmark,
    saveNote,
    exportBookmarksAsText,
  } = useBookmarks();

  const [toast, setToast] = useState(null);

  const handleExport = () => {
    const success = exportBookmarksAsText();
    if (success) {
      setToast({
        message: t('bookmarks.exportSuccess'),
        type: 'success',
        icon: 'bi-file-earmark-arrow-down-fill',
      });
    }
  };

  const handleNoteChange = (itemId, text) => {
    saveNote(itemId, text);
  };

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="font-heading display-6 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-heart-fill text-danger"></i> {t('bookmarks.title')}
          </h1>
          <p className="text-secondary small mb-0">
            {t('bookmarks.subtitlePart1')} <strong>LocalStorage</strong> {t('bookmarks.subtitlePart2')} <strong>SessionStorage</strong> {t('bookmarks.subtitlePart3')}
          </p>
        </div>

        {/* Export Button */}
        <div>
          <button
            type="button"
            className="btn btn-primary-fv px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
            onClick={handleExport}
            disabled={bookmarks.length === 0}
            title={bookmarks.length === 0 ? t('bookmarks.exportButtonDisabledTitle') : t('bookmarks.exportButtonTitle')}
          >
            <i className="bi bi-download"></i>
            <span>{t('bookmarks.exportButtonLabel')}</span>
          </button>
        </div>
      </div>

      {/* Info Alert about SessionStorage */}
      <div className="alert alert-info border-0 rounded-4 shadow-xs small mb-4 d-flex align-items-center gap-2">
        <i className="bi bi-info-circle-fill text-info fs-5"></i>
        <div>
          <strong>{t('bookmarks.infoAlertStrong')}</strong> {t('bookmarks.infoAlertText')}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {bookmarks.length === 0 ? (
        <EmptyState
          title={t('bookmarks.emptyTitle')}
          message={t('bookmarks.emptyMessage')}
          icon="bi-bookmark-heart"
          actionLabel={t('bookmarks.exploreHome')}
          onAction={() => (window.location.hash = '#/')}
        />
      ) : (
        <div className="row g-4">
          {bookmarks.map((b) => (
            <div key={b.itemId} className="col-lg-6 col-12">
              <div className={`card fv-card h-100 p-3 accent-border-${b.category} border-0 shadow-sm rounded-4`}>
                <div className="d-flex gap-3 align-items-start mb-3">
                  {/* Thumbnail */}
                  {b.thumbnail ? (
                    <img
                      src={b.thumbnail}
                      alt={b.title}
                      className="rounded-3 object-fit-cover shadow-xs"
                      style={{ width: '80px', height: '80px', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                      style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-primary-light)', flexShrink: 0 }}
                    >
                      <i className="bi bi-bookmark-fill fs-3"></i>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className={`badge-category badge-category-${b.category}`} style={{ fontSize: '0.65rem' }}>
                        {b.category?.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm text-danger p-0"
                        onClick={() => removeBookmark(b.itemId)}
                        title={t('bookmarks.removeTitle')}
                        aria-label={t('bookmarks.removeAriaLabel')}
                      >
                        <i className="bi bi-trash fs-6"></i>
                      </button>
                    </div>

                    <h6 className="font-heading fw-bold text-dark mb-1 text-truncate" title={b.title}>
                      {b.title}
                    </h6>

                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-clock me-1"></i> {t('bookmarks.savedOn', { date: new Date(b.addedAt).toLocaleDateString(bcp47) })}
                    </div>
                  </div>
                </div>

                {/* Session Note Input */}
                <div className="mt-auto pt-2 border-top">
                  <label className="form-label small fw-semibold text-secondary d-flex align-items-center justify-content-between mb-1">
                    <span>
                      <i className="bi bi-pencil-square text-primary me-1"></i> {t('bookmarks.noteLabel')}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                      (SessionStorage)
                    </span>
                  </label>
                  <textarea
                    className="form-control form-control-sm bg-light border-0 rounded-3"
                    rows="2"
                    placeholder={t('bookmarks.notePlaceholder')}
                    value={notes[b.itemId] || ''}
                    onChange={(e) => handleNoteChange(b.itemId, e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
