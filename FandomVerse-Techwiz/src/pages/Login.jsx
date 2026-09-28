import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ToastNotification from '../components/common/ToastNotification.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '', remember: true });
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectedFromAuthGate = Boolean(location.state?.from);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setToast({
      message: t('login.forgotPasswordUnavailable'),
      type: 'info',
      icon: 'bi-info-circle-fill',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(formData.email, formData.password);
    if (result.success) {
      if (result.isAdmin && !location.state?.from) {
        navigate('/admin', { replace: true });
      } else {
        const targetFrom = typeof location.state?.from === 'string'
          ? location.state.from
          : (location.state?.from?.pathname || '/');
        navigate(targetFrom, { replace: true, state: location.state });
      }
    } else {
      setToast({
        message: result.message,
        type: 'error',
        icon: 'bi-exclamation-triangle-fill',
      });
    }
  };

  return (
    <div className="cinematic-hero-space cinematic-hero-wrap align-items-center justify-content-center">
      <div className="container py-5 d-flex align-items-center justify-content-center">
        <div className="card fv-card border-0 shadow-lg rounded-4 p-4 w-100" style={{ maxWidth: '420px' }}>
          <div className="text-center mb-4">
            <span style={{ fontSize: '2.5rem' }}>🌌</span>
            <h3 className="font-heading fw-bold text-dark mt-2 mb-1">{t('login.title')}</h3>
            <p className="text-secondary small mb-0">{t('login.subtitle')}</p>
          </div>

          {redirectedFromAuthGate && (
            <div className="alert alert-warning bg-warning-subtle border-0 rounded-3 small py-2 px-3 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-lock-fill text-warning flex-shrink-0"></i>
              <span>{t('login.authGateWarning')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">{t('login.emailLabel')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 bg-light"
                  placeholder={t('common.demoEmailPlaceholder') || 'Nhập email của bạn...'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0">{t('common.passwordLabel')}</label>
                <button
                  type="button"
                  className="btn btn-link p-0 small fw-semibold text-primary text-decoration-none"
                  style={{ fontSize: '0.75rem' }}
                  onClick={handleForgotPassword}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 bg-light"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0 text-muted"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                  title={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              />
              <label className="form-check-label small text-secondary" htmlFor="rememberMe">
                {t('login.rememberMe')}
              </label>
            </div>

            <button type="submit" className="btn btn-primary-fv w-100 py-2 fw-semibold">
              {t('login.title')}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top small text-muted">
            {t('login.noAccount')}{' '}
            <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
              {t('login.signupNow')}
            </Link>
          </div>

          <div className="text-center mt-3 pt-2">
            <Link
              to="/admin/login"
              className="text-secondary small text-decoration-none d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: '0.8rem' }}
            >
              <i className="bi bi-shield-lock-fill text-info"></i>
              <span>Cổng Đăng Nhập Quản Trị Viên (Admin) →</span>
            </Link>
          </div>
        </div>

        <ToastNotification toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
