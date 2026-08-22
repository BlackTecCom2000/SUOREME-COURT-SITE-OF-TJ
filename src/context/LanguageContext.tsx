import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, getTranslation } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'supreme-court-language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      // 1. Check URL param ?lang=ru|tj|en
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'ru' || urlLang === 'tj' || urlLang === 'en') {
        return urlLang;
      }

      // 2. Check local storage
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'ru' || stored === 'tj' || stored === 'en') {
        return stored;
      }

      // 3. Browser language detection
      const navLang = navigator.language?.toLowerCase() || '';
      if (navLang.startsWith('tg') || navLang.startsWith('tj')) {
        return 'tj';
      }
      if (navLang.startsWith('en')) {
        return 'en';
      }
      if (navLang.startsWith('ru')) {
        return 'ru';
      }
    }
    return 'ru';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      // Update URL search query cleanly without full page refresh
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
