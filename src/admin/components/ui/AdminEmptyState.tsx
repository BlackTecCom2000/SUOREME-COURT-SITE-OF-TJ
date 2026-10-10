import React from 'react';
import { FolderOpen } from 'lucide-react';
import { AdminButton } from './AdminButton';

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-theme-border bg-theme-bg/60">
      <div className="w-14 h-14 rounded-2xl bg-theme-gold/10 border border-theme-gold/20 text-theme-gold flex items-center justify-center mb-4 shadow-lg shadow-theme-gold/5">
        {icon || <FolderOpen size={28} />}
      </div>
      <h4 className="font-serif font-bold text-base text-theme-text">{title}</h4>
      {description && (
        <p className="font-sans text-xs text-theme-textSec max-w-sm mt-1 mb-4 leading-relaxed font-medium">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <AdminButton variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
};
