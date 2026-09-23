import React from 'react';

// Portal badge — same prop API as AdminBadge, styled with theme tokens + DS scale.
export type BadgeVariant =
  | 'draft'
  | 'pending'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'scheduled'
  | 'archived'
  | 'neutral'
  | 'gold'
  | 'success'
  | 'warn'
  | 'danger'
  | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  label?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

const styles: Record<BadgeVariant, string> = {
  draft: 'bg-theme-surface text-theme-textMuted border-theme-border',
  pending: 'bg-theme-gold/15 text-theme-gold border-theme-gold/30',
  pending_review: 'bg-theme-gold/15 text-theme-gold border-theme-gold/30',
  approved: 'bg-theme-digital/15 text-theme-digital border-theme-digital/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  published: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  scheduled: 'bg-theme-digital/15 text-theme-digital border-theme-digital/30',
  archived: 'bg-theme-surface text-theme-textMuted border-theme-border',
  neutral: 'bg-theme-surface text-theme-textMuted border-theme-border',
  gold: 'bg-theme-gold/15 text-theme-gold border-theme-gold/40',
  success: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  warn: 'bg-theme-gold/15 text-theme-gold border-theme-gold/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-theme-digital/15 text-theme-digital border-theme-digital/30',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', label, children, size = 'sm' }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border font-semibold select-none backdrop-blur-md ${styles[variant]} ${
      size === 'sm'
        ? 'text-[10px] px-2 py-0.5 font-mono uppercase tracking-wider'
        : 'text-xs px-2.5 py-1 font-mono uppercase tracking-wider'
    }`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
    {label || children}
  </span>
);
