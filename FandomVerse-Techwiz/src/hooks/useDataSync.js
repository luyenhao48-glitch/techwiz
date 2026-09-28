import { useState, useEffect } from 'react';

// Stable default so the effect below isn't re-subscribed on every render
const ALL_KEYS = [];

/**
 * Custom hook that listens to both local window data changes ('fv_data_change')
 * and cross-tab storage changes ('storage') to trigger automatic component re-renders.
 */
export function useDataSync(targetKeys = ALL_KEYS) {
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const handleDataChange = (e) => {
      const changedKey = e?.detail?.key;
      if (!targetKeys.length || !changedKey || targetKeys.includes(changedKey)) {
        setDataVersion((v) => v + 1);
      }
    };

    const handleStorageChange = (e) => {
      if (!targetKeys.length || !e?.key || targetKeys.includes(e.key)) {
        setDataVersion((v) => v + 1);
      }
    };

    window.addEventListener('fv_data_change', handleDataChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('fv_data_change', handleDataChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [targetKeys]);

  return dataVersion;
}
