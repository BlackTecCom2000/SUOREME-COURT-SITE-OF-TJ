import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
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
  if (typeof document === 'undefined') return null;

  const overlay = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm animate-fadeIn select-none overflow-y-auto admin-portal-modal">
      <div
        className={`
          relative w-full ${maxWidth} my-auto flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden text-left min-w-0 rounded-2xl
          bg-white/95 border border-slate-200/90 text-black shadow-2xl backdrop-blur-xl
          dark:bg-[#071224]/95 dark:border-slate-800/80 dark:text-white
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-serif font-bold text-xl text-black dark:text-white tracking-wide">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="font-sans text-xs text-slate-800 dark:text-slate-300 mt-1 tracking-wide">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black hover:text-amber-600 dark:text-white dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-black dark:text-white min-w-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
