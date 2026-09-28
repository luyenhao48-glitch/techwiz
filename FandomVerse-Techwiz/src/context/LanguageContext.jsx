import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { storageService } from '../services/storageService.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, toBcp47 } from '../i18n/localeMap.js';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(() => storageService.loadLanguage() || DEFAULT_LANGUAGE);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    document.documentElement.setAttribute('lang', language);
    document.title = i18n.getFixedT(language)('brand.documentTitle');
    storageService.saveLanguage(language);
  }, [language, i18n]);

  const setLanguage = (nextLanguage) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === nextLanguage)) {
      i18n.changeLanguage(nextLanguage);
      setLanguageState(nextLanguage);
      document.documentElement.setAttribute('lang', nextLanguage);
      document.title = i18n.getFixedT(nextLanguage)('brand.documentTitle');
      storageService.saveLanguage(nextLanguage);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        bcp47: toBcp47(language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
