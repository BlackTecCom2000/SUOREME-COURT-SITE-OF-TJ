import React from 'react';

interface AdminCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  hoverEffect?: boolean;
}

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
        relative rounded-2xl border border-slate-800 bg-[#070d1a]/90 backdrop-blur-xl p-5 sm:p-6
        shadow-xl shadow-black/40 text-left transition-all duration-300
        ${hoverEffect ? 'hover:border-amber-400/40 hover:shadow-amber-500/5 hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Corner Tech Accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400/30" />
      </div>

      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-serif font-bold text-lg text-white tracking-wide">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="font-mono text-xs text-slate-400 mt-0.5 uppercase tracking-wider">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
