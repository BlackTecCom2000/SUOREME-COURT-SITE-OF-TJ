import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Search, ScrollText, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { HeroImage } from '../components/HeroImage';
import { HERO_CATEGORIES, heroCategoryLabel, type HeroRow } from '../hooks/useHeroes';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

interface CategoryCount {
  category: string;
  n: number;
  official?: number | null;
}

const initialsOf = (name: string) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  return (parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
};

const yearsOf = (row: HeroRow) => {
  const b = (row.birth_date || '').match(/(\d{4})/);
  const d = (row.death_date || '').match(/(\d{4})/);
  if (b && d) return `${b[1]} – ${d[1]}`;
  return b ? b[1] : '';
};

/**
 * Қаҳрамонони Тоҷикистон — the archive of historical personalities.
 * Reads the CMS table `heroes`; every card links to the full biography with
 * timeline and sources.
 */
export const HeroesPage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(
    L(language, 'Қаҳрамонони Тоҷикистон', 'Герои Таджикистана', 'Heroes of Tajikistan'),
    L(
      language,
      'Биографии шахсониятҳои таърихӣ, давлатӣ, илмӣ ва фарҳангии Тоҷикистон бо манбаъҳои расмӣ',
      'Биографии исторических, государственных, научных и культурных деятелей Таджикистана с указанием источников',
      'Biographies of historical, state, scientific and cultural figures of Tajikistan with verified sources'
    )
  );

  const [rows, setRows] = useState<HeroRow[]>([]);
  const [counts, setCounts] = useState<CategoryCount[]>([]);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [officialOnly, setOfficialOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/heroes/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then((c: CategoryCount[]) => setCounts(Array.isArray(c) ? c : []))
      .catch(() => setCounts([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (officialOnly) params.set('official', '1');
    if (q.trim().length >= 2) params.set('q', q.trim());
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      fetch(`/api/heroes?${params.toString()}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('request failed'))))
        .then((data: HeroRow[]) => {
          setRows(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((e) => {
          if (e?.name === 'AbortError') return;
          setError(L(language, 'Маълумот бор карда нашуд', 'Не удалось загрузить данные', 'Could not load the data'));
          setLoading(false);
        });
    }, q ? 250 : 0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [category, officialOnly, q, language]);

  const total = useMemo(() => counts.reduce((acc, c) => acc + (c.n || 0), 0), [counts]);

  const heroBadge = L(language, 'Қаҳрамони Тоҷикистон', 'Герой Таджикистана', 'Hero of Tajikistan');

  return (
    <div className="site-container px-4 sm:px-8 md:px-12 py-10 text-theme-text">
      <Breadcrumbs
        items={[{ label: L(language, 'Қаҳрамонони Тоҷикистон', 'Герои Таджикистана', 'Heroes of Tajikistan') }]}
      />

      <div data-cinematic-stage="page" className="liquid-glass-title-pod p-6 sm:p-8 md:p-10 max-w-4xl mb-8">
        <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
          <span className="tracking-widest text-theme-gold font-semibold">( 09 )</span>
          <span className="text-theme-textMuted">[ 009 / 009 ]</span>
          <span className="w-1.5 h-1.5 rounded-full bg-theme-gold ml-1" aria-hidden="true" />
        </div>
        <h1 className="public-section-title type-glass text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
          {L(language, 'Қаҳрамонони Тоҷикистон', 'Герои Таджикистана', 'Heroes of Tajikistan')}
        </h1>
        <p className="text-theme-textSec text-sm sm:text-base leading-relaxed mt-4 max-w-2xl">
          {L(
            language,
            'Биографии шахсониятҳои таърихӣ, давлатӣ, илмӣ ва фарҳангии Тоҷикистон. Ҳар як маълумот бо манбаъи расмӣ ва истиноди манбаъ оварда шудааст.',
            'Биографии исторических, государственных, научных и культурных деятелей Таджикистана. Каждый материал сопровождается официальными источниками и указанием первоисточника.',
            'Biographies of historical, state, scientific and cultural figures of Tajikistan. Every entry carries its official sources and the original reference.'
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="glass glass-card rounded-2xl border p-4 sm:p-5 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">
              {L(language, 'Ҷустуҷӯ', 'Поиск', 'Search')}
            </span>
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-textMuted pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={L(
                language,
                'Номи шахсият, касб ё зоҳир кардан...',
                'Имя, профессия или достижения...',
                'Name, profession or achievements...'
              )}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-theme-surface/60 border border-theme-border text-sm text-theme-text placeholder:text-theme-textMuted focus:border-theme-gold/60 focus:outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label={L(language, 'Тоза кардан', 'Очистить', 'Clear')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-theme-textMuted hover:text-theme-gold transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <button
            type="button"
            onClick={() => setOfficialOnly((v) => !v)}
            aria-pressed={officialOnly}
            className={`tap-target inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border text-sm transition-colors ${
              officialOnly
                ? 'bg-theme-gold/15 border-theme-gold/50 text-theme-gold'
                : 'bg-theme-surface/60 border-theme-border text-theme-textSec hover:border-theme-gold/40'
            }`}
          >
            <Sparkles size={15} aria-hidden="true" />
            {L(language, 'Танҳо Қаҳрамони расмӣ', 'Только Герои', 'Official heroes only')}
          </button>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={L(language, 'Категорияҳо', 'Категории', 'Categories')}>
          <button
            type="button"
            onClick={() => setCategory('')}
            aria-pressed={category === ''}
            className={`tap-target px-3.5 h-9 rounded-full border text-xs font-medium transition-colors ${
              category === ''
                ? 'bg-theme-gold text-theme-bg border-theme-gold font-semibold'
                : 'bg-theme-surface/50 border-theme-border text-theme-textSec hover:border-theme-gold/40'
            }`}
          >
            {L(language, 'Ҳамаи', 'Все', 'All')}
            {total > 0 && <span className="ml-1.5 font-mono opacity-70">{total}</span>}
          </button>
          {HERO_CATEGORIES.filter((c) => c.id !== 'official-hero' && (counts.find((x) => x.category === c.id)?.n || 0) > 0).map((c) => {
            const count = counts.find((x) => x.category === c.id)?.n || 0;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(active ? '' : c.id)}
                aria-pressed={active}
                className={`tap-target px-3.5 h-9 rounded-full border text-xs font-medium transition-colors ${
                  active
                    ? 'bg-theme-gold text-theme-bg border-theme-gold font-semibold'
                    : 'bg-theme-surface/50 border-theme-border text-theme-textSec hover:border-theme-gold/40'
                }`}
              >
                {heroCategoryLabel(c.id, language)}
                {count > 0 && <span className="ml-1.5 font-mono opacity-70">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p role="status" className="glass glass-card rounded-xl border border-theme-gold/30 p-4 text-sm text-theme-textSec mb-6">
          {error}
        </p>
      )}

      {loading && rows.length === 0 && (
        <p className="text-sm text-theme-textMuted font-mono" role="status">
          {L(language, 'Бор мешавад…', 'Загрузка…', 'Loading…')}
        </p>
      )}

      {!loading && rows.length === 0 && (
        <div className="glass glass-card rounded-2xl border p-10 text-center">
          <Landmark size={26} className="mx-auto text-theme-gold mb-3" aria-hidden="true" />
          <p className="text-theme-textSec text-sm">
            {L(
              language,
              'Дар ин база маълумот ёфт нашуд.',
              'В этой базе пока нет записей.',
              'No entries in this base yet.'
            )}
          </p>
        </div>
      )}

      {loading && rows.length === 0 && (
        /* Skeleton cards keep the footer below the fold while the archive is
           fetched, so the page does not jump when the real cards arrive
           (that jump was worth 0.42 CLS). */
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="glass glass-card rounded-2xl border overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-theme-surface/40" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-2/3 rounded bg-theme-surface/50" />
                <div className="h-3 w-full rounded bg-theme-surface/40" />
                <div className="h-3 w-1/2 rounded bg-theme-surface/30" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[60vh] content-start">
        {rows.map((row) => {
          const name =
            (language === 'tj' ? row.name_tj : language === 'en' ? row.name_en : row.name_ru) || row.name_ru;
          const profession =
            (language === 'tj' ? row.profession_tj : language === 'en' ? row.profession_en : row.profession_ru) || '';
          const years = yearsOf(row);
          const official = !!row.is_official_hero;
          const portraitNote =
            (language === 'tj'
              ? row.portrait_note_tj
              : language === 'en'
                ? row.portrait_note_en
                : row.portrait_note_ru) || '';
          return (
            <li key={row.id}>
              <Link
                to={`/heroes/${row.slug}`}
                className="group block h-full glass glass-card rounded-2xl border overflow-hidden hover:border-theme-gold/50 transition-colors"
              >
                {/* Portraits are mostly 3:4 (photographs, banknote crops); a
                    short wide frame would zoom them into the top of a head. */}
                <div className="relative aspect-[4/5] overflow-hidden bg-theme-bg/40">
                  {row.portrait_url ? (
                    <HeroImage
                      src={row.portrait_url}
                      alt={name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif font-bold text-4xl text-theme-gold/80">
                        {initialsOf(name)}
                      </span>
                    </div>
                  )}
                  {official && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-theme-gold/90 text-theme-bg text-[11px] font-semibold">
                      <Sparkles size={12} aria-hidden="true" />
                      {heroBadge}
                    </span>
                  )}
                  {portraitNote && (
                    <span className="absolute bottom-0 inset-x-0 px-3 py-2 text-[10px] leading-tight text-white/85 bg-gradient-to-t from-black/75 to-transparent">
                      {portraitNote}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-theme-textMuted mb-2">
                    <ScrollText size={12} aria-hidden="true" />
                    <span className="truncate">{heroCategoryLabel(row.category || 'other', language)}</span>
                  </div>
                  <h2 className="font-serif text-xl leading-tight text-theme-text group-hover:text-theme-gold transition-colors">
                    {name}
                  </h2>
                  {profession && <p className="text-sm text-theme-textSec mt-1.5 leading-snug">{profession}</p>}
                  {years && (
                    <p className="font-mono text-xs text-theme-textMuted mt-2 tracking-[0.2em]">{years}</p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
