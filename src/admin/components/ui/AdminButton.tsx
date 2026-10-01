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

  /* Every variant resolves from the shared tokens: the accent is the theme's
     gold (rewritten by the store per scheme/preset), surfaces are the glass
     tints, danger is the danger token. No local slate/amber palette. */
  const variantClasses = {
    primary:
      'bg-theme-gold text-theme-bg font-semibold shadow-md hover:brightness-110 border border-transparent active:scale-[0.98]',
    secondary:
      'bg-theme-surface text-theme-text font-medium border border-theme-border hover:bg-theme-surfaceHover active:scale-[0.98]',
    digital:
      'bg-theme-digital text-theme-bg font-semibold shadow-md hover:brightness-110 border border-transparent active:scale-[0.98]',
    outline:
      'bg-transparent text-theme-textSec border border-theme-border hover:bg-theme-surface active:scale-[0.98]',
    ghost:
      'bg-transparent text-theme-textSec border border-transparent hover:text-theme-text hover:bg-theme-surface active:scale-[0.98]',
    danger:
      'bg-transparent text-[var(--theme-danger)] font-semibold border border-[color-mix(in_srgb,var(--theme-danger)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-danger)_12%,transparent)] active:scale-[0.98]',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center whitespace-nowrap font-sans transition-all duration-200 select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-gold)_60%,transparent)]
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
