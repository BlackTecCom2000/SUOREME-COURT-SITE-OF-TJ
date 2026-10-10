import React from 'react';

export type AdminBadgeVariant = 'draft' | 'pending' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'scheduled' | 'archived' | 'new' | 'active' | 'inactive' | 'error' | 'role';

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
    draft: 'bg-theme-bg text-theme-textSec border-theme-border',
pending: 'bg-theme-gold/15 text-theme-gold border-theme-gold/30',
  pending_review: 'bg-theme-gold/15 text-theme-gold border-theme-gold/30',
    approved: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
    rejected: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    published: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    scheduled: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
    archived: 'bg-theme-bg text-theme-textMuted border-theme-border',
    new: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40 animate-pulse',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    inactive: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    error: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40',
    role: 'bg-theme-gold/10 text-theme-gold border-theme-gold/30 font-serif',
  }[variant];

  const sizeStyles = {
    sm: 'text-2xs px-2 py-0.5 font-mono uppercase tracking-wider',
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
