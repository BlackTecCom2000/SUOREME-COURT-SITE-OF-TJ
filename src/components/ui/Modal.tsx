import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Portal modal — same prop API as AdminModal, theme glass.
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  footer,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidth} my-auto max-h-[90dvh] flex flex-col rounded-3xl border border-theme-border bg-theme-surface shadow-2xl overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-theme-border bg-theme-bg/60">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h2 className="font-serif font-bold text-lg text-theme-text leading-snug">{title}</h2>
            ) : (
              title
            )}
            {subtitle && <p className="mt-0.5 text-xs text-theme-textMuted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg border border-theme-border text-theme-textMuted hover:text-theme-text hover:border-theme-gold/50 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-theme-border bg-theme-bg/60">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
