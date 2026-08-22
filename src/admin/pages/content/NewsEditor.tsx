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
} from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTabs } from '../../components/ui/AdminTabs';

export const NewsEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');

  const [activeLang, setActiveLang] = useState<'ru' | 'tj' | 'en'>('ru');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    status: 'draft' as 'draft' | 'pending' | 'published' | 'scheduled' | 'archived',
    scheduled_at: '',
  });

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
          });
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

      setStatusMessage({
        type: 'success',
        text: targetStatus === 'published' ? 'Публикация успешно размещена!' : 'Черновик сохранен',
      });

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
          <AdminBadge variant={formData.status} label={formData.status.toUpperCase()} size="md" />
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

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Multilingual Editor Fields */}
        <div className="lg:col-span-2 space-y-6">
          <AdminCard title="Основной контент">
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

          {/* SEO & Meta Box */}
          <AdminCard title="SEO & Метаданные" subtitle="Оптимизация для поисковых систем">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* RIGHT 1 COL: Publishing Settings & Actions */}
        <div className="space-y-6">
          <AdminCard title="Параметры публикации">
            <div className="space-y-4">
              <AdminSelect
                label="Статус публикации"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'draft', label: 'Черновик (Draft)' },
                  { value: 'pending', label: 'На проверке (Pending Review)' },
                  { value: 'published', label: 'Опубликовано (Published)' },
                  { value: 'scheduled', label: 'Запланировано (Scheduled)' },
                  { value: 'archived', label: 'В архиве (Archived)' },
                ]}
              />

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
                  label="Дата публикации"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  leftIcon={<Calendar size={15} />}
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
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#040813]/95 backdrop-blur-xl border-t border-slate-800 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Clock size={14} className="text-amber-400" />
          <span>Все изменения фиксируются в журнале ревизий</span>
        </div>

        <div className="flex items-center gap-3">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft')}
            isLoading={isSaving}
          >
            Сохранить черновик
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={() => handleSave('published')}
            isLoading={isSaving}
          >
            Опубликовать сейчас
          </AdminButton>
        </div>
      </div>
    </div>
  );
};
export default NewsEditor;
