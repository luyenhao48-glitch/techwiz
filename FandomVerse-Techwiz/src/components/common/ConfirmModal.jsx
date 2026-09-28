import React from 'react';

const VARIANTS = {
  danger: { icon: 'bi-trash3-fill', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
  warning: { icon: 'bi-exclamation-triangle-fill', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)' },
  info: { icon: 'bi-question-circle-fill', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
};

// Reusable dark-themed confirmation dialog for the Admin panel, replacing native
// window.confirm() popups (which show the raw URL and can't be styled).
export default function ConfirmModal({
  show,
  title = 'Xác nhận hành động',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const v = VARIANTS[variant] || VARIANTS.danger;

  return (
    <div className="fv-admin-modal-backdrop" style={{ zIndex: 1080 }} onClick={onCancel}>
      <div
        className="fv-admin-modal-dialog"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fv-admin-modal-body text-center py-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '56px', height: '56px', background: v.bg, border: `1px solid ${v.border}` }}
          >
            <i className={`bi ${v.icon} fs-3`} style={{ color: v.color }}></i>
          </div>
          <h5 className="fw-bold text-white mb-2">{title}</h5>
          <p className="text-secondary small mb-0">{message}</p>
        </div>
        <div className="fv-admin-modal-footer justify-content-center">
          <button type="button" className="fv-admin-btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={variant === 'danger' ? 'fv-admin-btn-danger' : 'fv-admin-btn-primary'}
            style={variant === 'danger' ? { padding: '8px 18px', fontSize: '0.9rem' } : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
