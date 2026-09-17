import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SearchControlProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const SearchControl: React.FC<SearchControlProps> = ({ value, onChange, id = 'judmap-search' }) => {
  const { t } = useLanguage();
  return (
    <div className="relative w-full sm:w-64">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--jm-muted)] pointer-events-none" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('network.searchPlaceholder')}
        aria-label={t('network.searchPlaceholder')}
        className="w-full h-10 pl-9 pr-8 rounded-[10px] text-xs text-[var(--jm-text)] placeholder:text-[var(--jm-muted)] bg-[var(--jm-surface)] border border-[var(--jm-border)] focus:outline-none focus:border-[var(--jm-gold)] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--jm-muted)] hover:text-[var(--jm-text)] text-xs font-mono px-1"
        >
          ✕
        </button>
      )}
    </div>
  );
};
