import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Newspaper,
  FileText,
  Gavel,
  Image,
  Send,
  Users,
  Settings,
  ShieldAlert,
  PlusCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      group: 'Быстрые действия',
      items: [
        {
          icon: <PlusCircle size={16} className="text-theme-gold" />,
          title: 'Создать новость',
          category: 'Контент',
          action: () => {
            navigate('/admin/news/new');
            onClose();
          },
        },
        {
          icon: <PlusCircle size={16} className="text-cyan-400" />,
          title: 'Добавить судебный акт',
          category: 'Акты',
          action: () => {
            navigate('/admin/acts?action=new');
            onClose();
          },
        },
        {
          icon: <PlusCircle size={16} className="text-emerald-400" />,
          title: 'Зарегистрировать суд',
          category: 'Суды',
          action: () => {
            navigate('/admin/courts?action=new');
            onClose();
          },
        },
      ],
    },
    {
      group: 'Разделы управления',
      items: [
        {
          icon: <LayoutDashboard size={16} />,
          title: 'Обзор системы',
          category: 'Главная',
          action: () => {
            navigate('/admin');
            onClose();
          },
        },
        {
          icon: <Newspaper size={16} />,
          title: 'Публикации и пресс-релизы',
          category: 'Контент',
          action: () => {
            navigate('/admin/news');
            onClose();
          },
        },
        {
          icon: <Gavel size={16} />,
          title: 'База судебных актов',
          category: 'Судебная информация',
          action: () => {
            navigate('/admin/acts');
            onClose();
          },
        },
        {
          icon: <FileText size={16} />,
          title: 'Судебная сеть и филиалы',
          category: 'Судебная система',
          action: () => {
            navigate('/admin/courts');
            onClose();
          },
        },
        {
          icon: <Send size={16} />,
          title: 'Обращения граждан',
          category: 'Сервисы',
          action: () => {
            navigate('/admin/appeals');
            onClose();
          },
        },
        {
          icon: <Image size={16} />,
          title: 'Медиа библиотека',
          category: 'Файлы',
          action: () => {
            navigate('/admin/media');
            onClose();
          },
        },
        {
          icon: <Users size={16} />,
          title: 'Пользователи и роли',
          category: 'Администрирование',
          action: () => {
            navigate('/admin/users');
            onClose();
          },
        },
        {
          icon: <ShieldAlert size={16} />,
          title: 'Журнал аудита безопасности',
          category: 'Безопасность',
          action: () => {
            navigate('/admin/audit');
            onClose();
          },
        },
        {
          icon: <Settings size={16} />,
          title: 'Системные настройки',
          category: 'Конфигурация',
          action: () => {
            navigate('/admin/settings');
            onClose();
          },
        },
      ],
    },
  ];

  const filteredGroups = actions
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (it) =>
          it.title.toLowerCase().includes(query.toLowerCase()) ||
          it.category.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/35 animate-fadeIn select-none">
      <div className="relative w-full max-w-xl glass glass-premium overflow-hidden flex flex-col">
        {/* Search Header — same as public */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--glass-border)] gap-3">
          <Search size={18} className="text-theme-gold shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите команду или раздел системы (напр. Новости, Акты, Суды)..."
            className="w-full bg-transparent text-theme-text font-sans text-sm placeholder-theme-textMuted focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-theme-textMuted hover:text-theme-text hover:bg-[var(--glass-surface-hover)] border border-transparent hover:border-[var(--glass-border-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[var(--glass-border)]/40">
          {filteredGroups.length === 0 ? (
            <div className="py-8 text-center text-theme-textMuted font-mono text-xs">
              Ничего не найдено по запросу "{query}"
            </div>
          ) : (
            filteredGroups.map((g, gIdx) => (
              <div key={gIdx} className="py-2 first:pt-0 last:pb-0">
                <div className="px-3 py-1 font-mono text-2xs uppercase tracking-wider text-theme-textMuted font-semibold">
                  {g.group}
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {g.items.map((it, idx) => (
                    <button
                      key={idx}
                      onClick={it.action}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-theme-bg/60 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3 text-theme-textSec group-hover:text-theme-text">
                        <span className="shrink-0 text-theme-textMuted group-hover:text-theme-gold transition-colors">
                          {it.icon}
                        </span>
                        <span className="font-sans text-sm font-medium">{it.title}</span>
                      </div>
                      <span className="font-mono text-2xs text-theme-textMuted uppercase px-2 py-0.5 rounded bg-theme-bg border border-theme-border">
                        {it.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-theme-border bg-theme-bg/60 text-[11px] font-mono text-theme-textMuted">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-theme-gold" />
            <span>COMMAND CONTROL</span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-theme-bg border border-theme-border text-theme-textSec">ESC</kbd> Закрыть
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-theme-bg border border-theme-border text-theme-textSec">↵</kbd> Выбрать
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
