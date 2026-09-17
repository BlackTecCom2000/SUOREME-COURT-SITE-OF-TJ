import { ru } from './ru';
import { tj } from './tj';
import { en } from './en';

export type Language = 'ru' | 'tj' | 'en';

export const translations = {
  ru,
  tj,
  en,
};

export type TranslationSchema = typeof ru;

// Helper to get nested value by dot notation key (e.g. 'hero.line1')
export function getTranslation(lang: Language, path: string): string {
  const dict = translations[lang] || translations.ru;
  const keys = path.split('.');
  let current: any = dict;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to Russian dictionary
      let fallbackCurrent: any = translations.ru;
      for (const fk of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fk in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fk];
        } else {
          return path;
        }
      }
      return typeof fallbackCurrent === 'string' ? fallbackCurrent : path;
    }
  }

  return typeof current === 'string' ? current : path;
}
