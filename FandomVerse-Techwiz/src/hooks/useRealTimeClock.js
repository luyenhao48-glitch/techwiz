import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

export function useRealTimeClock() {
  const { bcp47 } = useLanguage();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString(bcp47, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = time.toLocaleDateString(bcp47, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return { time, formattedTime, formattedDate };
}
