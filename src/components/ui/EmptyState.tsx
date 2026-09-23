import React from 'react';
import { FolderOpen } from 'lucide-react';

// Portal empty state — same prop API as AdminEmptyState, theme tokens.
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center gap-3 py-12 px-6 text-center rounded-2xl border border-dashed border-theme-border">
    <span className="p-3 rounded-2xl border border-theme-gold/30 bg-theme-gold/10 text-theme-gold">
      {icon || <FolderOpen size={22} />}
    </span>
    <p className="font-serif font-bold text-theme-text">{title}</p>
    {description && <p className="max-w-sm text-xs text-theme-textMuted leading-relaxed">{description}</p>}
    {actionLabel && onAction && (
      <button type="button" onClick={onAction} className="btn-primary mt-1">
        {actionLabel}
      </button>
    )}
  </div>
);
