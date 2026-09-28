import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './localeMap.js';

import viCommon from './locales/vi/common.json';
import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';

const STORAGE_KEY = 'fv_language';

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch (error) {
    // localStorage unavailable — fall back to default
  }
  return DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { common: viCommon },
    en: { common: enCommon },
    hi: { common: hiCommon },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
});

export default i18n;
