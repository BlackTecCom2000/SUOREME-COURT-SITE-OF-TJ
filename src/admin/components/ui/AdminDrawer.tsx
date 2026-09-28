import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-xl',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`
          relative w-full ${width} h-full flex flex-col overflow-hidden text-left border-l
          bg-white/95 text-black border-slate-200 shadow-2xl backdrop-blur-xl
          dark:bg-[#071224]/95 dark:text-white dark:border-slate-800
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0a1120]">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-serif font-bold text-lg text-black dark:text-white tracking-wide">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="font-sans text-xs text-slate-800 dark:text-slate-300 mt-1 tracking-wide font-medium">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black hover:text-amber-600 dark:text-white dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 text-black dark:text-white">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0a1120]/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
