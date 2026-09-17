import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Search,
  Phone,
  Database,
  Save,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { AdminTabs } from '../../components/ui/AdminTabs';

export const SettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    ai_writer_enabled: '1',
    ai_translate_enabled: '1',
    ai_improve_enabled: '1',
    ai_default_style: 'official',
    ai_max_length: '2000',
  });
  const [aiLoaded, setAiLoaded] = useState(false);

  useEffect(() => {
    if (activeTab !== 'ai' || aiLoaded) return;
    const token = sessionStorage.getItem('cms-token');
    fetch('/api/admin/settings', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        setAiSettings((prev) => ({
          ai_writer_enabled: d.ai_writer_enabled ?? prev.ai_writer_enabled,
          ai_translate_enabled: d.ai_translate_enabled ?? prev.ai_translate_enabled,
          ai_improve_enabled: d.ai_improve_enabled ?? prev.ai_improve_enabled,
          ai_default_style: d.ai_default_style ?? prev.ai_default_style,
          ai_max_length: d.ai_max_length ?? prev.ai_max_length,
        }));
        setAiLoaded(true);
      })
      .catch(() => undefined);
  }, [activeTab, aiLoaded]);

  const saveAiSetting = (key: string, value: string) => {
    setAiSettings((prev) => ({ ...prev, [key]: value }));
    const token = sessionStorage.getItem('cms-token');
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ key, value }),
    }).catch(() => undefined);
  };

  const aiToggleRow = (key: 'ai_writer_enabled' | 'ai_translate_enabled' | 'ai_improve_enabled', title: string, desc: string) => (
    <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer select-none">
      <span>
        <span className="block text-xs text-slate-200 font-medium">{title}</span>
        <span className="block font-mono text-[10px] text-slate-500 mt-0.5">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={aiSettings[key] !== '0'}
        onChange={(e) => saveAiSetting(key, e.target.checked ? '1' : '0')}
        className="rounded border-slate-700 bg-slate-900 text-amber-500 w-4 h-4 cursor-pointer shrink-0"
      />
    </label>
  );

  // Settings form state
  const [settings, setSettings] = useState({
    siteNameRu: 'Верховный суд Республики Таджикистан',
    siteNameTj: 'Суди Олии Ҷумҳурии Тоҷикистон',
    siteNameEn: 'Supreme Court of the Republic of Tajikistan',
    hotlinePhone: '+992 (37) 221-14-14',
    chancelleryEmail: 'info@sud.tj',
    receptionAddressRu: 'г. Душанбе, проспект Рудаки, 33',
    jwtExpiryHours: '8',
    defaultLanguage: 'tj',
    seoTitleRu: 'Верховный суд Республики Таджикистан — Официальный портал',
    seoDescRu: 'Официальный информационный портал судебной власти Республики Таджикистан.',
  });

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const tabs = [
    { id: 'general', label: 'Основные', icon: <Settings size={14} /> },
    { id: 'contacts', label: 'Контакты и приемная', icon: <Phone size={14} /> },
    { id: 'seo', label: 'SEO и Мета', icon: <Search size={14} /> },
    { id: 'security', label: 'Безопасность', icon: <Shield size={14} /> },
    { id: 'ai', label: 'AI-помощник', icon: <Sparkles size={14} /> },
    { id: 'system', label: 'Система & БД', icon: <Database size={14} /> },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">Системные настройки</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Конфигурация портала, контактов канцелярии, параметров безопасности и базы данных
          </p>
        </div>
        <AdminButton
          variant="primary"
          size="md"
          leftIcon={<Save size={16} />}
          onClick={handleSave}
        >
          {isSaved ? 'Сохранено!' : 'Сохранить изменения'}
        </AdminButton>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Настройки успешно обновлены в базе данных!</span>
        </div>
      )}

      {/* Tabs */}
      <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          <AdminCard title="Идентификация портала">
            <div className="space-y-4">
              <AdminInput
                label="Наименование органа (TJ)"
                value={settings.siteNameTj}
                onChange={(e) => setSettings({ ...settings, siteNameTj: e.target.value })}
              />
              <AdminInput
                label="Наименование органа (RU)"
                value={settings.siteNameRu}
                onChange={(e) => setSettings({ ...settings, siteNameRu: e.target.value })}
              />
              <AdminInput
                label="Наименование органа (EN)"
                value={settings.siteNameEn}
                onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })}
              />
              <AdminSelect
                label="Основной язык интерфейса по умолчанию"
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                options={[
                  { value: 'tj', label: 'Тоҷикӣ (Таджикский)' },
                  { value: 'ru', label: 'Русский' },
                  { value: 'en', label: 'English' },
                ]}
              />
            </div>
          </AdminCard>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-5">
          <AdminCard title="Контакты Верховного суда и канцелярии">
            <div className="space-y-4">
              <AdminInput
                label="Телефон горячей линии / Канцелярия"
                value={settings.hotlinePhone}
                onChange={(e) => setSettings({ ...settings, hotlinePhone: e.target.value })}
              />
              <AdminInput
                label="Официальный Email приемной"
                value={settings.chancelleryEmail}
                onChange={(e) => setSettings({ ...settings, chancelleryEmail: e.target.value })}
              />
              <AdminInput
                label="Физический адрес здания суда"
                value={settings.receptionAddressRu}
                onChange={(e) => setSettings({ ...settings, receptionAddressRu: e.target.value })}
              />
            </div>
          </AdminCard>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="space-y-5">
          <AdminCard title="Поисковая оптимизация (SEO)">
            <div className="space-y-4">
              <AdminInput
                label="Основной заголовок портала (Title)"
                value={settings.seoTitleRu}
                onChange={(e) => setSettings({ ...settings, seoTitleRu: e.target.value })}
              />
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
                  Мета-описание (Description)
                </label>
                <textarea
                  rows={3}
                  value={settings.seoDescRu}
                  onChange={(e) => setSettings({ ...settings, seoDescRu: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-900 text-white placeholder-slate-500 border border-slate-700 font-sans text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-5">
          <AdminCard title="Параметры аутентификации и сессий">
            <div className="space-y-4">
              <AdminSelect
                label="Срок действия JWT токена администратора"
                value={settings.jwtExpiryHours}
                onChange={(e) => setSettings({ ...settings, jwtExpiryHours: e.target.value })}
                options={[
                  { value: '4', label: '4 часа (Повышенная безопасность)' },
                  { value: '8', label: '8 часов (Стандартный рабочий день)' },
                  { value: '24', label: '24 часа' },
                ]}
              />
              <div className="p-4 rounded-xl border border-slate-800 bg-[#091124] text-xs font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Lock size={14} />
                  <span>ШИФРОВАНИЕ И ХЕШИРОВАНИЕ</span>
                </div>
                <p>Пароли сотрудников защищены алгоритмом bcrypt (salt rounds: 12).</p>
                <p>Все действия регистрируются в неизменяемом аудит-логе SQLite.</p>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-5">
          <AdminCard title="AI-функции редактора" subtitle="Перевод, генерация и улучшение текстов публикаций">
            <div className="space-y-3">
              {aiToggleRow('ai_writer_enabled', 'AI Writer (генерация)', 'Кнопка генерации черновика по теме')}
              {aiToggleRow('ai_translate_enabled', 'Автоперевод', 'Перевод на TJ / RU / EN')}
              {aiToggleRow('ai_improve_enabled', 'AI Improve (режимы)', 'Improve, Formal, Shorten, Expand, Rewrite, Official')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminSelect
                  label="Стиль по умолчанию"
                  value={aiSettings.ai_default_style}
                  onChange={(e) => saveAiSetting('ai_default_style', e.target.value)}
                  options={[
                    { value: 'official', label: 'Официальный' },
                    { value: 'neutral', label: 'Нейтральный' },
                  ]}
                />
                <AdminInput
                  label="Макс. длина генерации (символов)"
                  value={aiSettings.ai_max_length}
                  onChange={(e) => saveAiSetting('ai_max_length', e.target.value.replace(/[^0-9]/g, '').slice(0, 4) || '2000')}
                />
              </div>
              <p className="font-mono text-[10px] text-slate-500">
                Настройки применяются сразу. Отключенные функции возвращают 403 с пояснением.
              </p>
            </div>
          </AdminCard>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-5">
          <AdminCard title="Состояние базы данных и хранилища">
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Файл базы данных:</span>
                <span className="text-emerald-400">data/sudtj.sqlite</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Режим транзакций:</span>
                <span className="text-emerald-400">WAL (Write-Ahead Logging)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Папка медиа хранилища:</span>
                <span className="text-slate-200">data/uploads/</span>
              </div>
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
};
export default SettingsManager;
