import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CATEGORY_LIST } from '../../constants.js';

export default function MerchCard({ item, onToast }) {
  const { t } = useTranslation();
  const { addItem, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdded, setIsAdded] = useState(false);
  const hasAutoAddedRef = useRef(false);

  const category = CATEGORY_LIST.find((c) => c.id === item.category);
  const categoryLabel = category ? t(`categories.${category.id}.label`) : item.category;

  // Auto add to cart after login redirect if this item was requested
  useEffect(() => {
    if (
      isAuthenticated &&
      location.state?.autoAddToCartId === item.id &&
      !hasAutoAddedRef.current
    ) {
      hasAutoAddedRef.current = true;
      addItem(item.id, 1);
      setIsAdded(true);
      if (onToast) {
        onToast(t('cards.merch.addedToast', { name: item.name }));
      }
      setIsCartOpen(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1500);
    }
  }, [isAuthenticated, location.state, item.id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      if (onToast) {
        onToast(t('cards.merch.loginToAddToCart'));
      }
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          autoAddToCartId: item.id,
        },
      });
      return;
    }

    addItem(item.id, 1);
    setIsAdded(true);
    if (onToast) {
      onToast(t('cards.merch.addedToast', { name: item.name }));
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="card fv-card fv-merch-card h-100 border-0 shadow-sm overflow-hidden d-flex flex-column">
      {/* Product Image 1:1 ratio */}
      <div className="position-relative overflow-hidden" style={{ paddingTop: '100%', backgroundColor: 'rgba(128, 128, 128, 0.08)' }}>
        <img
          src={item.image?.startsWith('image/') ? `/${item.image}` : item.image}
          alt={item.name}
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-normal"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <span className="position-absolute top-0 start-0 m-1.5 m-md-2 badge bg-dark bg-opacity-75 text-white rounded-pill px-2 py-0.5 py-md-1 small text-uppercase" style={{ fontSize: '0.65rem', backdropFilter: 'blur(4px)' }}>
          {item.productType}
        </span>
      </div>

      {/* Product Details */}
      <div className="card-body p-2 p-md-3 d-flex flex-column flex-grow-1">
        <span className={`badge-category badge-category-${item.category} mb-1.5 mb-md-2 align-self-start`}>
          {categoryLabel}
        </span>

        <h5 className="card-title font-heading fs-6 fw-bold mb-1 text-dark line-clamp-2">
          {item.name}
        </h5>

        <p className="card-text text-secondary small flex-grow-1 line-clamp-2 mb-2 mb-md-3">
          {item.shortDescription}
        </p>

        {/* Price and Add to Cart */}
        <div className="mt-auto pt-1.5 pt-md-2 border-top">
          <div className="d-flex align-items-baseline gap-1 mb-1.5 mb-md-2">
            <span className="fs-5 fw-bold fv-price-display" style={{ color: 'var(--color-accent)' }}>
              ${item.price.toFixed(2)}
            </span>
            {item.priceMax && (
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.72rem' }}>
                - ${item.priceMax.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            className={`btn w-100 py-1.5 py-md-2 fv-add-cart-btn d-flex align-items-center justify-content-center gap-1.5 ${isAdded ? 'btn-success text-white' : 'btn-accent-fv'
              }`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isAdded}
          >
            <i className={`bi ${isAdded ? 'bi-check-circle-fill' : 'bi-bag-plus'}`}></i>
            <span>{isAdded ? t('cards.merch.added') : t('cards.merch.addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
