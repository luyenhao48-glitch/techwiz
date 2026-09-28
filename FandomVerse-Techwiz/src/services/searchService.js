import { dataService } from './dataService.js';
import i18n from '../i18n/index.js';
// Below this query length, only the primary field (title/name) is matched.
// A 1-2 letter query almost always appears somewhere inside a long bio/description,
// which used to flood the results with items whose *title* had nothing to do with the query.
const MIN_LENGTH_FOR_SECONDARY_FIELDS = 3;

// Scores how well a single field matches the query: exact > starts-with > contains > no match.
function fieldScore(value, q) {
  if (!value || !q) return 0;
  const text = value.toLowerCase();
  if (text === q) return 100;
  if (text.startsWith(q)) return 70;
  if (text.includes(q)) return 40;
  return 0;
}

// Best score across a list of secondary field values (description, tags, traits...).
function secondaryFieldScore(values, q) {
  let best = 0;
  for (const value of values) {
    if (!value) continue;
    const score = fieldScore(value, q);
    if (score > best) best = score;
  }
  return best;
}

// Combines a primary-field score with secondary-field scores into one relevance score.
// Secondary matches are only considered for longer queries, and are always weighted
// below primary matches so a title/name hit never gets buried under a bio hit.
function computeRelevance(primaryValue, secondaryValues, q) {
  const primary = fieldScore(primaryValue, q);
  const secondary = q.length >= MIN_LENGTH_FOR_SECONDARY_FIELDS
    ? secondaryFieldScore(secondaryValues, q)
    : 0;
  return { matched: primary > 0 || secondary > 0, score: primary + secondary * 0.3 };
}

export const searchService = {
  search(keyword = '', { category = 'all', type = 'all' } = {}) {
    const q = keyword.toLowerCase().trim();
    if (!q && category === 'all' && type === 'all') return [];

    let results = [];

    // 1. Scan Contents (Articles, Galleries, Videos, Audios)
    if (type === 'all' || ['article', 'gallery', 'video', 'audio'].includes(type)) {
      const contents = dataService.getAllContents();
      contents.forEach((item) => {
        const { matched, score } = q
          ? computeRelevance(item.title?.toLowerCase(), [
              item.shortDescription?.toLowerCase(),
              ...(item.subTags || []).map((tag) => (typeof tag === 'string' ? tag.toLowerCase() : (tag?.vi || tag?.en || '').toLowerCase())),
            ], q)
          : { matched: true, score: 0 };

        if (matched) {
          results.push({
            id: item.id,
            category: item.category,
            title: item.title,
            description: item.shortDescription,
            thumbnail: item.thumbnail,
            resultType: item.type, // 'article' | 'gallery' | 'video' | 'audio'
            targetUrl: `#/category/${item.category}/article/${item.id}`,
            date: item.dateAdded,
            _score: score,
          });
        }
      });
    }

    // 2. Scan Characters
    if (type === 'all' || type === 'character') {
      const characters = dataService.getAllCharacters();
      characters.forEach((c) => {
        const { matched, score } = q
          ? computeRelevance(c.name?.toLowerCase(), [
              c.biography?.toLowerCase(),
              c.franchise?.toLowerCase(),
              ...(c.traits || []).map((t) => t.toLowerCase()),
            ], q)
          : { matched: true, score: 0 };

        if (matched) {
          results.push({
            id: c.id,
            category: c.category,
            title: c.name,
            description: `${c.franchise} — ${c.biography}`,
            thumbnail: c.image,
            resultType: 'character',
            targetUrl: `#/category/${c.category}`,
            _score: score,
          });
        }
      });
    }

    // 3. Scan Events
    if (type === 'all' || type === 'event') {
      const events = dataService.getAllEvents();
      events.forEach((e) => {
        const { matched, score } = q
          ? computeRelevance(e.title?.toLowerCase(), [
              e.description?.toLowerCase(),
              e.location?.toLowerCase(),
            ], q)
          : { matched: true, score: 0 };

        if (matched) {
          results.push({
            id: e.id,
            category: e.category,
            title: e.title,
            description: `${e.date} | ${e.location} — ${e.description}`,
            thumbnail: null,
            resultType: 'event',
            targetUrl: `#/category/${e.category}`,
            date: e.date,
            _score: score,
          });
        }
      });
    }

    // 4. Scan Trailers
    if (type === 'all' || type === 'trailer') {
      const trailers = dataService.getAllTrailers();
      trailers.forEach((t) => {
        const { matched, score } = q
          ? computeRelevance(t.title?.toLowerCase(), [], q)
          : { matched: true, score: 0 };

        if (matched) {
          results.push({
            id: t.id,
            category: t.category,
            title: t.title,
            description: i18n.t('search.trailerStatusLabel', {
              status: t.status === 'upcoming' ? i18n.t('search.statusUpcoming') : i18n.t('search.statusReleased'),
              date: t.releaseDate,
            }),
            thumbnail: t.thumbnail,
            resultType: 'trailer',
            targetUrl: `#/trailers`,
            date: t.releaseDate,
            _score: score,
          });
        }
      });
    }

    // 5. Scan Merchandise
    if (type === 'all' || type === 'merchandise') {
      const merchandise = dataService.getAllMerchandise();
      merchandise.forEach((m) => {
        const { matched, score } = q
          ? computeRelevance(m.name?.toLowerCase(), [m.shortDescription?.toLowerCase()], q)
          : { matched: true, score: 0 };

        if (matched) {
          results.push({
            id: m.id,
            category: m.category,
            title: m.name,
            description: `$${m.price}${m.priceMax ? ` - $${m.priceMax}` : ''} | ${m.shortDescription}`,
            thumbnail: m.image,
            resultType: 'merchandise',
            targetUrl: `#/merchandise`,
            _score: score,
          });
        }
      });
    }

    // Filter by Category if selected
    if (category && category !== 'all') {
      results = results.filter((r) => r.category === category);
    }

    // Rank the closest matches (title/name hits) first; drop the internal score before returning.
    results.sort((a, b) => b._score - a._score);
    return results.map(({ _score, ...r }) => r);
  },
};
