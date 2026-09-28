import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { storageService } from '../services/storageService.js';
import ToastNotification from '../components/common/ToastNotification.jsx';

export default function OrdersHistory() {
  const { t } = useTranslation();
  const { currentUser, isAuthenticated } = useAuth();
  const { addItem, setIsCartOpen } = useCart();
  const { isDark } = useTheme();

  const [orders, setOrders] = useState(() => storageService.loadOrders());
  const [filter, setFilter] = useState('all'); // 'all' | 'completed' | 'processing'
  const [activeOrderReceipt, setActiveOrderReceipt] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-refresh orders whenever an order is placed or storage changes
  useEffect(() => {
    const refreshOrders = () => {
      setOrders(storageService.loadOrders());
    };
    window.addEventListener('storage', refreshOrders);
    window.addEventListener('fv_order_created', refreshOrders);
    refreshOrders();
    return () => {
      window.removeEventListener('storage', refreshOrders);
      window.removeEventListener('fv_order_created', refreshOrders);
    };
  }, []);

  // Filter user orders
  const userOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    if (!isAuthenticated || !currentUser) return orders;

    const currentEmail = currentUser.email?.toLowerCase().trim();
    const matched = orders.filter((o) => {
      if (!o.userEmail || o.userEmail === 'guest') return true;
      const orderEmail = o.userEmail?.toLowerCase().trim();
      const shipEmail = o.shippingInfo?.email?.toLowerCase().trim();
      return orderEmail === currentEmail || shipEmail === currentEmail;
    });

    return matched.length > 0 ? matched : orders;
  }, [orders, isAuthenticated, currentUser]);

  // Tab filter: all, completed, processing
  const filteredOrders = useMemo(() => {
    if (filter === 'completed') {
      return userOrders.filter((o) => o.status === 'completed');
    }
    if (filter === 'processing') {
      return userOrders.filter((o) => o.status !== 'completed');
    }
    return userOrders;
  }, [userOrders, filter]);

  const completedCount = useMemo(
    () => userOrders.filter((o) => o.status === 'completed').length,
    [userOrders]
  );
  const processingCount = useMemo(
    () => userOrders.filter((o) => o.status !== 'completed').length,
    [userOrders]
  );

  const getPaymentDetails = (method) => {
    switch (method) {
      case 'momo':
        return {
          label: 'MoMo E-Wallet',
          icon: 'bi-wallet2',
          bg: isDark ? 'rgba(255, 71, 87, 0.15)' : 'rgba(255, 71, 87, 0.1)',
          color: isDark ? '#ff7675' : '#d63031',
          border: 'rgba(255, 71, 87, 0.3)',
        };
      case 'vnpay':
        return {
          label: 'VNPAY QR',
          icon: 'bi-qr-code-scan',
          bg: isDark ? 'rgba(9, 132, 227, 0.18)' : 'rgba(9, 132, 227, 0.1)',
          color: isDark ? '#74b9ff' : '#0984e3',
          border: 'rgba(9, 132, 227, 0.3)',
        };
      case 'banking':
        return {
          label: 'Bank Transfer',
          icon: 'bi-bank',
          bg: isDark ? 'rgba(0, 184, 148, 0.18)' : 'rgba(0, 184, 148, 0.1)',
          color: isDark ? '#55efc4' : '#00b894',
          border: 'rgba(0, 184, 148, 0.3)',
        };
      case 'card':
        return {
          label: 'Credit Card',
          icon: 'bi-credit-card',
          bg: isDark ? 'rgba(108, 92, 231, 0.18)' : 'rgba(108, 92, 231, 0.1)',
          color: isDark ? '#a29bfe' : '#6C5CE7',
          border: 'rgba(108, 92, 231, 0.3)',
        };
      case 'cod':
      default:
        return {
          label: 'COD',
          icon: 'bi-cash-coin',
          bg: isDark ? 'rgba(253, 203, 110, 0.18)' : 'rgba(253, 203, 110, 0.12)',
          color: isDark ? '#ffeaa7' : '#d35400',
          border: 'rgba(253, 203, 110, 0.35)',
        };
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item) => {
      addItem(item.id || item.productId, item.quantity || 1);
    });
    setToast({
      id: Date.now(),
      type: 'success',
      icon: 'bi-bag-check-fill',
      message: t('profile.reorderSuccess', { count: order.items.length, id: order.orderId }),
      duration: 2500,
    });
    setIsCartOpen(true);
  };

  return (
    <div
      className="container-fluid px-3 px-md-4 px-lg-5 py-4"
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Top Header Card */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4"
        style={{
          backgroundColor: isDark ? '#12162a' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
        }}
      >
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
              style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #00b894 0%, #6C5CE7 100%)',
                fontSize: '1.75rem',
              }}
            >
              <i className="bi bi-receipt-cutoff"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className={`font-heading fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('orders.title')}
                </h4>
                <span
                  className="badge rounded-pill px-2.5 py-1 small fw-semibold"
                  style={{
                    backgroundColor: isDark ? 'rgba(0, 184, 148, 0.2)' : 'rgba(0, 184, 148, 0.12)',
                    color: isDark ? '#55efc4' : '#009472',
                    border: '1px solid rgba(0, 184, 148, 0.3)',
                    fontSize: '0.75rem',
                  }}
                >
                  {t('profile.ordersCount', { count: userOrders.length })}
                </span>
              </div>
              <p className={`small mb-0 ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.85rem' }}>
                {t('orders.subtitle')}
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 align-self-start align-self-sm-center"
          >
            <i className="bi bi-arrow-left"></i>
            <span>{t('orders.backToProfile')}</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        {userOrders.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top border-secondary border-opacity-10">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all ${
                filter === 'all'
                  ? 'btn-primary-fv'
                  : isDark
                  ? 'btn-dark bg-opacity-50 text-white-50 border-secondary'
                  : 'btn-light text-secondary'
              }`}
              onClick={() => setFilter('all')}
            >
              {t('orders.filterAll')} ({userOrders.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all ${
                filter === 'completed'
                  ? 'btn-primary-fv'
                  : isDark
                  ? 'btn-dark bg-opacity-50 text-white-50 border-secondary'
                  : 'btn-light text-secondary'
              }`}
              onClick={() => setFilter('completed')}
            >
              {t('orders.filterCompleted')} ({completedCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition-all ${
                filter === 'processing'
                  ? 'btn-primary-fv'
                  : isDark
                  ? 'btn-dark bg-opacity-50 text-white-50 border-secondary'
                  : 'btn-light text-secondary'
              }`}
              onClick={() => setFilter('processing')}
            >
              {t('orders.filterProcessing')} ({processingCount})
            </button>
          </div>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div
          className="p-5 rounded-4 shadow-sm text-center mb-4"
          style={{
            backgroundColor: isDark ? '#12162a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
          }}
        >
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: '68px',
              height: '68px',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              color: '#6C5CE7',
            }}
          >
            <i className="bi bi-bag-x fs-2"></i>
          </div>
          <h5 className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>
            {t('profile.noOrdersTitle')}
          </h5>
          <p className={`small mb-3 ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ maxWidth: '440px', margin: '0 auto' }}>
            {t('profile.noOrdersSubtitle')}
          </p>
          <Link to="/merchandise" className="btn btn-sm btn-primary-fv rounded-pill px-4 py-2 fw-semibold">
            <i className="bi bi-shop me-1.5"></i> {t('profile.shopNow')}
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {filteredOrders.map((order) => {
            const payment = getPaymentDetails(order.paymentMethod);
            const itemCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

            return (
              <div
                key={order.orderId}
                className="rounded-4 shadow-sm overflow-hidden"
                style={{
                  backgroundColor: isDark ? '#12162a' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                }}
              >
                {/* Order Card Header */}
                <div
                  className="p-3 px-md-4 d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom"
                  style={{
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                  }}
                >
                  <div className="d-flex flex-wrap align-items-center gap-2.5">
                    {/* Order ID badge with high-contrast readable styling */}
                    <span
                      className="font-monospace fw-bold px-2.5 py-1 rounded-pill"
                      style={{
                        backgroundColor: isDark ? 'rgba(108, 92, 231, 0.25)' : 'rgba(108, 92, 231, 0.12)',
                        color: isDark ? '#c7bcfb' : '#5849C2',
                        border: '1px solid rgba(108, 92, 231, 0.35)',
                        fontSize: '0.82rem',
                      }}
                    >
                      #{order.orderId}
                    </span>

                    <span className={`small ${isDark ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '0.8rem' }}>
                      <i className="bi bi-calendar3 me-1"></i> {order.date}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {/* Payment badge */}
                    <span
                      className="px-2.5 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1.5"
                      style={{
                        backgroundColor: payment.bg,
                        color: payment.color,
                        border: `1px solid ${payment.border}`,
                        fontSize: '0.78rem',
                      }}
                    >
                      <i className={`bi ${payment.icon}`}></i>
                      <span>{payment.label}</span>
                    </span>

                    {/* Status badge */}
                    <span
                      className="px-2.5 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1.5"
                      style={{
                        backgroundColor: isDark ? 'rgba(0, 184, 148, 0.22)' : 'rgba(0, 184, 148, 0.12)',
                        color: isDark ? '#55efc4' : '#009472',
                        border: '1px solid rgba(0, 184, 148, 0.35)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{order.status === 'completed' ? t('profile.statusCompleted') : t('profile.statusProcessing')}</span>
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3 px-md-4">
                  <div className="d-flex flex-column gap-2 mb-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between gap-3 py-1">
                        <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                          <img
                            src={item.image || '/image/luffy.jpg'}
                            alt={item.name}
                            className="rounded-3 flex-shrink-0 object-fit-cover shadow-xs"
                            style={{ width: '48px', height: '48px', backgroundColor: isDark ? '#1a1f36' : '#e2e8f0' }}
                            onError={(e) => {
                              e.target.src = '/image/luffy.jpg';
                            }}
                          />
                          <div className="text-truncate">
                            <h6 className={`fw-semibold mb-0 small text-truncate ${isDark ? 'text-white' : 'text-dark'}`} style={{ maxWidth: '420px' }}>
                              {item.name}
                            </h6>
                            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              ${Number(item.price || 0).toFixed(2)} × {item.quantity || 1}
                            </span>
                          </div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <span className={`fw-bold small font-monospace ${isDark ? 'text-white' : 'text-dark'}`}>
                            ${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address Brief */}
                  {order.shippingInfo && (
                    <div
                      className="p-2.5 rounded-3 mb-3 d-flex align-items-start gap-2 small"
                      style={{
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        color: isDark ? '#cbd5e1' : '#64748b',
                        fontSize: '0.78rem',
                      }}
                    >
                      <i className="bi bi-geo-alt-fill text-danger flex-shrink-0 mt-0.5"></i>
                      <div>
                        <strong className={isDark ? 'text-white' : 'text-dark'}>{order.shippingInfo.fullName}</strong>
                        {order.shippingInfo.phone && ` • ${order.shippingInfo.phone}`}
                        <span className="d-block text-muted">
                          {[order.shippingInfo.address, order.shippingInfo.district, order.shippingInfo.city].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div
                    className="pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-3"
                    style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }}
                  >
                    <div className="d-flex align-items-baseline gap-2">
                      <span className={`small ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                        {t('profile.orderTotal')}
                      </span>
                      <span className="fs-5 fw-bold font-heading text-gradient-primary">
                        ${Number(order.total || 0).toFixed(2)}
                      </span>
                      <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        ({itemCount} {t('profile.orderItems').toLowerCase().replace(':', '')})
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                        onClick={() => setActiveOrderReceipt(order)}
                      >
                        <i className="bi bi-receipt"></i>
                        <span>{t('profile.viewInvoice')}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary-fv rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                        onClick={() => handleReorder(order)}
                      >
                        <i className="bi bi-cart-plus"></i>
                        <span>{t('profile.reorder')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Receipt Modal */}
      {activeOrderReceipt && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060 }}
          onClick={() => setActiveOrderReceipt(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content rounded-4 shadow-lg border-0 overflow-hidden"
              style={{
                backgroundColor: isDark ? '#12162a' : '#ffffff',
                color: isDark ? '#f8fafc' : '#1e293b',
              }}
            >
              {/* Modal Header */}
              <div
                className="modal-header border-bottom p-3 px-4 d-flex align-items-center justify-content-between"
                style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: '38px',
                      height: '38px',
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #FF6B81 100%)',
                    }}
                  >
                    <i className="bi bi-receipt"></i>
                  </div>
                  <div>
                    <h5 className="modal-title font-heading fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                      {t('profile.receiptTitle')}
                    </h5>
                    <span className="small text-muted font-monospace">
                      #{activeOrderReceipt.orderId}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-close ${isDark ? 'btn-close-white' : ''}`}
                  onClick={() => setActiveOrderReceipt(null)}
                  aria-label="Close"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-sm-6 col-12">
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc' }}
                    >
                      <div className="text-uppercase small fw-bold text-muted mb-2" style={{ fontSize: '0.7rem' }}>
                        {t('profile.recipient')}
                      </div>
                      <div className="fw-bold">{activeOrderReceipt.shippingInfo?.fullName || activeOrderReceipt.userName}</div>
                      <div className="small text-muted">{activeOrderReceipt.shippingInfo?.email || activeOrderReceipt.userEmail}</div>
                      <div className="small text-muted">{activeOrderReceipt.shippingInfo?.phone}</div>
                      <div className="small text-muted mt-1">
                        <i className="bi bi-geo-alt me-1"></i>
                        {[activeOrderReceipt.shippingInfo?.address, activeOrderReceipt.shippingInfo?.district, activeOrderReceipt.shippingInfo?.city].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-12">
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc' }}
                    >
                      <div className="text-uppercase small fw-bold text-muted mb-2" style={{ fontSize: '0.7rem' }}>
                        {t('profile.orderStatus')}
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span
                          className="px-2.5 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1.5"
                          style={{
                            backgroundColor: isDark ? 'rgba(0, 184, 148, 0.2)' : 'rgba(0, 184, 148, 0.12)',
                            color: isDark ? '#55efc4' : '#009472',
                            border: '1px solid rgba(0, 184, 148, 0.35)',
                          }}
                        >
                          <i className="bi bi-check-circle-fill"></i>
                          <span>{activeOrderReceipt.status === 'completed' ? t('profile.statusCompleted') : t('profile.statusProcessing')}</span>
                        </span>
                        <span className="small text-muted font-monospace">
                          {activeOrderReceipt.date}
                        </span>
                      </div>
                      <div className="text-uppercase small fw-bold text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                        {t('profile.paymentMethod')}
                      </div>
                      <div className="small fw-semibold">
                        {getPaymentDetails(activeOrderReceipt.paymentMethod).label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items breakdown table */}
                <div className="table-responsive mb-4">
                  <table className={`table table-sm align-middle mb-0 ${isDark ? 'table-dark' : ''}`} style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr className="text-muted small border-bottom" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                        <th style={{ width: '55%' }}>{t('profile.orderItems')}</th>
                        <th className="text-center" style={{ width: '15%' }}>Qty</th>
                        <th className="text-end" style={{ width: '15%' }}>Price</th>
                        <th className="text-end" style={{ width: '15%' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrderReceipt.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                          <td>
                            <div className="d-flex align-items-center gap-2 py-1">
                              <img
                                src={item.image || '/image/luffy.jpg'}
                                alt={item.name}
                                className="rounded-2 object-fit-cover flex-shrink-0"
                                style={{ width: '36px', height: '36px' }}
                                onError={(e) => {
                                  e.target.src = '/image/luffy.jpg';
                                }}
                              />
                              <div className="small fw-semibold text-truncate" style={{ maxWidth: '280px' }}>
                                {item.name}
                              </div>
                            </div>
                          </td>
                          <td className="text-center small font-monospace">{item.quantity || 1}</td>
                          <td className="text-end small font-monospace">${Number(item.price || 0).toFixed(2)}</td>
                          <td className="text-end small font-monospace fw-bold">
                            ${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial summary calculations */}
                <div
                  className="p-3 rounded-3"
                  style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc' }}
                >
                  <div className="d-flex justify-content-between small text-muted mb-1.5">
                    <span>Subtotal</span>
                    <span className="font-monospace">${Number(activeOrderReceipt.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {activeOrderReceipt.discount > 0 && (
                    <div className="d-flex justify-content-between small text-success mb-1.5">
                      <span>Discount</span>
                      <span className="font-monospace">-${Number(activeOrderReceipt.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between small text-muted mb-1.5">
                    <span>Shipping</span>
                    <span className="font-monospace">
                      {activeOrderReceipt.shippingFee === 0 ? 'Free ($0.00)' : `$${Number(activeOrderReceipt.shippingFee || 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>VAT (8%)</span>
                    <span className="font-monospace">${Number(activeOrderReceipt.vatTax || 0).toFixed(2)}</span>
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center pt-2 border-top"
                    style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                  >
                    <span className="fw-bold">{t('profile.orderTotal')}</span>
                    <span className="fs-4 fw-bold font-heading text-gradient-primary">
                      ${Number(activeOrderReceipt.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="modal-footer border-top p-3 px-4 d-flex justify-content-between"
                style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i> {t('profile.printReceipt')}
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={() => setActiveOrderReceipt(null)}
                  >
                    {t('profile.close')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary-fv rounded-pill px-3.5"
                    onClick={() => {
                      handleReorder(activeOrderReceipt);
                      setActiveOrderReceipt(null);
                    }}
                  >
                    <i className="bi bi-cart-plus me-1"></i> {t('profile.reorder')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
