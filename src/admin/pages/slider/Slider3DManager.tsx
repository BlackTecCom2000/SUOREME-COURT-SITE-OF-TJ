import React, { useState, useEffect } from 'react';
import {
  Layers,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  Sliders,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  Globe,
  Moon,
  Sun,
} from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { AdminTabs } from '../../components/ui/AdminTabs';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminModal } from '../../components/ui/AdminModal';
import { apiFetch } from '../../context/adminHttp';
import {
  Slider3DConfig,
  Slider3DSlide,
  DEFAULT_SLIDER_3D_CONFIG,
  DEFAULT_SLIDER_3D_SLIDES,
} from '../../../types/slider3d';
import { Judicial3DNewsSlider } from '../../../components/news/Judicial3DNewsSlider';

const PRESET_THEMES = [
  {
    id: 'supreme_gold',
    name: 'Судебное Золото',
    desc: 'Классический государственный янтарно-золотой стиль',
    color: '#dfbe7e',
    glow: 'rgba(223, 190, 126, 0.6)',
    cardTheme: 'glass' as const,
    glowIntensity: 'medium' as const,
    imageOverlayOpacity: 60,
  },
  {
    id: 'cyber_cyan',
    name: 'Цифровой Циан',
    desc: 'Технологичный неоновый акцент в духе электронного суда',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.65)',
    cardTheme: 'cyber' as const,
    glowIntensity: 'strong' as const,
    imageOverlayOpacity: 50,
  },
  {
    id: 'royal_blue',
    name: 'Королевский Сапфир',
    desc: 'Строгий темно-синий официальный стиль юстиции',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.6)',
    cardTheme: 'glass' as const,
    glowIntensity: 'medium' as const,
    imageOverlayOpacity: 55,
  },
  {
    id: 'justice_emerald',
    name: 'Изумруд Правосудия',
    desc: 'Благородный изумрудно-зеленый контур закона',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.6)',
    cardTheme: 'glass' as const,
    glowIntensity: 'strong' as const,
    imageOverlayOpacity: 55,
  },
  {
    id: 'dark_obsidian',
    name: 'Глубокий Обсидиан',
    desc: 'Ультра-темный контрастный монолит для ночной эстетики',
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.3)',
    cardTheme: 'dark' as const,
    glowIntensity: 'soft' as const,
    imageOverlayOpacity: 75,
  },
  {
    id: 'pure_glass',
    name: 'Кристальный Платиновый',
    desc: 'Светлое воздушное стекло с чистым белым контуром',
    color: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.4)',
    cardTheme: 'glass' as const,
    glowIntensity: 'soft' as const,
    imageOverlayOpacity: 45,
  },
];

const PRESET_SYSTEM_IMAGES = [
  { label: 'Суд ночью', path: '/supreme-court-night.jpg' },
  { label: 'Суд днем', path: '/supreme-court-day.jpg' },
  { label: 'Фемида (Темная)', path: '/themis-background.jpg' },
  { label: 'Фемида (Светлая)', path: '/themis-light-background.jpg' },
];

export const Slider3DManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('slides');
  const [config, setConfig] = useState<Slider3DConfig>(DEFAULT_SLIDER_3D_CONFIG);
  const [slides, setSlides] = useState<Slider3DSlide[]>(DEFAULT_SLIDER_3D_SLIDES);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Modal for Edit / Add Slide
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<Slider3DSlide> | null>(null);
  const [slideLangTab, setSlideLangTab] = useState<'tj' | 'ru' | 'en'>('tj');
  const [isUploading, setIsUploading] = useState(false);

  // News import modal
  const [isNewsImportOpen, setIsNewsImportOpen] = useState(false);

  // Live Preview Settings
  const [previewLang, setPreviewLang] = useState<'tj' | 'ru' | 'en'>('tj');
  const [previewDark, setPreviewDark] = useState<boolean>(true);

  // Load Data
  const loadData = async () => {
    try {
      const res = await apiFetch('/api/admin/slider-3d');
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
        if (Array.isArray(data.slides)) setSlides(data.slides);
        if (Array.isArray(data.recentNews)) setRecentNews(data.recentNews);
      }
    } catch (err) {
      console.error('Failed to load 3D slider data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Configuration
  const handleSaveConfig = async (customConfig?: Slider3DConfig) => {
    setIsSaving(true);
    const targetConfig = customConfig || config;
    try {
      const res = await apiFetch('/api/admin/slider-3d/config', {
        method: 'POST',
        body: JSON.stringify(targetConfig),
      });
      if (res.ok) {
        setIsSaved(true);
        setSaveMessage('Настройки 3D-слайдера успешно сохранены и применены!');
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении конфигурации');
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder Slides
  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;

    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    setSlides(updated);

    try {
      await apiFetch('/api/admin/slider-3d/slides/reorder', {
        method: 'POST',
        body: JSON.stringify({ order: updated.map((s) => s.id) }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Active Slide
  const handleToggleActive = async (slide: Slider3DSlide) => {
    const nextState = !slide.isActive;
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, isActive: nextState } : s))
    );

    try {
      await apiFetch(`/api/admin/slider-3d/slides/${slide.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: nextState ? 1 : 0 }),
      });
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Delete Slide
  const handleDeleteSlide = async (id: number | string) => {
    if (!confirm('Вы уверены, что хотите удалить этот слайд?')) return;
    try {
      const res = await apiFetch(`/api/admin/slider-3d/slides/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (slide?: Slider3DSlide) => {
    if (slide) {
      setEditingSlide({ ...slide });
    } else {
      setEditingSlide({
        titleTj: '',
        titleRu: '',
        titleEn: '',
        summaryTj: '',
        summaryRu: '',
        summaryEn: '',
        categoryTj: 'ХАБАРҲОИ СУДИ ОЛӢ',
        categoryRu: 'НОВОСТИ ВЕРХОВНОГО СУДА',
        categoryEn: 'SUPREME COURT NEWS',
        imageUrl: '/supreme-court-night.jpg',
        linkUrl: '',
        dateText: new Date().toLocaleDateString('ru-RU'),
        sortOrder: slides.length + 1,
        isActive: 1,
      });
    }
    setSlideLangTab('tj');
    setIsModalOpen(true);
  };

  // Save Slide from Modal
  const handleSaveModalSlide = async () => {
    if (!editingSlide?.titleTj?.trim() && !editingSlide?.titleRu?.trim()) {
      alert('Пожалуйста, заполните заголовок хотя бы на таджикском или русском языке.');
      return;
    }
    if (!editingSlide.imageUrl?.trim()) {
      alert('Пожалуйста, укажите или выберите фоновое изображение.');
      return;
    }

    try {
      if (editingSlide.id) {
        // Update existing
        const res = await apiFetch(`/api/admin/slider-3d/slides/${editingSlide.id}`, {
          method: 'PUT',
          body: JSON.stringify(editingSlide),
        });
        if (res.ok) {
          setIsModalOpen(false);
          loadData();
        }
      } else {
        // Create new
        const res = await apiFetch('/api/admin/slider-3d/slides', {
          method: 'POST',
          body: JSON.stringify(editingSlide),
        });
        if (res.ok) {
          setIsModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении слайда');
    }
  };

  // Import news item as slide
  const handleImportNewsAsSlide = async (newsItem: any) => {
    const newSlide: Partial<Slider3DSlide> = {
      titleTj: newsItem.title_tj || newsItem.title_ru || '',
      titleRu: newsItem.title_ru || newsItem.title_tj || '',
      titleEn: newsItem.title_en || newsItem.title_ru || '',
      summaryTj: newsItem.excerpt_tj || newsItem.excerpt_ru || '',
      summaryRu: newsItem.excerpt_ru || newsItem.excerpt_tj || '',
      summaryEn: newsItem.excerpt_en || newsItem.excerpt_ru || '',
      categoryTj: newsItem.category || 'ХАБАРҲОИ СУДИ ОЛӢ',
      categoryRu: newsItem.category || 'НОВОСТИ ВЕРХОВНОГО СУДА',
      categoryEn: newsItem.category || 'SUPREME COURT NEWS',
      imageUrl: newsItem.cover_image ? `/uploads/${newsItem.cover_image}` : '/supreme-court-day.jpg',
      linkUrl: newsItem.slug ? `/news/${newsItem.slug}` : '',
      dateText: newsItem.published_at ? new Date(newsItem.published_at).toLocaleDateString('ru-RU') : '2026',
      sortOrder: slides.length + 1,
      isActive: 1,
    };

    try {
      const res = await apiFetch('/api/admin/slider-3d/slides', {
        method: 'POST',
        body: JSON.stringify(newSlide),
      });
      if (res.ok) {
        setIsNewsImportOpen(false);
        loadData();
        alert('Новость успешно добавлена в список слайдов 3D карусели!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload image handler
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setEditingSlide((prev) => (prev ? { ...prev, imageUrl: data.url } : null));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке изображения');
    } finally {
      setIsUploading(false);
    }
  };

  // Factory Reset
  const handleResetToDefaults = async () => {
    if (
      !confirm(
        'Внимание! Это действие сбросит все параметры 3D-слайдера к стандартным заводским значениям. Продолжить?'
      )
    ) {
      return;
    }
    try {
      const res = await apiFetch('/api/admin/slider-3d/reset', { method: 'POST' });
      if (res.ok) {
        loadData();
        alert('Настройки и слайды успешно сброшены к стандартным!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Apply Theme Preset
  const handleApplyPreset = (preset: (typeof PRESET_THEMES)[0]) => {
    const updated: Slider3DConfig = {
      ...config,
      cardTheme: preset.cardTheme,
      activeBorderColor: preset.color,
      glowIntensity: preset.glowIntensity,
      glowColor: preset.glow,
      imageOverlayOpacity: preset.imageOverlayOpacity,
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  const tabs = [
    { id: 'slides', label: '🎴 Слайды и Контент', icon: <Layers size={14} /> },
    { id: 'behavior', label: '⚙️ Поведение & Настройки', icon: <Sliders size={14} /> },
    { id: 'design', label: '🎨 3D Дизайн & Геометрия', icon: <Palette size={14} /> },
    { id: 'preview', label: '👁️ Живой 3D Предпросмотр', icon: <Sparkles size={14} /> },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-black dark:text-white">
              3D Слайдер (Карусель новостей)
            </h2>
            <p className="font-sans text-xs text-black dark:text-white mt-0.5">
              Управление слайдами, параметрами 3D-геометрии, автопрокруткой и визуальным стилем
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AdminButton
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            onClick={handleResetToDefaults}
            className="text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10"
          >
            Сброс
          </AdminButton>

          <AdminButton
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles size={14} />}
            onClick={() => setActiveTab(activeTab === 'preview' ? 'slides' : 'preview')}
          >
            {activeTab === 'preview' ? 'К настройкам' : 'Живой предпросмотр'}
          </AdminButton>

          <AdminButton
            variant="primary"
            size="md"
            leftIcon={<Save size={16} />}
            onClick={() => handleSaveConfig()}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : isSaved ? 'Сохранено!' : 'Сохранить настройки'}
          </AdminButton>
        </div>
      </div>

      {/* Success Notification */}
      {isSaved && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: SLIDES & CONTENT */}
      {activeTab === 'slides' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Source Mode Setting Card */}
          <AdminCard title="Режим источника слайдов">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: 'hybrid',
                    title: 'Гибридный режим',
                    desc: 'Пользовательские слайды в приоритете, затем свежие новости портала',
                    tag: 'Рекомендуется',
                  },
                  {
                    id: 'custom',
                    title: 'Только свои слайды',
                    desc: 'Отображаются исключительно вручную настроенные слайды из списка ниже',
                    tag: 'Ручной',
                  },
                  {
                    id: 'news',
                    title: 'Свежие новости',
                    desc: 'Автоматически загружаются последние опубликованные новости сайта',
                    tag: 'Автоматический',
                  },
                  {
                    id: 'featured',
                    title: 'Избранные новости',
                    desc: 'Только новости с пометкой «Избранное / Featured» в CMS',
                    tag: 'Кураторский',
                  },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => {
                      const updated = { ...config, sourceMode: mode.id as any };
                      setConfig(updated);
                      handleSaveConfig(updated);
                    }}
                    className={`
                      p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between
                      ${
                        config.sourceMode === mode.id
                          ? 'border-amber-500 bg-amber-500/10 shadow-md'
                          : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                      }
                    `}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-serif font-bold text-sm text-black dark:text-white">{mode.title}</span>
                        <AdminBadge
                          variant={config.sourceMode === mode.id ? 'active' : 'draft'}
                          size="sm"
                        >
                          {mode.tag}
                        </AdminBadge>
                      </div>
                      <p className="font-sans text-xs text-black dark:text-white leading-relaxed">{mode.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                      <span className={config.sourceMode === mode.id ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-black dark:text-white font-medium'}>
                        {config.sourceMode === mode.id ? '✓ Активен' : 'Выбрать'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>

          {/* Slide List Card */}
          <AdminCard
            title={
              <div className="flex items-center justify-between w-full">
                <span>Управление слайдами ({slides.length})</span>
                <div className="flex items-center gap-2">
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    leftIcon={<Globe size={14} />}
                    onClick={() => setIsNewsImportOpen(true)}
                  >
                    Импорт из новостей
                  </AdminButton>
                  <AdminButton
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={() => handleOpenEdit()}
                  >
                    Добавить слайд
                  </AdminButton>
                </div>
              </div>
            }
          >
            {slides.length === 0 ? (
              <div className="p-8 text-center text-black dark:text-white font-sans text-sm">
                Список слайдов пуст. Нажмите «Добавить слайд» или «Импорт из новостей».
              </div>
            ) : (
              <div className="space-y-3">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`
                      p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                      ${
                        slide.isActive
                          ? 'border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 shadow-sm dark:shadow-none'
                          : 'border-slate-200/60 bg-slate-100/40 opacity-60 dark:border-slate-800/40 dark:bg-slate-950/40'
                      }
                    `}
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <span className="font-mono text-xs text-black dark:text-white w-5 shrink-0 text-center font-bold">
                        #{idx + 1}
                      </span>

                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-950 relative group shadow-sm">
                        <img
                          src={slide.imageUrl}
                          alt={slide.titleRu || slide.titleTj}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            {slide.categoryTj || slide.categoryRu}
                          </span>
                          <span className="text-[11px] font-mono text-black dark:text-white">
                            {slide.dateText}
                          </span>
                          {slide.linkUrl && (
                            <span className="text-[11px] font-mono text-sky-600 dark:text-cyan-400/80 truncate max-w-[150px]">
                              → {slide.linkUrl}
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif font-bold text-sm text-black dark:text-white truncate max-w-lg">
                          {slide.titleTj || slide.titleRu}
                        </h4>

                        {slide.titleRu && slide.titleTj && (
                          <p className="font-sans text-xs text-black dark:text-white truncate max-w-lg mt-0.5">
                            RU: {slide.titleRu}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Move Order */}
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, 'up')}
                        disabled={idx === 0}
                        title="Поднять выше"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MoveUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, 'down')}
                        disabled={idx === slides.length - 1}
                        title="Опустить ниже"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MoveDown size={14} />
                      </button>

                      {/* Toggle Active */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide)}
                        title={slide.isActive ? 'Скрыть со слайдера' : 'Отображать на слайдере'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          slide.isActive
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {slide.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(slide)}
                        title="Редактировать слайд"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide.id)}
                        title="Удалить слайд"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      )}

      {/* TAB 2: BEHAVIOR & CONTROLS */}
      {activeTab === 'behavior' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Autoplay & Interaction Card */}
          <AdminCard title="Автовоспроизведение и сенсорное управление">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Autoplay switch */}
              <label className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none shadow-sm dark:shadow-none transition-colors">
                <div>
                  <span className="block text-sm text-black dark:text-white font-medium">
                    Автоматическая прокрутка слайдов
                  </span>
                  <span className="block font-sans text-xs text-black dark:text-white mt-1">
                    Слайды будут автоматически перелистываться с заданным интервалом
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoplay}
                  onChange={(e) => setConfig({ ...config, autoplay: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-5 h-5 cursor-pointer shrink-0"
                />
              </label>

              {/* Pause on hover */}
              <label className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none shadow-sm dark:shadow-none transition-colors">
                <div>
                  <span className="block text-sm text-black dark:text-white font-medium">
                    Пауза при наведении мыши
                  </span>
                  <span className="block font-sans text-xs text-black dark:text-white mt-1">
                    Останавливать таймер автопрокрутки, когда курсор находится над слайдером
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.pauseOnHover}
                  onChange={(e) => setConfig({ ...config, pauseOnHover: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-5 h-5 cursor-pointer shrink-0"
                />
              </label>

              {/* 3D Tilt on hover */}
              <label className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none shadow-sm dark:shadow-none transition-colors">
                <div>
                  <span className="block text-sm text-black dark:text-white font-medium">
                    3D-наклон за курсором (Tilt Parallax)
                  </span>
                  <span className="block font-sans text-xs text-black dark:text-white mt-1">
                    Живой интерактивный эффект наклона центральной карточки вслед за курсором
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.tiltEnabled}
                  onChange={(e) => setConfig({ ...config, tiltEnabled: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-5 h-5 cursor-pointer shrink-0"
                />
              </label>

              {/* Drag & swipe */}
              <label className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none shadow-sm dark:shadow-none transition-colors">
                <div>
                  <span className="block text-sm text-black dark:text-white font-medium">
                    Свайп и перетаскивание мышью
                  </span>
                  <span className="block font-sans text-xs text-black dark:text-white mt-1">
                    Поддержка свайпов на тачскринах и перетаскивания левой кнопкой мыши
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.dragEnabled}
                  onChange={(e) => setConfig({ ...config, dragEnabled: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-5 h-5 cursor-pointer shrink-0"
                />
              </label>
            </div>

            {/* Slider Interval Slider */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black dark:text-white">
                  Интервал смены слайдов
                </span>
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                  {config.interval || 6} секунд
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={config.interval || 6}
                onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) })}
                className="w-full accent-amber-500 dark:accent-amber-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-2xs font-mono text-black dark:text-white">
                <span>Быстро (2 сек)</span>
                <span>Стандарт (6 сек)</span>
                <span>Медленно (15 сек)</span>
              </div>
            </div>

            {/* Max Slides Limit */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black dark:text-white">
                  Максимальное количество отображаемых слайдов
                </span>
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/30">
                  {config.maxSlides || 10} слайдов
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={config.maxSlides || 10}
                onChange={(e) => setConfig({ ...config, maxSlides: Number(e.target.value) })}
                className="w-full accent-sky-500 dark:accent-cyan-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </AdminCard>

          {/* Header Badge Customization */}
          <AdminCard title="Верхняя плашка (Бейдж)">
            <div className="space-y-4">
              <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none shadow-sm dark:shadow-none transition-colors">
                <div>
                  <span className="block text-sm text-black dark:text-white font-medium">
                    Показывать верхний бейдж
                  </span>
                  <span className="block font-sans text-xs text-black dark:text-white mt-0.5">
                    Отображать плашку с иконкой Sparkles и названием секции
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showBadge}
                  onChange={(e) => setConfig({ ...config, showBadge: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-5 h-5 cursor-pointer shrink-0"
                />
              </label>

              {config.showBadge && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <AdminInput
                    label="Текст бейджа (TJ)"
                    value={config.badgeTextTj}
                    onChange={(e) => setConfig({ ...config, badgeTextTj: e.target.value })}
                  />
                  <AdminInput
                    label="Текст бейджа (RU)"
                    value={config.badgeTextRu}
                    onChange={(e) => setConfig({ ...config, badgeTextRu: e.target.value })}
                  />
                  <AdminInput
                    label="Текст бейджа (EN)"
                    value={config.badgeTextEn}
                    onChange={(e) => setConfig({ ...config, badgeTextEn: e.target.value })}
                  />
                </div>
              )}
            </div>
          </AdminCard>

          {/* Visible Controls & Buttons */}
          <AdminCard title="Видимость элементов управления и кнопок">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm dark:shadow-none transition-colors">
                <span className="text-xs text-black dark:text-white font-medium">Счетчик (04 / 11)</span>
                <input
                  type="checkbox"
                  checked={config.showCounter}
                  onChange={(e) => setConfig({ ...config, showCounter: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm dark:shadow-none transition-colors">
                <span className="text-xs text-black dark:text-white font-medium">Кнопка Play / Pause</span>
                <input
                  type="checkbox"
                  checked={config.showPlayPause}
                  onChange={(e) => setConfig({ ...config, showPlayPause: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm dark:shadow-none transition-colors">
                <span className="text-xs text-black dark:text-white font-medium">Стрелки (Prev / Next)</span>
                <input
                  type="checkbox"
                  checked={config.showArrows}
                  onChange={(e) => setConfig({ ...config, showArrows: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm dark:shadow-none transition-colors">
                <span className="text-xs text-black dark:text-white font-medium">Точки-индикаторы снизу</span>
                <input
                  type="checkbox"
                  checked={config.showDots}
                  onChange={(e) => setConfig({ ...config, showDots: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Action Buttons customization */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-black dark:text-white">
                Кнопки перехода на активном слайде
              </h4>

              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-black dark:text-white font-medium">
                    Кнопка «Подробнее / Муфассал хондан»
                  </span>
                  <input
                    type="checkbox"
                    checked={config.showReadMore}
                    onChange={(e) => setConfig({ ...config, showReadMore: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>
                {config.showReadMore && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <AdminInput
                      label="Текст (TJ)"
                      value={config.readMoreTextTj}
                      onChange={(e) => setConfig({ ...config, readMoreTextTj: e.target.value })}
                    />
                    <AdminInput
                      label="Текст (RU)"
                      value={config.readMoreTextRu}
                      onChange={(e) => setConfig({ ...config, readMoreTextRu: e.target.value })}
                    />
                    <AdminInput
                      label="Текст (EN)"
                      value={config.readMoreTextEn}
                      onChange={(e) => setConfig({ ...config, readMoreTextEn: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-black dark:text-white font-medium">
                    Кнопка «Все новости / Ҳамаи хабарҳо»
                  </span>
                  <input
                    type="checkbox"
                    checked={config.showAllNews}
                    onChange={(e) => setConfig({ ...config, showAllNews: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>
                {config.showAllNews && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <AdminInput
                      label="Текст (TJ)"
                      value={config.allNewsTextTj}
                      onChange={(e) => setConfig({ ...config, allNewsTextTj: e.target.value })}
                    />
                    <AdminInput
                      label="Текст (RU)"
                      value={config.allNewsTextRu}
                      onChange={(e) => setConfig({ ...config, allNewsTextRu: e.target.value })}
                    />
                    <AdminInput
                      label="Текст (EN)"
                      value={config.allNewsTextEn}
                      onChange={(e) => setConfig({ ...config, allNewsTextEn: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* TAB 3: 3D DESIGN & GEOMETRY */}
      {activeTab === 'design' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Preset Themes */}
          <AdminCard title="Готовые дизайнерские пресеты (в 1 клик)">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {PRESET_THEMES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-amber-400/80 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-slate-700 cursor-pointer transition-all duration-200 group flex items-start gap-3 shadow-sm dark:shadow-none"
                >
                  <div
                    className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center border border-white/40 shadow-md group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: preset.color }}
                  >
                    <Sparkles size={16} className="text-slate-950" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-black dark:text-white">{preset.name}</span>
                    </div>
                    <p className="font-sans text-xs text-black dark:text-white mt-1 leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* 3D Geometry Sliders */}
          <AdminCard title="3D-геометрия сцены и позиционирование карточек">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Perspective */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">3D Перспектива сцены</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {config.perspective || 1200}px
                  </span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="2000"
                  step="50"
                  value={config.perspective || 1200}
                  onChange={(e) => setConfig({ ...config, perspective: Number(e.target.value) })}
                  className="w-full accent-amber-500 dark:accent-amber-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Stage Height */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Высота сцены карусели</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {config.stageHeight || 400}px
                  </span>
                </div>
                <input
                  type="range"
                  min="320"
                  max="520"
                  step="10"
                  value={config.stageHeight || 400}
                  onChange={(e) => setConfig({ ...config, stageHeight: Number(e.target.value) })}
                  className="w-full accent-amber-500 dark:accent-amber-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Card Width */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Ширина карточки</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {config.cardWidth || 660}px
                  </span>
                </div>
                <input
                  type="range"
                  min="460"
                  max="800"
                  step="10"
                  value={config.cardWidth || 660}
                  onChange={(e) => setConfig({ ...config, cardWidth: Number(e.target.value) })}
                  className="w-full accent-amber-500 dark:accent-amber-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Card Height */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Высота карточки</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {config.cardHeight || 370}px
                  </span>
                </div>
                <input
                  type="range"
                  min="280"
                  max="460"
                  step="10"
                  value={config.cardHeight || 370}
                  onChange={(e) => setConfig({ ...config, cardHeight: Number(e.target.value) })}
                  className="w-full accent-amber-500 dark:accent-amber-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Side Offset X */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Смещение боковых слайдов (Translate X)</span>
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/30">
                    {config.sideOffsetX || 280}px
                  </span>
                </div>
                <input
                  type="range"
                  min="160"
                  max="420"
                  step="10"
                  value={config.sideOffsetX || 280}
                  onChange={(e) => setConfig({ ...config, sideOffsetX: Number(e.target.value) })}
                  className="w-full accent-sky-500 dark:accent-cyan-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Side Offset Z */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Глубина боковых слайдов (Translate Z)</span>
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/30">
                    {config.sideOffsetZ || -120}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-250"
                  max="-40"
                  step="10"
                  value={config.sideOffsetZ || -120}
                  onChange={(e) => setConfig({ ...config, sideOffsetZ: Number(e.target.value) })}
                  className="w-full accent-sky-500 dark:accent-cyan-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Side Rotate Y */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Угол разворота боковых слайдов (Rotate Y)</span>
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/30">
                    {config.sideRotateY || 18}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="1"
                  value={config.sideRotateY || 18}
                  onChange={(e) => setConfig({ ...config, sideRotateY: Number(e.target.value) })}
                  className="w-full accent-sky-500 dark:accent-cyan-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Side Scale */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Масштаб боковых слайдов (Scale)</span>
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/30">
                    {Math.round((config.sideScale || 0.85) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="1.0"
                  step="0.05"
                  value={config.sideScale || 0.85}
                  onChange={(e) => setConfig({ ...config, sideScale: Number(e.target.value) })}
                  className="w-full accent-sky-500 dark:accent-cyan-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Side Opacity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Прозрачность боковых слайдов</span>
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/30">
                    {Math.round((config.sideOpacity || 0.45) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={config.sideOpacity || 0.45}
                  onChange={(e) => setConfig({ ...config, sideOpacity: Number(e.target.value) })}
                  className="w-full accent-sky-500 dark:accent-cyan-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Card Radius */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Скругление углов (Border Radius)</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {config.cardRadius || 24}px
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="40"
                  step="2"
                  value={config.cardRadius || 24}
                  onChange={(e) => setConfig({ ...config, cardRadius: Number(e.target.value) })}
                  className="w-full accent-amber-500 dark:accent-amber-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>
            </div>
          </AdminCard>

          {/* Color & Card Styling */}
          <AdminCard title="Цвета, свечение и оформление карточек">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Theme Select */}
              <AdminSelect
                label="Стиль подложки карточки"
                value={config.cardTheme}
                onChange={(e) => setConfig({ ...config, cardTheme: e.target.value as any })}
                options={[
                  { value: 'glass', label: 'Стеклянный (Glassmorphism / Glass)' },
                  { value: 'dark', label: 'Тёмный монолит (Dark Obsidian)' },
                  { value: 'solid', label: 'Глубокий синий (Royal Slate)' },
                  { value: 'gold_bordered', label: 'Золотая рамка (Gold Bordered)' },
                  { value: 'cyber', label: 'Кибернетический циан (Cyber Frame)' },
                ]}
              />

              {/* Glow Intensity Select */}
              <AdminSelect
                label="Интенсивность неонового свечения"
                value={config.glowIntensity}
                onChange={(e) => setConfig({ ...config, glowIntensity: e.target.value as any })}
                options={[
                  { value: 'none', label: 'Без свечения' },
                  { value: 'soft', label: 'Мягкое свечение (Soft)' },
                  { value: 'medium', label: 'Среднее свечение (Medium)' },
                  { value: 'strong', label: 'Мощное неоновое свечение (Strong)' },
                ]}
              />

              {/* Active Border Color with Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-sans font-bold text-black dark:text-white uppercase tracking-wider">
                  Цвет рамки активного слайда
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.activeBorderColor || '#dfbe7e'}
                    onChange={(e) => setConfig({ ...config, activeBorderColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer p-0.5 shrink-0 shadow-sm"
                  />
                  <input
                    type="text"
                    value={config.activeBorderColor || '#dfbe7e'}
                    onChange={(e) => setConfig({ ...config, activeBorderColor: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-amber-500 shadow-sm dark:shadow-none"
                  />
                </div>
              </div>

              {/* Image Darkness Overlay */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black dark:text-white font-bold">Затемнение фотографии (Overlay)</span>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {config.imageOverlayOpacity ?? 60}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={config.imageOverlayOpacity ?? 60}
                  onChange={(e) =>
                    setConfig({ ...config, imageOverlayOpacity: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 dark:accent-amber-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* TAB 4: LIVE 3D PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls toolbar */}
          <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm dark:shadow-none transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-sans text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                Язык предпросмотра:
              </span>
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-950 p-1 rounded-lg border border-slate-300 dark:border-slate-800">
                {(['tj', 'ru', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setPreviewLang(lang)}
                    className={`px-3 py-1 rounded-md text-xs font-mono uppercase transition-colors ${
                      previewLang === lang
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-400'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-sans text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                Тема оформления:
              </span>
              <button
                type="button"
                onClick={() => setPreviewDark(!previewDark)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-black dark:text-white hover:border-slate-400 dark:hover:border-slate-700 shadow-sm dark:shadow-none"
              >
                {previewDark ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-amber-500" />}
                <span>{previewDark ? 'Тёмная тема' : 'Светлая тема'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Slider Preview Window */}
          <div
            className={`
              w-full p-4 sm:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden
              ${
                previewDark
                  ? 'bg-[#030712] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
                  : 'bg-slate-100 border-slate-300 text-slate-900 shadow-2xl'
              }
            `}
          >
            <div className="max-w-6xl mx-auto">
              <Judicial3DNewsSlider
                configOverride={config}
                slidesOverride={slides}
                previewLanguage={previewLang}
                previewDark={previewDark}
                onOpenNewsItem={(item) => {
                  alert(`Клик по слайду: "${item.titleTj || item.titleRu}"\nURL: ${item.url || 'не задан'}`);
                }}
                onOpenAllNews={() => {
                  alert('Клик по кнопке: "Все новости"');
                }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 text-xs text-black dark:text-white flex items-center justify-between shadow-sm dark:shadow-none">
            <span>
              💡 Все изменения в размерах, углах и цветах отображаются в реальном времени. Нажмите «Сохранить настройки», чтобы опубликовать их на сайте.
            </span>
            <AdminButton
              variant="primary"
              size="sm"
              leftIcon={<Save size={14} />}
              onClick={() => handleSaveConfig()}
            >
              Сохранить сейчас
            </AdminButton>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SLIDE */}
      {isModalOpen && editingSlide && (
        <AdminModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSlide.id ? 'Редактирование 3D-слайда' : 'Создание нового 3D-слайда'}
          subtitle="Настройка заголовка, текста, категории, ссылки и изображения"
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <AdminButton variant="ghost" onClick={() => setIsModalOpen(false)}>
                Отмена
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSaveModalSlide}>
                Сохранить слайд
              </AdminButton>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Language tabs for slide contents */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-sans text-xs font-bold text-black dark:text-white mr-2">Язык контента:</span>
              {(['tj', 'ru', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSlideLangTab(lang)}
                  className={`px-3 py-1 rounded-md text-xs font-mono uppercase transition-colors ${
                    slideLangTab === lang
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-transparent'
                  }`}
                >
                  {lang === 'tj' ? 'Тоҷикӣ' : lang === 'ru' ? 'Русский' : 'English'}
                </button>
              ))}
            </div>

            {/* Language Form Fields */}
            {slideLangTab === 'tj' && (
              <div className="space-y-4">
                <AdminInput
                  label="Сарлавҳаи хабар (Заголовок на таджикском)"
                  placeholder="Масалан: Ҷаласаи Пленуми Суди Олии ҶТ..."
                  value={editingSlide.titleTj || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, titleTj: e.target.value })}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-sans font-bold text-black dark:text-white uppercase tracking-wider">
                    Шарҳи кӯтоҳ (Краткое описание на таджикском)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Матни мухтасари хабар барои намоиш дар слайд..."
                    value={editingSlide.summaryTj || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, summaryTj: e.target.value })}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-xs text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors shadow-sm dark:shadow-none"
                  />
                </div>
                <AdminInput
                  label="Бахш / Категория (TJ)"
                  placeholder="СУДИ ЭЛЕКТРОНӢ / ПЛЕНУМИ СУДИ ОЛӢ"
                  value={editingSlide.categoryTj || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, categoryTj: e.target.value })}
                />
              </div>
            )}

            {slideLangTab === 'ru' && (
              <div className="space-y-4">
                <AdminInput
                  label="Заголовок новости (RU)"
                  placeholder="Например: Заседание Пленума Верховного суда..."
                  value={editingSlide.titleRu || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, titleRu: e.target.value })}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-sans font-bold text-black dark:text-white uppercase tracking-wider">
                    Краткое описание (RU)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Краткое содержание новости для отображения на слайде..."
                    value={editingSlide.summaryRu || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, summaryRu: e.target.value })}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-xs text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors shadow-sm dark:shadow-none"
                  />
                </div>
                <AdminInput
                  label="Категория (RU)"
                  placeholder="ЭЛЕКТРОННЫЙ СУД / ПЛЕНУМ ВЕРХОВНОГО СУДА"
                  value={editingSlide.categoryRu || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, categoryRu: e.target.value })}
                />
              </div>
            )}

            {slideLangTab === 'en' && (
              <div className="space-y-4">
                <AdminInput
                  label="Title (EN)"
                  placeholder="For example: Plenum Session of the Supreme Court..."
                  value={editingSlide.titleEn || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, titleEn: e.target.value })}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-sans font-bold text-black dark:text-white uppercase tracking-wider">
                    Summary (EN)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Short summary for the slide display..."
                    value={editingSlide.summaryEn || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, summaryEn: e.target.value })}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-xs text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors shadow-sm dark:shadow-none"
                  />
                </div>
                <AdminInput
                  label="Category (EN)"
                  placeholder="E-JUSTICE / SUPREME COURT PLENUM"
                  value={editingSlide.categoryEn || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, categoryEn: e.target.value })}
                />
              </div>
            )}

            {/* General parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <AdminInput
                label="Ссылка перехода (URL)"
                placeholder="/news/slug-name или /acts"
                value={editingSlide.linkUrl || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, linkUrl: e.target.value })}
              />
              <AdminInput
                label="Дата отображения"
                placeholder="18.08.2026"
                value={editingSlide.dateText || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, dateText: e.target.value })}
              />
            </div>

            {/* Image Selection */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-sans font-bold text-black dark:text-white uppercase tracking-wider">
                Фоновое изображение карточки
              </label>

              {/* Current preview + URL input */}
              <div className="flex items-center gap-3">
                <div className="w-24 h-16 rounded-xl border border-slate-300 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 shadow-sm">
                  {editingSlide.imageUrl ? (
                    <img
                      src={editingSlide.imageUrl}
                      alt="Превью"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <AdminInput
                    placeholder="/supreme-court-night.jpg или URL..."
                    value={editingSlide.imageUrl || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  />

                  {/* Upload button */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs font-mono text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-bold cursor-pointer transition-colors shadow-sm dark:shadow-none">
                    <Upload size={13} />
                    <span>{isUploading ? 'Загрузка...' : 'Загрузить файл с компьютера'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Quick Preset Images */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-mono font-bold text-black dark:text-white">
                  Быстрый выбор из системных изображений:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SYSTEM_IMAGES.map((img) => (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, imageUrl: img.path })}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                        editingSlide.imageUrl === img.path
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                          : 'border-slate-300 dark:border-slate-800 text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(editingSlide.isActive)}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, isActive: e.target.checked ? 1 : 0 })
                  }
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-500 accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-black dark:text-white font-medium">
                  Отображать этот слайд в карусели на сайте
                </span>
              </label>
            </div>
          </div>
        </AdminModal>
      )}

      {/* MODAL: IMPORT FROM NEWS */}
      {isNewsImportOpen && (
        <AdminModal
          isOpen={isNewsImportOpen}
          onClose={() => setIsNewsImportOpen(false)}
          title="Импорт новости в 3D Слайдер"
          subtitle="Выберите существующую опубликованную новость для добавления в качестве слайда"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {recentNews.length === 0 ? (
              <div className="p-8 text-center text-black dark:text-white font-sans text-xs">
                Опубликованных новостей не найдено.
              </div>
            ) : (
              recentNews.map((news) => (
                <div
                  key={news.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 flex items-center justify-between gap-4 transition-colors shadow-sm dark:shadow-none"
                >
                  <div className="min-w-0 text-left">
                    <span className="text-2xs font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 uppercase font-bold">
                      {news.category || 'НОВОСТЬ'}
                    </span>
                    <h5 className="font-serif font-bold text-sm text-black dark:text-white truncate mt-1">
                      {news.title_tj || news.title_ru}
                    </h5>
                    {news.title_ru && (
                      <p className="font-sans text-xs text-black dark:text-white truncate mt-0.5">
                        {news.title_ru}
                      </p>
                    )}
                  </div>
                  <AdminButton
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={() => handleImportNewsAsSlide(news)}
                  >
                    Добавить в слайды
                  </AdminButton>
                </div>
              ))
            )}
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default Slider3DManager;
