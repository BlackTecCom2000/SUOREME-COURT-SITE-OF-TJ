import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Gavel,
  Landmark,
  Image,
  Send,
  Users,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Layers,
  LibraryBig,
  Brain,
  Link2,
  PanelsTopLeft,
} from 'lucide-react';
import { NationalEmblem } from '../../components/judicial-ecosystem/NationalEmblem';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  icon: any;
  label: string;
  path: string;
  exact?: boolean;
  // SEC-01: any-of permission required to SEE this item (backend still enforces).
  anyOf?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { hasPerm } = useAdminAuth();
  const visible = (item: NavItem) =>
    !item.anyOf || item.anyOf.length === 0 || item.anyOf.some((p) => hasPerm(p));
  const navigationGroups: NavGroup[] = [
    {
      title: 'Управление',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Обзор системы',
          path: '/admin',
          exact: true,
        },
        {
          icon: PanelsTopLeft,
          label: 'Визуальный конструктор',
          path: '/admin/site-builder',
          anyOf: ['content.edit', 'settings.manage'],
        },
      ],
    },
    {
      title: 'Контент & Медиа',
      items: [
        {
          icon: Newspaper,
          label: 'Публикации',
          path: '/admin/news',
          anyOf: ['content.create', 'content.edit', 'content.review', 'content.approve', 'content.publish'],
        },
        {
          icon: Image,
          label: 'Медиатека',
          path: '/admin/media',
          anyOf: ['media.manage'],
        },
        {
          icon: Link2,
          label: 'Полезные сайты',
          path: '/admin/useful',
          anyOf: ['content.edit', 'settings.manage'],
        },
      ],
    },
    {
      title: 'Судебная власть',
      items: [
        {
          icon: Gavel,
          label: 'Судебные акты',
          path: '/admin/acts',
          anyOf: ['acts.manage'],
        },
        {
          icon: LibraryBig,
          label: 'Книги и библиотека',
          path: '/admin/books',
          anyOf: ['library.manage'],
        },
        {
          icon: Landmark,
          label: 'Судебная сеть (Судҳо)',
          path: '/admin/courts',
          anyOf: ['courts.manage'],
        },
        {
          icon: Layers,
          label: 'Сохтори Суди Олӣ (Редактор)',
          path: '/admin/structure-editor',
          anyOf: ['content.edit'],
        },
        {
          icon: Calculator,
          label: 'Госпошлина (Тарифы)',
          path: '/admin/duty',
          anyOf: ['settings.manage'],
        },
      ],
    },
    {
      title: 'Сервисы & Граждане',
      items: [
        {
          icon: Send,
          label: 'Обращения граждан',
          path: '/admin/appeals',
          anyOf: ['appeals.manage'],
        },
      ],
    },
    {
      title: 'Администрирование',
      items: [
        {
          icon: Users,
          label: 'Пользователи и роли',
          path: '/admin/users',
          anyOf: ['users.manage'],
        },
        {
          icon: ShieldCheck,
          label: 'Журнал аудита',
          path: '/admin/audit',
        },
        {
          icon: Settings,
          label: 'Системные настройки',
          path: '/admin/settings',
          anyOf: ['settings.manage'],
        },
        {
          icon: Brain,
          label: 'AI · База знаний',
          path: '/admin/ai',
          anyOf: ['ai.manage'],
        },
      ],
    },
  ];

  return (
    <aside
      className={`
        admin-sidebar ${isCollapsed ? 'is-collapsed' : ''}
        glass select-none z-40 border-r !rounded-none
      `}
      style={{ borderColor: 'var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}
    >
      {/* Header — same GlassNavigation as public site */}
      <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 drop-shadow-[0_0_8px_rgba(223,190,126,0.3)]">
            <NationalEmblem size={isCollapsed ? 32 : 36} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left overflow-hidden">
              <span className="font-serif font-bold text-xs text-[#e8c679] leading-tight tracking-wider uppercase truncate">
                СУДИ ОЛИИ ҶТ
              </span>
              <span className="font-mono text-[9px] text-theme-textMuted tracking-widest uppercase">
                CONTROL CENTER
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* 2. Navigation Groups */}
      <div className="admin-sidebar-nav p-3 space-y-5">
        {navigationGroups
          .map((group) => ({ ...group, items: group.items.filter(visible) }))
          .filter((group) => group.items.length > 0)
          .map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-theme-textMuted font-bold text-left">
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-medium
                  transition-all duration-200 group relative
                  ${
                    isActive
                      ? 'bg-[var(--court-gold)]/15 text-[var(--court-gold)] border border-[var(--court-gold)]/30 shadow-[var(--glass-shadow)] font-semibold'
                      : 'text-theme-textSec hover:text-theme-text hover:bg-[var(--glass-surface-hover)] hover:border-[var(--glass-border-hover)] border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  size={17}
                  className="shrink-0 transition-transform group-hover:scale-110"
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer — same glass, no dark */}
      <div className="p-3 border-t border-[var(--glass-border)] bg-transparent">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 uppercase">SECURE NODE</span>
            </div>
            <span>v2.6.4</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="SECURE NODE • ACTIVE" />
          </div>
        )}
      </div>
    </aside>
  );
};
