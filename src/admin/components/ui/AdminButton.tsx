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
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-sm gap-2 rounded-xl',
    lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#ca8a04] to-[#eab308] text-slate-950 font-semibold shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] border border-amber-300/40',
    secondary:
      'bg-slate-800/80 text-white font-medium hover:bg-slate-700 active:scale-[0.98] border border-white/10 shadow-sm',
    digital:
      'bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-[0.98] border border-cyan-300/30',
    outline:
      'bg-transparent text-slate-200 border border-slate-700 hover:border-amber-400/50 hover:bg-slate-800/40 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white active:scale-[0.98]',
    danger:
      'bg-red-600/90 text-white font-semibold hover:bg-red-500 active:scale-[0.98] border border-red-400/30 shadow-md shadow-red-500/20',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-sans transition-all duration-200 select-none
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
