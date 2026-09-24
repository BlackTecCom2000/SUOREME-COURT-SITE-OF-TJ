import React from 'react';

// Portal tabs — same prop API as AdminTabs, theme tokens.
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => (
  <div
    role="tablist"
    className={`inline-flex max-w-full items-center gap-1 p-1 glass glass-chip overflow-x-auto ${className}`}
  >
    {tabs.map((t) => {
      const active = t.id === activeTab;
      return (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(t.id)}
          className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
            active
              ? 'bg-theme-gold text-black font-bold'
              : 'text-theme-textMuted hover:text-theme-text hover:bg-white/10'
          }`}
        >
          {t.icon}
          <span>{t.label}</span>
          {typeof t.count === 'number' && (
            <span
              className={`px-1.5 rounded-full text-[10px] ${active ? 'bg-black/20' : 'bg-theme-bg text-theme-textMuted'}`}
            >
              {t.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
