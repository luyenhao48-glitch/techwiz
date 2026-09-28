import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { t } = useTranslation();
  const { bcp47 } = useLanguage();
  const navigate = useNavigate();
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [checkoutNotice, setCheckoutNotice] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '440px',
          zIndex: 1075,
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-cart3 text-primary fs-4"></i>
            <h5 className="font-heading fw-bold mb-0">{t('cartDrawer.title')}</h5>
            <span className="badge bg-primary rounded-pill">{cartCount}</span>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label={t('cartDrawer.closeAria')}
            onClick={() => setIsCartOpen(false)}
          ></button>
        </div>

        {/* Cart Item List */}
        <div className="flex-grow-1 overflow-y-auto p-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bag-x display-3 text-secondary mb-3 d-block"></i>
              <h6 className="fw-semibold">{t('cartDrawer.emptyTitle')}</h6>
              <p className="small mb-4">{t('cartDrawer.emptyMessage')}</p>
              <Link
                to="/merchandise"
                className="btn btn-primary-fv btn-sm px-4"
                onClick={() => setIsCartOpen(false)}
              >
                {t('cartDrawer.exploreMerch')}
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => (
                <div key={item.id} className="p-2 border rounded-3 d-flex gap-3 align-items-center bg-white shadow-xs">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rounded-2 object-fit-cover"
                    style={{ width: '64px', height: '64px', flexShrink: 0 }}
                  />

                  {/* Info */}
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="font-heading fw-semibold small mb-1 text-truncate" title={item.name}>
                      {item.name}
                    </h6>
                    <div className="text-primary fw-bold small mb-2">
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Quantity Selector */}
                    <div className="d-flex align-items-center gap-2">
                      <div className="input-group input-group-sm" style={{ width: '100px' }}>
                        <button
                          className="btn btn-outline-secondary px-2"
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={t('cartDrawer.decreaseAria')}
                        >
                          -
                        </button>
                        <span className="form-control text-center px-1 font-monospace bg-light">
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-outline-secondary px-2"
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={t('cartDrawer.increaseAria')}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        className="btn btn-sm text-danger p-0 ms-auto"
                        onClick={() => removeItem(item.id)}
                        title={t('cartDrawer.removeTitle')}
                        aria-label={t('cartDrawer.removeTitle')}
                      >
                        <i className="bi bi-trash fs-6"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Billing Section */}
        {cartItems.length > 0 && (
          <div className="p-3 border-top bg-light">
            <div className="d-flex justify-content-between mb-1 small text-secondary">
              <span>{t('cartDrawer.subtotalLabel', { count: cartCount })}</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>{t('cartDrawer.shippingLabel')}</span>
              <span className="text-success fw-semibold">{t('cartDrawer.freeShipping')}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <span className="fw-bold font-heading">{t('cartDrawer.totalLabel')}</span>
              <span className="fs-5 fw-bold text-primary font-monospace">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-accent-fv py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                onClick={handleCheckout}
              >
                <i className="bi bi-credit-card-2-front-fill"></i>
                <span>{t('cartDrawer.proceedToCheckout', { total: cartTotal.toFixed(2) })}</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={clearCart}
              >
                {t('cartDrawer.clearCart')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Demo Modal */}
      {checkoutNotice && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1090 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold text-primary d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-success"></i> {t('cartDrawer.checkoutModalTitle')}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t('common.close')}
                  onClick={() => setCheckoutNotice(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info border-0 rounded-3 small mb-3">
                  <strong><i className="bi bi-info-circle me-1"></i> {t('cartDrawer.srsNoticeStrong')}</strong>
                  <br />
                  {t('cartDrawer.srsNoticeText')}
                </div>

                <div className="p-3 bg-light rounded-3 mb-3">
                  <div className="d-flex justify-content-between mb-1 small">
                    <span className="text-secondary">{t('cartDrawer.quantityLabel')}</span>
                    <span className="fw-bold">{t('cartDrawer.quantityValue', { count: cartCount })}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1 small">
                    <span className="text-secondary">{t('cartDrawer.totalAmountLabel')}</span>
                    <span className="fw-bold text-primary font-monospace">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-secondary">{t('cartDrawer.createdTimeLabel')}</span>
                    <span>{new Date().toLocaleTimeString(bcp47)}</span>
                  </div>
                </div>

                <p className="text-muted small text-center mb-0">
                  {t('cartDrawer.thankYou')}
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-primary-fv w-100 rounded-pill"
                  onClick={() => {
                    setCheckoutNotice(false);
                    setIsCartOpen(false);
                  }}
                >
                  {t('cartDrawer.confirmAndReturn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
