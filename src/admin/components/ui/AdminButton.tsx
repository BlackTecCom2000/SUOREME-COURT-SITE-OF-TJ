import React from 'react';
import { Loader2 } from 'lucide-react';

export type AdminButtonVariant = 'primary' | 'secondary' | 'digital' | 'ghost' | 'danger' | 'outline';
export type AdminButtonSize = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-11 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-11 px-4 text-sm gap-2 rounded-xl',
    lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-md hover:from-amber-400 hover:to-amber-500 border border-amber-400/60 active:scale-[0.98]',
    secondary:
      'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98]',
    digital:
      'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md hover:from-sky-400 hover:to-blue-500 border border-sky-400/50 active:scale-[0.98]',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 border border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-[0.98]',
    danger:
      'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-300 dark:border-rose-500/30 hover:bg-rose-500/20 active:scale-[0.98]',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center whitespace-nowrap font-sans transition-all duration-200 select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70
        disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
