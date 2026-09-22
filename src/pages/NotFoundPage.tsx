import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Scale } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguage();
  const L = (tj: string, ru: string, en: string) =>
    language === 'tj' ? tj : language === 'en' ? en : ru;
  usePageMeta(L('Саҳифа ёфт нашуд (404)', 'Страница не найдена (404)', 'Page not found (404)'));

  return (
    <div className="site-container px-4 py-20 text-center text-theme-text">
      <div className="mx-auto max-w-md rounded-3xl border border-theme-border bg-theme-surface/70 backdrop-blur-md p-10 shadow-sm">
        <span className="mx-auto mb-4 flex w-14 h-14 items-center justify-center rounded-2xl bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
          <Scale size={26} />
        </span>
        <p className="font-mono text-sm text-theme-gold tracking-widest">404</p>
        <h1 className="mt-2 text-xl font-medium">
          {L('Саҳифа ёфт нашуд', 'Страница не найдена', 'Page not found')}
        </h1>
        <p className="mt-2 font-mono text-xs text-theme-textMuted">
          {L(
            'Нишонӣ нодуруст аст ё саҳифа кӯчонида шудааст.',
            'Адрес неверный или страница перемещена.',
            'The address is wrong or the page has moved.'
          )}
        </p>
        <Link
          to="/"
          className="btn-primary mt-6 inline-flex items-center gap-2 no-underline"
        >
          <Home size={14} />
          {L('Ба саҳифаи асосӣ', 'На главную', 'Back to home')}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
