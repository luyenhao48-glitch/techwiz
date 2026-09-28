import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CharacterCard({ character }) {
  const { t } = useTranslation();
  const [showBio, setShowBio] = useState(false);

  return (
    <>
      <div className={`card fv-card fv-character-card h-100 text-center p-3 border-0 shadow-sm d-flex flex-column align-items-center ${character.category === 'gaming' ? 'gaming-character-card' : ''} ${character.category === 'anime' ? 'anime-character-card' : ''} ${character.category === 'kpop' ? 'kpop-character-card' : ''} ${character.category === 'movies' ? 'movies-character-card' : ''} ${character.category === 'manga' ? 'manga-character-card' : ''}`}>
        {/* Circular Avatar */}
        <div
          className="rounded-circle overflow-hidden mb-3 border border-3 border-white shadow-sm"
          style={{ width: '96px', height: '96px', backgroundColor: '#f0f0f0' }}
        >
          <img
            src={character.image}
            alt={character.name}
            className="w-100 h-100 object-fit-cover"
            loading="lazy"
          />
        </div>

        {/* Character Name & Franchise */}
        <h5 className="font-heading fs-6 fw-bold mb-1 text-dark text-truncate w-100">
          {character.name}
        </h5>
        <span className="badge bg-light text-primary border rounded-pill mb-2 px-2 py-1 small">
          {character.franchise}
        </span>

        {/* Short Bio snippet */}
        <p className="text-secondary small mb-3 flex-grow-1 line-clamp-2 px-1">
          {character.biography}
        </p>

        {/* Trait Chips */}
        <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
          {character.traits.slice(0, 3).map((trait) => (
            <span
              key={trait}
              className="badge bg-light text-secondary rounded-pill border small"
              style={{ fontSize: '0.7rem' }}
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Detail Button */}
        <button
          type="button"
          className="btn btn-sm btn-outline-fv w-100 mt-auto py-1"
          onClick={() => setShowBio(true)}
        >
          {t('cards.character.viewBio')}
        </button>
      </div>

      {/* Character Detail Modal */}
      {showBio && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-heading fw-bold text-primary">{t('cards.character.modalTitle')}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t('common.close')}
                  onClick={() => setShowBio(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-4">
                <div
                  className="rounded-circle overflow-hidden mx-auto mb-3 border border-4 border-light shadow"
                  style={{ width: '120px', height: '120px' }}
                >
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <h4 className="font-heading fw-bold mb-1">{character.name}</h4>
                <div className="text-primary fw-semibold mb-3">{character.franchise}</div>

                <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
                  {character.traits.map((trait) => (
                    <span key={trait} className="badge bg-primary-subtle text-primary border rounded-pill px-3 py-1">
                      {trait}
                    </span>
                  ))}
                </div>

                <div className="bg-light p-3 rounded-3 text-start small text-secondary lh-base">
                  <strong>{t('cards.character.bioLabel')}</strong>
                  <p className="mt-1 mb-0">{character.biography}</p>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowBio(false)}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
