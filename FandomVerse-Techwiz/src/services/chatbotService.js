import faqData from '../data/chatbot_faq.json';
import i18n from '../i18n/index.js';

// Small, local copy of dataService's locale-picking helper. Duplicated here
// (rather than imported from dataService.js) to avoid a circular import
// between the two service modules.
function pick(field, lang) {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    return field[lang] ?? field.vi ?? Object.values(field)[0];
  }
  return field;
}

function resolveFaq(item, lang = i18n.language) {
  if (!item) return item;
  return {
    ...item,
    question: pick(item.question, lang),
    answer: pick(item.answer, lang),
    keywords: Array.isArray(item.keywords) ? item.keywords.map((k) => pick(k, lang)) : item.keywords,
  };
}

export const chatbotService = {
  getQuickReplies() {
    return faqData
      .filter((item) => item.keywords && item.keywords.length > 0)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        question: pick(item.question, i18n.language),
      }));
  },

  matchAnswer(inputText = '') {
    const query = inputText.toLowerCase().trim();
    if (!query) {
      return this.getFallback();
    }

    const lang = i18n.language;

    // Direct match with keywords for the currently active language
    // (falling back to the vi keyword when the current-language one is missing/empty).
    const matched = faqData.find((item) => {
      if (!item.keywords || item.keywords.length === 0) return false;
      return item.keywords.some((keyword) => {
        const localizedKeyword = pick(keyword, lang);
        return localizedKeyword && query.includes(String(localizedKeyword).toLowerCase());
      });
    });

    if (matched) {
      const resolved = resolveFaq(matched, lang);
      return {
        id: resolved.id,
        question: resolved.question,
        answer: resolved.answer,
        link: resolved.link,
      };
    }

    return this.getFallback();
  },

  getFallback() {
    const fallback = faqData.find((item) => item.id === 'faq-fallback');
    if (fallback) {
      return resolveFaq(fallback, i18n.language);
    }

    return {
      id: 'faq-fallback',
      question: 'Tôi cần hỗ trợ thêm thông tin',
      answer:
        'Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Hãy thử hỏi về các danh mục Anime, Gaming, Merchandise, Trailers hoặc cách lưu Bookmark nhé!',
      link: null,
    };
  },
};
