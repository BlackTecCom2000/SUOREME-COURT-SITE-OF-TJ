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
      'glass text-[var(--court-navy)] font-semibold border border-[rgba(212,164,45,0.38)] shadow-[var(--glass-shadow)] hover:brightness-110 active:scale-[0.98]',
    secondary:
      'glass text-theme-text font-medium border border-[var(--glass-border)] shadow-[var(--glass-shadow)] hover:bg-[var(--glass-surface-hover)] active:scale-[0.98]',
    digital:
      'glass text-[var(--court-navy)] font-semibold border border-[rgba(56,189,248,0.30)] shadow-[var(--glass-shadow)] hover:brightness-110 active:scale-[0.98]',
    outline:
      'glass text-theme-text border border-[var(--glass-border)] hover:border-[var(--court-gold)]/50 hover:bg-[var(--glass-surface-hover)] active:scale-[0.98]',
    ghost:
      'glass text-theme-textMuted border border-[var(--glass-border-subtle)] hover:text-theme-text hover:bg-[var(--glass-surface-hover)] active:scale-[0.98]',
    danger:
      'glass text-white font-semibold border border-red-400/30 shadow-[var(--glass-shadow)] hover:bg-red-500/10 active:scale-[0.98]',
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
