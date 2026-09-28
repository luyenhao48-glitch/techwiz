import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import ToastNotification from '../components/common/ToastNotification.jsx';
import { storageService } from '../services/storageService.js';

// Available discount promo codes
const PROMO_CODES = {
  FANDOM2026: { type: 'percent', value: 10, label: 'Giảm 10% đơn hàng (TechWiz Fandom)' },
  FREESHIP: { type: 'shipping', value: 0, label: 'Miễn phí vận chuyển toàn quốc' },
  VIPANIME: { type: 'fixed', value: 15, label: 'Giảm $15 cho thành viên VIP' },
};

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { currentUser } = useAuth();

  // Active Checkout Step: 'shipping' | 'payment' | 'success'
  const [step, setStep] = useState('shipping');

  // Customer Shipping Details
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.name || '',
    phone: '',
    email: currentUser?.email || '',
    city: 'Hà Nội',
    district: '',
    address: '',
    note: '',
    saveInfo: true,
  });

  // Payment Method: 'credit_card' | 'momo' | 'bank_transfer' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // Credit Card details
  const [cardInfo, setCardInfo] = useState({
    number: '',
    holder: currentUser?.name ? currentUser.name.toUpperCase() : '',
    expiry: '',
    cvv: '',
  });

  // Promo Code
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Processing & Toast
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  // Completed Order Data
  const [completedOrder, setCompletedOrder] = useState(null);

  // Calculations
  const baseShippingFee = cartTotal >= 50 || cartTotal === 0 ? 0 : 5.0;
  const shippingFee = appliedCoupon?.type === 'shipping' ? 0 : baseShippingFee;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = (cartTotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = Math.min(appliedCoupon.value, cartTotal);
    }
  }

  const vatTax = ((cartTotal - discountAmount) * 0.08); // 8% VAT
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee + (vatTax > 0 ? vatTax : 0));

  // Handle Promo Code Apply
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedCoupon({ code, ...PROMO_CODES[code] });
      setCouponError('');
      setToast({
        message: `${code}: ${PROMO_CODES[code].label}`,
        type: 'success',
        icon: 'bi-patch-check-fill',
      });
    } else {
      setCouponError('Invalid promo code');
      setToast({
        message: 'Invalid promo code',
        type: 'danger',
        icon: 'bi-exclamation-triangle-fill',
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  // Card formatting helpers
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardInfo({ ...cardInfo, number: val });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setCardInfo({ ...cardInfo, expiry: val });
  };

  // Handle Next to Payment
  const handleGoToPayment = (e) => {
    e.preventDefault();
    if (!shippingInfo.fullName.trim() || !shippingInfo.phone.trim() || !shippingInfo.address.trim()) {
      setToast({
        message: t('checkout.requiredNote') || 'Please fill in all required shipping fields.',
        type: 'warning',
        icon: 'bi-exclamation-circle-fill',
      });
      return;
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Place Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (paymentMethod === 'credit_card') {
      if (!cardInfo.number || cardInfo.number.replace(/\s/g, '').length < 16) {
        setToast({
          message: t('checkout.cardNumberLabel'),
          type: 'warning',
          icon: 'bi-credit-card',
        });
        return;
      }
      if (!cardInfo.expiry || cardInfo.expiry.length < 5) {
        setToast({
          message: t('checkout.cardExpiryLabel'),
          type: 'warning',
          icon: 'bi-calendar-date',
        });
        return;
      }
      if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
        setToast({
          message: t('checkout.cvvLabel'),
          type: 'warning',
          icon: 'bi-shield-lock',
        });
        return;
      }
    }

    setIsProcessing(true);

    // Simulate instant payment authorization and order placement
    setTimeout(() => {
      const orderId = `FV-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderData = {
        orderId,
        date: new Date().toLocaleString(
          i18n.language?.startsWith('vi') ? 'vi-VN' : i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-US'
        ),
        items: [...cartItems],
        shippingInfo: { ...shippingInfo },
        paymentMethod,
        subtotal: cartTotal,
        discount: discountAmount,
        shippingFee,
        vatTax,
        total: finalTotal,
        status: 'completed',
        userEmail: currentUser?.email || shippingInfo.email || 'guest',
        userName: currentUser?.name || shippingInfo.fullName,
      };

      storageService.addOrder(orderData);
      setCompletedOrder(orderData);
      setIsProcessing(false);
      setStep('success');
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  // If cart is empty and not in success state
  if (cartItems.length === 0 && step !== 'success') {
    return (
      <div className="container py-5 text-center my-5">
        <div
          className="card border-0 shadow-lg rounded-4 p-5 mx-auto"
          style={{
            maxWidth: '560px',
            background: isDark ? 'rgba(18, 23, 43, 0.8)' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{
              width: '90px',
              height: '90px',
              background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(255, 107, 129, 0.15) 100%)',
              color: 'var(--color-primary)',
            }}
          >
            <i className="bi bi-cart-x display-4"></i>
          </div>
          <h3 className="font-heading fw-bold mb-2">{t('checkout.emptyCartTitle')}</h3>
          <p className="text-secondary small mb-4">
            {t('checkout.emptyCartSubtitle')}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/merchandise" className="btn btn-primary-fv px-4 py-2">
              <i className="bi bi-shop me-2"></i> {t('checkout.exploreMerch')}
            </Link>
            <Link to="/" className="btn btn-outline-secondary px-4 py-2">
              <i className="bi bi-house me-2"></i> {t('checkout.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
      {/* Checkout Header & Breadcrumbs */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
          <Link to="/" className="text-decoration-none text-secondary">{t('breadcrumb.home')}</Link>
          <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
          <Link to="/merchandise" className="text-decoration-none text-secondary">{t('breadcrumb.merchandiseShop')}</Link>
          <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
          <span className="fw-bold text-primary">{t('breadcrumb.checkout')}</span>
        </div>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <div>
            <h1 className="font-heading fw-bold display-6 mb-1">
              {t('checkout.title')}
            </h1>
            <p className="text-secondary small mb-0">
              {t('checkout.subtitle')}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
              <i className="bi bi-shield-check me-1"></i> {t('checkout.sslBadge')}
            </span>
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div
        className="card border-0 shadow-sm rounded-4 p-3 mb-4"
        style={{
          background: isDark ? 'rgba(18, 23, 43, 0.6)' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="row g-2 text-center">
          <div className="col-4">
            <div
              className={`p-2 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                step === 'shipping'
                  ? 'bg-primary text-white fw-bold shadow-sm'
                  : 'text-success fw-semibold'
              }`}
            >
              <i className={`bi ${step === 'shipping' ? 'bi-1-circle-fill' : 'bi-check-circle-fill'}`}></i>
              <span className="small d-none d-sm-inline">{t('checkout.stepShipping')}</span>
              <span className="small d-sm-none">{t('checkout.stepShippingShort')}</span>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`p-2 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                step === 'payment'
                  ? 'bg-primary text-white fw-bold shadow-sm'
                  : step === 'success'
                  ? 'text-success fw-semibold'
                  : 'text-secondary'
              }`}
            >
              <i className={`bi ${step === 'success' ? 'bi-check-circle-fill' : 'bi-2-circle-fill'}`}></i>
              <span className="small d-none d-sm-inline">{t('checkout.stepPayment')}</span>
              <span className="small d-sm-none">{t('checkout.stepPaymentShort')}</span>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`p-2 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                step === 'success'
                  ? 'bg-success text-white fw-bold shadow-sm'
                  : 'text-secondary'
              }`}
            >
              <i className="bi bi-3-circle-fill"></i>
              <span className="small d-none d-sm-inline">{t('checkout.stepSuccess')}</span>
              <span className="small d-sm-none">{t('checkout.stepSuccessShort')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flow */}
      {step === 'success' ? (
        /* ORDER SUCCESS SCREEN */
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div
              className="card border-0 shadow-lg rounded-4 p-4 p-md-5 text-center position-relative overflow-hidden"
              style={{
                background: isDark ? 'linear-gradient(135deg, rgba(18, 23, 43, 0.95) 0%, rgba(13, 37, 30, 0.9) 100%)' : '#ffffff',
                border: '1px solid rgba(0, 184, 148, 0.3)',
              }}
            >
              <div
                style={{
                  height: '5px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(90deg, #00b894 0%, #00cec9 100%)',
                }}
              ></div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: '84px',
                  height: '84px',
                  background: 'rgba(0, 184, 148, 0.15)',
                  color: '#00b894',
                  boxShadow: '0 0 25px rgba(0, 184, 148, 0.3)',
                }}
              >
                <i className="bi bi-check2-circle display-4"></i>
              </div>

              <span className="badge bg-success-subtle text-success border border-success px-3 py-1 rounded-pill mb-2">
                {t('checkout.successBadge')}
              </span>
              <h2 className="font-heading fw-bold mb-1">{t('checkout.successTitle')}</h2>
              <p className="text-secondary small mb-4">
                {t('checkout.successSubtitle')}
              </p>

              {/* Order Info Summary Card */}
              <div
                className="card border-0 rounded-4 p-3 p-md-4 mb-4 text-start"
                style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8f9fa' }}
              >
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <span className="text-secondary small d-block">{t('checkout.orderCode')}</span>
                    <strong className="text-primary font-monospace fs-6">{completedOrder?.orderId}</strong>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-secondary small d-block">{t('checkout.orderTime')}</span>
                    <strong className="small">{completedOrder?.date}</strong>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-secondary small d-block">{t('checkout.paymentMethodLabel')}</span>
                    <span className="badge bg-secondary-subtle text-capitalize small">
                      {completedOrder?.paymentMethod === 'credit_card' && t('checkout.methodCreditCard')}
                      {completedOrder?.paymentMethod === 'momo' && t('checkout.methodMomo')}
                      {completedOrder?.paymentMethod === 'bank_transfer' && t('checkout.methodBank')}
                      {completedOrder?.paymentMethod === 'cod' && t('checkout.methodCod')}
                    </span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-secondary small d-block">{t('checkout.totalPaid')}</span>
                    <strong className="text-danger font-monospace fs-5">${completedOrder?.total.toFixed(2)}</strong>
                  </div>
                </div>

                <hr className="my-3 opacity-25" />

                <div>
                  <h6 className="fw-bold mb-2 small text-uppercase text-secondary">{t('checkout.shippingAddress')}</h6>
                  <p className="small mb-1">
                    <strong>{completedOrder?.shippingInfo.fullName}</strong> • {completedOrder?.shippingInfo.phone}
                  </p>
                  <p className="small text-secondary mb-0">
                    {completedOrder?.shippingInfo.address}, {completedOrder?.shippingInfo.district ? `${completedOrder?.shippingInfo.district}, ` : ''}{completedOrder?.shippingInfo.city}
                  </p>
                </div>

                <hr className="my-3 opacity-25" />

                <h6 className="fw-bold mb-2 small text-uppercase text-secondary">{t('checkout.orderedItems')}</h6>
                <div className="d-flex flex-column gap-2">
                  {completedOrder?.items.map((it) => (
                    <div key={it.id} className="d-flex align-items-center justify-content-between small">
                      <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '80%' }}>
                        <img
                          src={it.image}
                          alt={it.name}
                          className="rounded-2 object-fit-cover flex-shrink-0"
                          style={{ width: '36px', height: '36px' }}
                        />
                        <span className="text-truncate">{it.name}</span>
                        <span className="text-secondary font-monospace">x{it.quantity}</span>
                      </div>
                      <span className="font-monospace fw-bold">${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/orders" className="btn btn-primary-fv px-4 py-2">
                  <i className="bi bi-receipt-cutoff me-2"></i> {t('checkout.viewInProfile') || (i18n.language === 'vi' ? 'Xem Lịch Sử Giao Dịch' : 'View Order History')}
                </Link>
                <Link to="/merchandise" className="btn btn-outline-secondary px-4 py-2">
                  <i className="bi bi-bag-plus me-2"></i> {t('checkout.continueShopping')}
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  onClick={() => {
                    window.print();
                  }}
                >
                  <i className="bi bi-printer me-2"></i> {t('checkout.printInvoice')}
                </button>
                <Link to="/" className="btn btn-outline-secondary px-4 py-2">
                  <i className="bi bi-house me-2"></i> {t('checkout.backHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 1 & 2 FORM + SIDEBAR */
        <div className="row g-4 mb-5">
          {/* Main Form Column (Left) */}
          <div className="col-lg-8">
            {step === 'shipping' ? (
              /* STEP 1: SHIPPING INFORMATION */
              <div
                className="card fv-card border-0 shadow-sm rounded-4 p-4"
                style={{
                  background: isDark ? 'rgba(18, 23, 43, 0.8)' : '#ffffff',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="font-heading fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-geo-alt-fill text-danger"></i> {t('checkout.shippingTitle')}
                  </h4>
                  <span className="small text-secondary">{t('checkout.requiredNote')}</span>
                </div>

                <form onSubmit={handleGoToPayment}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('checkout.fullNameLabel')}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 bg-light"
                          placeholder={t('checkout.fullNamePlaceholder')}
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('checkout.phoneLabel')}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="bi bi-telephone"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-start-0 bg-light"
                          placeholder={t('checkout.phonePlaceholder')}
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('checkout.emailLabel')}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0 bg-light"
                          placeholder="email@example.com"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('checkout.cityLabel')}
                      </label>
                      <select
                        className="form-select bg-light"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      >
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Hải Phòng">Hải Phòng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                        <option value="Bình Dương">Bình Dương</option>
                        <option value="Đồng Nai">Đồng Nai</option>
                        <option value="Quảng Ninh">Quảng Ninh</option>
                        <option value="Khánh Hòa">Khánh Hòa</option>
                        <option value="Khác">{t('checkout.cityOther')}</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('checkout.districtLabel')}
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder={t('checkout.districtPlaceholder')}
                        value={shippingInfo.district}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('checkout.addressLabel')}
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder={t('checkout.addressPlaceholder')}
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('checkout.noteLabel')}
                      </label>
                      <textarea
                        className="form-control bg-light"
                        rows="2"
                        placeholder={t('checkout.notePlaceholder')}
                        value={shippingInfo.note}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="saveShippingCheck"
                          checked={shippingInfo.saveInfo}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, saveInfo: e.target.checked })}
                        />
                        <label className="form-check-label small text-secondary" htmlFor="saveShippingCheck">
                          {t('checkout.saveInfoLabel')}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <Link to="/merchandise" className="btn btn-outline-secondary">
                      <i className="bi bi-arrow-left me-1"></i> {t('checkout.backToCart')}
                    </Link>
                    <button type="submit" className="btn btn-primary-fv px-4 py-2">
                      {t('checkout.continueToPayment')} <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* STEP 2: PAYMENT METHOD SELECTION */
              <div
                className="card fv-card border-0 shadow-sm rounded-4 p-4"
                style={{
                  background: isDark ? 'rgba(18, 23, 43, 0.8)' : '#ffffff',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="font-heading fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-credit-card-2-front text-info"></i> {t('checkout.paymentTitle')}
                  </h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-decoration-none"
                    onClick={() => setStep('shipping')}
                  >
                    <i className="bi bi-pencil me-1"></i> {t('checkout.editShipping')}
                  </button>
                </div>

                {/* Recipient summary pill */}
                <div
                  className="p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center"
                  style={{ background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa' }}
                >
                  <div className="small">
                    <span className="text-secondary">{t('checkout.deliverTo')} </span>
                    <strong>{shippingInfo.fullName}</strong> ({shippingInfo.phone}) - {shippingInfo.address}, {shippingInfo.city}
                  </div>
                  <span className="badge bg-success-subtle text-success small">{t('checkout.confirmed')}</span>
                </div>

                {/* Payment Option Radio Cards */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {/* Option 1: Credit Card */}
                  <div
                    className={`card border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                        : isDark ? 'border-secondary-subtle bg-dark bg-opacity-25' : 'bg-white'
                    }`}
                    onClick={() => setPaymentMethod('credit_card')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="radio"
                          className="form-check-input mt-0"
                          name="paymentMethod"
                          checked={paymentMethod === 'credit_card'}
                          onChange={() => setPaymentMethod('credit_card')}
                        />
                        <div>
                          <div className="fw-bold d-flex align-items-center gap-2">
                            <span>{t('checkout.creditCardTitle')}</span>
                            <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>{t('checkout.recommendedBadge')}</span>
                          </div>
                          <small className="text-secondary">{t('checkout.creditCardDesc')}</small>
                        </div>
                      </div>
                      <div className="d-flex gap-1 fs-5 text-primary">
                        <i className="bi bi-credit-card-2-front"></i>
                      </div>
                    </div>

                    {/* Interactive Credit Card Form (Visible if selected) */}
                    {paymentMethod === 'credit_card' && (
                      <div className="mt-4 pt-3 border-top">
                        {/* Interactive Visual Card Simulation */}
                        <div
                          className="rounded-4 p-4 text-white mb-4 mx-auto shadow-lg position-relative overflow-hidden"
                          style={{
                            maxWidth: '380px',
                            height: '210px',
                            background: 'linear-gradient(135deg, #6C5CE7 0%, #1a1e36 60%, #00f5d4 100%)',
                            boxShadow: '0 12px 30px rgba(108, 92, 231, 0.4)',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-bold tracking-wider fs-6 opacity-75">{t('checkout.cardVipTitle')}</span>
                            <i className="bi bi-shield-lock-fill text-warning fs-5"></i>
                          </div>

                          <div className="d-flex align-items-center gap-2 mb-3">
                            <div
                              style={{
                                width: '38px',
                                height: '28px',
                                background: '#e1b12c',
                                borderRadius: '4px',
                                opacity: 0.9,
                              }}
                            ></div>
                            <i className="bi bi-wifi fs-5 opacity-75"></i>
                          </div>

                          <div className="font-monospace fs-5 fw-bold mb-3 tracking-widest text-center">
                            {cardInfo.number || '•••• •••• •••• ••••'}
                          </div>

                          <div className="d-flex justify-content-between align-items-end small">
                            <div>
                              <div className="text-uppercase opacity-50" style={{ fontSize: '0.65rem' }}>{t('checkout.cardHolder')}</div>
                              <div className="fw-bold text-truncate" style={{ maxWidth: '180px' }}>
                                {cardInfo.holder || 'JOHN DOE'}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="text-uppercase opacity-50" style={{ fontSize: '0.65rem' }}>{t('checkout.cardExpiry')}</div>
                              <div className="fw-bold font-monospace">{cardInfo.expiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Card Input fields */}
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label small fw-semibold text-secondary">{t('checkout.cardNumberLabel')}</label>
                            <input
                              type="text"
                              className="form-control font-monospace"
                              placeholder="4123 4567 8901 2345"
                              value={cardInfo.number}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                            />
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label small fw-semibold text-secondary">{t('checkout.cardHolderLabel')}</label>
                            <input
                              type="text"
                              className="form-control text-uppercase"
                              placeholder="JOHN DOE"
                              value={cardInfo.holder}
                              onChange={(e) => setCardInfo({ ...cardInfo, holder: e.target.value.toUpperCase() })}
                            />
                          </div>
                          <div className="col-6 col-md-3">
                            <label className="form-label small fw-semibold text-secondary">{t('checkout.cardExpiryLabel')}</label>
                            <input
                              type="text"
                              className="form-control font-monospace text-center"
                              placeholder="12/28"
                              value={cardInfo.expiry}
                              onChange={handleExpiryChange}
                              maxLength={5}
                            />
                          </div>
                          <div className="col-6 col-md-3">
                            <label className="form-label small fw-semibold text-secondary">{t('checkout.cvvLabel')}</label>
                            <input
                              type="password"
                              className="form-control font-monospace text-center"
                              placeholder="•••"
                              value={cardInfo.cvv}
                              onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.substring(0, 4) })}
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Momo / ZaloPay / VNPay QR */}
                  <div
                    className={`card border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentMethod === 'momo'
                        ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                        : isDark ? 'border-secondary-subtle bg-dark bg-opacity-25' : 'bg-white'
                    }`}
                    onClick={() => setPaymentMethod('momo')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="radio"
                          className="form-check-input mt-0"
                          name="paymentMethod"
                          checked={paymentMethod === 'momo'}
                          onChange={() => setPaymentMethod('momo')}
                        />
                        <div>
                          <div className="fw-bold d-flex align-items-center gap-2">
                            <span>{t('checkout.momoTitle')}</span>
                            <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>{t('checkout.momoBadge')}</span>
                          </div>
                          <small className="text-secondary">{t('checkout.momoDesc')}</small>
                        </div>
                      </div>
                      <i className="bi bi-qr-code-scan fs-4 text-danger"></i>
                    </div>

                    {paymentMethod === 'momo' && (
                      <div className="mt-3 pt-3 border-top text-center">
                        <div
                          className="p-3 bg-white rounded-3 d-inline-block shadow-sm mb-2 border"
                          style={{ maxWidth: '200px' }}
                        >
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=FANDOMVERSE-PAY-MOMO-DEMO"
                            alt="MoMo QR Code"
                            className="img-fluid rounded-2"
                          />
                        </div>
                        <p className="small text-secondary mb-1">
                          {t('checkout.momoInstruction', { total: finalTotal.toFixed(2) })}
                        </p>
                        <span className="badge bg-warning-subtle text-warning border border-warning small">
                          <i className="bi bi-clock me-1"></i> {t('checkout.qrValidity')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Option 3: Bank Transfer VietQR */}
                  <div
                    className={`card border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                        : isDark ? 'border-secondary-subtle bg-dark bg-opacity-25' : 'bg-white'
                    }`}
                    onClick={() => setPaymentMethod('bank_transfer')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="radio"
                          className="form-check-input mt-0"
                          name="paymentMethod"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                        />
                        <div>
                          <div className="fw-bold">{t('checkout.bankTransferTitle')}</div>
                          <small className="text-secondary">{t('checkout.bankTransferDesc')}</small>
                        </div>
                      </div>
                      <i className="bi bi-bank fs-4 text-success"></i>
                    </div>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-3 pt-3 border-top">
                        <div
                          className="p-3 rounded-3"
                          style={{ background: isDark ? 'rgba(0, 0, 0, 0.3)' : '#f1f2f6' }}
                        >
                          <div className="row g-2 small">
                            <div className="col-sm-6">
                              <span className="text-secondary">{t('checkout.bankLabel')}</span>
                              <strong className="d-block text-primary">Vietcombank (VCB) - CN Ba Đình</strong>
                            </div>
                            <div className="col-sm-6">
                              <span className="text-secondary">{t('checkout.accountNumberLabel')}</span>
                              <strong className="d-block font-monospace">1029 3847 5689</strong>
                            </div>
                            <div className="col-sm-6">
                              <span className="text-secondary">{t('checkout.accountHolderLabel')}</span>
                              <strong className="d-block">CONG TY TNHH FANDOMVERSE VIETNAM</strong>
                            </div>
                            <div className="col-sm-6">
                              <span className="text-secondary">{t('checkout.transferMemoLabel')}</span>
                              <strong className="d-block text-danger font-monospace">FV {shippingInfo.phone || '9999'}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 4: COD Cash on Delivery */}
                  <div
                    className={`card border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                        : isDark ? 'border-secondary-subtle bg-dark bg-opacity-25' : 'bg-white'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="radio"
                          className="form-check-input mt-0"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                        />
                        <div>
                          <div className="fw-bold">{t('checkout.codTitle')}</div>
                          <small className="text-secondary">{t('checkout.codDesc')}</small>
                        </div>
                      </div>
                      <i className="bi bi-box-seam fs-4 text-warning"></i>
                    </div>
                  </div>
                </div>

                {/* Back and Submit Button */}
                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setStep('shipping')}
                  >
                    <i className="bi bi-arrow-left me-1"></i> {t('checkout.back')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-accent-fv px-4 py-2 fs-6 fw-bold d-flex align-items-center gap-2"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        {t('checkout.processingOrder')}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-lock-fill"></i>
                        {t('checkout.confirmAndOrder', { total: finalTotal.toFixed(2) })}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Column (Right) */}
          <div className="col-lg-4">
            <div
              className="card fv-card border-0 shadow-sm rounded-4 p-4 sticky-top"
              style={{
                top: '90px',
                background: isDark ? 'rgba(18, 23, 43, 0.8)' : '#ffffff',
              }}
            >
              <h5 className="font-heading fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
                <span>{t('checkout.orderSummary')}</span>
                <span className="badge bg-primary rounded-pill">{t('checkout.itemsCount', { count: cartCount })}</span>
              </h5>

              {/* Cart Items Preview List */}
              <div
                className="overflow-y-auto mb-3 pe-1"
                style={{ maxHeight: '260px' }}
              >
                {cartItems.map((item) => (
                  <div key={item.id} className="d-flex gap-3 align-items-center mb-3 pb-2 border-bottom border-secondary-subtle">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded-2 object-fit-cover flex-shrink-0"
                      style={{ width: '50px', height: '50px' }}
                    />
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-semibold small text-truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-secondary small">
                        {t('checkout.itemQty')} <strong>{item.quantity}</strong> × ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="fw-bold font-monospace text-primary small">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Input Form */}
              <div className="mb-3">
                <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm text-uppercase font-monospace bg-light"
                    placeholder={t('checkout.couponPlaceholder')}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveCoupon}
                      title={t('checkout.removeCoupon')}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-sm btn-primary-fv px-3">
                      {t('checkout.applyCoupon')}
                    </button>
                  )}
                </form>
                {couponError && <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{couponError}</div>}
                {appliedCoupon && (
                  <div className="text-success small mt-1 d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{appliedCoupon.label}</span>
                  </div>
                )}
                {/* Promo hints */}
                <div className="mt-2 text-muted" style={{ fontSize: '0.72rem' }}>
                  {t('checkout.couponHint')} <code className="text-primary cursor-pointer" onClick={() => setCouponInput('FANDOM2026')}>FANDOM2026</code> (-10%), <code className="text-primary cursor-pointer" onClick={() => setCouponInput('FREESHIP')}>FREESHIP</code>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-top pt-3 d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between text-secondary">
                  <span>{t('checkout.merchSubtotal')}</span>
                  <span className="font-monospace">${cartTotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success fw-semibold">
                    <span>{t('checkout.discountLabel')}</span>
                    <span className="font-monospace">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between text-secondary">
                  <span>{t('checkout.shippingFeeLabel')}</span>
                  {shippingFee === 0 ? (
                    <span className="text-success fw-bold">{t('checkout.freeShipping')}</span>
                  ) : (
                    <span className="font-monospace">${shippingFee.toFixed(2)}</span>
                  )}
                </div>

                <div className="d-flex justify-content-between text-secondary">
                  <span>{t('checkout.vatLabel')}</span>
                  <span className="font-monospace">${vatTax.toFixed(2)}</span>
                </div>

                <hr className="my-1 opacity-25" />

                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold fs-6 font-heading">{t('checkout.totalPayable')}</span>
                  <span className="fs-4 fw-bold text-primary font-monospace">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div
                className="mt-4 p-3 rounded-3 small"
                style={{ background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa' }}
              >
                <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                  <i className="bi bi-box-seam text-primary"></i>
                  <span>{t('checkout.guarantee1')}</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                  <i className="bi bi-arrow-repeat text-success"></i>
                  <span>{t('checkout.guarantee2')}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-secondary">
                  <i className="bi bi-headset text-info"></i>
                  <span>{t('checkout.guarantee3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
