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
        relative rounded-2xl p-5 sm:p-6
        text-left transition-all duration-300
        text-black dark:text-white
        bg-white/92 dark:bg-[#071224]/92
        border border-slate-200/90 dark:border-slate-800/80
        backdrop-blur-xl
        shadow-md dark:shadow-2xl
        ${hoverEffect ? 'hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Corner Tech Accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/40 dark:border-amber-400/30" />
      </div>

      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-serif font-bold text-lg text-black dark:text-white tracking-wide">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="font-mono text-xs text-slate-800 dark:text-slate-300 mt-0.5 uppercase tracking-wider">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
