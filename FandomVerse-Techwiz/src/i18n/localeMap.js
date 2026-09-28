export const SUPPORTED_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', bcp47: 'vi-VN', flag: '🇻🇳' },
  { code: 'en', label: 'English', bcp47: 'en-US', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', bcp47: 'hi-IN', flag: '🇮🇳' },
];

export const DEFAULT_LANGUAGE = 'vi';

export function toBcp47(language) {
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  return match ? match.bcp47 : 'vi-VN';
}
