import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink, Newspaper, ScrollText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Reveal } from '../components/Reveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';

const ALLOWED: Record<string, { tj: string; ru: string; en: string }> = {
  news: { tj: 'Хабарҳо', ru: 'Новости', en: 'News' },
  announcements: { tj: 'Эълонҳо', ru: 'Объявления', en: 'Announcements' },
  vacancies: { tj: 'Ҷойҳои корӣ', ru: 'Вакансии', en: 'Vacancies' },
  journal: { tj: 'Нашрия', ru: 'Журнал', en: 'Journal' },
};

// The API speaks the singular content type, the routes use the plural one.
const API_TYPE: Record<string, string> = {
  news: 'news',
  announcements: 'announcement',
  vacancies: 'vacancy',
  journal: 'journal',
};

export const ContentDetailPage: React.FC = () => {
  const { slug = '' } = useParams();
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const [item, setItem] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<any[]>([]);

  // The route carries the section ("news/:slug"), not a `type` param — the
  // section is derived from the path so the page can actually resolve the
  // publication instead of falling back to 404.
  const section = pathname.split('/').filter(Boolean)[0] || '';
  const type = ALLOWED[section] ? section : '';
  const apiType = API_TYPE[type] || type;

  useEffect(() => {
    if (!type) { setNotFound(true); return; }
    fetch('/api/content/' + apiType + '/' + slug)
      .then((r) => { if (!r.ok) throw new Error('nf'); return r.json(); })
      .then(setItem)
      .catch(() => setNotFound(true));
  }, [type, apiType, slug]);

  // Related publications: same region first.
  useEffect(() => {
    if (!type || !slug) return;
    fetch(`/api/content/${apiType}/${slug}/related`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: any[]) => setRelated(Array.isArray(rows) ? rows : []))
      .catch(() => setRelated([]));
  }, [type, apiType, slug]);

  const title = item
    ? language === 'en' ? (item.title_en || item.title_ru) : language === 'tj' ? (item.title_tj || item.title_ru) : item.title_ru
    : '';
  const body = item
    ? language === 'en' ? (item.body_en || item.body_ru) : language === 'tj' ? (item.body_tj || item.body_ru) : item.body_ru
    : '';
  const excerpt = item
    ? language === 'en' ? (item.excerpt_en || item.excerpt_ru) : language === 'tj' ? (item.excerpt_tj || item.excerpt_ru) : item.excerpt_ru
    : '';
  usePageMeta(title || 'SUD.TJ', excerpt || undefined);

  return (
    <div className="site-container px-4 sm:px-8 md:px-12 py-10 lg:py-16 text-theme-text">
      <Breadcrumbs
        items={[
          {
            label: language === 'en' ? ALLOWED[type]?.en || type : language === 'tj' ? ALLOWED[type]?.tj || type : ALLOWED[type]?.ru || type,
          },
          ...(title ? [{ label: title }] : []),
        ]}
      />
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

            {/* Photo gallery imported from the official source */}
            {(() => {
              let gallery: string[] = [];
              try {
                const parsed = item.gallery ? JSON.parse(item.gallery) : [];
                if (Array.isArray(parsed)) gallery = parsed.filter((g: unknown) => typeof g === 'string');
              } catch { gallery = []; }
              if (!gallery.length) return null;
              return (
                <div className="mt-7">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-theme-textMuted mb-3">
                    {language === 'tj' ? 'Суратҳо' : language === 'en' ? 'Photo gallery' : 'Галерея фотографий'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((src, i) => (
                      <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-theme-border"
                      >
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          className="w-full h-28 sm:h-32 object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Attribution to the original publication */}
            {item.source_url && (
              <div className="mt-7 rounded-xl border border-theme-gold/30 bg-theme-gold/10 p-4">
                <div className="font-mono text-[11px] uppercase tracking-widest text-theme-gold mb-1.5">
                  {language === 'tj' ? 'Сарчашма' : language === 'en' ? 'Source' : 'Источник'}
                </div>
                <p className="text-xs sm:text-sm text-theme-textSec mb-2">
                  {item.source_name || 'sud.tj'}
                  {item.original_date ? ` · ${item.original_date}` : ''}
                </p>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-theme-gold hover:underline underline-offset-4 break-all"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  {item.source_url}
                </a>
              </div>
            )}
          </article>

          {related.length > 0 && (
            <Reveal delay={150}>
              <section className="mt-8" aria-label={language === 'tj' ? 'Хабарҳои дигар' : language === 'en' ? 'Related publications' : 'Другие публикации'}>
                <div className="flex items-center gap-2 mb-3">
                  <ScrollText size={15} className="text-theme-gold" aria-hidden="true" />
                  <h2 className="text-lg font-medium">
                    {language === 'tj' ? 'Хабарҳои дигар' : language === 'en' ? 'Related publications' : 'Другие публикации'}
                  </h2>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/${type}/${r.slug}`}
                        className="block h-full content-card p-4 hover:border-theme-gold/40 transition-colors"
                      >
                        <span className="font-mono text-[11px] text-theme-textMuted">
                          {r.published_at ? new Date(r.published_at).toLocaleDateString() : ''}
                        </span>
                        <p className="text-sm text-theme-text mt-1 leading-snug">
                          {language === 'en' ? r.title_en || r.title_ru : language === 'tj' ? r.title_tj || r.title_ru : r.title_ru}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}
        </Reveal>
      )}
    </div>
  );
};

export default ContentDetailPage;
