import React from 'react';
import { resolveAdminImage, handleImageFallback } from '../../utils/adminImageHelper.js';

// Full-size image preview shared by the Admin management pages; `children` is the caption line.
export default function AdminImageLightbox({ item, title, onClose, children }) {
  return (
    <div className="fv-admin-lightbox-modal" onClick={onClose}>
      <div className="fv-admin-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={item.resolvedImg || resolveAdminImage(item, item.category)}
          alt={title}
          className="fv-admin-lightbox-img"
          onError={(e) => handleImageFallback(e, item.category)}
        />
        <div className="d-flex justify-content-between align-items-center mt-3 text-white">
          <div className="text-start">
            <h5 className="fw-bold mb-0">{title}</h5>
            {children}
          </div>
          <button
            type="button"
            className="btn btn-outline-light btn-sm rounded-pill px-3"
            onClick={onClose}
          >
            <i className="bi bi-x-lg me-1"></i> Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
