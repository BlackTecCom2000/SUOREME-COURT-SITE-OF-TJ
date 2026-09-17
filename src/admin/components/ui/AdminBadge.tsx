import React from 'react';

export type AdminBadgeVariant = 'draft' | 'pending' | 'published' | 'scheduled' | 'archived' | 'new' | 'active' | 'inactive' | 'error' | 'role';

interface AdminBadgeProps {
  variant?: AdminBadgeVariant;
  label?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  variant = 'draft',
  label,
  children,
  size = 'sm',
}) => {
  const content = label || children;

  const variantStyles = {
    draft: 'bg-slate-800 text-slate-300 border-slate-700',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    scheduled: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    archived: 'bg-slate-800/80 text-slate-400 border-slate-700',
    new: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse',
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    inactive: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    error: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    role: 'bg-amber-500/10 text-amber-200 border-amber-500/30 font-serif',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-mono uppercase tracking-wider',
  }[size];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-semibold select-none
        ${variantStyles}
        ${sizeStyles}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {content}
    </span>
  );
};
