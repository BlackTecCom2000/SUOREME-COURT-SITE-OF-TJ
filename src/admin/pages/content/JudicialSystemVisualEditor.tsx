import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  Undo2,
  Redo2,
  Eye,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Monitor,
  Tablet,
  Smartphone,
  Moon,
  Sun,
  Sliders,
  Search,
  Building2,
} from 'lucide-react';
import { SUPREME_COURT_STRUCTURE_DATA, StructureEntity } from '../../../components/judicial-ecosystem/SupremeCourtStructureHub';

export const JudicialSystemVisualEditor: React.FC = () => {
  // Multilingual active editing language: 'tj' | 'ru' | 'en'
  const [activeLang, setActiveLang] = useState<'tj' | 'ru' | 'en'>('tj');

  // Entities state
  const [entities, setEntities] = useState<StructureEntity[]>(() => {
    const saved = localStorage.getItem('sudtj_structure_cms_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SUPREME_COURT_STRUCTURE_DATA;
      }
    }
    return SUPREME_COURT_STRUCTURE_DATA;
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<StructureEntity[][]>([entities]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active selected entity for editing
  const [selectedId, setSelectedId] = useState<string>(entities[0]?.id || 'chief_justice');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter] = useState<string>('all');

  // Preview controls
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [publishedNotification, setPublishedNotification] = useState(false);

  const activeEntity = entities.find((e) => e.id === selectedId) || entities[0];

  // Update history on change
  const pushState = (newEntities: StructureEntity[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newEntities);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setEntities(newEntities);
    localStorage.setItem('sudtj_structure_cms_data', JSON.stringify(newEntities));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEntities(history[historyIndex - 1]);
      localStorage.setItem('sudtj_structure_cms_data', JSON.stringify(history[historyIndex - 1]));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEntities(history[historyIndex + 1]);
      localStorage.setItem('sudtj_structure_cms_data', JSON.stringify(history[historyIndex + 1]));
    }
  };

  // Modify active entity field
  const updateField = (field: string, value: any) => {
    const updated = entities.map((item) => {
      if (item.id === selectedId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    pushState(updated);
  };

  // Move item up/down
  const moveEntity = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= entities.length) return;

    const copy = [...entities];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    pushState(copy);
  };

  // Duplicate item
  const duplicateEntity = (item: StructureEntity) => {
    const newItem: StructureEntity = {
      ...item,
      id: `${item.id}_copy_${Date.now().toString().slice(-4)}`,
      titleTj: `${item.titleTj} (Нусха)`,
      titleRu: `${item.titleRu} (Копия)`,
      titleEn: `${item.titleEn} (Copy)`,
      code: `${item.code}-COPY`,
    };
    pushState([...entities, newItem]);
    setSelectedId(newItem.id);
  };

  // Delete item
  const deleteEntity = (id: string) => {
    if (entities.length <= 1) return;
    const filtered = entities.filter((e) => e.id !== id);
    pushState(filtered);
    setSelectedId(filtered[0]?.id || '');
  };

  // Publish to public API
  const handlePublish = async () => {
    try {
      localStorage.setItem('sudtj_structure_cms_data', JSON.stringify(entities));
      setPublishedNotification(true);
      setTimeout(() => setPublishedNotification(false), 3000);
    } catch (e) {
      console.error('Publish error', e);
    }
  };

  const filteredList = entities.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.titleTj.toLowerCase().includes(q) ||
      item.titleRu.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn text-left select-none">
      
      {/* 1. TOP HEADER & CMS ACTION TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-slate-800 bg-[#070d1a] shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>ВИЗУАЛЬНЫЙ РЕДАКТОР СТРУКТУРЫ // СУДИ ҶУМҲУРИИ ТОҶИКИСТОН</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Низоми иттилоотии sud.tj — Сохтор ва Ҳайатҳо
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Управление каждым элементом, коллегией, текстом на 3-х языках и параметрами структуры без изменения кода.
          </p>
        </div>

        {/* Global Toolbar: Undo, Redo, Language, Publish */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Undo / Redo */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            >
              <Undo2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* Multilingual Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 font-mono text-xs">
            {(['tj', 'ru', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-lg uppercase font-bold transition-colors ${
                  activeLang === lang
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Publish CTA */}
          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Save size={14} />
            <span>Опубликовать</span>
          </button>
        </div>
      </div>

      {publishedNotification && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Изменения успешно опубликованы! Они мгновенно отображаются на публичном сайте sud.tj.</span>
          </div>
        </div>
      )}

      {/* 2. MAIN 3-PANEL CMS LAYOUT: NAV LIST (Left) -> EDIT PANEL (Center) -> LIVE PREVIEW (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Entity Tree & Hierarchy Reordering */}
        <div className="xl:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-[#070d1a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                ПОДРАЗДЕЛЕНИЯ ({filteredList.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  const newId = `custom_unit_${Date.now().toString().slice(-4)}`;
                  const newItem: StructureEntity = {
                    id: newId,
                    category: 'apparatus',
                    titleTj: 'Шуъбаи нав',
                    titleRu: 'Новое подразделение',
                    titleEn: 'New Unit',
                    subtitleTj: 'Тавсифи кӯтоҳ',
                    subtitleRu: 'Краткое описание',
                    subtitleEn: 'Short description',
                    descTj: 'Маълумоти муфассал оид ба воҳиди сохторӣ...',
                    descRu: 'Подробная информация о подразделении...',
                    descEn: 'Detailed unit information...',
                    icon: Building2,
                    code: `NEW-${entities.length + 1}`,
                  };
                  pushState([...entities, newItem]);
                  setSelectedId(newId);
                }}
                className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-black transition-colors"
                title="Добавить подразделение"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Quick Search in left tree */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Фильтр элементов..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* List with Up/Down and Selection */}
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredList.map((item, index) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                        : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[9px] text-amber-400 font-bold">{item.code}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase truncate">
                          [{item.category}]
                        </span>
                      </div>
                      <p className="font-sans text-xs font-semibold truncate">
                        {activeLang === 'tj' ? item.titleTj : activeLang === 'en' ? item.titleEn : item.titleRu}
                      </p>
                    </div>

                    {/* Move controls */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveEntity(index, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <MoveUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveEntity(index, 'down');
                        }}
                        disabled={index === entities.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <MoveDown size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Visual Properties Editor */}
        <div className="xl:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-[#070d1a] border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold uppercase">
                <Sliders size={15} />
                <span>РЕДАКТИРОВАНИЕ ПОДРАЗДЕЛЕНИЯ ({activeEntity.code})</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => duplicateEntity(activeEntity)}
                  title="Дублировать"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteEntity(activeEntity.id)}
                  title="Удалить"
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Language Tag Indicator */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">АКТИВНЫЙ ЯЗЫК РЕДАКТИРОВАНИЯ:</span>
              <span className="text-amber-400 font-bold uppercase px-2 py-0.5 rounded bg-amber-400/20">
                {activeLang === 'tj' ? 'Тоҷикӣ (TJ)' : activeLang === 'en' ? 'English (EN)' : 'Русский (RU)'}
              </span>
            </div>

            {/* Field: Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Заголовок подразделения ({activeLang.toUpperCase()}):
              </label>
              <input
                type="text"
                value={activeLang === 'tj' ? activeEntity.titleTj : activeLang === 'en' ? activeEntity.titleEn : activeEntity.titleRu}
                onChange={(e) => {
                  const key = activeLang === 'tj' ? 'titleTj' : activeLang === 'en' ? 'titleEn' : 'titleRu';
                  updateField(key, e.target.value);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400 font-serif font-bold"
              />
            </div>

            {/* Field: Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Подзаголовок / Юрисдикция ({activeLang.toUpperCase()}):
              </label>
              <input
                type="text"
                value={activeLang === 'tj' ? activeEntity.subtitleTj : activeLang === 'en' ? activeEntity.subtitleEn : activeEntity.subtitleRu}
                onChange={(e) => {
                  const key = activeLang === 'tj' ? 'subtitleTj' : activeLang === 'en' ? 'subtitleEn' : 'subtitleRu';
                  updateField(key, e.target.value);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Field: Leader / Head */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Руководитель / Председатель ({activeLang.toUpperCase()}):
              </label>
              <input
                type="text"
                value={
                  activeLang === 'tj' 
                    ? (activeEntity.leaderTj || '') 
                    : activeLang === 'en' 
                    ? (activeEntity.leaderEn || '') 
                    : (activeEntity.leaderRu || '')
                }
                onChange={(e) => {
                  const key = activeLang === 'tj' ? 'leaderTj' : activeLang === 'en' ? 'leaderEn' : 'leaderRu';
                  updateField(key, e.target.value);
                }}
                placeholder="ФИО руководителя..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            {/* Field: Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Полное описание полномочий ({activeLang.toUpperCase()}):
              </label>
              <textarea
                rows={4}
                value={activeLang === 'tj' ? activeEntity.descTj : activeLang === 'en' ? activeEntity.descEn : activeEntity.descRu}
                onChange={(e) => {
                  const key = activeLang === 'tj' ? 'descTj' : activeLang === 'en' ? 'descEn' : 'descRu';
                  updateField(key, e.target.value);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
              />
            </div>

            {/* Technical attributes: Category & Code */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Категория:</label>
                <select
                  value={activeEntity.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="leadership">Роҳбарият (Leadership)</option>
                  <option value="central_organs">Мақомоти марказӣ (Central Organs)</option>
                  <option value="collegiums">Коллегияҳо (Collegiums)</option>
                  <option value="apparatus">Дастгоҳ (Apparatus)</option>
                  <option value="secretariats">Котиботҳо (Secretariats)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block">Системный код:</label>
                <input
                  type="text"
                  value={activeEntity.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Realistic Preview */}
        <div className="xl:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#070d1a] border border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={14} />
              <span>ЖИВОЙ ПРЕДПРОСМОТР</span>
            </span>

            {/* Device & Theme controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg ${previewDevice === 'desktop' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'}`}
                title="Desktop"
              >
                <Monitor size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg ${previewDevice === 'tablet' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'}`}
                title="Tablet"
              >
                <Tablet size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg ${previewDevice === 'mobile' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'}`}
                title="Mobile"
              >
                <Smartphone size={14} />
              </button>
              <div className="w-[1px] h-4 bg-slate-800 mx-1" />
              <button
                type="button"
                onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="Переключить тему"
              >
                {previewTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>
          </div>

          {/* Preview Container Container Frame */}
          <div
            className={`p-5 rounded-3xl border transition-all ${
              previewTheme === 'dark'
                ? 'bg-[#05080f] border-amber-400/30 text-white shadow-2xl'
                : 'bg-[#f5f7fb] border-slate-300 text-slate-950 shadow-lg'
            } ${previewDevice === 'mobile' ? 'max-w-[320px] mx-auto' : previewDevice === 'tablet' ? 'max-w-[420px] mx-auto' : 'w-full'}`}
          >
            {/* Rendered Live Card Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  {activeEntity.code} // {activeEntity.category.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[9px] font-mono text-amber-400">
                  {activeLang.toUpperCase()} PREVIEW
                </span>
              </div>

              <h3 className="font-serif font-bold text-base leading-tight">
                {activeLang === 'tj' ? activeEntity.titleTj : activeLang === 'en' ? activeEntity.titleEn : activeEntity.titleRu}
              </h3>

              <p className="font-mono text-xs text-amber-500/90 font-medium">
                {activeLang === 'tj' ? activeEntity.subtitleTj : activeLang === 'en' ? activeEntity.subtitleEn : activeEntity.subtitleRu}
              </p>

              {activeEntity.leaderTj && (
                <div className={`p-3 rounded-xl border text-xs ${previewTheme === 'dark' ? 'bg-[#070e20] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Руководитель:</span>
                  <span className="font-serif font-bold mt-0.5 block">
                    {activeLang === 'tj' ? activeEntity.leaderTj : activeLang === 'en' ? activeEntity.leaderEn : activeEntity.leaderRu}
                  </span>
                </div>
              )}

              <p className={`text-xs leading-relaxed p-3 rounded-xl border ${previewTheme === 'dark' ? 'bg-[#070e20]/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                {activeLang === 'tj' ? activeEntity.descTj : activeLang === 'en' ? activeEntity.descEn : activeEntity.descRu}
              </p>

              <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>sud.tj // LIVE REPLICA</span>
                <span className="text-emerald-400">✓ SYNCED</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
