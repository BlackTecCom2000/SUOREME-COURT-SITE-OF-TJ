import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const AboutCourtPage: React.FC = () => {
  const { t, language } = useLanguage();
  usePageMeta(language === 'en' ? 'About the Supreme Court' : language === 'tj' ? 'Дар бораи Суди Олӣ' : 'О Верховном суде');

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto space-y-12">
        <Breadcrumbs
          items={[{ label: language === 'en' ? 'About' : language === 'tj' ? 'Маълумот' : 'О суде' }]}
        />
        <header className="border-b border-theme-border pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-theme-gold" />
            <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
              {language === 'en' ? 'About' : language === 'tj' ? 'Маълумот' : 'О суде'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-theme-text font-medium tracking-tight">
            {language === 'en' ? 'Constitutional Status & History' : language === 'tj' ? 'Мақоми конститутсионӣ ва таърих' : 'Конституционный статус и история'}
          </h1>
        </header>

        <section className="prose prose-sm sm:prose-base dark:prose-invert prose-theme max-w-none">
          <p className="text-lg text-theme-textSec leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 glass glass-chip">
              <h3 className="text-xl font-medium text-theme-text mb-4">
                {language === 'en' ? 'Powers' : language === 'tj' ? 'Ваколатҳо' : 'Полномочия'}
              </h3>
              <ul className="space-y-2 text-theme-textSec text-sm">
                <li>• {language === 'en' ? 'Highest judicial instance' : language === 'tj' ? 'Инстансияи олии судӣ' : 'Высшая судебная инстанция'}</li>
                <li>• {language === 'en' ? 'Supervisory review' : language === 'tj' ? 'Назорати судӣ' : 'Судебный надзор'}</li>
                <li>• {language === 'en' ? 'Uniform interpretation of laws' : language === 'tj' ? 'Тафсири ягонаи қонунҳо' : 'Единое толкование законов'}</li>
              </ul>
            </div>
            <div className="p-6 glass glass-chip">
              <h3 className="text-xl font-medium text-theme-text mb-4">
                {language === 'en' ? 'Jurisdiction' : language === 'tj' ? 'Тобият' : 'Юрисдикция'}
              </h3>
              <ul className="space-y-2 text-theme-textSec text-sm">
                <li>• {language === 'en' ? 'Civil cases' : language === 'tj' ? 'Парвандаҳои маданӣ' : 'Гражданские дела'}</li>
                <li>• {language === 'en' ? 'Criminal cases' : language === 'tj' ? 'Парвандаҳои ҷиноятӣ' : 'Уголовные дела'}</li>
                <li>• {language === 'en' ? 'Administrative cases' : language === 'tj' ? 'Парвандаҳои маъмурӣ' : 'Административные дела'}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
