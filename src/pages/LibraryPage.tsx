import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  LibraryBig,
  Scale,
  Search,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { pickTri } from '../sites/types';
import {
  ShelfBook,
  DOC_KINDS,
  DOC_KIND_LABEL,
  DocKind,
  actToShelfBook,
  useShelfBooks,
  coverFor,
  BOOK_THEMES,
} from '../components/digital-court/LawBookshelf';
import { FoliantReader } from '../components/digital-court/FoliantReader';
import { DiamondCatalog } from '../components/library/DiamondCatalog';
import { usePageMeta } from '../hooks/usePageMeta';
import './LibraryPage.css';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

export const LibraryPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  usePageMeta(
    L(language, 'Китобхонаи электронии суд', 'Электронная библиотека суда', 'Electronic Court Library')
  );
  const shelfBooks = useShelfBooks();
  const [acts, setActs] = useState<ShelfBook[]>([]);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | DocKind>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [docPage, setDocPage] = useState(1);
  const [contents, setContents] = useState<Record<string, any>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [initialDoc] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('doc');
    } catch {
      return null;
    }
  });
  const [initialPage] = useState(() => {
    try {
      const n = Number(new URLSearchParams(window.location.search).get('page'));
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
    } catch {
      return 1;
    }
  });
  const initialDocUsed = React.useRef(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/judicial_acts', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (alive && Array.isArray(d)) setActs(d.map(actToShelfBook));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const all = useMemo(() => [...shelfBooks, ...acts], [shelfBooks, acts]);

  const kindCounts = useMemo(() => {
    const c: Record<DocKind, number> = { constitution: 0, code: 0, law: 0, document: 0, quote: 0, other: 0 };
    all.forEach((b) => {
      const dl = (b.docLang || '').toLowerCase();
      if (dl && dl !== 'auto' && dl !== 'multi' && dl !== language) return;
      c[(b.kind || 'other') as DocKind]++;
    });
    return c;
  }, [all, language]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((b) => {
      const dl = (b.docLang || '').toLowerCase();
      if (dl && dl !== 'auto' && dl !== 'multi' && dl !== language) return false;
      if (kindFilter !== 'all' && (b.kind || 'other') !== kindFilter) return false;
      if (!q) return true;
      return pickTri(b.title, language).toLowerCase().includes(q);
    });
  }, [all, query, language, kindFilter]);

  useEffect(() => {
    if (filtered.length === 0) return;
    if (initialDoc && !initialDocUsed.current && all.some((b) => b.key === initialDoc)) {
      initialDocUsed.current = true;
      setSelectedKey(initialDoc);
      setDocPage(initialPage);
      return;
    }
    // Не автовыбирать первую книгу если пользователь закрыл читалку (selectedKey === null) — остаётся только полка
    if (selectedKey === null) return;
    const alive = all.some((b) => b.key === selectedKey);
    if (!alive) setSelectedKey(filtered[0].key);
  }, [filtered, selectedKey, all, initialDoc, initialPage]);

  const selected =
    filtered.find((b) => b.key === selectedKey) ||
    all.find((b) => b.key === selectedKey) ||
    null;
  const selIdx = selected ? filtered.findIndex((b) => b.key === selected.key) : -1;

  // Lazy-load full text per book (lists exclude content for weight) — multilingual with doc_lang
  useEffect(() => {
    if (!selected || !selected.key.startsWith('db:')) return;
    if (contents[selected.key] !== undefined) return;
    const id = selected.key.slice(3);
    let alive = true;
    setLoadingKey(selected.key);
    fetch(`/api/shelf-books/${id}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        if (!d) { setContents((prev) => ({ ...prev, [selected.key as string]: null })); setLoadingKey(null); return; }
        // Store full multilingual object; keep legacy string fallback for old code
        setContents((prev) => ({ ...prev, [selected.key as string]: d }));
        setLoadingKey(null);
      })
      .catch(() => {
        if (!alive) return;
        setContents((prev) => ({ ...prev, [selected.key as string]: null }));
        setLoadingKey(null);
      });
    return () => {
      alive = false;
    };
  }, [selected, contents]);

  // Pick content for current UI language — строго, не смешивать файлы до переключения
  const selectedRaw = selected ? contents[selected.key] : null;
  const selectedText: string | null = useMemo(() => {
    if (!selectedRaw) return null;
    if (typeof selectedRaw === 'string') return selectedRaw;
    const r: any = selectedRaw;
    const dl = (r.doc_lang || '').toLowerCase();
    // Одноязычный документ — только свой язык, без fallback на другой
    if (dl && dl !== 'auto' && dl !== 'multi') {
      if (dl === 'tj') return (r.content_tj as string) || null;
      if (dl === 'en') return (r.content_en as string) || null;
      if (dl === 'ru') return (r.content_ru as string) || (r.content as string) || null;
      return null;
    }
    // multi/auto/legacy — строго текущий язык, без подмешивания другого языка
    if (language === 'tj') return (r.content_tj as string) || null;
    if (language === 'en') return (r.content_en as string) || null;
    if (language === 'ru') return (r.content_ru as string) || (r.content as string) || null;
    return null;
  }, [selectedRaw, language]);

  // Pick URL for current language — строго, не показывать файл другого языка до переключения
  const selectedUrl = useMemo(() => {
    if (!selected) return null;
    const raw: any = selectedRaw;
    if (raw && typeof raw === 'object') {
      const dl = (raw.doc_lang || '').toLowerCase();
      if (dl && dl !== 'auto' && dl !== 'multi') {
        if (dl === 'tj') return (raw.url_tj as string) || null;
        if (dl === 'en') return (raw.url_en as string) || null;
        if (dl === 'ru') return (raw.url_ru as string) || (raw.url as string) || null;
        return null;
      }
      if (language === 'tj') return (raw.url_tj as string) || null;
      if (language === 'en') return (raw.url_en as string) || null;
      if (language === 'ru') return (raw.url_ru as string) || (raw.url as string) || null;
      return null;
    }
    const dl2 = ((selected as any).docLang || '').toLowerCase();
    if (dl2 && dl2 !== 'auto' && dl2 !== 'multi') {
      if (dl2 === 'tj') return (selected as any).urlTj || null;
      if (dl2 === 'en') return (selected as any).urlEn || null;
      if (dl2 === 'ru') return (selected as any).urlRu || (selected as any).url || null;
      return null;
    }
    if (language === 'tj' && (selected as any).urlTj) return (selected as any).urlTj as string;
    if (language === 'en' && (selected as any).urlEn) return (selected as any).urlEn as string;
    if (language === 'ru' && ((selected as any).urlRu || (selected as any).url)) return ((selected as any).urlRu as string) || ((selected as any).url as string);
    return null;
  }, [selected, selectedRaw, language]);

  const goDoc = (dir: 1 | -1) => {
    if (filtered.length === 0) return;
    const next = selIdx < 0 ? 0 : (selIdx + dir + filtered.length) % filtered.length;
    setSelectedKey(filtered[next].key);
    setDocPage(1);
  };

  const selectDoc = (key: string) => {
    setSelectedKey(key);
    setDocPage(1);
  };

  // URL state (?doc=&page=): direct opening, refresh preserves page,
  // browser back/forward work via history entries replaced on change.
  // On close (selectedKey null) clear stale ?doc so next entry shows catalog, not reader.
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (!selectedKey) {
        if (url.searchParams.has('doc') || url.searchParams.has('page')) {
          url.searchParams.delete('doc');
          url.searchParams.delete('page');
          window.history.replaceState(null, '', url.toString());
        }
        return;
      }
      url.searchParams.set('doc', selectedKey);
      url.searchParams.set('page', String(docPage));
      window.history.replaceState(null, '', url.toString());
    } catch {
      /* ignore */
    }
  }, [selectedKey, docPage]);

  // Esc to close reader overlay
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedKey(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const visibleAllCount = useMemo(() => all.filter(b => {
    const dl = (b.docLang || '').toLowerCase();
    if (dl && dl !== 'auto' && dl !== 'multi' && dl !== language) return false;
    return true;
  }).length, [all, language]);
  const selTitle = selected ? pickTri(selected.title, language) : '';
  const selKind = (selected?.kind || 'other') as DocKind;

  return (
    <div className="elib">
      {/* Top bar */}
      <header className="elib-topbar">
        <div className="elib-topbar-inner">
          <Link to="/" className="elib-back" aria-label={L(language, 'Ба саҳифаи асосӣ', 'На главную', 'Back to home')}>
            <ArrowLeft size={15} />
            <span className="elib-back-text">SUD.TJ</span>
          </Link>
          <div className="elib-brand">
            <span className="elib-brand-icon">
              <LibraryBig size={18} />
            </span>
            <div className="elib-brand-text">
              <strong>{L(language, 'Китобхонаи электронии суд', 'Электронная библиотека суда', 'Electronic Court Library')}</strong>
              <span>SUD.TJ // {L(language, 'Ҳамаи санадҳо', 'Все документы', 'All documents')} · {visibleAllCount}</span>
            </div>
          </div>

        </div>
        <div className="elib-toolbar">
          <div className="elib-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={L(language, 'Ҷустуҷӯи санад...', 'Поиск документа...', 'Search documents...')}
              aria-label={L(language, 'Ҷустуҷӯи санад', 'Поиск документа', 'Search documents')}
            />
          </div>
          <div className="leglib-chips elib-chips" role="tablist" aria-label={L(language, 'Категорияҳо', 'Категории', 'Categories')}>
            <button
              type="button"
              role="tab"
              aria-selected={kindFilter === 'all'}
              onClick={() => setKindFilter('all')}
              className={'leglib-chip' + (kindFilter === 'all' ? ' is-active' : '')}
            >
              {L(language, 'Ҳама', 'Все', 'All')} · {all.length}
            </button>
            {DOC_KINDS.map(
              (k) =>
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
            )}
          </div>
        </div>
      </header>

      {/* Body — diamond catalog like CodePen */}
      <div className="elib-body !max-w-none !p-0 !overflow-hidden" style={{ display: 'block', height: 'calc(100dvh - 112px)' }}>
        {/* Mobile doc picker */}
        <div className="elib-mobilepick !block sm:!hidden">
          <select
            value={selected?.key || ''}
            onChange={(e) => selectDoc(e.target.value)}
            aria-label={L(language, 'Интихоби санад', 'Выбор документа', 'Choose a document')}
          >
            <option value="">{L(language, 'Интихоби китоб...', 'Выберите книгу...', 'Choose a book...')}</option>
            {filtered.map((b) => (
              <option key={b.key} value={b.key}>
                {pickTri(b.title, language)}
              </option>
            ))}
          </select>
        </div>

        {/* Diamond catalog — CodePen style, adapted to SUD.TJ */}
        <DiamondCatalog books={filtered} onSelect={(b) => selectDoc(b.key)} selectedKey={selectedKey} />

        {/* Reader overlay */}
        {selected && (
          <div className="fixed inset-0 z-40 flex flex-col bg-black/78 backdrop-blur-[6px]" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setSelectedKey(null); }}>
            <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-4 md:p-6">
              <div className="max-w-[980px] mx-auto">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <button type="button" onClick={() => setSelectedKey(null)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-theme-gold/30 bg-theme-gold/15 text-theme-gold font-mono text-xs hover:bg-theme-gold hover:text-black transition-colors">
                    <ChevronLeft size={14} /> {L(language, 'Ба китобҳо', 'К книгам', 'Back to books')}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => goDoc(-1)} disabled={filtered.length < 2} className="p-2 rounded-full border border-white/10 bg-white/5 text-white hover:border-theme-gold hover:text-theme-gold disabled:opacity-30">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-mono text-xs text-white/70 px-2">{selIdx >= 0 ? selIdx + 1 : '—'} / {filtered.length}</span>
                    <button type="button" onClick={() => goDoc(1)} disabled={filtered.length < 2} className="p-2 rounded-full border border-white/10 bg-white/5 text-white hover:border-theme-gold hover:text-theme-gold disabled:opacity-30">
                      <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={() => setSelectedKey(null)} className="ml-2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                      <span className="text-lg leading-none">×</span>
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-theme-gold/20 bg-[#070a14] shadow-2xl">
                  <div className="p-4 sm:p-5 border-b border-theme-border/30 bg-theme-surface/40">
                    <span className="elib-kindchip">{pickTri(DOC_KIND_LABEL[selKind], language)}</span>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">{selTitle}</h1>
                    <div className="elib-docmeta mt-2">
                      <span className="elib-badge">{selected.badge || 'PDF'}</span>
                      <span className="text-white/60">sud.tj</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-black/20">
                    <FoliantReader
                      key={selected.key + '|' + language}
                      bookKey={selected.key + '|' + language}
                      book={selected}
                      kindLabel={pickTri(DOC_KIND_LABEL[selKind], language)}
                      textContent={selectedText}
                      pdfUrl={selectedUrl}
                      downloadUrl={selectedUrl}
                      loading={loadingKey === selected.key}
                      initialPage={docPage}
                      onPage={(p) => setDocPage(p)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
