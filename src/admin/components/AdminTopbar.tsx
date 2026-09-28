import React from 'react';
import { Search, Menu } from 'lucide-react';
import { AdminNotificationMenu } from './AdminNotificationMenu';
import { AdminProfileMenu } from './AdminProfileMenu';
import { useLocation } from 'react-router-dom';

interface AdminTopbarProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onOpenMobileMenu,
  onOpenCommandPalette,
}) => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Обзор системы';
    if (path.startsWith('/admin/news/new')) return 'Новая публикация';
    if (path.startsWith('/admin/news')) return 'Публикации и пресс-релизы';
    if (path.startsWith('/admin/acts')) return 'База судебных актов';
    if (path.startsWith('/admin/courts')) return 'Судебная сеть Таджикистана';
    if (path.startsWith('/admin/duty')) return 'Калькулятор госпошлины';
    if (path.startsWith('/admin/appeals')) return 'Обращения граждан';
    if (path.startsWith('/admin/media')) return 'Медиатека';
    if (path.startsWith('/admin/users')) return 'Пользователи и права';
    if (path.startsWith('/admin/audit')) return 'Журнал аудита действий';
    if (path.startsWith('/admin/settings')) return 'Системные настройки';
    return 'Управление';
  };

  return (
    <header className="admin-topbar sticky top-0 px-4 sm:px-6 glass-navigation flex items-center justify-between gap-4 z-30 select-none !rounded-none border-b">
      {/* Left: Mobile Menu Trigger & Breadcrumb Title */}
      <div className="flex items-center gap-3 overflow-hidden text-left min-w-0 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-black dark:text-white hover:bg-slate-200/60 dark:hover:bg-[var(--glass-surface-hover)] border border-transparent"
          aria-label="Открыть меню"
        >
          <Menu size={20} />
        </button>

        <div className="admin-topbar-titles flex flex-col">
          <div className="admin-topbar-crumbs flex items-center gap-2 text-xs font-mono text-black dark:text-white font-medium">
            <span>SUD.TJ</span>
            <span>/</span>
            <span className="text-amber-700 dark:text-[var(--court-gold)] font-bold uppercase">CONTROL CENTER</span>
          </div>
          <h1 className="font-serif font-bold text-base sm:text-lg text-black dark:text-white leading-tight truncate">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      {/* Center/Right: Quick Command Search, Notifications, Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-[var(--glass-border)] bg-white/90 dark:bg-slate-900/70 text-black dark:text-white hover:border-amber-500 transition-all text-xs font-mono shadow-sm"
        >
          <Search size={14} className="text-amber-600 dark:text-[var(--court-gold)]" />
          <span>Быстрый поиск / команды</span>
          <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-2xs text-black dark:text-white font-bold">
            Ctrl + K
          </kbd>
        </button>

        {/* Mobile Search Icon Button */}
        <button
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 rounded-xl border border-slate-300 dark:border-[var(--glass-border)] bg-white/90 dark:bg-slate-900/70 text-black dark:text-white"
          aria-label="Поиск"
        >
          <Search size={18} />
        </button>

        {/* Notifications Dropdown */}
        <AdminNotificationMenu />

        {/* User Profile Dropdown */}
        <AdminProfileMenu />
      </div>
    </header>
  );
};
