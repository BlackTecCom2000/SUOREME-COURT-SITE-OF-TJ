import React, { useState, useRef, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LogOut, ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeReveal } from "../../hooks/useThemeReveal";
import { motion } from 'motion/react';

export const AdminProfileMenu: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const { language, setLanguage } = useLanguage();
  const { isDark, revealToggle } = useThemeReveal();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabel = ({
    super_admin: 'Главный Администратор',
    admin: 'Администратор',
    administrator: 'Администратор системы',
    editor: 'Редактор контента',
    publisher: 'Издатель',
    court_manager: 'Куратор судебной сети',
    content_manager: 'Менеджер контента',
    reviewer: 'Рецензент',
    viewer: 'Наблюдатель',
  } as Record<string, string>)[user?.role || 'editor'] || user?.role || 'editor';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-theme-border bg-theme-surface hover:border-amber-400/40 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-theme-gold to-theme-gold/80 text-theme-bg font-serif font-bold text-sm flex items-center justify-center shadow-md">
          {user?.name?.[0] || 'A'}
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-theme-text leading-tight truncate max-w-[120px]">
            {user?.name || 'Administrator'}
          </span>
          <span className="text-2xs font-mono text-theme-gold uppercase tracking-wider">
            {user?.role || 'super_admin'}
          </span>
        </div>
          <ChevronDown size={14} className="text-theme-textMuted ml-1" />
        </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-amber-400/30 bg-theme-surface shadow-2xl shadow-black/90 p-3 z-50 animate-fadeIn text-left">
          {/* User Info Header */}
          <div className="p-2 pb-3 border-b border-theme-border">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-theme-gold" />
              <span className="font-mono text-2xs font-bold text-theme-gold uppercase tracking-wider">
                {roleLabel}
              </span>
            </div>
            <p className="font-serif font-bold text-sm text-theme-text truncate">{user?.name}</p>
            <p className="font-mono text-[11px] text-theme-textMuted truncate">{user?.email}</p>
          </div>

          {/* Quick Settings Switchers */}
          <div className="py-2.5 border-b border-theme-border space-y-2">
            {/* Language Switcher */}
            <div className="flex items-center justify-between px-2 text-xs text-theme-textSec">
              <span className="font-mono text-[11px] text-theme-textMuted">Язык</span>
              <div className="relative flex items-center gap-1 font-mono text-[11px] bg-theme-bg/60 p-0.5 rounded-lg border border-theme-border">
                {(['ru', 'tj', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`relative px-2 py-0.5 rounded uppercase transition-colors z-10 ${
                      language === lang ? 'text-slate-950 font-bold' : 'text-theme-textMuted hover:text-theme-text'
                    }`}
                  >
                    {language === lang && (
                      <motion.div
                        layoutId="activeAdminProfileLangPill"
                        className="absolute inset-0 bg-theme-gold rounded shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span>{lang}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="flex items-center justify-between px-2 text-xs text-theme-textSec">
              <span className="font-mono text-[11px] text-theme-textMuted">Тема</span>
              <button
                onClick={() => revealToggle()}
                className="px-2 py-0.5 rounded bg-theme-bg border border-theme-border text-theme-textSec font-mono text-2xs hover:bg-theme-bg/60"
              >
                {isDark ? 'ТЕМНАЯ (НОЧЬ)' : 'СВЕТЛАЯ (ДЕНЬ)'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-theme-textSec hover:text-theme-text hover:bg-theme-bg/60 transition-colors"
            >
              <span>Открыть портал</span>
              <ExternalLink size={14} className="text-theme-textMuted" />
            </a>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut size={14} />
              <span>Завершить сессию (Выйти)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
