import contentsData from '../data/contents.json';
import charactersData from '../data/characters.json';
import eventsData from '../data/events.json';
import trailersData from '../data/trailers.json';
import merchandiseData from '../data/merchandise.json';
import i18n from '../i18n/index.js';
import { toBcp47 } from '../i18n/localeMap.js';

// Field lists for locale resolution per dataset
const CONTENT_LOCALE_FIELDS = ['title', 'shortDescription', 'body', 'subTags'];
const CHARACTER_LOCALE_FIELDS = ['name', 'biography', 'traits'];
const EVENT_LOCALE_FIELDS = ['title', 'description', 'location'];
const TRAILER_LOCALE_FIELDS = ['title'];
const MERCHANDISE_LOCALE_FIELDS = ['name', 'shortDescription'];

// Admin edits are also kept in localStorage so they survive reloads and reach other tabs
// on static hosting (e.g. Vercel), where the dev-only /api/sync-data endpoint doesn't exist.
const OVERRIDE_PREFIX = 'fv_data_override_';

function fingerprint(data) {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return `${str.length}:${hash}`;
}

const BUNDLED = {
  contents: contentsData,
  characters: charactersData,
  events: eventsData,
  trailers: trailersData,
  merchandise: merchandiseData,
};
const BUNDLED_FINGERPRINTS = Object.fromEntries(
  Object.entries(BUNDLED).map(([name, data]) => [name, fingerprint(data)])
);

// Returns the saved admin copy of a dataset, or null. A copy made from an older version of
// the JSON file is discarded so fresh data in a new build/deploy is never hidden.
function loadOverride(dataset) {
  try {
    const saved = JSON.parse(localStorage.getItem(OVERRIDE_PREFIX + dataset));
    if (saved?.base === BUNDLED_FINGERPRINTS[dataset] && Array.isArray(saved.data)) {
      return saved.data;
    }
    localStorage.removeItem(OVERRIDE_PREFIX + dataset);
  } catch (_) {}
  return null;
}

function saveOverride(dataset, data) {
  try {
    localStorage.setItem(
      OVERRIDE_PREFIX + dataset,
      JSON.stringify({ base: BUNDLED_FINGERPRINTS[dataset], data })
    );
  } catch (_) {}
}

function clearOverrides() {
  try {
    Object.keys(BUNDLED).forEach((name) => localStorage.removeItem(OVERRIDE_PREFIX + name));
  } catch (_) {}
}

// In-memory active stores: the admin's saved copy if any, otherwise the JSON files on disk
let activeContents = loadOverride('contents') || [...contentsData];
let activeCharacters = loadOverride('characters') || [...charactersData];
let activeEvents = loadOverride('events') || [...eventsData];
let activeTrailers = loadOverride('trailers') || [...trailersData];
let activeMerchandise = loadOverride('merchandise') || [...merchandiseData];

// Applies a dataset pushed from another tab / the dev server and notifies subscribed components
function applyRemoteUpdate(message) {
  if (!message?.dataset || !Array.isArray(message.data)) return;
  const { dataset, data } = message;
  if (dataset === 'contents') activeContents = data;
  else if (dataset === 'characters') activeCharacters = data;
  else if (dataset === 'events') activeEvents = data;
  else if (dataset === 'trailers') activeTrailers = data;
  else if (dataset === 'merchandise') activeMerchandise = data;
  window.dispatchEvent(new CustomEvent('fv_data_change', { detail: { key: dataset } }));
}

// 1. Live WebSocket synchronization via Vite HMR across all open tabs (User & Admin, Incognito & Normal)
if (typeof import.meta !== 'undefined' && import.meta.hot) {
  import.meta.hot.on('fandomverse:data-updated', applyRemoteUpdate);
}

// 2. BroadcastChannel fallback across same-origin tabs
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('fandomverse_data_sync');
    broadcastChannel.onmessage = (event) => applyRemoteUpdate(event?.data);
  } catch (_) {}
}

const DATASET_GETTERS = {
  contents: () => activeContents,
  characters: () => activeCharacters,
  events: () => activeEvents,
  trailers: () => activeTrailers,
  merchandise: () => activeMerchandise,
};

// Re-reads every dataset from disk and applies any that differ, so edits that keep the
// item count the same (e.g. swapping an image URL) still reach this tab.
function refreshFromDisk() {
  Object.entries(DATASET_GETTERS).forEach(([dataset, getCurrent]) => {
    fetch(`/api/data?dataset=${dataset}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && JSON.stringify(data) !== JSON.stringify(getCurrent())) {
          applyRemoteUpdate({ dataset, data });
        }
      })
      .catch(() => {});
  });
}

// 3. Sync on page load and on window focus (when switching from Admin tab to User tab)
if (typeof window !== 'undefined') {
  refreshFromDisk();
  window.addEventListener('focus', refreshFromDisk);

  // 4. localStorage changes made by another tab (works on static hosting too)
  window.addEventListener('storage', (e) => {
    if (!e.key?.startsWith(OVERRIDE_PREFIX)) return;
    const dataset = e.key.slice(OVERRIDE_PREFIX.length);
    if (!(dataset in BUNDLED)) return;
    applyRemoteUpdate({ dataset, data: loadOverride(dataset) || [...BUNDLED[dataset]] });
  });
}

function persistDataset(datasetName, dataset) {
  if (typeof window !== 'undefined') {
    saveOverride(datasetName, dataset);
    window.dispatchEvent(new CustomEvent('fv_data_change', { detail: { key: datasetName } }));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ dataset: datasetName, data: dataset });
      } catch (_) {}
    }

    // Sync directly to the real JSON file on disk
    fetch('/api/sync-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: datasetName, data: dataset }),
    }).catch(() => {});
  }
}

// Picks the value for the active language from a { vi, en, hi } locale object,
// falling back to vi, then to whatever value is available.
export function pick(field, lang) {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    return field[lang] ?? field.vi ?? Object.values(field)[0];
  }
  return field;
}

// Returns a shallow copy of `item` with each field in `fields` resolved to a
// plain string (or array of plain strings) for the given/current language.
export function resolveLocale(item, fields, lang = i18n.language) {
  if (!item) return item;
  const resolved = { ...item };
  fields.forEach((f) => {
    if (Array.isArray(item[f])) {
      resolved[f] = item[f].map((entry) => pick(entry, lang));
    } else if (f in item) {
      resolved[f] = pick(item[f], lang);
    }
  });
  return resolved;
}

export const dataService = {
  // ==========================================
  // CONTENTS (Articles, Galleries, Videos, Audios)
  // ==========================================
  getAllContents() {
    return activeContents.map((item) => resolveLocale(item, CONTENT_LOCALE_FIELDS));
  },

  getRawContents() {
    return [...activeContents];
  },

  getFeaturedContents() {
    // Return items explicitly marked as featured first, followed by newest items so newly added posts are always highlighted
    const featured = activeContents.filter((item) => item.featured);
    const nonFeatured = activeContents.filter((item) => !item.featured);
    return [...featured, ...nonFeatured].map((item) => resolveLocale(item, CONTENT_LOCALE_FIELDS));
  },

  getContentById(id) {
    const item = activeContents.find((item) => item.id === id) || null;
    return resolveLocale(item, CONTENT_LOCALE_FIELDS);
  },

  getContentsByCategory(categoryId, { type = 'all', subTag = 'all', sort = 'newest' } = {}) {
    let result = activeContents.filter((item) => item.category === categoryId);

    if (type && type !== 'all') {
      result = result.filter((item) => item.type === type);
    }

    if (subTag && subTag !== 'all') {
      result = result.filter((item) => item.subTags && (
        Array.isArray(item.subTags) 
          ? item.subTags.some(t => typeof t === 'object' ? Object.values(t).includes(subTag) : t === subTag)
          : false
      ));
    }

    result = result.map((item) => resolveLocale(item, CONTENT_LOCALE_FIELDS));

    if (sort === 'alphabetical') {
      result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || '', toBcp47(i18n.language)));
    } else if (sort === 'featured') {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
      result = [...result].sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
    }

    return result;
  },

  getRelatedContents(categoryId, currentId, limit = 3) {
    return activeContents
      .filter((item) => item.category === categoryId && item.id !== currentId)
      .slice(0, limit)
      .map((item) => resolveLocale(item, CONTENT_LOCALE_FIELDS));
  },

  saveContent(item) {
    const index = activeContents.findIndex((c) => c.id === item.id);
    if (index >= 0) {
      activeContents[index] = { ...activeContents[index], ...item };
    } else {
      activeContents.unshift(item);
    }
    persistDataset('contents', activeContents);
    return item;
  },

  deleteContent(id) {
    activeContents = activeContents.filter((c) => c.id !== id);
    persistDataset('contents', activeContents);
    return true;
  },

  // ==========================================
  // CHARACTERS
  // ==========================================
  getAllCharacters() {
    return activeCharacters.map((c) => resolveLocale(c, CHARACTER_LOCALE_FIELDS));
  },

  getRawCharacters() {
    return [...activeCharacters];
  },

  getCharactersByCategory(categoryId, { franchise = 'all' } = {}) {
    let result = activeCharacters.filter((c) => c.category === categoryId);
    if (franchise && franchise !== 'all') {
      result = result.filter((c) => c.franchise === franchise);
    }
    return result.map((c) => resolveLocale(c, CHARACTER_LOCALE_FIELDS));
  },

  getFranchisesByCategory(categoryId) {
    const chars = activeCharacters.filter((c) => c.category === categoryId);
    const set = new Set(chars.map((c) => c.franchise).filter(Boolean));
    return Array.from(set);
  },

  saveCharacter(item) {
    const index = activeCharacters.findIndex((c) => c.id === item.id);
    if (index >= 0) {
      activeCharacters[index] = { ...activeCharacters[index], ...item };
    } else {
      activeCharacters.unshift(item);
    }
    persistDataset('characters', activeCharacters);
    return item;
  },

  deleteCharacter(id) {
    activeCharacters = activeCharacters.filter((c) => c.id !== id);
    persistDataset('characters', activeCharacters);
    return true;
  },

  // ==========================================
  // EVENTS
  // ==========================================
  getAllEvents() {
    return activeEvents.map((e) => resolveLocale(e, EVENT_LOCALE_FIELDS));
  },

  getRawEvents() {
    return [...activeEvents];
  },

  getEventsByCategory(categoryId, { status = 'all' } = {}) {
    let result = activeEvents.filter((e) => e.category === categoryId);
    const today = new Date().toISOString().split('T')[0];

    if (status === 'upcoming') {
      result = result.filter((e) => e.date >= today);
    } else if (status === 'past') {
      result = result.filter((e) => e.date < today);
    }

    return result
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((e) => resolveLocale(e, EVENT_LOCALE_FIELDS));
  },

  saveEvent(item) {
    const index = activeEvents.findIndex((e) => e.id === item.id);
    if (index >= 0) {
      activeEvents[index] = { ...activeEvents[index], ...item };
    } else {
      activeEvents.unshift(item);
    }
    persistDataset('events', activeEvents);
    return item;
  },

  deleteEvent(id) {
    activeEvents = activeEvents.filter((e) => e.id !== id);
    persistDataset('events', activeEvents);
    return true;
  },

  // ==========================================
  // TRAILERS
  // ==========================================
  getAllTrailers() {
    return activeTrailers.map((t) => resolveLocale(t, TRAILER_LOCALE_FIELDS));
  },

  getRawTrailers() {
    return [...activeTrailers];
  },

  getTrailersByCategory(categoryId, { status = 'all' } = {}) {
    let result = activeTrailers;
    if (categoryId && categoryId !== 'all') {
      result = result.filter((t) => t.category === categoryId);
    }
    if (status && status !== 'all') {
      result = result.filter((t) => t.status === status);
    }
    return result
      .sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
      .map((t) => resolveLocale(t, TRAILER_LOCALE_FIELDS));
  },

  saveTrailer(item) {
    const index = activeTrailers.findIndex((t) => t.id === item.id);
    if (index >= 0) {
      activeTrailers[index] = { ...activeTrailers[index], ...item };
    } else {
      activeTrailers.unshift(item);
    }
    persistDataset('trailers', activeTrailers);
    return item;
  },

  deleteTrailer(id) {
    activeTrailers = activeTrailers.filter((t) => t.id !== id);
    persistDataset('trailers', activeTrailers);
    return true;
  },

  // ==========================================
  // MERCHANDISE
  // ==========================================
  getAllMerchandise() {
    return activeMerchandise.map((m) => resolveLocale(m, MERCHANDISE_LOCALE_FIELDS));
  },

  getRawMerchandise() {
    return [...activeMerchandise];
  },

  getMerchandiseByCategory(categoryId, { productType = 'all', sort = 'featured' } = {}) {
    let result = activeMerchandise;
    if (categoryId && categoryId !== 'all') {
      result = result.filter((m) => m.category === categoryId);
    }
    if (productType && productType !== 'all') {
      result = result.filter((m) => m.productType === productType);
    }

    const localized = result.map((m) => resolveLocale(m, MERCHANDISE_LOCALE_FIELDS));

    if (sort === 'price-asc') {
      return localized.sort((a, b) => a.price - b.price);
    }
    if (sort === 'price-desc') {
      return localized.sort((a, b) => b.price - a.price);
    }
    if (sort === 'rating') {
      return localized.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return localized;
  },

  saveMerchandise(item) {
    const index = activeMerchandise.findIndex((m) => m.id === item.id);
    if (index >= 0) {
      activeMerchandise[index] = { ...activeMerchandise[index], ...item };
    } else {
      activeMerchandise.unshift(item);
    }
    persistDataset('merchandise', activeMerchandise);
    return item;
  },

  deleteMerchandise(id) {
    activeMerchandise = activeMerchandise.filter((m) => m.id !== id);
    persistDataset('merchandise', activeMerchandise);
    return true;
  },

  // ==========================================
  // OVERALL STATS & ADMIN HELPERS
  // ==========================================
  getStats() {
    const categories = ['anime', 'gaming', 'movies', 'tvshows', 'kpop', 'comics', 'manga'];
    
    const countByCategory = {};
    categories.forEach(cat => {
      countByCategory[cat] = {
        contents: activeContents.filter(c => c.category === cat).length,
        events: activeEvents.filter(e => e.category === cat).length,
        trailers: activeTrailers.filter(t => t.category === cat).length,
        characters: activeCharacters.filter(c => c.category === cat).length,
        merchandise: activeMerchandise.filter(m => m.category === cat).length,
      };
      countByCategory[cat].total = 
        countByCategory[cat].contents +
        countByCategory[cat].events +
        countByCategory[cat].trailers +
        countByCategory[cat].characters +
        countByCategory[cat].merchandise;
    });

    return {
      totalContents: activeContents.length,
      totalEvents: activeEvents.length,
      totalTrailers: activeTrailers.length,
      totalCharacters: activeCharacters.length,
      totalMerchandise: activeMerchandise.length,
      grandTotal: activeContents.length + activeEvents.length + activeTrailers.length + activeCharacters.length + activeMerchandise.length,
      byCategory: countByCategory
    };
  },

  resetAllToDefaults() {
    activeContents = [...contentsData];
    activeCharacters = [...charactersData];
    activeEvents = [...eventsData];
    activeTrailers = [...trailersData];
    activeMerchandise = [...merchandiseData];
    clearOverrides();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fv_data_change', { detail: { action: 'reset' } }));
    }
    return true;
  },

  exportBackup() {
    return {
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      data: {
        contents: activeContents,
        characters: activeCharacters,
        events: activeEvents,
        trailers: activeTrailers,
        merchandise: activeMerchandise,
      }
    };
  },

  importBackup(backupData) {
    if (!backupData || !backupData.data) {
      throw new Error('Định dạng tệp sao lưu không hợp lệ.');
    }
    const { contents, characters, events, trailers, merchandise } = backupData.data;

    if (Array.isArray(contents)) {
      activeContents = contents;
      persistDataset('contents', activeContents);
    }
    if (Array.isArray(characters)) {
      activeCharacters = characters;
      persistDataset('characters', activeCharacters);
    }
    if (Array.isArray(events)) {
      activeEvents = events;
      persistDataset('events', activeEvents);
    }
    if (Array.isArray(trailers)) {
      activeTrailers = trailers;
      persistDataset('trailers', activeTrailers);
    }
    if (Array.isArray(merchandise)) {
      activeMerchandise = merchandise;
      persistDataset('merchandise', activeMerchandise);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fv_data_change', { detail: { action: 'import' } }));
    }
    return true;
  }
};
