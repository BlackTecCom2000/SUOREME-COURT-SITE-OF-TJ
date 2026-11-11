import React, { useEffect, useState } from 'react';
import { ExternalLink, Plus, Save, Trash2, Pencil, X } from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { apiFetch } from '../../context/adminHttp';

interface Hero {
  id: number;
  slug: string;
  name_ru: string; name_tj?: string | null; name_en?: string | null;
  profession_ru?: string | null; profession_tj?: string | null; profession_en?: string | null;
  category?: string | null;
  is_official_hero?: number | null;
  birth_date?: string | null; death_date?: string | null;
  portrait_url?: string | null;
  bio_ru?: string | null; bio_tj?: string | null; bio_en?: string | null;
  education_ru?: string | null; education_tj?: string | null; education_en?: string | null;
  career_ru?: string | null; career_tj?: string | null; career_en?: string | null;
  achievements_ru?: string | null; achievements_tj?: string | null; achievements_en?: string | null;
  contribution_ru?: string | null; contribution_tj?: string | null; contribution_en?: string | null;
  awards_ru?: string | null; awards_tj?: string | null; awards_en?: string | null;
  hero_decree_ru?: string | null; hero_decree_tj?: string | null; hero_decree_en?: string | null;
  birth_place_ru?: string | null; birth_place_tj?: string | null; birth_place_en?: string | null;
  timeline?: string | null; sources?: string | null;
  seo_title?: string | null; seo_description?: string | null;
  confidence?: string | null; editorial_note?: string | null;
  status?: string | null; sort_order?: number | null;
}

const CATEGORIES = [
  { value: 'official-hero', label: 'Қаҳрамони Тоҷикистон / Герой Таджикистана' },
  { value: 'statesman', label: 'Давлат ва сиёсӣ / Государственные деятели' },
  { value: 'scientist', label: 'Олимҳо ва педагогҳо / Учёные и педагоги' },
  { value: 'writer', label: 'Нависандаҳо ва шоирон / Писатели и поэты' },
  { value: 'artist', label: 'Фарҳангӣ ва санъат / Культура и искусство' },
  { value: 'military', label: 'Ҳарбӣ ва давлатӣ / Военные и общественные' },
  { value: 'other', label: 'Дигар / Другие' },
];

const EMPTY: Partial<Hero> = {
  slug: '', name_ru: '', name_tj: '', name_en: '',
  profession_ru: '', profession_tj: '', profession_en: '',
  category: 'other', is_official_hero: 0,
  birth_date: '', death_date: '', portrait_url: '',
  bio_ru: '', bio_tj: '', bio_en: '',
  education_ru: '', career_ru: '', achievements_ru: '', contribution_ru: '', awards_ru: '',
  hero_decree_ru: '', birth_place_ru: '',
  timeline: '[]', sources: '[]',
  confidence: 'needs-editorial-review', status: 'published', sort_order: 100,
};

/** Field groups keep the form short: one line per concept, three languages. */
const GROUPS: { title: string; fields: { key: string; label: string; type?: 'textarea' | 'select' | 'checkbox' }[] }[] = [
  {
    title: 'Идентификация',
    fields: [
      { key: 'slug', label: 'Slug (латиница, a-z0-9-)' },
      { key: 'name_ru', label: 'ФИО RU *' },
      { key: 'name_tj', label: 'ФИО TJ' },
      { key: 'name_en', label: 'Name EN' },
      { key: 'profession_ru', label: 'Профессия RU' },
      { key: 'profession_tj', label: 'Касб TJ' },
      { key: 'profession_en', label: 'Profession EN' },
      { key: 'category', label: 'Категория', type: 'select' },
      { key: 'is_official_hero', label: 'Официальный «Герой Таджикистана»', type: 'checkbox' },
      { key: 'birth_date', label: 'Дата рождения' },
      { key: 'death_date', label: 'Дата смерти' },
      { key: 'birth_place_ru', label: 'Место рождения RU' },
      { key: 'portrait_url', label: 'Портрет (URL файла)' },
    ],
  },
  {
    title: 'Биография (RU)',
    fields: [
      { key: 'bio_ru', label: 'Биография', type: 'textarea' },
      { key: 'education_ru', label: 'Образование', type: 'textarea' },
      { key: 'career_ru', label: 'Профессиональная деятельность', type: 'textarea' },
      { key: 'achievements_ru', label: 'Достижения', type: 'textarea' },
      { key: 'contribution_ru', label: 'Вклад в Таджикистан', type: 'textarea' },
      { key: 'awards_ru', label: 'Награды и звания', type: 'textarea' },
      { key: 'hero_decree_ru', label: 'Указ о присвоении звания', type: 'textarea' },
    ],
  },
  {
    title: 'Источники и таймлайн',
    fields: [
      { key: 'sources', label: 'Источники (JSON: [{label,url,level}])', type: 'textarea' },
      { key: 'timeline', label: 'Хронология (JSON: [{year,event}])', type: 'textarea' },
      { key: 'confidence', label: 'Уровень подтверждения', type: 'select' },
      { key: 'editorial_note', label: 'Примечание редакции', type: 'textarea' },
      { key: 'status', label: 'Статус', type: 'select' },
      { key: 'sort_order', label: 'Порядок' },
    ],
  },
];

export const HeroesManager: React.FC = () => {
  const [items, setItems] = useState<Hero[]>([]);
  const [form, setForm] = useState<Partial<Hero>>(EMPTY);
  const [editing, setEditing] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    apiFetch('/api/admin/heroes')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Hero[]) => setItems(Array.isArray(rows) ? rows : []))
      .catch(() => setMsg('Не удалось загрузить список'));
  };
  useEffect(load, []);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(EMPTY);
    setEditing(null);
    setOpen(true);
  };

  const save = async () => {
    if (!form.slug || !form.name_ru) {
      setMsg('Slug и ФИО (RU) обязательны');
      return;
    }
    const payload: any = { ...form };
    payload.is_official_hero = form.is_official_hero ? 1 : 0;
    const res = editing
      ? await apiFetch(`/api/admin/heroes/${editing}`, { method: 'PATCH', body: JSON.stringify(payload) })
      : await apiFetch('/api/admin/heroes', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) {
      setMsg(editing ? 'Запись обновлена' : 'Запись создана');
      setOpen(false);
      setForm(EMPTY);
      setEditing(null);
      load();
    } else {
      const t = await res.text().catch(() => '');
      setMsg('Ошибка сохранения: ' + t.slice(0, 200));
    }
  };

  const edit = (h: Hero) => {
    setForm({ ...EMPTY, ...h, is_official_hero: h.is_official_hero ?? 0 });
    setEditing(h.id);
    setOpen(true);
  };

  const del = async (h: Hero) => {
    if (!confirm(`Удалить «${h.name_ru}»? Действие необратимо.`)) return;
    await apiFetch(`/api/admin/heroes/${h.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-theme-text">Қаҳрамонони Тоҷикистон — АРХИВ БИОГРАФИЙ</h2>
        <span className="font-mono text-xs text-theme-textMuted">{items.length} записей</span>
      </div>

      <AdminCard
        title="Добавить / изменить запись"
        subtitle="slug, ФИО TJ/RU/EN, профессия, категория, официальный титул, даты, биография, источники, таймлайн, уровень подтверждения"
        headerAction={
          <div className="flex gap-2">
            <AdminButton onClick={reset} leftIcon={<Plus size={14} />}>Новая запись</AdminButton>
            {open && (
              <AdminButton onClick={() => setOpen(false)} leftIcon={<X size={14} />}>Закрыть</AdminButton>
            )}
          </div>
        }
      >
        {msg && <p className="font-mono text-xs text-theme-gold mb-3">{msg}</p>}
        {open ? (
          <div className="space-y-6">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <div className="font-mono text-xs uppercase tracking-widest text-theme-textMuted mb-2">{g.title}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {g.fields.map((f) => {
                    const value = (form as any)[f.key];
                    if (f.type === 'checkbox') {
                      return (
                        <label key={f.key} className="flex items-center gap-2 font-mono text-xs text-theme-textSec">
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => set(f.key, e.target.checked ? 1 : 0)}
                          />
                          {f.label}
                        </label>
                      );
                    }
                    if (f.type === 'select') {
                      const options =
                        f.key === 'category'
                          ? CATEGORIES
                          : f.key === 'confidence'
                            ? [
                                { value: 'verified', label: 'verified' },
                                { value: 'partial', label: 'partial' },
                                { value: 'needs-editorial-review', label: 'needs-editorial-review' },
                              ]
                            : [
                                { value: 'published', label: 'published' },
                                { value: 'draft', label: 'draft' },
                              ];
                      return (
                        <label key={f.key} className="flex flex-col gap-1">
                          <span className="font-mono text-xs text-theme-textMuted">{f.label}</span>
                          <select
                            value={String(value ?? '')}
                            onChange={(e) => set(f.key, e.target.value)}
                            className="admin-input w-full"
                          >
                            {options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      );
                    }
                    if (f.type === 'textarea') {
                      return (
                        <label key={f.key} className="flex flex-col gap-1 md:col-span-2">
                          <span className="font-mono text-xs text-theme-textMuted">{f.label}</span>
                          <textarea
                            value={String(value ?? '')}
                            onChange={(e) => set(f.key, e.target.value)}
                            rows={4}
                            className="admin-input w-full font-mono text-xs"
                          />
                        </label>
                      );
                    }
                    return (
                      <label key={f.key} className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-theme-textMuted">{f.label}</span>
                        <AdminInput
                          value={String(value ?? '')}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <AdminButton onClick={save} leftIcon={<Save size={14} />}>
                {editing ? 'Сохранить изменения' : 'Создать запись'}
              </AdminButton>
              <AdminButton onClick={() => setOpen(false)} leftIcon={<X size={14} />}>Отмена</AdminButton>
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-theme-textMuted">
            Нажмите «Новая запись», чтобы добавить биографию, или «Изменить» в списке ниже.
          </p>
        )}
      </AdminCard>

      <AdminCard title="Список записей" subtitle="имя, категория, официальный титул, подтверждение, статус, порядок">
        <div className="space-y-2">
          {items.map((h) => (
            <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl border border-theme-border glass">
              {h.portrait_url ? (
                <img src={h.portrait_url} alt="" className="w-10 h-12 rounded object-cover object-top" loading="lazy" />
              ) : (
                <div className="w-10 h-12 rounded bg-theme-bg/40 flex items-center justify-center font-serif text-theme-gold">
                  {(h.name_ru || '?').slice(0, 2)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base text-theme-text truncate">{h.name_ru}</span>
                  {h.is_official_hero ? (
                    <span className="px-2 h-5 inline-flex items-center rounded-full bg-theme-gold/90 text-theme-bg text-[10px] font-bold">
                      Қаҳрамони Тоҷикистон
                    </span>
                  ) : null}
                  {h.confidence && h.confidence !== 'verified' && (
                    <span className="px-2 h-5 inline-flex items-center rounded-full border border-theme-gold/40 text-theme-gold text-[10px]">
                      {h.confidence}
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-theme-textMuted truncate">
                  /heroes/{h.slug} · {h.category} · {h.status} · #{h.sort_order}
                </div>
              </div>
              <a
                href={`/heroes/${h.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-9 h-9 rounded-lg glass-nest border flex items-center justify-center text-theme-textSec hover:text-theme-gold"
                aria-label="Открыть на сайте"
              >
                <ExternalLink size={14} />
              </a>
              <button
                type="button"
                onClick={() => edit(h)}
                className="tap-target w-9 h-9 rounded-lg glass-nest border flex items-center justify-center text-theme-textSec hover:text-theme-gold"
                aria-label="Изменить"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => del(h)}
                className="tap-target w-9 h-9 rounded-lg glass-nest border flex items-center justify-center text-theme-textSec hover:text-theme-gold"
                aria-label="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="font-mono text-xs text-theme-textMuted">Записей пока нет.</p>
          )}
        </div>
      </AdminCard>
    </div>
  );
};
