import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LeadershipPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="border-b border-theme-border pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-theme-gold" />
            <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
              {language === 'en' ? 'Leadership' : language === 'tj' ? 'Роҳбарият' : 'Руководство'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-theme-text font-medium tracking-tight">
            {language === 'en' ? 'Leadership of the Supreme Court' : language === 'tj' ? 'Роҳбарияти Суди Олӣ' : 'Руководство Верховного суда'}
          </h1>
        </header>

        <section className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8 p-8 bg-theme-surface border border-theme-border rounded-2xl shadow-sm">
            <div className="w-48 h-64 bg-theme-bgSec rounded-xl flex items-center justify-center border border-theme-border flex-shrink-0">
              <span className="text-theme-textMuted font-mono text-xs">PHOTO PLACEHOLDER</span>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h2 className="text-2xl font-medium text-theme-text">Шермухаммад Шохиён</h2>
                <p className="text-theme-gold font-mono text-sm uppercase mt-1">
                  {language === 'en' ? 'Chief Justice of the Supreme Court' : language === 'tj' ? 'Раиси Суди Олии Ҷумҳурии Тоҷикистон' : 'Председатель Верховного суда Республики Таджикистан'}
                </p>
              </div>
              <p className="text-sm text-theme-textSec leading-relaxed">
                Biography and professional career information goes here. Will be populated dynamically from the CMS in Phase 2.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
