import React from 'react';

export interface AdminTabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

interface AdminTabsProps {
  tabs: AdminTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-theme-surface border border-theme-border shadow-sm backdrop-blur-md overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider
              transition-all duration-200 select-none whitespace-nowrap
              ${
                isActive
                ? 'bg-theme-gold text-theme-bg font-bold shadow-md'
                : 'text-theme-text font-semibold hover:bg-theme-bg/60'
              }
            `}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`
                  px-1.5 py-0.2 rounded-full text-2xs font-bold
                  ${isActive ? 'bg-black text-amber-300' : 'bg-theme-bg/60 text-theme-text'}
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
