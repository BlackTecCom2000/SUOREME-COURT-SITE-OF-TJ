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
    <div className="w-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#070d1a]/50">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/5">
        {icon || <FolderOpen size={28} />}
      </div>
      <h4 className="font-serif font-bold text-base text-white">{title}</h4>
      {description && (
        <p className="font-mono text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
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
