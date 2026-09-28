import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container py-5 text-center my-auto">
      <div className="display-1 text-primary fw-bold font-heading mb-3">404</div>
      <h2 className="font-heading fw-bold mb-3">{t('notFound.title')}</h2>
      <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '500px' }}>
        {t('notFound.message')}
      </p>
      <Link to="/" className="btn btn-primary-fv px-4 py-2">
        <i className="bi bi-house-door me-2"></i> {t('notFound.backHome')}
      </Link>
    </div>
  );
}
