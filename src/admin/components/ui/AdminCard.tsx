import React from 'react';

interface AdminCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  hoverEffect?: boolean;
}

/**
 * One surface for the whole admin: the same liquid material the public
 * portal runs on, reading the same theme tokens. There is deliberately no
 * `dark:` branch and no local hex — the store projects the scheme onto the
 * document, so this card follows it automatically.
 */
export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        relative rounded-2xl p-5 sm:p-6
        text-left transition-all duration-300
        text-theme-text glass border border-theme-border
        ${hoverEffect ? 'hover:border-theme-borderHover hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Corner accent, themed instead of a fixed amber */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
        <div
          className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2"
          style={{ borderColor: 'color-mix(in srgb, var(--accent-gold) 45%, transparent)' }}
        />
      </div>

      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-theme-border">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h3 className="font-serif font-bold text-lg text-theme-text tracking-wide">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="font-mono text-xs text-theme-textSec mt-0.5 uppercase tracking-wider">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
