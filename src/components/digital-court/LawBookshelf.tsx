import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Scale, BookOpen, Landmark, Gavel, ExternalLink, FileText, X, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { TriText } from '../../sites/types';
import { pickTri } from '../../sites/types';
import type { LegislationLink } from '../../sites/shared';
import { SHARED_LEGISLATION } from '../../sites/shared';
import { useSiteSync } from '../../hooks/useSiteSync';
import './LegislativeLibrary.css';

export interface ShelfBookMeta {
  label: TriText;
  value: string;
}

export interface ShelfBook {
  key: string;
  url: string | null;
  title: TriText;
  badge?: string;
  meta?: ShelfBookMeta[];
  blurb?: TriText;
  cover?: number;
  kind?: DocKind;
  coverText?: string | null;
  coverEmblem?: string | null;
  coverBg?: string | null;
  coverImage?: string | null;
}

export type DocKind = 'constitution' | 'code' | 'law' | 'document' | 'quote' | 'other';

export const DOC_KINDS: DocKind[] = ['constitution', 'code', 'law', 'document', 'quote', 'other'];

export const DOC_KIND_LABEL: Record<DocKind, TriText> = {
  constitution: { tj: 'Конститутсия', ru: 'Конституция', en: 'Constitution' },
  code: { tj: 'Кодексҳо', ru: 'Кодексы', en: 'Codes' },
  law: { tj: 'Қонунҳо', ru: 'Законы', en: 'Laws' },
  document: { tj: 'Ҳуҷҷатҳо', ru: 'Документы', en: 'Documents' },
  quote: { tj: 'Иқтибосҳо', ru: 'Цитаты', en: 'Quotes' },
  other: { tj: 'Санадҳо', ru: 'Материалы', en: 'Materials' },
};

// Default cover per document kind (admin cover choice wins when set).
const COVER_BY_KIND: Record<DocKind, number> = {
  constitution: 0,
  code: 2,
  law: 1,
  document: 3,
  quote: 5,
  other: 4,
};

export function detectKind(titleRu: string): DocKind {
  const s = (titleRu || '').toLowerCase();
  if (s.includes('конституци')) return 'constitution';
  if (s.includes('кодекс')) return 'code';
  if (s.includes('закон')) return 'law';
  return 'other';
}

export function coverFor(book: Pick<ShelfBook, 'cover' | 'kind'>, fallbackIdx = 0): number {
  if (Number.isFinite(Number(book.cover))) return Number(book.cover) % BOOK_THEMES.length;
  const kind = (book.kind || 'other') as DocKind;
  if (COVER_BY_KIND[kind] !== undefined) return COVER_BY_KIND[kind] % BOOK_THEMES.length;
  return fallbackIdx % BOOK_THEMES.length;
}

// Custom cover face: own image wins, then custom bg/color, then theme gradient.
export function coverFaceStyle(book: Pick<ShelfBook, 'cover' | 'kind' | 'coverBg' | 'coverImage'>, fallbackIdx = 0): React.CSSProperties {
  if (book.coverImage) {
    return { backgroundImage: `url("${book.coverImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (book.coverBg) return { background: book.coverBg };
  return { background: BOOK_THEMES[coverFor(book, fallbackIdx)] };
}

export const COVER_EMBLEMS = {
  scale: Scale,
  book: BookOpen,
  landmark: Landmark,
  gavel: Gavel,
} as const;

export function coverEmblem(book: Pick<ShelfBook, 'coverEmblem'>): keyof typeof COVER_EMBLEMS | null {
  const e = (book.coverEmblem || 'scale').toLowerCase();
  if (e === 'none') return null;
  return (Object.keys(COVER_EMBLEMS) as Array<keyof typeof COVER_EMBLEMS>).includes(e as any) ? (e as keyof typeof COVER_EMBLEMS) : 'scale';
}

export function coverTitle(book: ShelfBook, language: string): string {
  const custom = (book.coverText || '').trim();
  return custom || pickTri(book.title, language);
}

export const BOOK_THEMES = [
  'linear-gradient(180deg, #1b2a4a 0%, #0d1526 100%)',
  'linear-gradient(180deg, #3d1f2b 0%, #200f16 100%)',
  'linear-gradient(180deg, #123c3a 0%, #0a2221 100%)',
  'linear-gradient(180deg, #3a2f1c 0%, #1f180c 100%)',
  'linear-gradient(180deg, #2a2140 0%, #141026 100%)',
  'linear-gradient(180deg, #1f3a44 0%, #0c1a20 100%)',
];

export const COVER_THEMES = [
  'linear-gradient(160deg, #17233d 0%, #0b1322 72%)',
  'linear-gradient(160deg, #143c39 0%, #0a2221 72%)',
  'linear-gradient(160deg, #2b2344 0%, #141029 72%)',
];

const T = (tj: string, ru: string, en: string): TriText => ({ tj, ru, en });

export const staticToShelfBook = (doc: LegislationLink, idx = 0): ShelfBook => ({
  key: 'static:' + doc.url,
  url: doc.url,
  title: doc.title,
  badge: 'PDF',
  cover: idx % BOOK_THEMES.length,
  kind: detectKind(doc.title.ru),
  meta: [
    { label: T('Формат', 'Формат', 'Format'), value: 'PDF' },
    { label: T('Манбаъ', 'Источник', 'Source'), value: 'sud.tj' },
    { label: T('Забонҳо', 'Языки', 'Languages'), value: 'TJ · RU · EN' },
  ],
});

export const dbToShelfBook = (row: any): ShelfBook => ({
  key: 'db:' + row.id,
  url: row.url || null,
  title: {
    ru: row.title_ru || '',
    tj: row.title_tj || row.title_ru || '',
    en: row.title_en || row.title_ru || '',
  },
  badge: row.badge || 'PDF',
  cover: Number.isFinite(Number(row.cover_theme)) ? Number(row.cover_theme) % BOOK_THEMES.length : 0,
  kind: (['constitution', 'code', 'law', 'document', 'quote', 'other'] as const).includes(row.kind) ? row.kind : detectKind(row.title_ru || ''),
  coverText: row.cover_text || null,
  coverEmblem: row.cover_emblem || null,
  coverBg: row.cover_bg || null,
  coverImage: row.cover_image || null,
  meta: [
    { label: T('Формат', 'Формат', 'Format'), value: 'PDF' },
    { label: T('Манбаъ', 'Источник', 'Source'), value: 'sud.tj' },
    { label: T('Забонҳо', 'Языки', 'Languages'), value: 'TJ · RU · EN' },
  ],
});

// Books managed in admin (/admin/books). Falls back to the static set
// until the admin seeds or creates books.
const SHARED_LEGISLATION_STATIC_FALLBACK: ShelfBook[] = SHARED_LEGISLATION.map((doc, i) => staticToShelfBook(doc, i));

export function useShelfBooks(): ShelfBook[] {
  const [dbBooks, setDbBooks] = useState<ShelfBook[] | null>(null);
  const load = useCallback(() => {
    fetch('/api/shelf-books', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setDbBooks(d.map(dbToShelfBook));
        else setDbBooks([]);
      })
      .catch(() => {
        setDbBooks((prev) => (prev === null ? [] : prev));
      });
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useSiteSync(load);
  return useMemo(() => {
    if (dbBooks === null) return SHARED_LEGISLATION_STATIC_FALLBACK;
    if (dbBooks.length > 0) return dbBooks;
    return SHARED_LEGISLATION_STATIC_FALLBACK;
  }, [dbBooks]);
}

export const actToShelfBook = (row: any): ShelfBook => ({
  key: 'act:' + row.id,
  url: row.file_path || null,
  title: {
    ru: row.title_ru || '',
    tj: row.title_tj || row.title_ru || '',
    en: row.title_en || row.title_ru || '',
  },
  badge: row.doc_number || undefined,
  cover: undefined,
  kind: detectKind(row.title_ru || ''),
  meta: [
    ...(row.doc_number ? [{ label: T('Рақам', 'Номер', 'Number'), value: String(row.doc_number) }] : []),
    ...(row.category ? [{ label: T('Гурӯҳ', 'Категория', 'Category'), value: String(row.category) }] : []),
    ...(row.act_date ? [{ label: T('Сана', 'Дата', 'Date'), value: String(row.act_date) }] : []),
  ],
});

export function pluralDocs(n: number, language: string): string {
  if (language === 'tj') return n + ' санад';
  if (language === 'en') return n + (n === 1 ? ' document' : ' documents');
  const m10 = n % 10;
  const m100 = n % 100;
  const w = m10 === 1 && m100 !== 11 ? 'документ' : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? 'документа' : 'документов';
  return n + ' ' + w;
}

const OpenBookReader: React.FC<{ book: ShelfBook; onClose: () => void }> = ({ book, onClose }) => {
  const { language, t } = useLanguage();
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const title = pickTri(book.title, language);
  const themeIdx = coverFor(book, 0) % COVER_THEMES.length;
  const meta = book.meta && book.meta.length > 0 ? book.meta : [
    { label: T('Формат', 'Формат', 'Format'), value: 'PDF' },
    { label: T('Манбаъ', 'Источник', 'Source'), value: 'sud.tj' },
  ];
  const blurb = book.blurb ? pickTri(book.blurb, language) : t('leglib.description');

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  const reader = (
    <div className={'leglib-reader-card rounded-2xl border border-theme-gold/40 bg-theme-surface/60 overflow-hidden' + (expanded ? ' is-fullscreen' : '')}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-theme-border">
        <span className="font-mono text-[11px] text-theme-gold uppercase tracking-wider truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? t('leglib.closeDoc') : t('leglib.openDoc')}
            title={expanded ? 'Свернуть' : 'На весь экран'}
            className="p-1.5 rounded-lg border border-theme-border text-theme-textMuted hover:text-theme-gold hover:border-theme-gold/60 transition-colors"
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('leglib.closeDoc')}
            className="p-1.5 rounded-lg border border-theme-border text-theme-textMuted hover:text-red-400 hover:border-red-400/60 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="bk-showcase !py-6">
        <div className="bk-cell" style={{ zIndex: 10 }}>
          <div className="bk-stage">
            <div className="bk-book bk-viewinside">
              <div className="bk-front">
                <div className="bk-cover-back" />
                <div className="bk-cover" style={{ background: COVER_THEMES[themeIdx % COVER_THEMES.length] }}>
                  <span className="bk-emblem">
                    <Scale size={26} />
                  </span>
                  <h2>
                    <span>{language === 'tj' ? 'Санади меъёрӣ' : language === 'en' ? 'Statute' : 'Нормативный акт'}</span>
                    <span>{title}</span>
                  </h2>
                  <span className="bk-cover-foot">SUD.TJ • PDF</span>
                </div>
              </div>
              <div className="bk-page bk-pageflip" key={'pg' + page} style={{ display: 'block' }}>
                <div className={'bk-content' + (page === 0 ? ' bk-content-current' : '')}>
                  <div className="bk-meta">
                    {meta.map((m, i) => (
                      <div key={i}>
                        <span>{pickTri(m.label, language)}</span>
                        <span>{m.value}</span>
                      </div>
                    ))}
                  </div>
                  {book.url && (
                    <a className="bk-openbtn" href={book.url} target="_blank" rel="noreferrer">
                      <span>{t('leglib.openDoc')}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className={'bk-content' + (page === 1 ? ' bk-content-current' : '')}>
                  <p>{blurb}</p>
                  {book.url && (
                    <a className="bk-openbtn" href={book.url} target="_blank" rel="noreferrer">
                      <span>{t('leglib.openDoc')}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <nav className="bk-pagenav" aria-label="pages">
                  <button type="button" onClick={() => setPage(0)} className={page === 0 ? 'bk-dot-current' : ''} aria-label="1">‹</button>
                  <button type="button" onClick={() => setPage(1)} className={page === 1 ? 'bk-dot-current' : ''} aria-label="2">›</button>
                </nav>
              </div>
              <div className="bk-back">
                <span className="bk-emblem bk-emblem-sm">
                  <Scale size={20} />
                </span>
                <h2>{title}</h2>
                {book.url && (
                  <a className="bk-openbtn light" href={book.url} target="_blank" rel="noreferrer">
                    <span>{t('leglib.openDoc')}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <div className="bk-right" />
              <div className="bk-left" style={{ background: COVER_THEMES[(themeIdx + 1) % COVER_THEMES.length] }}>
                <h2><span>{title}</span></h2>
              </div>
              <div className="bk-top" />
              <div className="bk-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (expanded) {
    return (
      <div className="leglib-reader-overlay" role="dialog" aria-modal="true" aria-label={title}>
        <div className="leglib-reader-backdrop" onClick={() => setExpanded(false)} />
        <div className="leglib-reader-sheet">{reader}</div>
      </div>
    );
  }
  return reader;
};

interface LawBookshelfProps {
  books: ShelfBook[];
  showSearch?: boolean;
}

export const LawBookshelf: React.FC<LawBookshelfProps> = ({ books, showSearch = true }) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | DocKind>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const kindCounts = useMemo(() => {
    const c: Record<DocKind, number> = { constitution: 0, code: 0, law: 0, document: 0, quote: 0, other: 0 };
    books.forEach((b) => {
      const k = (b.kind || detectKind(pickTri(b.title, 'ru'))) as DocKind;
      c[k]++;
    });
    return c;
  }, [books]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      if (kindFilter !== 'all') {
        const k = (b.kind || detectKind(pickTri(b.title, 'ru'))) as DocKind;
        if (k !== kindFilter) return false;
      }
      if (!q) return true;
      return pickTri(b.title, language).toLowerCase().includes(q);
    });
  }, [books, query, language, kindFilter]);

  const selected = useMemo(
    () => filtered.find((b) => b.key === selectedKey) || books.find((b) => b.key === selectedKey) || null,
    [filtered, books, selectedKey]
  );

  // Independent per-book entrance (no shared group animation)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const triggers: ScrollTrigger[] = [];
    const nodes = Array.from(
      rootRef.current?.querySelectorAll('.leglib-book:not([data-leglib-anim])') || []
    );
    nodes.forEach((el) => {
      el.setAttribute('data-leglib-anim', '1');
      const tween = gsap.from(el, {
        y: 44,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });
    return () => {
      triggers.forEach((st) => st.kill());
      // StrictMode-safe: a remount kills triggers but NOT their from-tweens,
      // leaving books stuck at opacity:0 behind the data-leglib-anim guard.
      // Release only unfinished nodes so finished books don't re-animate.
      nodes.forEach((el) => {
        gsap.killTweensOf(el);
        const html = el as HTMLElement;
        if (html.style.opacity !== '') {
          el.removeAttribute('data-leglib-anim');
          html.style.removeProperty('opacity');
          html.style.removeProperty('transform');
        }
      });
    };
  }, [filtered]);

  useEffect(() => {
    if (!selectedKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedKey(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedKey]);

  useEffect(() => {
    if (selectedKey && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedKey]);

  return (
    <div ref={rootRef}>
      {showSearch && (
        <>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-textMuted pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('leglib.searchPlaceholder')}
              aria-label={t('leglib.searchPlaceholder')}
              className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold font-mono transition-colors"
            />
          </div>
          <span className="font-mono text-[11px] text-theme-gold uppercase tracking-wider">
            {pluralDocs(filtered.length, language)}
          </span>
        </div>
        <div className="leglib-chips" role="tablist" aria-label="Категории документов">
          <button
            type="button"
            role="tab"
            aria-selected={kindFilter === 'all'}
            onClick={() => setKindFilter('all')}
            className={'leglib-chip' + (kindFilter === 'all' ? ' is-active' : '')}
          >
            {language === 'tj' ? 'Ҳама' : language === 'en' ? 'All' : 'Все'} · {books.length}
          </button>
          {DOC_KINDS.map((k) => (
            kindCounts[k] > 0 && (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kindFilter === k}
                onClick={() => setKindFilter(kindFilter === k ? 'all' : k)}
                className={'leglib-chip' + (kindFilter === k ? ' is-active' : '')}
              >
                {pickTri(DOC_KIND_LABEL[k], language)} · {kindCounts[k]}
              </button>
            )
          ))}
        </div>
        </>
      )}

      {selected && (
        <div ref={readerRef} className="mb-6 scroll-mt-32">
          <OpenBookReader
            key={selected.key}
            book={selected}
            onClose={() => setSelectedKey(null)}
          />
        </div>
      )}

      <div className="leglib-stage">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-theme-textMuted">
            <FileText size={28} />
            <span className="font-mono text-xs">{t('leglib.empty')}</span>
          </div>
        ) : (
          <>
            <div
              className={'leglib-shelf-inner flex flex-wrap justify-center gap-x-5 gap-y-9 px-2 py-10' + (selectedKey ? ' leglib-has-open' : '')}
            >
              {filtered.map((b, idx) => {
                const title = pickTri(b.title, language);
                const isSel = selectedKey === b.key;
                const inner = (
                  <span className="leglib-book-inner">
                    <span
                      className="leglib-face leglib-spine"
                      style={{ background: BOOK_THEMES[coverFor(b, idx)] }}
                    >
                      <Scale size={15} className="text-theme-gold shrink-0" />
                      <span className="leglib-spine-text">{title}</span>
                      <span className="font-mono text-[8px] tracking-[0.2em] text-theme-gold/80">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </span>
                    <span className={'leglib-face leglib-cover' + (b.coverImage ? ' has-custom' : '')} style={coverFaceStyle(b, idx)}>
                      <span className="p-2 rounded-full border border-theme-gold/50 bg-theme-gold/15 text-theme-gold">
                        {(() => {
                          const ek = coverEmblem(b);
                          const EI = ek ? COVER_EMBLEMS[ek] : null;
                          return EI ? <EI size={18} /> : null;
                        })()}
                      </span>
                      <span className="font-sans text-[13px] font-semibold leading-snug text-center text-theme-text line-clamp-4">
                        {coverTitle(b, language)}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-theme-gold">
                        <span className="px-2 py-0.5 rounded border border-theme-gold/50 bg-theme-gold/10 inline-flex items-center gap-1">
                          <FileText size={11} aria-hidden="true" />
                          {b.badge || 'DOC'}
                        </span>
                        <ExternalLink size={12} aria-hidden="true" />
                      </span>
                    </span>
                    <span className="leglib-pages" aria-hidden="true" />
                  </span>
                );
                const cls = 'leglib-book group' + (isSel ? ' open' : '');
                const label = title + ' — ' + t('leglib.openDoc');
                const kindLabel = pickTri(DOC_KIND_LABEL[(b.kind || 'other') as DocKind], language);
                const bookNode = b.url ? (
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedKey(isSel ? null : b.key);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedKey(isSel ? null : b.key);
                      }
                    }}
                    className={cls}
                    aria-label={label}
                    aria-expanded={isSel}
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedKey(isSel ? null : b.key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedKey(isSel ? null : b.key);
                      }
                    }}
                    className={cls}
                    aria-label={label}
                    aria-expanded={isSel}
                  >
                    {inner}
                  </div>
                );
                return (
                  <div key={b.key} className="leglib-item">
                    {bookNode}
                    <span className="leglib-caption" aria-hidden="true">{title}</span>
                    <span className="leglib-tip" aria-hidden="true">
                      <strong>{title}</strong>
                      <span>{kindLabel} · {b.badge || 'PDF'} · sud.tj</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="leglib-shelf-bar mx-2 sm:mx-8" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
};

export default LawBookshelf;
