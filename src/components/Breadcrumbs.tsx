import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface Crumb {
  label: string;
  to?: string;
}

// Soft glass breadcrumbs for inner pages (tj/ru/en labels passed by caller).
export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => {
  const { language } = useLanguage();
  const home = language === 'tj' ? 'Асосӣ' : language === 'en' ? 'Home' : 'Главная';
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-full glass font-mono text-[11px] text-theme-textMuted">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-theme-gold transition-colors">
            <Home size={12} />
            <span>{home}</span>
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            <ChevronRight size={12} className="opacity-50" aria-hidden="true" />
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-theme-gold transition-colors">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-theme-text">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
