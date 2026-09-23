import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Gavel, Scale, Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { pickTri } from '../sites/types';

interface SearchItem {
  kind: 'content' | 'act' | 'book' | 'hearing';
  id: number;
  type?: string;
  slug?: string;
  title_ru: string;
  title_tj?: string | null;
  title_en?: string | null;
  excerpt?: string | null;
  doc_number?: string | null;
  category?: string | null;
  badge?: string | null;
  date?: string | null;
}

const TABS = ['all', 'news', 'announcement', 'vacancy', 'journal', 'act', 'book', 'hearing'] as const;

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]>('all');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('');
  const [court, setCourt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);

  const L = (tj: string, ru: string, en: string) =>
    language === 'tj' ? tj : language === 'en' ? en : ru;

  useEffect(() => {
    if (isOpen) {
      setQ('');
      setItems([]);
      setTotal(0);
      setTab('all');
      setDateFrom('');
      setDateTo('');
      setCategory('');
      setCourt('');
      setShowFilters(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (timer.current) window.clearTimeout(timer.current);
    const query = q.trim();
    if (query.length < 2) {
      setItems([]);
      setTotal(0);
      setBusy(false);
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, type: tab === 'all' ? 'all' : tab });
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (category.trim()) params.set('category', category.trim());
        if (court.trim()) params.set('court', court.trim());
        const r = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
        const d = r.ok ? await r.json() : null;
        setItems(Array.isArray(d?.items) ? d.items : []);
        setTotal(Number(d?.total) || 0);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setBusy(false);
      }
    }, 320);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [q, tab, dateFrom, dateTo, category, court, isOpen]);

  if (!isOpen) return null;

  const hrefOf = (it: SearchItem): string => {
    if (it.kind === 'content' && it.type && it.slug) return `/${it.type}/${it.slug}`;
    if (it.kind === 'book') return `/library?doc=db:${it.id}`;
    return '/';
  };

  const iconOf = (it: SearchItem) =>
    it.kind === 'book' ? (
      <BookOpen size={14} />
    ) : it.kind === 'act' ? (
      <Scale size={14} />
    ) : it.kind === 'hearing' ? (
      <Gavel size={14} />
    ) : (
      <FileText size={14} />
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={L('Ҷустуҷӯ', 'Поиск', 'Search')}
      className="fixed inset-0 z-[80] flex items-start justify-center p-3 sm:p-6 pt-[10vh] bg-black/70 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl border border-theme-gold/25 bg-theme-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-theme-border">
          <Search size={16} className="text-theme-gold shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={L('Ҷустуҷӯи санадҳо, хабарҳо, китобҳо…', 'Поиск документов, новостей, книг…', 'Search documents, news, books…')}
            aria-label={L('Ҷустуҷӯ', 'Поиск', 'Search')}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-theme-text placeholder:text-theme-textMuted"
          />
          {busy && <span className="w-4 h-4 rounded-full border-2 border-theme-gold/30 border-t-theme-gold animate-spin" aria-hidden="true" />}
          <button
            type="button"
            onClick={onClose}
            aria-label={L('Пӯшидан', 'Закрыть', 'Close')}
            className="p-1.5 rounded-lg text-theme-textMuted hover:text-theme-text hover:bg-theme-bg"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-theme-border/60" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-full font-mono text-[11px] whitespace-nowrap border transition-colors ${
                tab === t
                  ? 'bg-theme-gold text-black border-theme-gold font-bold'
                  : 'border-theme-border text-theme-textMuted hover:text-theme-gold hover:border-theme-gold/50'
              }`}
            >
              {t === 'all'
                ? L('Ҳама', 'Все', 'All')
                : t === 'act'
                  ? L('Актҳо', 'Акты', 'Acts')
                  : t === 'book'
                    ? L('Китобҳо', 'Книги', 'Books')
                    : t === 'hearing'
                      ? L('Маҷлисҳо', 'Заседания', 'Hearings')
                      : t}
            </button>
          ))}
        </div>
        <div className="px-4 pb-1">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="font-mono text-[11px] text-theme-textMuted hover:text-theme-gold transition-colors"
          >
            {showFilters ? '− ' : '+ '}
            {L('Филтрҳо: сана, категория, суд', 'Фильтры: дата, категория, суд', 'Filters: date, category, court')}
          </button>
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2">
              <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wider text-theme-textMuted">
                {L('Аз сана', 'С даты', 'From')}
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 px-2 rounded-lg bg-theme-bg border border-theme-border text-theme-text text-xs font-sans focus:outline-none focus:border-theme-gold" />
              </label>
              <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wider text-theme-textMuted">
                {L('То сана', 'По дату', 'To')}
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 px-2 rounded-lg bg-theme-bg border border-theme-border text-theme-text text-xs font-sans focus:outline-none focus:border-theme-gold" />
              </label>
              <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wider text-theme-textMuted">
                {L('Категория', 'Категория', 'Category')}
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="…" className="h-9 px-2 rounded-lg bg-theme-bg border border-theme-border text-theme-text text-xs font-sans placeholder:text-theme-textMuted focus:outline-none focus:border-theme-gold" />
              </label>
              <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wider text-theme-textMuted">
                {L('Суд', 'Суд', 'Court')}
                <input value={court} onChange={(e) => setCourt(e.target.value)} placeholder="…" className="h-9 px-2 rounded-lg bg-theme-bg border border-theme-border text-theme-text text-xs font-sans placeholder:text-theme-textMuted focus:outline-none focus:border-theme-gold" />
              </label>
            </div>
          )}
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <p className="px-3 py-6 text-center font-mono text-xs text-theme-textMuted">
              {L('Ҳадди ақал 2 ҳарф ворид кунед', 'Введите минимум 2 символа', 'Type at least 2 characters')}
            </p>
          ) : items.length === 0 && !busy ? (
            <p className="px-3 py-6 text-center font-mono text-xs text-theme-textMuted">
              {L('Ҳеҷ чиз ёфт нашуд', 'Ничего не найдено', 'No results found')}
            </p>
          ) : (
            <>
              <p className="px-3 pt-2 pb-1 font-mono text-[11px] text-theme-textMuted">
                {L('Натиҷаҳо', 'Результатов', 'Results')}: {total}
              </p>
              {items.map((it) => (
                <Link
                  key={`${it.kind}-${it.id}`}
                  to={hrefOf(it)}
                  onClick={onClose}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-theme-gold/10 border border-transparent hover:border-theme-gold/30 transition-colors"
                >
                  <span className="mt-0.5 p-1.5 rounded-lg bg-theme-gold/15 text-theme-gold shrink-0">
                    {iconOf(it)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-theme-text leading-snug">
                      {pickTri(
                        { ru: it.title_ru, tj: it.title_tj || it.title_ru, en: it.title_en || it.title_ru },
                        language
                      )}
                    </span>
                    <span className="block mt-0.5 font-mono text-[10px] uppercase tracking-wider text-theme-textMuted">
                      {it.kind === 'content' ? it.type : it.kind}
                      {it.doc_number ? ` · №${it.doc_number}` : ''}
                      {it.badge ? ` · ${it.badge}` : ''}
                      {it.date ? ` · ${String(it.date).slice(0, 10)}` : ''}
                    </span>
                  </span>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
