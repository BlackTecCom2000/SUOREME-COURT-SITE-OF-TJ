import { useEffect, useState } from 'react';
import { HEROES as FALLBACK_HEROES, type Hero, type HeroLang } from '../data/heroes';

/**
 * Historical personalities ("heroes") — public data layer.
 *
 * The archive lives in the CMS (table `heroes`), so an editor can correct a
 * biography, attach sources and change the confidence level without a code
 * deployment. The curated static file (src/data/heroes.ts) stays as the
 * offline fallback: if the API is unreachable the showcase keeps rendering
 * the same content it shipped with.
 */

export interface HeroRow {
  id: number;
  slug: string;
  name_ru: string;
  name_tj?: string | null;
  name_en?: string | null;
  profession_ru?: string | null;
  profession_tj?: string | null;
  profession_en?: string | null;
  category?: string | null;
  is_official_hero?: number | null;
  birth_date?: string | null;
  death_date?: string | null;
  bio_ru?: string | null;
  bio_tj?: string | null;
  bio_en?: string | null;
  hero_decree_ru?: string | null;
  hero_decree_tj?: string | null;
  hero_decree_en?: string | null;
  portrait_url?: string | null;
  confidence?: string | null;
  sources?: string | null;
}

export const HERO_CATEGORIES: { id: string; tj: string; ru: string; en: string }[] = [
  { id: 'official-hero', tj: 'Қаҳрамони Тоҷикистон', ru: 'Герои Таджикистана', en: 'Heroes of Tajikistan' },
  { id: 'statesman', tj: 'Давлат ва сиёсиӣ', ru: 'Государственные и политические деятели', en: 'State and political figures' },
  { id: 'scientist', tj: 'Олимҳо ва педагогҳо', ru: 'Учёные и педагоги', en: 'Scientists and educators' },
  { id: 'writer', tj: 'Нависандаҳо ва шоирон', ru: 'Писатели и поэты', en: 'Writers and poets' },
  { id: 'artist', tj: 'Фарҳангӣ ва санъат', ru: 'Культура и искусство', en: 'Cultural and artistic figures' },
  { id: 'military', tj: 'Ҳарбӣ ва давлатӣ', ru: 'Военные и общественные деятели', en: 'Military and public figures' },
  { id: 'other', tj: 'Дигар', ru: 'Другие', en: 'Others' },
];

export const heroCategoryLabel = (id: string, language: string): string => {
  const c = HERO_CATEGORIES.find((x) => x.id === id);
  if (!c) return id;
  return language === 'tj' ? c.tj : language === 'en' ? c.en : c.ru;
};

const text = (v: string | null | undefined): string => (v || '').trim();

const initialsOf = (name: string): string => {
  const parts = text(name).split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return (first[0] || '') + (last[0] || '');
};

const yearOf = (iso: string | null | undefined): string => {
  const s = text(iso);
  const m = s.match(/(\d{4})/);
  return m ? m[1] : '';
};

const yearsOf = (row: HeroRow): string => {
  const b = yearOf(row.birth_date);
  const d = yearOf(row.death_date);
  if (b && d) return `${b} – ${d}`;
  if (b) return b;
  return '';
};

const paragraphs = (value: string): string[] =>
  text(value)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

const excerptOf = (value: string): string => {
  const first = paragraphs(value)[0] || '';
  const clean = first.replace(/\s+/g, ' ').trim();
  if (clean.length <= 220) return clean;
  return clean.slice(0, 217).replace(/\s+\S*$/, '') + '…';
};

const langBlock = (row: HeroRow, lang: 'tj' | 'ru' | 'en', years: string): HeroLang => {
  const name = text(lang === 'tj' ? row.name_tj : lang === 'en' ? row.name_en : row.name_ru) || text(row.name_ru);
  const profession =
    text(lang === 'tj' ? row.profession_tj : lang === 'en' ? row.profession_en : row.profession_ru) || '';
  const bio = text(lang === 'tj' ? row.bio_tj : lang === 'en' ? row.bio_en : row.bio_ru);
  const decree =
    text(lang === 'tj' ? row.hero_decree_tj : lang === 'en' ? row.hero_decree_en : row.hero_decree_ru) || '';
  return {
    name,
    title: profession,
    years,
    excerpt: excerptOf(bio),
    bio: paragraphs(bio),
    decree,
  };
};

/** DB row → the shape the showcase component renders. */
export const normalizeHero = (row: HeroRow): Hero => {
  const years = yearsOf(row);
  return {
    id: row.slug,
    portrait: text(row.portrait_url) || `/images/heroes/${row.slug}.jpg`,
    initials: initialsOf(text(row.name_ru)),
    tj: langBlock(row, 'tj', years),
    ru: langBlock(row, 'ru', years),
    en: langBlock(row, 'en', years),
  };
};

/**
 * Showcase data: the static file first (so SSR and the first paint stay
 * stable), replaced by the CMS archive as soon as the API answers.
 */
export function useHeroes(): Hero[] {
  const [heroes, setHeroes] = useState<Hero[]>(FALLBACK_HEROES);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/heroes')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: HeroRow[]) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        setHeroes(rows.map(normalizeHero));
      })
      .catch(() => {
        /* keep the curated fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return heroes;
}
