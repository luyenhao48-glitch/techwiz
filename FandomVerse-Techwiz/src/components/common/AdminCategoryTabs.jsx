import React from 'react';

const CATEGORY_ICONS = {
  all: 'bi-grid-fill',
  anime: 'bi-stars',
  gaming: 'bi-controller',
  movies: 'bi-film',
  tvshows: 'bi-tv',
  kpop: 'bi-music-note-beamed',
  comics: 'bi-book-half',
  manga: 'bi-journal-richtext',
};

const CATEGORY_COLORS = {
  all: '#00f5d4',
  anime: '#ff4d6d',
  gaming: '#00b4d8',
  movies: '#f72585',
  tvshows: '#7209b7',
  kpop: '#ff758f',
  comics: '#fca311',
  manga: '#4cc9f0',
};

export default function AdminCategoryTabs({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  itemCounts = {},
  totalCount = 0,
}) {
  return (
    <div className="fv-admin-category-tabs-container mb-4">
      <div className="fv-admin-category-tabs">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all' ? totalCount : (itemCounts[cat.id] ?? 0);
          const icon = CATEGORY_ICONS[cat.id] || 'bi-tag';
          const accentColor = CATEGORY_COLORS[cat.id] || '#00f5d4';

          return (
            <button
              key={cat.id}
              type="button"
              className={`fv-admin-cat-tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
              style={
                isSelected
                  ? {
                      borderColor: accentColor,
                      boxShadow: `0 0 16px ${accentColor}40`,
                    }
                  : {}
              }
            >
              <i
                className={`bi ${icon} me-1.5`}
                style={{ color: isSelected ? accentColor : 'inherit' }}
              ></i>
              <span className="fv-cat-tab-label">{cat.label.replace('Tất cả danh mục', 'Tất cả')}</span>
              <span
                className={`fv-cat-tab-badge ${isSelected ? 'active-badge' : ''}`}
                style={
                  isSelected
                    ? { backgroundColor: accentColor, color: '#090d16' }
                    : {}
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
