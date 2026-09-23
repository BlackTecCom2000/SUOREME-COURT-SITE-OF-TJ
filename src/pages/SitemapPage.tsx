import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, LibraryBig, Map } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DOC_KINDS, DOC_KIND_LABEL } from '../components/digital-court/LawBookshelf';
import { pickTri } from '../sites/types';

const pickKind = pickTri;

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

export const SitemapPage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(
    L(language, 'Харитаи сомона', 'Карта сайта', 'Sitemap'),
    L(
      language,
      'Харитаи сомонаи Суди Олии Ҷумҳурии Тоҷикистон',
      'Карта сайта Верховного суда Республики Таджикистан',
      'Sitemap of the Supreme Court of Tajikistan'
    )
  );

  const groups: { title: string; links: { to: string; label: string; external?: boolean }[] }[] = [
    {
      title: L(language, 'Асосӣ', 'Основное', 'Main'),
      links: [
        { to: '/', label: L(language, 'Саҳифаи асосӣ', 'Главная', 'Home') },
        { to: '/about', label: L(language, 'Дар бораи Суди Олӣ', 'О Верховном суде', 'About the Court') },
        { to: '/leadership', label: L(language, 'Роҳбарият', 'Руководство', 'Leadership') },
        { to: '/library', label: L(language, 'Китобхонаи электронӣ', 'Электронная библиотека', 'E-Library') },
        { to: '/sitemap', label: L(language, 'Харитаи сомона', 'Карта сайта', 'Sitemap') },
      ],
    },
    {
      title: L(language, 'Ахборот', 'Информация', 'Information'),
      links: [
        { to: '/news/news-1', label: L(language, 'Хабарҳо', 'Новости', 'News') },
        { to: '/announcements/ann-1', label: L(language, 'Эълонҳо', 'Объявления', 'Announcements') },
        { to: '/vacancies/vac-1', label: L(language, 'Ҷойҳои холӣ', 'Вакансии', 'Vacancies') },
        { to: '/journal/journal-1', label: L(language, 'Маҷалла', 'Журнал', 'Journal') },
      ],
    },
    {
      title: L(language, 'Китобхона', 'Библиотека', 'Library'),
      links: DOC_KINDS.map((k) => ({
        to: '/library',
        label: pickKind(DOC_KIND_LABEL[k], language),
      })),
    },
    {
      title: L(language, 'Судҳо', 'Суды', 'Courts'),
      links: [
        { to: '/courts/dushanbe', label: L(language, 'Суди шаҳри Душанбе', 'Суд города Душанбе', 'Dushanbe City Court') },
        { to: '/courts/sino', label: L(language, 'Суди ноҳияи Сино', 'Суд района Сино', 'Sino District Court') },
      ],
    },
    {
      title: L(language, 'Шаҳрвандон', 'Гражданам', 'Citizens'),
      links: [
        { to: '/', label: `${L(language, 'Муроҷиатҳо', 'Обращения', 'Appeals')} → ${L(language, 'саҳифаи асосӣ', 'главная', 'home')}` },
        { to: '/library', label: `${L(language, 'Намунаи ҳуҷҷатҳо', 'Образцы документов', 'Sample documents')} → ${L(language, 'китобхона', 'библиотека', 'library')}` },
      ],
    },
  ];

  return (
    <div className="site-container px-4 sm:px-8 md:px-12 py-10 text-theme-text">
      <Breadcrumbs items={[{ label: L(language, 'Харитаи сомона', 'Карта сайта', 'Sitemap') }]} />
      <div className="flex items-center gap-3 mb-2">
        <span className="p-2.5 rounded-xl bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
          <Map size={20} />
        </span>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">
          {L(language, 'Харитаи сомона', 'Карта сайта', 'Sitemap')}
        </h1>
      </div>
      <p className="font-mono text-xs text-theme-textMuted mb-8">SUD.TJ // TJ · RU · EN</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <Card
            key={g.title}
            title={
              <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-theme-gold">
                <LibraryBig size={14} />
                {g.title}
              </span>
            }
            headerAction={<Badge variant="gold">{String(g.links.length).padStart(2, '0')}</Badge>}
          >
            <ul className="space-y-1">
              {g.links.map((l, i) => (
                <li key={i}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-theme-textSec hover:text-theme-gold transition-colors py-1"
                  >
                    <span>{l.label}</span>
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-theme-gold"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SitemapPage;
