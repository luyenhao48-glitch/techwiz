import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, ADMIN_ACCOUNT } from '../../context/AuthContext.jsx';
import '../../styles/admin.css';

export default function AdminLogin() {
  const { adminLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const reason = location.state?.reason;
  const attemptedUserEmail = location.state?.userEmail;
  const redirectTarget = location.state?.from || '/admin';

  // If already logged in as admin, redirect to admin immediately
  if (isAuthenticated && isAdmin) {
    navigate(redirectTarget, { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = adminLogin(email, password);
      setIsLoading(false);

      if (result.success) {
        navigate(redirectTarget, { replace: true });
      } else {
        setErrorMsg(result.message || 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    }, 400);
  };

  const handleFillCredentials = () => {
    setEmail(ADMIN_ACCOUNT.email);
    setPassword(ADMIN_ACCOUNT.password);
    setErrorMsg(null);
  };

  return (
    <div
      className="fv-admin-login-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: '#070a14',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(0, 245, 212, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(123, 44, 191, 0.1) 0%, transparent 45%),
          linear-gradient(180deg, #070a14 0%, #0d1224 100%)
        `,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Top Back Link */}
        <div className="mb-3 text-start">
          <Link
            to="/"
            className="text-secondary text-decoration-none small d-inline-flex align-items-center gap-1 hover-light"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Về trang chủ FandomVerse</span>
          </Link>
        </div>

        {/* Security Shield Card */}
        <div
          className="card border-0 rounded-4 shadow-lg overflow-hidden position-relative"
          style={{
            background: 'rgba(17, 23, 43, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 245, 212, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 245, 212, 0.1)',
          }}
        >
          {/* Top Cyber Accent Line */}
          <div
            style={{
              height: '4px',
              background: 'linear-gradient(90deg, #00f5d4 0%, #7b2cbf 50%, #00bbf9 100%)',
            }}
          />

          <div className="p-4 p-md-5">
            {/* Header / Brand */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3 shadow"
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #00f5d4 0%, #7b2cbf 100%)',
                  boxShadow: '0 0 25px rgba(0, 245, 212, 0.45)',
                }}
              >
                <i className="bi bi-shield-lock-fill text-dark fs-2"></i>
              </div>

              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <span className="badge bg-dark border border-secondary text-info small" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  FANDOMVERSE V2.0
                </span>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle small" style={{ fontSize: '0.7rem' }}>
                  RESTRICTED ACCESS
                </span>
              </div>

              <h4 className="fw-bold text-white mb-1">Cổng Xác Thực Quản Trị</h4>
              <p className="text-secondary small mb-0">
                Đăng nhập để vào Trung tâm Quản trị (Admin Portal)
              </p>
            </div>

            {/* Access Denied Warning if coming from unprivileged user */}
            {reason === 'unauthorized' && (
              <div
                className="alert alert-danger border-0 rounded-3 py-2.5 px-3 mb-3 small d-flex align-items-start gap-2"
                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                <i className="bi bi-shield-x text-danger fs-5 mt-0.5 flex-shrink-0"></i>
                <div className="text-light">
                  <strong className="text-danger d-block">Quyền truy cập bị từ chối!</strong>
                  Tài khoản <code>{attemptedUserEmail}</code> là thành viên thông thường, không có quyền Quản trị. Vui lòng đăng nhập bằng tài khoản Admin bên dưới.
                </div>
              </div>
            )}

            {reason === 'unauthenticated' && !errorMsg && (
              <div
                className="alert alert-info border-0 rounded-3 py-2 px-3 mb-3 small d-flex align-items-center gap-2"
                style={{ background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)' }}
              >
                <i className="bi bi-lock-fill text-info flex-shrink-0"></i>
                <span className="text-light">Khu vực này yêu cầu xác thực tài khoản Quản trị viên.</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div
                className="alert alert-danger border-0 rounded-3 py-2 px-3 mb-3 small d-flex align-items-center gap-2"
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
              >
                <i className="bi bi-exclamation-triangle-fill text-danger flex-shrink-0"></i>
                <span className="text-light">{errorMsg}</span>
              </div>
            )}

            {/* Formal Admin Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Tài khoản Email Quản Trị
                </label>
                <div className="position-relative">
                  <i className="bi bi-person-fill-lock position-absolute top-50 translate-middle-y text-secondary ms-3"></i>
                  <input
                    type="email"
                    className="fv-admin-input ps-5"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-secondary small fw-semibold mb-0">
                    Mật khẩu bảo mật
                  </label>
                  <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                    SSL 256-bit
                  </span>
                </div>
                <div className="position-relative">
                  <i className="bi bi-key-fill position-absolute top-50 translate-middle-y text-secondary ms-3"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="fv-admin-input ps-5 pe-5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-secondary border-0 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="fv-admin-btn-primary w-100 justify-content-center py-2.5 fs-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xác thực bảo mật...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check me-2"></i>
                    Xác Thực & Vào Trung Tâm Quản Trị
                  </>
                )}
              </button>
            </form>

            {/* Admin Credentials Official Box (As Requested by User) */}
            <div
              className="mt-4 p-3 rounded-3"
              style={{
                background: 'rgba(9, 12, 21, 0.75)',
                border: '1px dashed rgba(0, 245, 212, 0.35)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-info small fw-bold d-flex align-items-center gap-1.5">
                  <i className="bi bi-key"></i> Thông tin tài khoản Admin cấp cho bạn:
                </span>
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm py-0 px-2 rounded-pill"
                  style={{ fontSize: '0.72rem' }}
                  onClick={handleFillCredentials}
                  title="Nhấn để tự động điền"
                >
                  <i className="bi bi-arrow-up-right-circle me-1"></i> Điền vào form
                </button>
              </div>

              <div className="small font-monospace text-light">
                <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Email:</span>
                  <strong className="text-white select-all">{ADMIN_ACCOUNT.email}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-secondary">Mật khẩu:</span>
                  <strong className="text-warning select-all">{ADMIN_ACCOUNT.password}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer notice */}
        <div className="text-center mt-3 text-secondary small" style={{ fontSize: '0.75rem' }}>
          <i className="bi bi-lock me-1"></i>
          Hệ thống FandomVerse Admin Portal • Phân quyền xác thực phân lớp
        </div>
      </div>
    </div>
  );
}
