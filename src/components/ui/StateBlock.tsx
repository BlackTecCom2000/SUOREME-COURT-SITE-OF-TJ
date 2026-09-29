import React from 'react';
import { AlertTriangle, FolderOpen, Inbox, RefreshCw } from 'lucide-react';

/**
 * Shared state block for loading / empty / error.
 *
 * The platform had ad-hoc "no data" text in three or four places and no
 * consistent loading treatment. This is the single component both the public
 * portal and the Control Center use, so every list behaves the same way and
 * assistive technology is told what is happening.
 *
 * - loading: `role="status"` + `aria-busy`, with a skeleton that is hidden from
 *   the accessibility tree
 * - empty:   announced as a status, not an error
 * - error:   `role="alert"`, states what failed, and offers a retry only when a
 *            handler is supplied (no dead controls)
 */

type Tone = 'loading' | 'empty' | 'error';

export interface StateBlockProps {
  tone: Tone;
  title?: string;
  description?: string;
  /** number of skeleton rows to draw while loading */
  rows?: number;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const DEFAULTS: Record<Tone, { title: string; description: string }> = {
  loading: { title: 'Загрузка', description: '' },
  empty: { title: 'Пока нет данных', description: '' },
  error: { title: 'Не удалось загрузить', description: 'Попробуйте обновить страницу.' },
};

export const StateBlock: React.FC<StateBlockProps> = ({
  tone,
  title,
  description,
  rows = 3,
  actionLabel,
  onAction,
  className = '',
}) => {
  const fb = DEFAULTS[tone];

  if (tone === 'loading') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={`flex flex-col gap-3 py-10 ${className}`}
      >
        <span className="sr-only">{title || fb.title}</span>
        <div aria-hidden="true" className="flex flex-col gap-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-11 rounded-xl border border-theme-border/60 bg-theme-surface/50 animate-pulse"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const Icon = tone === 'error' ? AlertTriangle : tone === 'empty' ? Inbox : FolderOpen;
  const heading = title || fb.title;
  const body = description ?? fb.description;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed border-theme-border px-6 py-12 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className={`rounded-2xl border p-3 ${
          tone === 'error'
            ? 'border-red-500/30 bg-red-500/10 text-red-400'
            : 'border-theme-gold/30 bg-theme-gold/10 text-theme-gold'
        }`}
      >
        <Icon size={22} />
      </span>
      <p className="lg-vibrant text-md font-semibold text-theme-text">{heading}</p>
      {body && <p className="lg-vibrant max-w-sm text-sm leading-relaxed text-theme-textMuted">{body}</p>}
      {/* A control is only rendered when it can actually do something. */}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-secondary mt-1">
          {tone === 'error' && <RefreshCw size={15} aria-hidden="true" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default StateBlock;
