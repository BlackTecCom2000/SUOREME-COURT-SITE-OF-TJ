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
} from 'lucide-react';
import { NationalEmblem } from '../../components/judicial-ecosystem/NationalEmblem';

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
      ],
    },
    {
      title: 'Контент & Медиа',
      items: [
        {
          icon: Newspaper,
          label: 'Публикации',
          path: '/admin/news',
        },
        {
          icon: Image,
          label: 'Медиатека',
          path: '/admin/media',
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
        },
        {
          icon: Landmark,
          label: 'Судебная сеть',
          path: '/admin/courts',
        },
        {
          icon: Calculator,
          label: 'Госпошлина (Тарифы)',
          path: '/admin/duty',
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
        },
      ],
    },
  ];

  return (
    <aside
      className={`
        h-full bg-[#040813] border-r border-slate-800/80 flex flex-col justify-between
        transition-all duration-300 select-none z-40
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* 1. Header / Supreme Court Brand */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 drop-shadow-[0_0_8px_rgba(223,190,126,0.3)]">
            <NationalEmblem size={isCollapsed ? 32 : 36} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left overflow-hidden">
              <span className="font-serif font-bold text-xs text-[#e8c679] leading-tight tracking-wider uppercase truncate">
                СУДИ ОЛИИ ҶТ
              </span>
              <span className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">
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
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold text-left">
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
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-500/5 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:bg-slate-900/60'
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

      {/* 3. Footer System Telemetry Status */}
      <div className="p-3 border-t border-slate-800/80 bg-[#02050e]">
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
