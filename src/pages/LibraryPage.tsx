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
import { BookReaderView } from '../components/digital-court/BookReaderView';
import './LibraryPage.css';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

export const LibraryPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const shelfBooks = useShelfBooks();
  const [acts, setActs] = useState<ShelfBook[]>([]);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | DocKind>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, string | null>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

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
      c[(b.kind || 'other') as DocKind]++;
    });
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((b) => {
      if (kindFilter !== 'all' && (b.kind || 'other') !== kindFilter) return false;
      if (!q) return true;
      return pickTri(b.title, language).toLowerCase().includes(q);
    });
  }, [all, query, language, kindFilter]);

  useEffect(() => {
    if (filtered.length === 0) return;
    const alive = selectedKey !== null && all.some((b) => b.key === selectedKey);
    if (!alive) setSelectedKey(filtered[0].key);
  }, [filtered, selectedKey, all]);

  const selected =
    filtered.find((b) => b.key === selectedKey) ||
    all.find((b) => b.key === selectedKey) ||
    null;
  const selIdx = selected ? filtered.findIndex((b) => b.key === selected.key) : -1;

  // Lazy-load full text per book (lists exclude content for weight).
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
        setContents((prev) => ({ ...prev, [selected.key as string]: typeof d?.content === 'string' && d.content ? d.content : null }));
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

  const goDoc = (dir: 1 | -1) => {
    if (filtered.length === 0) return;
    const next = selIdx < 0 ? 0 : (selIdx + dir + filtered.length) % filtered.length;
    setSelectedKey(filtered[next].key);
  };

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
              <span>SUD.TJ // {L(language, 'Ҳамаи санадҳо', 'Все документы', 'All documents')} · {all.length}</span>
            </div>
          </div>
          <div className="elib-lang" role="group" aria-label="Language">
            {(['tj', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={language === l ? 'is-active' : ''}
                aria-pressed={language === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
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

      {/* Body */}
      <div className="elib-body">
        {/* Mobile doc picker */}
        <div className="elib-mobilepick">
          <select
            value={selected?.key || ''}
            onChange={(e) => setSelectedKey(e.target.value)}
            aria-label={L(language, 'Интихоби санад', 'Выбор документа', 'Choose a document')}
          >
            {filtered.map((b) => (
              <option key={b.key} value={b.key}>
                {pickTri(b.title, language)}
              </option>
            ))}
          </select>
        </div>

        {/* Sidebar */}
        <nav className="elib-sidebar" aria-label={L(language, 'Рӯйхати санадҳо', 'Список документов', 'Document list')}>
          {filtered.length === 0 && (
            <div className="elib-empty">
              <FileText size={26} aria-hidden="true" />
              <span>{L(language, 'Санаде ёфт нашуд', 'Документы не найдены', 'No documents found')}</span>
            </div>
          )}
          {filtered.map((b, i) => {
            const t = pickTri(b.title, language);
            const active = selected?.key === b.key;
            return (
              <button
                key={b.key}
                type="button"
                onClick={() => setSelectedKey(b.key)}
                className={'elib-item' + (active ? ' is-active' : '')}
                aria-current={active ? 'true' : undefined}
              >
                <span
                  className="elib-swatch"
                  style={{ background: BOOK_THEMES[coverFor(b, i)] }}
                  aria-hidden="true"
                >
                  <Scale size={13} />
                </span>
                <span className="elib-item-text">
                  <span className="elib-item-kind">
                    {pickTri(DOC_KIND_LABEL[(b.kind || 'other') as DocKind], language)}
                  </span>
                  <span className="elib-item-title">{t}</span>
                </span>
                <span className="elib-item-badge">{b.badge || 'PDF'}</span>
              </button>
            );
          })}
        </nav>

        {/* Reader */}
        <main className="elib-reader" aria-live="polite">
          {!selected ? (
            <div className="elib-empty">
              <BookOpen size={30} aria-hidden="true" />
              <span>{L(language, 'Санадеро интихоб кунед', 'Выберите документ для чтения', 'Select a document to read')}</span>
            </div>
          ) : (
            <>
              <div className="elib-dochead">
                <span className="elib-kindchip">
                  {pickTri(DOC_KIND_LABEL[selKind], language)}
                </span>
                <h1>{selTitle}</h1>
                <div className="elib-docmeta">
                  <span className="elib-badge">{selected.badge || 'PDF'}</span>
                  <span>sud.tj</span>
                  <span>TJ · RU · EN</span>
                </div>
              </div>

              <div className="elib-docnav">
                <button type="button" onClick={() => goDoc(-1)} disabled={filtered.length < 2} aria-label={L(language, 'Қаблӣ', 'Назад', 'Previous')}>
                  <ChevronLeft size={16} />
                  <span>{L(language, 'Қаблӣ', 'Назад', 'Prev')}</span>
                </button>
                <span className="elib-docpos">
                  {selIdx >= 0 ? selIdx + 1 : '—'} / {filtered.length}
                </span>
                <button type="button" onClick={() => goDoc(1)} disabled={filtered.length < 2} aria-label={L(language, 'Баъдӣ', 'Вперёд', 'Next')}>
                  <span>{L(language, 'Баъдӣ', 'Вперёд', 'Next')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <BookReaderView
                key={selected.key}
                book={selected}
                content={contents[selected.key] ?? null}
                loading={loadingKey === selected.key}
              />

              <div className="elib-docnav bottom">
                <button type="button" onClick={() => goDoc(-1)} disabled={filtered.length < 2}>
                  <ChevronLeft size={16} />
                  <span>{L(language, 'Ҳуҷҷати қаблӣ', 'Предыдущий документ', 'Previous document')}</span>
                </button>
                <button type="button" onClick={() => goDoc(1)} disabled={filtered.length < 2}>
                  <span>{L(language, 'Ҳуҷҷати баъдӣ', 'Следующий документ', 'Next document')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LibraryPage;
