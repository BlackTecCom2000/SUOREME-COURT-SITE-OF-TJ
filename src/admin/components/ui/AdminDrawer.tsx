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
          bg-theme-surface text-theme-text border-theme-border shadow-2xl backdrop-blur-xl
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-theme-border bg-theme-bg/60">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-serif font-bold text-lg text-theme-text tracking-wide">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="font-sans text-xs text-theme-textSec mt-1 tracking-wide font-medium">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text hover:text-theme-gold hover:bg-theme-bg/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 text-theme-text">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-theme-border bg-theme-bg/60 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
