import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, LogOut, Megaphone, Newspaper, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { getCourtSite } from "./registry";
import { pickTri } from "./types";
import { useLanguage } from "../context/LanguageContext";

// Theme-styled controls (main site design: theme vars, gold accents)
const inputCls =
  "w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold font-mono transition-colors";
const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-theme-gold text-black font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-40 disabled:pointer-events-none";
const btnGhost =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-theme-border text-theme-textSec hover:text-theme-gold hover:border-theme-gold font-mono text-xs transition-colors";
const btnDanger =
  "inline-flex items-center justify-center gap-1 p-2 rounded-lg border border-theme-border text-theme-textMuted hover:text-red-400 hover:border-red-400/60 transition-colors";

const SiteInput: React.FC<{
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}> = ({ label, value, onChange, placeholder, type, onKeyDown }) => (
  <div className="w-full flex flex-col gap-1.5 text-left">
    {label && (
      <label className="font-mono text-[11px] font-medium uppercase tracking-wider text-theme-textMuted">{label}</label>
    )}
    <input value={value} onChange={onChange} placeholder={placeholder} type={type} onKeyDown={onKeyDown} className={inputCls} />
  </div>
);

interface SiteColumn {
  header: React.ReactNode;
  accessor?: ((row: any) => React.ReactNode) | string;
  width?: string;
}

const SiteTable: React.FC<{
  columns: SiteColumn[];
  data: any[];
  keyExtractor: (row: any, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
}> = ({ columns, data, keyExtractor, isLoading, emptyMessage }) => (
  <div className="w-full rounded-xl border border-theme-border bg-theme-surface overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-theme-border bg-theme-bg/60 text-theme-textMuted font-mono text-[11px] uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className="py-3 px-4 font-semibold" style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center font-mono text-xs text-theme-textSec">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center font-mono text-xs text-theme-textSec">
                {emptyMessage || 'No items'}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={keyExtractor(row, i)} className="border-b border-theme-border/40 last:border-0 hover:bg-theme-bg/50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="py-3 px-4 text-sm">
                    {typeof col.accessor === 'function' ? col.accessor(row) : (row as any)[col.accessor || '']}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const SiteTabs: React.FC<{
  tabs: Array<{ id: string; label: React.ReactNode; icon?: React.ReactNode; count?: number }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}> = ({ tabs, activeTab, onChange }) => (
  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={'px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors inline-flex items-center gap-1.5 font-mono text-xs ' + (activeTab === tab.id ? 'bg-theme-gold text-black font-bold shadow-sm' : 'text-theme-textSec hover:text-theme-text hover:bg-theme-surface border border-theme-border')}
      >
        {tab.icon}
        <span>{tab.label}</span>
        {typeof tab.count === 'number' && (
          <span className={'px-1.5 rounded-full text-[10px] ' + (activeTab === tab.id ? 'bg-black/20' : 'bg-theme-bg text-theme-textMuted')}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// SEC-05: cookie transport — the httpOnly `cms_token` cookie is sent via credentials:include.
const cfetch = (url: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers || undefined);
  if (init.body != null && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers, credentials: 'include' });
};

const translit = (s: string): string => {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ғ: 'gh', ӣ: 'i', қ: 'q', ӯ: 'u', ҳ: 'h', ҷ: 'j',
  };
  return s.toLowerCase().split('').map((ch) => (map[ch] !== undefined ? map[ch] : /[a-z0-9]/.test(ch) ? ch : '-')).join('').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
};

export const CourtSiteAdmin: React.FC = () => {
  const { courtId = '' } = useParams();
  const { language } = useLanguage();
  const cfg = getCourtSite(courtId);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [me, setMe] = useState<any | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('news');
  const [items, setItems] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const doLogout = useCallback(() => {
    cfetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => undefined);
    setAuthed(false);
    setMe(null);
  }, []);

  const loadAll = useCallback(() => {
    if (!cfg || !authed) return;
    setIsLoading(true);
    Promise.all([
      cfetch('/api/admin/content').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('/api/hearings?court=' + encodeURIComponent(cfg.courtNameRu)).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      cfetch('/api/admin/leadership?court=' + cfg.id).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([content, h, l]) => {
      const arr = Array.isArray(content) ? content : content.items || [];
      setItems(arr.filter((c: any) => c.region === cfg.region));
      setHearings(Array.isArray(h) ? h : []);
      setLeaders(Array.isArray(l) ? l : []);
      setIsLoading(false);
    });
  }, [cfg, authed]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (me) return;
    cfetch('/api/admin/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (u) { setMe(u); setAuthed(true); } else setAuthed(false); })
      .catch(() => setAuthed(false));
  }, [me]);

  if (!cfg) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text p-8">
        <div className="max-w-2xl mx-auto content-card p-8 text-center font-mono">404</div>
      </div>
    );
  }

  const doLogin = () => {
    setLoginError('');
    cfetch('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
      .then((r) => { if (!r.ok) throw new Error('auth'); return r.json(); })
      .then((d) => { setAuthed(true); setMe(d.user || null); loadAll(); })
      .catch(() => setLoginError(language === 'tj' ? 'Ном ё гузарвожа нодуруст' : language === 'en' ? 'Invalid credentials' : 'Неверный логин или пароль'));
  };

  if (authed === null) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center p-4">
        <div className="font-mono text-xs text-theme-textMuted">…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center p-4">
        <div className="w-full max-w-sm content-card p-6 space-y-4">
          <div className="font-mono text-xs uppercase tracking-widest text-theme-gold">
            {language === 'tj' ? 'Админкаи суд' : language === 'en' ? 'Court admin' : 'Админка суда'}
          </div>
          <div className="font-sans font-bold text-lg text-theme-text">{pickTri(cfg.shortName, language)}</div>
          <SiteInput label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sud.tj" />
          <SiteInput label={language === 'en' ? 'Password' : language === 'tj' ? 'Гузарвожа' : 'Пароль'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }} />
          {loginError && <div className="font-mono text-xs text-red-400">{loginError}</div>}
          <button type="button" className={btnPrimary + ' w-full !py-3'} onClick={doLogin}>
            {language === 'en' ? 'Sign in' : language === 'tj' ? 'Воридшавӣ' : 'Войти'}
          </button>
          <Link to={'/courts/' + cfg.id} className="flex items-center justify-center gap-1.5 font-mono text-xs text-theme-textMuted hover:text-theme-gold">
            <ArrowLeft size={13} />
            <span>{language === 'en' ? 'Back to site' : language === 'tj' ? 'Ба сомона' : 'На сайт'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess = !me || me.role === 'super_admin' || me.role === 'admin' || me.site_id === cfg.id;
  if (authed && me && !hasAccess) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center p-4">
        <div className="w-full max-w-md content-card p-8 text-center space-y-4">
          <div className="font-mono text-xs uppercase tracking-widest text-red-400">
            {language === 'en' ? 'Access denied' : language === 'tj' ? 'Дастрасӣ манъ аст' : 'Доступ запрещён'}
          </div>
          <p className="font-sans text-sm text-theme-textSec">
            {language === 'en' ? 'Your account is bound to another court site.' : language === 'tj' ? 'Ҳисоби шумо ба сомонаи дигари суд вобаста аст.' : 'Ваш аккаунт привязан к сайту другого суда.'}
          </p>
          <button
            type="button"
            onClick={doLogout}
            className={btnPrimary + ' !h-10 !px-5 !text-sm'}
          >
            {language === 'en' ? 'Sign out' : language === 'tj' ? 'Баромад' : 'Выйти'}
          </button>
        </div>
      </div>
    );
  }

  const newsItems = items.filter((c) => c.type === 'news');
  const annItems = items.filter((c) => c.type === 'announcement');

  const removeContent = (id: number) => {
    if (!confirm('OK?')) return;
    cfetch('/api/admin/content/' + id, { method: 'DELETE' }).then(() => loadAll()).catch(() => undefined);
  };
  const togglePublish = (row: any) => {
    cfetch('/api/admin/content/' + row.id, { method: 'PATCH', body: JSON.stringify({ status: row.status === 'published' ? 'archived' : 'published' }) }).then(() => loadAll()).catch(() => undefined);
  };
  const removeHearing = (id: number) => {
    if (!confirm('OK?')) return;
    cfetch('/api/admin/hearings/' + id, { method: 'DELETE' }).then(() => loadAll()).catch(() => undefined);
  };
  const removeLeader = (id: number) => {
    if (!confirm('OK?')) return;
    cfetch('/api/admin/leadership/' + id, { method: 'DELETE' }).then(() => loadAll()).catch(() => undefined);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="content-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-theme-gold">
              {language === 'tj' ? 'Админкаи суд' : language === 'en' ? 'Court admin panel' : 'Админка суда'}
            </div>
            <div className="font-sans font-bold text-xl text-theme-text mt-0.5">{pickTri(cfg.name, language)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={'/courts/' + cfg.id} className={btnGhost}>
              <ArrowLeft size={13} />
              <span>{language === 'en' ? 'Site' : language === 'tj' ? 'Сомона' : 'Сайт'}</span>
            </Link>
            <button type="button" className={btnGhost} onClick={loadAll}>
              <RefreshCw size={13} />
              <span>{language === 'en' ? 'Refresh' : language === 'tj' ? 'Навсозӣ' : 'Обновить'}</span>
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={doLogout}
            >
              <LogOut size={13} />
              <span>{language === 'en' ? 'Exit' : language === 'tj' ? 'Баромад' : 'Выйти'}</span>
            </button>
          </div>
        </div>

        <SiteTabs
          activeTab={tab}
          onChange={setTab}
          tabs={[
            { id: 'news', label: language === 'tj' ? 'Хабарҳо' : language === 'en' ? 'News' : 'Новости', icon: <Newspaper size={13} />, count: newsItems.length },
            { id: 'announcements', label: language === 'tj' ? 'Эълонҳо' : language === 'en' ? 'Notices' : 'Эълонҳо', icon: <Megaphone size={13} />, count: annItems.length },
            { id: 'hearings', label: language === 'tj' ? 'Маҷлисҳо' : language === 'en' ? 'Hearings' : 'Заседания', icon: <Calendar size={13} />, count: hearings.length },
            { id: 'leadership', label: language === 'tj' ? 'Роҳбарият' : language === 'en' ? 'Board' : 'Руководство', icon: <Users size={13} />, count: leaders.length },
          ]}
        />

        {tab === 'news' && <ContentManager type="news" region={cfg.region} items={newsItems} isLoading={isLoading} onChanged={loadAll} onDelete={removeContent} onToggle={togglePublish} />}
        {tab === 'announcements' && <ContentManager type="announcement" region={cfg.region} items={annItems} isLoading={isLoading} onChanged={loadAll} onDelete={removeContent} onToggle={togglePublish} />}
        {tab === 'hearings' && <HearingsManager courtName={cfg.courtNameRu} items={hearings} isLoading={isLoading} onChanged={loadAll} onDelete={removeHearing} />}
        {tab === 'leadership' && <LeadershipManager courtId={cfg.id} items={leaders} isLoading={isLoading} onChanged={loadAll} onDelete={removeLeader} />}
      </div>
    </div>
  );
};

const ContentManager: React.FC<{
  type: 'news' | 'announcement';
  region: string;
  items: any[];
  isLoading: boolean;
  onChanged: () => void;
  onDelete: (id: number) => void;
  onToggle: (row: any) => void;
}> = ({ type, region, items, isLoading, onChanged, onDelete, onToggle }) => {
  const [open, setOpen] = useState(false);
  const [titleRu, setTitleRu] = useState('');
  const [titleTj, setTitleTj] = useState('');
  const [slug, setSlug] = useState('');
  const [bodyRu, setBodyRu] = useState('');

  const submit = () => {
    const finalSlug = (slug.trim() || translit(titleRu)).slice(0, 80);
    if (titleRu.trim().length < 2 || !finalSlug) return;
    cfetch('/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ type, slug: finalSlug, titleRu: titleRu.trim(), titleTj: titleTj.trim() || undefined, excerptRu: bodyRu.trim().slice(0, 300) || undefined, bodyRu: bodyRu.trim() || undefined, region, status: 'published' }),
    }).then((r) => { if (r.ok) { setOpen(false); setTitleRu(''); setTitleTj(''); setSlug(''); setBodyRu(''); onChanged(); } }).catch(() => undefined);
  };

  const columns: SiteColumn[] = [
    { header: 'ID', accessor: 'id', width: '60px' },
    {
      header: 'Title',
      accessor: (row) => <span className="text-theme-text">{row.title_ru}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={'font-mono text-[11px] px-2 py-0.5 rounded-full border ' + (row.status === 'published' ? 'border-emerald-500/40 text-emerald-300' : 'border-theme-border text-theme-textMuted')}>
          {row.status}
        </span>
      ),
      width: '130px',
    },
    {
      header: 'Date',
      accessor: (row) => <span className="font-mono text-xs text-theme-textMuted">{row.published_at ? String(row.published_at).slice(0, 10) : ''}</span>,
      width: '120px',
    },
    {
      header: '',
      width: '150px',
      accessor: (row) => (
        <span className="flex items-center gap-1.5 justify-end">
          <button type="button" className={btnGhost} onClick={() => onToggle(row)}>
            {row.status === 'published' ? 'Hide' : 'Publish'}
          </button>
          <button type="button" className={btnDanger} onClick={() => onDelete(row.id)} aria-label="delete">
            <Trash2 size={13} />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button type="button" className={btnPrimary} onClick={() => setOpen((v) => !v)}>
          <Plus size={14} />
          <span>{type === 'news' ? 'New item' : 'New notice'}</span>
        </button>
      </div>
      {open && (
        <div className="content-card p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SiteInput label="Title RU *" value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
            <SiteInput label="Title TJ" value={titleTj} onChange={(e) => setTitleTj(e.target.value)} />
          </div>
          <SiteInput
            label="Slug *"
            value={slug}
            placeholder={translit(titleRu) || 'auto-from-title'}
            onChange={(e) => setSlug(e.target.value)}
          />
          <div className="w-full flex flex-col gap-1.5">
            <label className="font-mono text-xs font-medium uppercase tracking-wider text-theme-textMuted">Text</label>
            <textarea
              value={bodyRu}
              onChange={(e) => setBodyRu(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl font-sans text-sm bg-theme-bg text-theme-text placeholder-theme-textMuted border border-theme-border focus:outline-none focus:border-theme-gold resize-y transition-colors"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className={btnPrimary} onClick={submit}>Save & publish</button>
          </div>
        </div>
      )}
      <SiteTable columns={columns} data={items} keyExtractor={(r) => r.id} isLoading={isLoading} emptyMessage="No items yet" />
    </div>
  );
};

const HearingsManager: React.FC<{
  courtName: string;
  items: any[];
  isLoading: boolean;
  onChanged: () => void;
  onDelete: (id: number) => void;
}> = ({ courtName, items, isLoading, onChanged, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState('');
  const [room, setRoom] = useState('');

  const submit = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    cfetch('/api/admin/hearings', {
      method: 'POST',
      body: JSON.stringify({ courtRu: courtName, courtTj: courtName, hearingDate: date, hearingTime: time || undefined, categoryRu: category.trim() || undefined, categoryTj: category.trim() || undefined, room: room.trim() || undefined }),
    }).then((r) => { if (r.ok) { setOpen(false); setDate(''); setCategory(''); setRoom(''); onChanged(); } }).catch(() => undefined);
  };

  const columns: SiteColumn[] = [
    { header: 'Date', accessor: (row) => <span className="font-mono text-xs text-theme-text">{row.hearing_date} {row.hearing_time || ''}</span>, width: '150px' },
    { header: 'Category', accessor: (row) => <span className="text-theme-text">{row.category_ru || ''}</span> },
    { header: 'Room', accessor: (row) => <span className="font-mono text-xs text-theme-gold">{row.room || ''}</span>, width: '110px' },
    {
      header: '',
      width: '70px',
      accessor: (row) => (
          <button type="button" className={btnDanger} onClick={() => onDelete(row.id)} aria-label="delete">
            <Trash2 size={13} />
          </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button type="button" className={btnPrimary} onClick={() => setOpen((v) => !v)}>
          <Plus size={14} />
          <span>New hearing</span>
        </button>
      </div>
      {open && (
        <div className="content-card p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <SiteInput label="Date (YYYY-MM-DD) *" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <SiteInput label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            <SiteInput label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <SiteInput label="Room" value={room} onChange={(e) => setRoom(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className={btnPrimary} onClick={submit}>Save</button>
          </div>
        </div>
      )}
      <SiteTable columns={columns} data={items} keyExtractor={(r) => r.id} isLoading={isLoading} emptyMessage="No hearings yet" />
    </div>
  );
};

const LeadershipManager: React.FC<{
  courtId: string;
  items: any[];
  isLoading: boolean;
  onChanged: () => void;
  onDelete: (id: number) => void;
}> = ({ courtId, items, isLoading, onChanged, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [nameRu, setNameRu] = useState('');
  const [nameTj, setNameTj] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [titleTj, setTitleTj] = useState('');

  const submit = () => {
    if (nameRu.trim().length < 2) return;
    cfetch('/api/admin/leadership', {
      method: 'POST',
      body: JSON.stringify({ nameRu: nameRu.trim(), nameTj: nameTj.trim() || undefined, titleRu: titleRu.trim() || undefined, titleTj: titleTj.trim() || undefined, courtId }),
    }).then((r) => { if (r.ok) { setOpen(false); setNameRu(''); setNameTj(''); setTitleRu(''); setTitleTj(''); onChanged(); } }).catch(() => undefined);
  };

  const columns: SiteColumn[] = [
    { header: 'Name', accessor: (row) => <span className="text-theme-text">{row.name_ru}</span> },
    { header: 'Title', accessor: (row) => <span className="text-theme-textSec">{row.title_ru || ''}</span> },
    {
      header: '',
      width: '70px',
      accessor: (row) => (
          <button type="button" className={btnDanger} onClick={() => onDelete(row.id)} aria-label="delete">
            <Trash2 size={13} />
          </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="font-mono text-[11px] text-theme-textMuted">
        Entries added here appear on the court page instead of the built-in list.
      </div>
      <div className="flex items-center justify-end">
        <button type="button" className={btnPrimary} onClick={() => setOpen((v) => !v)}>
          <Plus size={14} />
          <span>New person</span>
        </button>
      </div>
      {open && (
        <div className="content-card p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SiteInput label="Name RU *" value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
            <SiteInput label="Name TJ" value={nameTj} onChange={(e) => setNameTj(e.target.value)} />
            <SiteInput label="Title RU" value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
            <SiteInput label="Title TJ" value={titleTj} onChange={(e) => setTitleTj(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className={btnPrimary} onClick={submit}>Save</button>
          </div>
        </div>
      )}
      <SiteTable columns={columns} data={items} keyExtractor={(r) => r.id} isLoading={isLoading} emptyMessage="No entries yet" />
    </div>
  );
};

export default CourtSiteAdmin;

