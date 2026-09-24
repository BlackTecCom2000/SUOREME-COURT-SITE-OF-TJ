import React from 'react';

// Portal card — same prop API as AdminCard, theme glass surface.
interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  hoverEffect?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  hoverEffect = false,
  className = '',
}) => (
  <section
    className={`glass glass-card p-5 sm:p-6 ${
      hoverEffect ? 'hover:border-theme-gold/50' : ''
    } ${className}`}
  >
    {(title || headerAction) && (
      <header className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-theme-border/60">
        <div className="min-w-0">
          {typeof title === 'string' ? (
            <h3 className="font-serif font-bold text-theme-text leading-snug">{title}</h3>
          ) : (
            title
          )}
          {subtitle && <p className="mt-1 text-xs text-theme-textMuted leading-relaxed">{subtitle}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </header>
    )}
    {children}
  </section>
);
