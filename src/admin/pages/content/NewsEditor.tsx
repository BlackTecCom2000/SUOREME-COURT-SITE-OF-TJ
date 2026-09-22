import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Globe,
  Image,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Languages,
} from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTabs } from '../../components/ui/AdminTabs';
import { LivePreviewEngine } from '../../components/preview/LivePreviewEngine';
import { useAdminAuth } from '../../context/AdminAuthContext';

type WorkflowStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'scheduled'
  | 'archived';

export const NewsEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  // CMS-01/SEC-01: workflow actions gated by server-issued permissions.
  const { hasPerm } = useAdminAuth();
  const canEdit = hasPerm('content.edit');
  const canSubmit = hasPerm('content.edit') || hasPerm('content.review');
  const canApprove = hasPerm('content.approve');
  const canPublish = hasPerm('content.publish');
  const canReview = hasPerm('content.review');

  const [activeLang, setActiveLang] = useState<'ru' | 'tj' | 'en'>('ru');
  const [isSaving, setIsSaving] = useState(false);
  const [magicTopic, setMagicTopic] = useState('');
  const [magicBusy, setMagicBusy] = useState(false);
  const [transBusy, setTransBusy] = useState(false);
  const [toolMsg, setToolMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [magicMode, setMagicMode] = useState<'generate' | 'improve' | 'formal' | 'shorten' | 'expand' | 'rewrite' | 'official'>('generate');
  const [pubType, setPubType] = useState('Новость');
  const [pubLength, setPubLength] = useState<'short' | 'medium' | 'full'>('medium');
  const [pubContext, setPubContext] = useState('');
  const [magicResult, setMagicResult] = useState<{ title: string; excerpt: string; body: string; lang: string } | null>(null);
  const [magicVariant, setMagicVariant] = useState(0);
  const [aiMeta, setAiMeta] = useState<Record<string, { s: string; at: string }>>({});
  const [aiSnapshot, setAiSnapshot] = useState<Record<string, string>>({});

  const PUB_TYPES = ['Новость', 'Пресс-релиз', 'Официальное сообщение', 'Мероприятие', 'Семинар', 'Конференция', 'Совещание', 'Поздравление', 'Интервью', 'Анонс', 'Отчет о мероприятии'];
  const MAGIC_MODES = [
    { value: 'generate', label: 'Generate' },
    { value: 'improve', label: 'Improve' },
    { value: 'formal', label: 'Formal' },
    { value: 'shorten', label: 'Shorten' },
    { value: 'expand', label: 'Expand' },
    { value: 'rewrite', label: 'Rewrite' },
    { value: 'official', label: 'Official' },
  ] as const;

  const fieldStatus = (field: string, lang: string) => {
    const key = field + '_' + lang;
    const meta = aiMeta[key];
    if (!meta) return null;
    const dirty = meta.s === 'ai' && aiSnapshot[key] !== undefined && String((formData as any)[key] || '') !== aiSnapshot[key];
    return { ...meta, dirty };
  };

  const editorAuthH = () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + sessionStorage.getItem('cms-token'),
  });

  const applyMagicResult = (res: { title: string; excerpt: string; body: string }, lang: 'ru' | 'tj' | 'en') => {
    setFormData((prev: any) => ({
      ...prev,
      ['title_' + lang]: res.title,
      ['excerpt_' + lang]: res.excerpt,
      ['body_' + lang]: res.body,
    }));
  };

  const stampAi = (lang: string, fields: string[]) => {
    const at = new Date().toISOString();
    setAiMeta((prev) => {
      const next = { ...prev };
      fields.forEach((f) => { next[f + '_' + lang] = { s: 'ai', at }; });
      return next;
    });
    setAiSnapshot((prev) => {
      const next = { ...prev };
      fields.forEach((f) => { next[f + '_' + lang] = String((formData as any)[f + '_' + lang] || ''); });
      return next;
    });
  };

  const runMagic = async (regen = false) => {
    const mode = magicMode;
    const fallbackText = (formData as any)['body_' + activeLang] || (formData as any)['title_' + activeLang] || '';
    const topic = mode === 'generate' ? (magicTopic.trim() || fallbackText) : fallbackText;
    if (!topic || topic.trim().length < 3) {
      setToolMsg({ type: 'error', text: 'Сначала введите тему или текст' });
      return;
    }
    const variant = regen ? magicVariant + 1 : 0;
    setMagicBusy(true);
    setToolMsg(null);
    try {
      const r = await fetch('/api/editor/magic', {
        method: 'POST',
        headers: editorAuthH(),
        body: JSON.stringify({
          mode, text: topic, lang: activeLang, variant,
          pubType: mode === 'generate' ? pubType : undefined,
          length: mode === 'generate' ? pubLength : undefined,
          context: mode === 'generate' && pubContext.trim() ? pubContext.trim() : undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Magic error');
      setMagicVariant(variant);
      setMagicResult({ title: d.title, excerpt: d.excerpt, body: d.body, lang: activeLang });
      setToolMsg({ type: 'success', text: 'Черновик готов — проверьте и нажмите Принять' });
    } catch (err: any) {
      setToolMsg({ type: 'error', text: err.message || 'Ошибка' });
    } finally {
      setMagicBusy(false);
    }
  };

  const acceptMagic = () => {
    if (!magicResult) return;
    const lang = magicResult.lang as 'ru' | 'tj' | 'en';
    applyMagicResult(magicResult, lang);
    stampAi(lang, ['title', 'excerpt', 'body']);
    setMagicResult(null);
    setToolMsg({ type: 'success', text: 'Применено (' + lang.toUpperCase() + ') — проверьте текст' });
  };

  const translateFields = async (src: 'ru' | 'tj' | 'en', dst: 'ru' | 'tj' | 'en', force = false) => {
    const fields = ['title', 'excerpt', 'body'];
    if (!force) {
      const risky = fields.filter((f) => {
        const cur = String((formData as any)[f + '_' + dst] || '').trim();
        if (!cur) return false;
        const st = fieldStatus(f, dst);
        return !st || st.s !== 'ai' || st.dirty;
      });
      if (risky.length > 0) {
        const ok = window.confirm('Перезаписать вручную отредактированный текст (' + dst.toUpperCase() + ': ' + risky.join(', ') + ')?');
        if (!ok) return false;
      }
    }
    for (const f of fields) {
      const v = String((formData as any)[f + '_' + src] || '');
      if (!v.trim()) continue;
      const r = await fetch('/api/editor/translate', {
        method: 'POST',
        headers: editorAuthH(),
        body: JSON.stringify({ text: v, from: src, to: dst }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Translate error');
      const txt = d.text as string;
      setFormData((prev: any) => ({ ...prev, [f + '_' + dst]: txt }));
      const at = new Date().toISOString();
      setAiMeta((prev) => ({ ...prev, [f + '_' + dst]: { s: 'ai', at } }));
      setAiSnapshot((prev) => ({ ...prev, [f + '_' + dst]: txt }));
    }
    return true;
  };

  const translateToOthers = async () => {
    const src = activeLang;
    const get = (f: string) => String((formData as any)[f + '_' + src] || '');
    if (!get('title') && !get('body')) {
      setToolMsg({ type: 'error', text: 'Нет текста для перевода' });
      return;
    }
    setTransBusy(true);
    setToolMsg(null);
    try {
      const dsts = (['tj', 'ru', 'en'] as const).filter((l) => l !== src);
      for (const dst of dsts) {
        await translateFields(src, dst);
      }
      setToolMsg({ type: 'success', text: 'Переведено с ' + src.toUpperCase() + ' на остальные языки' });
    } catch (err: any) {
      setToolMsg({ type: 'error', text: err.message || 'Ошибка перевода' });
    } finally {
      setTransBusy(false);
    }
  };

  const retranslateTo = async (dst: 'ru' | 'tj' | 'en') => {
    const order: Array<'ru' | 'tj' | 'en'> = [activeLang, ...(['tj', 'ru', 'en'] as const).filter((l) => l !== activeLang)];
    const src = order.find((l) => String((formData as any)['title_' + l] || (formData as any)['body_' + l] || '').trim()) || activeLang;
    setTransBusy(true);
    try {
      await translateFields(src, dst, true);
      setToolMsg({ type: 'success', text: 'Язык ' + dst.toUpperCase() + ' переведён заново с ' + src.toUpperCase() });
    } catch (err: any) {
      setToolMsg({ type: 'error', text: err.message || 'Ошибка перевода' });
    } finally {
      setTransBusy(false);
    }
  };

  const markReviewed = () => {
    const at = new Date().toISOString();
    setAiMeta((prev) => {
      const next = { ...prev };
      (['title', 'excerpt', 'body'] as const).forEach((f) => {
        (['tj', 'ru', 'en'] as const).forEach((l) => {
          if (String((formData as any)[f + '_' + l] || '').trim()) next[f + '_' + l] = { s: 'reviewed', at };
        });
      });
      return next;
    });
    setToolMsg({ type: 'success', text: 'Помечено как проверенное' });
  };
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    slug: '',
    title_ru: '',
    title_tj: '',
    title_en: '',
    excerpt_ru: '',
    excerpt_tj: '',
    excerpt_en: '',
    body_ru: '',
    body_tj: '',
    body_en: '',
    seo_title: '',
    seo_desc: '',
    cover_image: '',
    category: 'Судебная хроника',
    featured: false,
    status: 'draft' as WorkflowStatus,
    scheduled_at: '',
    published_at: '',
    review_notes: '',
  });

  // Server stores UTC ISO; datetime-local needs local 'YYYY-MM-DDTHH:mm'
  const toLocalInput = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };

  useEffect(() => {
    if (isEditing) {
      const token = sessionStorage.getItem('cms-token');
      fetch(`/api/admin/content/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((data) => {
          setFormData({
            slug: data.slug || '',
            title_ru: data.title_ru || '',
            title_tj: data.title_tj || '',
            title_en: data.title_en || '',
            excerpt_ru: data.excerpt_ru || '',
            excerpt_tj: data.excerpt_tj || '',
            excerpt_en: data.excerpt_en || '',
            body_ru: data.body_ru || '',
            body_tj: data.body_tj || '',
            body_en: data.body_en || '',
            seo_title: data.seo_title || '',
            seo_desc: data.seo_desc || '',
            cover_image: data.cover_image || '',
            category: data.category || 'Судебная хроника',
            featured: Boolean(data.featured),
            status: data.status || 'draft',
            scheduled_at: data.scheduled_at || '',
            published_at: toLocalInput(data.published_at),
            review_notes: data.review_notes || '',
          });
          try {
            const m = JSON.parse(data.ai_meta || '{}');
            if (m && typeof m === 'object') setAiMeta(m);
          } catch { /* ignore */ }
          setOriginalData(data);
        })
        .catch((err) => {
          console.error(err);
          setStatusMessage({ type: 'error', text: 'Ошибка загрузки публикации' });
        });
    }
  }, [id, isEditing]);

  const handleSave = async (forcedStatus?: typeof formData.status) => {
    setIsSaving(true);
    setStatusMessage(null);

    const targetStatus = forcedStatus || formData.status;
    const payload = {
      ...formData,
      type: 'news',
      status: targetStatus,
      ai_meta: aiMeta,
      // Auto-generate slug if empty
      slug:
        formData.slug.trim() ||
        formData.title_ru
          .toLowerCase()
          .replace(/[^a-z0-9а-яё]+/gi, '-')
          .replace(/^-|-$/g, '') ||
        `news-${Date.now()}`,
    };

    try {
      const token = sessionStorage.getItem('cms-token');
      const url = isEditing ? `/api/admin/content/${id}` : '/api/admin/content';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка при сохранении');
      }

      const okText =
        targetStatus === 'published'
          ? 'Публикация успешно размещена!'
          : targetStatus === 'pending_review'
            ? 'Отправлено на проверку'
            : targetStatus === 'approved'
              ? 'Одобрено рецензентом'
              : targetStatus === 'rejected'
                ? 'Возвращено на доработку'
                : targetStatus === 'scheduled'
                  ? 'Публикация запланирована'
                  : targetStatus === 'archived'
                    ? 'Перемещено в архив'
                    : 'Черновик сохранен';
      setStatusMessage({ type: 'success', text: okText });
      if (targetStatus) setFormData((prev) => ({ ...prev, status: targetStatus as WorkflowStatus }));

      if (!isEditing) {
        setTimeout(() => navigate('/admin/news'), 1200);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Ошибка сохранения' });
    } finally {
      setIsSaving(false);
    }
  };

  const langTabs = [
    { id: 'ru', label: 'Русский (RU)', icon: <Globe size={13} /> },
    { id: 'tj', label: 'Тоҷикӣ (TJ)', icon: <Globe size={13} /> },
    { id: 'en', label: 'English (EN)', icon: <Globe size={13} /> },
  ];

  return (
    <div className="space-y-6 pb-24 text-left animate-fadeIn">
      {/* Top Breadcrumb & Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/news')}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-amber-400/40 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">
              {isEditing ? 'Редактирование публикации' : 'Новая публикация'}
            </h2>
            <p className="font-mono text-xs text-slate-400">
              {formData.slug ? `slug: ${formData.slug}` : 'Черновик материала'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminBadge variant={formData.status as any} label={formData.status.toUpperCase()} size="md" />
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* LEFT COLUMN: Editor Form */}
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar xl:col-span-2">
          <AdminCard title="Основной контент">
            {/* Magic composer + auto-translate */}
            <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3.5 space-y-3">
              <div className="flex flex-col lg:flex-row gap-2">
                <div className="relative flex-1">
                  <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                  <input
                    value={magicTopic}
                    onChange={(e) => setMagicTopic(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') runMagic(false); }}
                    placeholder="Волшебство: тема («празднование дня независимости…») — или пусто, чтобы обработать текущий текст"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 font-sans text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-36">
                    <AdminSelect
                      value={magicMode}
                      onChange={(e) => setMagicMode(e.target.value as any)}
                      options={MAGIC_MODES.map((m) => ({ value: m.value, label: m.label }))}
                    />
                  </div>
                  <AdminButton size="sm" leftIcon={<Sparkles size={13} />} onClick={() => runMagic(false)} isLoading={magicBusy}>
                    Пуск
                  </AdminButton>
                </div>
              </div>
              {magicMode === 'generate' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <AdminSelect
                    label="Тип публикации"
                    value={pubType}
                    onChange={(e) => setPubType(e.target.value)}
                    options={PUB_TYPES.map((p) => ({ value: p, label: p }))}
                  />
                  <AdminSelect
                    label="Длина"
                    value={pubLength}
                    onChange={(e) => setPubLength(e.target.value as any)}
                    options={[
                      { value: 'short', label: 'Краткая' },
                      { value: 'medium', label: 'Средняя' },
                      { value: 'full', label: 'Подробная' },
                    ]}
                  />
                  <div className="w-full flex flex-col gap-1.5 text-left">
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                      Контекст (факты)
                    </label>
                    <input
                      value={pubContext}
                      onChange={(e) => setPubContext(e.target.value)}
                      placeholder="Даты, имена, цифры — попадут как есть"
                      className="w-full h-11 px-4 rounded-xl font-sans text-sm bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
              {magicResult && (
                <div className="rounded-xl border border-amber-400/40 bg-slate-900/90 p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-amber-300">
                      Черновик ({magicResult.lang.toUpperCase()}) — проверьте
                    </span>
                    <div className="flex gap-2">
                      <AdminButton size="sm" variant="outline" onClick={() => runMagic(true)} isLoading={magicBusy}>
                        Regenerate
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost" onClick={() => setMagicResult(null)}>
                        Убрать
                      </AdminButton>
                      <AdminButton size="sm" onClick={acceptMagic}>
                        Принять
                      </AdminButton>
                    </div>
                  </div>
                  <div className="font-sans font-bold text-sm text-white">{magicResult.title}</div>
                  <div className="font-sans text-xs text-slate-300 italic">{magicResult.excerpt}</div>
                  <div className="font-sans text-xs text-slate-400 whitespace-pre-line max-h-40 overflow-y-auto pr-1">
                    {magicResult.body}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  Перевести {activeLang.toUpperCase()} →
                </span>
                <AdminButton size="sm" variant="outline" leftIcon={<Languages size={13} />} onClick={translateToOthers} isLoading={transBusy}>
                  На остальные языки
                </AdminButton>
                {(['tj', 'ru', 'en'] as const).filter((l) => l !== activeLang).map((l) => (
                  <AdminButton key={l} size="sm" variant="ghost" onClick={() => retranslateTo(l)} isLoading={transBusy}>
                    ↻ {l.toUpperCase()}
                  </AdminButton>
                ))}
                <AdminButton size="sm" variant="ghost" onClick={markReviewed}>
                  Проверено ✓
                </AdminButton>
                {toolMsg && (
                  <span className={'font-mono text-[11px] ' + (toolMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400')}>
                    {toolMsg.text}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-slate-400">
                {(['tj', 'ru', 'en'] as const).map((l) => {
                  const filled = ['title', 'excerpt', 'body'].filter((f) => String((formData as any)[f + '_' + l] || '').trim()).length;
                  const aiN = ['title', 'excerpt', 'body'].filter((f) => (aiMeta[f + '_' + l]?.s === 'ai')).length;
                  const dirtyN = ['title', 'excerpt', 'body'].filter((f) => fieldStatus(f, l)?.dirty).length;
                  const revN = ['title', 'excerpt', 'body'].filter((f) => (aiMeta[f + '_' + l]?.s === 'reviewed')).length;
                  const dot = dirtyN > 0 ? 'bg-red-400' : aiN > 0 ? 'bg-amber-400' : revN > 0 ? 'bg-emerald-400' : filled > 0 ? 'bg-slate-400' : 'bg-transparent border border-slate-600';
                  return (
                    <span key={l} className="inline-flex items-center gap-1.5" title={dirtyN > 0 ? 'Изменено после AI' : aiN > 0 ? 'AI-версия' : revN > 0 ? 'Проверено' : filled > 0 ? 'Заполнено' : 'Пусто'}>
                      <span className={'w-2 h-2 rounded-full ' + dot} />
                      <span className="uppercase">{l}</span>
                      <span>{filled}/3</span>
                    </span>
                  );
                })}
              </div>
            </div>
            {/* Language Switcher Tabs */}
            <div className="mb-5">
              <AdminTabs
                tabs={langTabs}
                activeTab={activeLang}
                onChange={(t) => setActiveLang(t as any)}
              />
            </div>

            {/* Multilingual Title & Content */}
            <div className="space-y-4">
              {activeLang === 'ru' && (
                <>
                  <AdminInput
                    label="Заголовок новости (RU)"
                    required
                    value={formData.title_ru}
                    onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                    placeholder="Например: Пленум Верховного суда рассмотрел практику применения..."
                  />
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                      Краткое описание / Лид (RU)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.excerpt_ru}
                      onChange={(e) => setFormData({ ...formData, excerpt_ru: e.target.value })}
                      placeholder="Краткая суть публикации для новостной ленты и поисковиков..."
                      className="w-full p-3.5 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 font-sans text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                      Полный текст публикации (RU)
                    </label>
                    <textarea
                      rows={12}
                      value={formData.body_ru}
                      onChange={(e) => setFormData({ ...formData, body_ru: e.target.value })}
                      placeholder="Введите официальный текст публикации..."
                      className="w-full p-4 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 font-sans text-sm leading-relaxed focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                    />
                  </div>
                </>
              )}

              {activeLang === 'tj' && (
                <>
                  <AdminInput
                    label="Сарлавҳаи хабар (TJ)"
                    value={formData.title_tj}
                    onChange={(e) => setFormData({ ...formData, title_tj: e.target.value })}
                    placeholder="Сарлавҳа бо забони тоҷикӣ..."
                  />
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                      Тавзеҳи кӯтоҳ (TJ)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.excerpt_tj}
                      onChange={(e) => setFormData({ ...formData, excerpt_tj: e.target.value })}
                      placeholder="Матни мухтасари хабар..."
                      className="w-full p-3.5 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 font-sans text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                      Матни пурра (TJ)
                    </label>
                    <textarea
                      rows={12}
                      value={formData.body_tj}
                      onChange={(e) => setFormData({ ...formData, body_tj: e.target.value })}
                      placeholder="Матни расмии хабар бо забони тоҷикӣ..."
                      className="w-full p-4 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 font-sans text-sm leading-relaxed focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              )}

              {activeLang === 'en' && (
                <>
                  <AdminInput
                    label="News Title (EN)"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="English headline..."
                  />
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                      Short Excerpt (EN)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.excerpt_en}
                      onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                      placeholder="Summary in English..."
                      className="w-full p-3.5 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 font-sans text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                      Full Article Body (EN)
                    </label>
                    <textarea
                      rows={12}
                      value={formData.body_en}
                      onChange={(e) => setFormData({ ...formData, body_en: e.target.value })}
                      placeholder="Full press release in English..."
                      className="w-full p-4 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/80 font-sans text-sm leading-relaxed focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              )}
            </div>
          </AdminCard>

          {/* Publishing Settings inline with editor to save space */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdminCard title="Параметры публикации">
              <div className="space-y-4">
                <AdminSelect
                  label="Статус публикации"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  options={[
                    { value: 'draft', label: 'Черновик (Draft)' },
                    { value: 'pending_review', label: 'На проверке (Review)' },
                    { value: 'approved', label: 'Одобрено (Approved)' },
                    { value: 'rejected', label: 'Возвращено (Rejected)' },
                    { value: 'published', label: 'Опубликовано (Published)' },
                    { value: 'scheduled', label: 'Запланировано (Scheduled)' },
                    { value: 'archived', label: 'В архиве (Archived)' },
                  ]}
                />
                {(formData.status === 'rejected' || (canReview && isEditing)) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Причина возврата / review notes
                    </span>
                    <textarea
                      value={formData.review_notes}
                      onChange={(e) => setFormData({ ...formData, review_notes: e.target.value })}
                      rows={3}
                      disabled={!canReview}
                      placeholder="Обязательно при отклонении: что исправить…"
                      className="w-full rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 p-3 leading-relaxed disabled:opacity-50"
                    />
                  </div>
                )}

                <AdminSelect
                  label="Категория"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { value: 'Судебная хроника', label: 'Судебная хроника' },
                    { value: 'Пленумы и решения', label: 'Пленумы и решения' },
                    { value: 'Пресс-релизы', label: 'Пресс-релизы' },
                    { value: 'Международное сотрудничество', label: 'Международное сотрудничество' },
                    { value: 'Официальные заявления', label: 'Официальные заявления' },
                  ]}
                />

                <AdminInput
                  label="URL Обложки (Изображение)"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="/assets/news/cover-1.jpg"
                  leftIcon={<Image size={15} />}
                />

                {formData.status === 'scheduled' && (
                  <AdminInput
                    label="Дата и время публикации"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    leftIcon={<Calendar size={15} />}
                  />
                )}

                {formData.status === 'published' && (
                  <AdminInput
                    label="Дата и время публикации (можно задним числом — порядок сохранится)"
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    leftIcon={<Calendar size={15} />}
                    helperText="Пусто = сейчас. Сортировка новостей идёт по этой дате."
                  />
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Закрепить на главной (Главная новость)</span>
                  </label>
                </div>
              </div>
            </AdminCard>

            {/* SEO & Meta Box */}
            <AdminCard title="SEO & Метаданные" subtitle="Оптимизация для поисковых систем">
              <div className="space-y-4">
                <AdminInput
                  label="SEO Заголовок"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="Заголовок для поисковиков"
                />
                <AdminInput
                  label="URL Slug (Идентификатор)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="plenum-verhovnogo-suda-2026"
                />
              </div>
            </AdminCard>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview Engine */}
        <div className="h-[calc(100vh-200px)] min-h-[540px] sticky top-20 xl:col-span-3">
          <LivePreviewEngine type="news" data={formData} originalData={originalData} />
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#040813]/95 backdrop-blur-xl border-t border-slate-800 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Clock size={14} className="text-amber-400" />
          <span>Все изменения фиксируются в журнале ревизий</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {canEdit && (
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => handleSave('draft')}
              isLoading={isSaving}
            >
              Сохранить черновик
            </AdminButton>
          )}
          {canSubmit && (
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => handleSave('pending_review')}
              isLoading={isSaving}
              title="DRAFT → REVIEW"
            >
              На проверку
            </AdminButton>
          )}
          {canApprove && (
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => handleSave('approved')}
              isLoading={isSaving}
              title="REVIEW → APPROVED"
            >
              Одобрить
            </AdminButton>
          )}
          {canReview && (
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => {
                if (!formData.review_notes.trim() && formData.status !== 'rejected') {
                  setStatusMessage({ type: 'error', text: 'Укажите причину возврата' });
                  return;
                }
                handleSave('rejected');
              }}
              isLoading={isSaving}
              title="REVIEW → REJECTED (нужна причина)"
            >
              Отклонить
            </AdminButton>
          )}
          {canPublish ? (
            <AdminButton
              variant="primary"
              size="sm"
              leftIcon={<Save size={14} />}
              onClick={() => handleSave('published')}
              isLoading={isSaving}
              title="APPROVED → PUBLISHED"
            >
              Опубликовать сейчас
            </AdminButton>
          ) : (
            <span className="font-mono text-[11px] text-slate-500" title="Нужна привилегия content.publish">
              Нет права публикации
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default NewsEditor;
