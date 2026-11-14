import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, FileText, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type SearchItem = {
  id: number | string;
  kind: string;
  type?: string;
  slug?: string;
  title_ru?: string;
  title_tj?: string;
  title_en?: string;
  excerpt?: string;
  date?: string;
};

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

const titleOf = (it: SearchItem, language: string) =>
  language === 'tj' ? (it.title_tj || it.title_ru || it.title_en || '') :
  language === 'en' ? (it.title_en || it.title_ru || it.title_tj || '') :
  (it.title_ru || it.title_tj || it.title_en || '');

const kindLabel = (kind: string, language: string) => {
  const map: Record<string, [string,string,string]> = {
    content: ['Мақола','Статья','Article'],
    news: ['Хабар','Новость','News'],
    announcement: ['Эълон','Объявление','Announcement'],
    vacancy: ['Ҷойи кор','Вакансия','Vacancy'],
    journal: ['Маҷалла','Журнал','Journal'],
    act: ['Санад','Акт','Act'],
    book: ['Китоб','Книга','Book'],
    hearing: ['Шунавоӣ','Слушание','Hearing'],
    page: ['Саҳифа','Страница','Page'],
  };
  const t = map[kind] || map.content;
  return language === 'tj' ? t[0] : language === 'en' ? t[2] : t[1];
};

const linkFor = (it: SearchItem): string => {
  const kind = it.kind || it.type || 'content';
  if (kind === 'content' || kind === 'news' || kind === 'announcement' || kind === 'vacancy' || kind === 'journal') {
    return `/${kind === 'content' ? 'news' : kind}/${it.slug || it.id}`;
  }
  if (kind === 'act') return `/acts/${it.slug || it.id}`;
  if (kind === 'book') return `/library`;
  if (kind === 'hearing') return `/hearings`;
  return '/';
};

export const SearchPage: React.FC = () => {
  const { language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = params.get('type') || 'all';

  usePageMeta(
    L(language, 'Ҷустуҷӯ', 'Поиск', 'Search'),
    L(language, 'Ҷустуҷӯ дар сомонаи Суди Олӣ', 'Поиск по сайту Верховного суда', 'Search the Supreme Court website')
  );

  const [input, setInput] = useState(q);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setInput(q);
  }, [q]);

  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); setTotal(0); return; }
    let cancelled = false;
    setLoading(true); setError('');
    const url = `/api/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(Array.isArray(d.items) ? d.items : []);
        setTotal(typeof d.total === 'number' ? d.total : (Array.isArray(d.items) ? d.items.length : 0));
      })
      .catch(() => { if (!cancelled) setError(L(language,'Хатои боркунӣ','Ошибка загрузки','Loading error')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [q, type, language]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    next.set('q', input.trim());
    setParams(next);
  };

  const setFilter = (t: string) => {
    const next = new URLSearchParams(params);
    if (t === 'all') next.delete('type'); else next.set('type', t);
    setParams(next);
  };

  const types = ['all','news','announcement','vacancy','journal','act','book','hearing'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={[{ label: L(language,'Асосӣ','Главная','Home'), to: '/' }, { label: L(language,'Ҷустуҷӯ','Поиск','Search') }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-theme-text">{L(language,'Ҷустуҷӯ','Поиск','Search')}</h1>

      <form onSubmit={submit} className="flex gap-2 mb-6">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={L(language,'Дархости ҷустуҷӯ...','Поисковый запрос...','Search query...')}
          className="flex-1"
        />
        <Button type="submit" variant="primary">
          <Search size={16} className="mr-1" /> {L(language,'Ҷустуҷӯ','Найти','Search')}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              type === t || (t === 'all' && !params.get('type'))
                ? 'bg-theme-gold text-theme-bg border-theme-gold'
                : 'border-theme-border text-theme-textSec hover:border-theme-gold/50'
            }`}
          >
            {t === 'all' ? L(language,'Ҳама','Все','All') : kindLabel(t, language)}
          </button>
        ))}
      </div>

      {loading && <p className="text-theme-textSec">{L(language,'Боркунии...','Загрузка...','Loading...')}</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && q.trim().length >= 2 && items.length === 0 && (
        <p className="text-theme-textSec">{L(language,'Чизе ёфт нашуд.','Ничего не найдено.','Nothing found.')}</p>
      )}

      <div className="space-y-4">
        {items.map((it, idx) => (
          <Card key={`${it.kind}-${it.id}-${idx}`} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-theme-gold"><FileText size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge>{kindLabel(it.kind || it.type || 'content', language)}</Badge>
                  {it.date && (
                    <span className="text-xs text-theme-textMuted flex items-center gap-1">
                      <Calendar size={12} /> {String(it.date).slice(0, 10)}
                    </span>
                  )}
                </div>
                <Link to={linkFor(it)} className="font-semibold text-theme-text hover:text-theme-gold transition-colors block">
                  {titleOf(it, language)}
                </Link>
                {it.excerpt && (
                  <p className="text-sm text-theme-textSec mt-1 line-clamp-2">{it.excerpt}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && items.length > 0 && (
        <p className="text-xs text-theme-textMuted mt-6">
          {L(language, `Ёфт шуд: ${items.length}`, `Найдено: ${items.length}`, `Found: ${items.length}`)}
          {total > items.length ? ` / ${total}` : ''}
        </p>
      )}
    </div>
  );
};
