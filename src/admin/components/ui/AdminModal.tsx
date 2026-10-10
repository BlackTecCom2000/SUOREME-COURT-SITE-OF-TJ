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
          bg-theme-surface border border-theme-border text-theme-text shadow-2xl backdrop-blur-xl
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-theme-border bg-theme-bg/60">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-serif font-bold text-xl text-theme-text tracking-wide">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="font-sans text-xs text-theme-textSec mt-1 tracking-wide">{subtitle}</p>
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
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-theme-text min-w-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-theme-border bg-theme-bg/60 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
