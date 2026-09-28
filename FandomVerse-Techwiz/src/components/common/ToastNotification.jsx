import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function ToastNotification({ toast, onClose, duration = 2200 }) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const { isDark } = useTheme();
  const { setIsCartOpen } = useCart();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!toast) {
      setIsExiting(false);
      return;
    }

    setIsExiting(false);
    const toastDuration = toast.duration || duration || 2200;

    // Start exit fade-out slightly before full duration
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(0, toastDuration - 260));

    // Fully dismiss
    const dismissTimer = setTimeout(() => {
      if (onClose) onClose();
    }, toastDuration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast?.id, toast?.message, duration, onClose]);

  if (!toast) return null;

  const isCartToast =
    toast.type === 'success' &&
    (toast.icon === 'bi-bag-check-fill' ||
      toast.message?.toLowerCase().includes('cart') ||
      toast.message?.toLowerCase().includes('giỏ'));

  // Harmonious cyber palette configurations
  const themeConfig = {
    success: {
      gradient: 'linear-gradient(135deg, #00f5d4 0%, #6C5CE7 100%)',
      glow: 'rgba(0, 245, 212, 0.4)',
      badgeBg: 'rgba(0, 245, 212, 0.15)',
      badgeText: '#00f5d4',
      badgeLabel: isCartToast
        ? isVi
          ? 'ĐÃ THÊM VÀO GIỎ'
          : 'CART UPDATED'
        : isVi
        ? 'THÀNH CÔNG'
        : 'SUCCESS',
      icon: toast.icon || (isCartToast ? 'bi-bag-check-fill' : 'bi-check2-circle'),
    },
    error: {
      gradient: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
      glow: 'rgba(255, 71, 87, 0.4)',
      badgeBg: 'rgba(255, 71, 87, 0.15)',
      badgeText: '#ff4757',
      badgeLabel: isVi ? 'CẢNH BÁO' : 'ERROR',
      icon: toast.icon || 'bi-exclamation-triangle-fill',
    },
    warning: {
      gradient: 'linear-gradient(135deg, #f1c40f 0%, #e67e22 100%)',
      glow: 'rgba(241, 196, 15, 0.4)',
      badgeBg: 'rgba(241, 196, 15, 0.15)',
      badgeText: '#f39c12',
      badgeLabel: isVi ? 'LƯU Ý' : 'NOTICE',
      icon: toast.icon || 'bi-info-circle-fill',
    },
    info: {
      gradient: 'linear-gradient(135deg, #0984e3 0%, #6C5CE7 100%)',
      glow: 'rgba(108, 92, 231, 0.4)',
      badgeBg: 'rgba(108, 92, 231, 0.15)',
      badgeText: '#a29bfe',
      badgeLabel: isVi ? 'THÔNG BÁO' : 'INFO',
      icon: toast.icon || 'bi-bell-fill',
    },
  }[toast.type || 'info'];

  const handleManualClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 180);
  };

  const handleOpenCart = () => {
    if (setIsCartOpen) {
      setIsCartOpen(true);
    }
    handleManualClose();
  };

  const toastDuration = toast.duration || duration || 2200;

  return (
    <div
      className="fv-toast-container position-fixed"
      style={{
        top: '86px',
        right: '24px',
        zIndex: 1150,
        maxWidth: '430px',
        width: 'calc(100% - 32px)',
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      <div
        className={`fv-toast-card ${isExiting ? 'fv-toast-exit' : 'fv-toast-enter'}`}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(17, 21, 38, 0.94) 0%, rgba(12, 15, 29, 0.96) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(20px) saturate(190%)',
          WebkitBackdropFilter: 'blur(20px) saturate(190%)',
          borderRadius: '16px',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(108, 92, 231, 0.18)',
          boxShadow: isDark
            ? '0 20px 45px -10px rgba(0, 0, 0, 0.65), 0 0 25px rgba(108, 92, 231, 0.2)'
            : '0 20px 45px -10px rgba(108, 92, 231, 0.18), 0 6px 16px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className="p-3 d-flex align-items-start gap-3">
          {/* Glowing Circular Icon Badge */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{
              width: '42px',
              height: '42px',
              background: themeConfig.gradient,
              boxShadow: `0 4px 14px ${themeConfig.glow}`,
              fontSize: '1.15rem',
            }}
          >
            <i className={`bi ${themeConfig.icon}`}></i>
          </div>

          {/* Content Body */}
          <div className="flex-grow-1 overflow-hidden">
            {/* Header Tag */}
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill fw-bold"
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.06em',
                  background: themeConfig.badgeBg,
                  color: themeConfig.badgeText,
                  border: `1px solid ${themeConfig.badgeText}35`,
                }}
              >
                <span
                  className="rounded-circle"
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: themeConfig.badgeText,
                    boxShadow: `0 0 6px ${themeConfig.badgeText}`,
                  }}
                ></span>
                {themeConfig.badgeLabel}
              </span>
            </div>

            {/* Message Text */}
            <div
              className={`small fw-semibold lh-sm ${isDark ? 'text-white' : 'text-dark'}`}
              style={{ fontSize: '0.88rem' }}
            >
              {toast.message}
            </div>

            {/* Quick Action Button for Cart */}
            {isCartToast && (
              <div className="mt-2 pt-1 d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCart}
                  className="btn btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5 fw-semibold text-white border-0 shadow-sm"
                  style={{
                    fontSize: '0.75rem',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #00f5d4 100%)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <i className="bi bi-cart3"></i>
                  <span>{isVi ? 'Mở giỏ hàng' : 'View Cart'}</span>
                  <i className="bi bi-arrow-right small"></i>
                </button>
              </div>
            )}
          </div>

          {/* Minimalist Close Button */}
          <button
            type="button"
            className="btn btn-sm p-1 rounded-circle border-0 flex-shrink-0 d-flex align-items-center justify-content-center"
            style={{
              width: '26px',
              height: '26px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)',
              transition: 'all 0.15s ease',
            }}
            onClick={handleManualClose}
            aria-label={t('common.close')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? 'rgba(255, 255, 255, 0.18)'
                : 'rgba(0, 0, 0, 0.12)';
              e.currentTarget.style.color = isDark ? '#ffffff' : '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.color = isDark
                ? 'rgba(255, 255, 255, 0.65)'
                : 'rgba(0, 0, 0, 0.55)';
            }}
          >
            <i className="bi bi-x fs-5 lh-1"></i>
          </button>
        </div>

        {/* Real-time Smooth Progress Countdown Bar */}
        <div
          style={{
            height: '3px',
            width: '100%',
            background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            className="fv-toast-progress-bar"
            style={{
              height: '100%',
              background: themeConfig.gradient,
              boxShadow: `0 0 8px ${themeConfig.glow}`,
              animation: `fvToastProgress ${toastDuration}ms linear forwards`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
