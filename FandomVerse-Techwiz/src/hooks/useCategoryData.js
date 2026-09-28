import { useMemo } from 'react';
import { dataService } from '../services/dataService.js';
import { CATEGORY_LIST } from '../constants.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTranslation } from 'react-i18next';
import { useDataSync } from './useDataSync.js';

export function useCategoryData(categoryId) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const dataVersion = useDataSync();

  const categoryInfo = useMemo(() => {
    const cat = CATEGORY_LIST.find((c) => c.id === categoryId);
    if (!cat) return null;
    return {
      ...cat,
      label: t(`categories.${cat.id}.label`) || cat.label,
      description: t(`categories.${cat.id}.description`) || cat.description,
    };
  }, [categoryId, language, t]);

  const contents = useMemo(() => {
    if (!categoryId) return [];
    return dataService.getContentsByCategory(categoryId);
  }, [categoryId, language, dataVersion]);

  const characters = useMemo(() => {
    if (!categoryId) return [];
    return dataService.getCharactersByCategory(categoryId);
  }, [categoryId, language, dataVersion]);

  const events = useMemo(() => {
    if (!categoryId) return [];
    return dataService.getEventsByCategory(categoryId);
  }, [categoryId, language, dataVersion]);

  const franchises = useMemo(() => {
    if (!categoryId) return [];
    return dataService.getFranchisesByCategory(categoryId);
  }, [categoryId, language, dataVersion]);

  return {
    categoryInfo,
    contents,
    characters,
    events,
    franchises,
    isValidCategory: !!categoryInfo,
  };
}
