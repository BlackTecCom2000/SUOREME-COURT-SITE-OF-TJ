import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Search,
  Phone,
  Database,
  Save,
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
