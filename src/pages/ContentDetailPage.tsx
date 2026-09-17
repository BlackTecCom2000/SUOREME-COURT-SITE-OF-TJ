import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Newspaper } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Reveal } from '../components/Reveal';

const ALLOWED: Record<string, { tj: string; ru: string; en: string }> = {
  news: { tj: 'Хабарҳо', ru: 'Новости', en: 'News' },
  announcements: { tj: 'Эълонҳо', ru: 'Объявления', en: 'Announcements' },
  vacancies: { tj: 'Ҷойҳои корӣ', ru: 'Вакансии', en: 'Vacancies' },
  journal: { tj: 'Нашрия', ru: 'Журнал', en: 'Journal' },
};

export const ContentDetailPage: React.FC = () => {
  const { type = '', slug = '' } = useParams();
  const { language } = useLanguage();
  const [item, setItem] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!ALLOWED[type]) { setNotFound(true); return; }
    fetch('/api/content/' + type + '/' + slug)
      .then((r) => { if (!r.ok) throw new Error('nf'); return r.json(); })
      .then(setItem)
      .catch(() => setNotFound(true));
  }, [type, slug]);

  const title = item
    ? language === 'en' ? (item.title_en || item.title_ru) : language === 'tj' ? (item.title_tj || item.title_ru) : item.title_ru
    : '';
  const body = item
    ? language === 'en' ? (item.body_en || item.body_ru) : language === 'tj' ? (item.body_tj || item.body_ru) : item.body_ru
    : '';

  return (
    <div className="site-container px-4 sm:px-8 md:px-12 py-10 lg:py-16 text-theme-text">
      <Reveal>
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs text-theme-textSec hover:text-theme-gold transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>SUD.TJ</span>
        </Link>
      </Reveal>
      {notFound ? (
        <div className="content-card text-center py-12 font-mono text-sm text-theme-textSec">
          404
        </div>
      ) : !item ? (
        <div className="content-card text-center py-12 font-mono text-xs text-theme-textSec">Loading...</div>
      ) : (
        <Reveal delay={100}>
          <article className="content-card relative overflow-hidden">
            <div className="border-l-2 border-theme-gold pl-4 py-1 mb-5">
              <span className="font-mono text-xs text-theme-gold tracking-widest uppercase flex items-center gap-1.5">
                <Newspaper size={13} />
                <span>{language === 'en' ? ALLOWED[type].en : language === 'tj' ? ALLOWED[type].tj : ALLOWED[type].ru}</span>
              </span>
              <h1 className="text-2xl sm:text-4xl font-medium tracking-tight mt-2 leading-tight">{title}</h1>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-theme-textMuted mt-3">
                <Calendar size={12} />
                <span>{item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}</span>
              </span>
            </div>
            {item.cover_image && (
              <img src={`/uploads/${item.cover_image}`} alt="" className="w-full max-h-[420px] object-cover rounded-xl border border-theme-border mb-5" loading="lazy" />
            )}
            {String(body || '').split(/\n+/).map((p: string, i: number) => (
              <p key={i} className="text-sm sm:text-base leading-relaxed text-theme-textSec mb-4">{p}</p>
            ))}
          </article>
        </Reveal>
      )}
    </div>
  );
};

export default ContentDetailPage;
