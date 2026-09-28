import React from 'react';
import { useTranslation } from 'react-i18next';

export default function EmptyState({
  title,
  message,
  icon = 'bi-inbox',
  actionLabel,
  onAction,
}) {
  const { t } = useTranslation();
  const resolvedTitle = title || t('emptyState.defaultTitle');
  const resolvedMessage = message || t('emptyState.defaultMessage');

  return (
    <div className="text-center py-5 px-3">
      <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <h4 className="fw-semibold text-secondary mb-2">{resolvedTitle}</h4>
      <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
        {resolvedMessage}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-outline-fv mt-3" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
