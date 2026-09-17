import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../i18n';

const LANGS: Language[] = ['tj', 'ru', 'en'];

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLanguage(l)}
          aria-pressed={language === l}
          className={`px-2 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors ${
            language === l
              ? 'text-[var(--jm-gold)] font-bold'
              : 'text-[var(--jm-muted)] hover:text-[var(--jm-text)]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};
