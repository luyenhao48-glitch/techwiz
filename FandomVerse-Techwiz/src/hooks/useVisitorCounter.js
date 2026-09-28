import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService.js';

export function useVisitorCounter() {
  const [visitorCount, setVisitorCount] = useState(() => storageService.getVisitorCount());

  useEffect(() => {
    // Only increment once per session load
    const updated = storageService.incrementVisitorCount();
    setVisitorCount(updated);
  }, []);

  return visitorCount;
}
