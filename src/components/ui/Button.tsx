import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--accent-digital)] text-white border border-[var(--accent-digital)]
    hover:bg-sky-500 hover:border-sky-500
    hover:shadow-[0_4px_20px_rgba(2,132,199,0.35)]
    active:scale-[0.97]
  `,
  secondary: `
    bg-transparent text-[var(--text-primary)] border border-[var(--border-primary)]
    hover:border-[var(--border-hover)] hover:bg-[var(--surface-card-hover)]
    hover:shadow-[0_4px_16px_rgba(184,138,36,0.15)]
    active:scale-[0.97]
  `,
  gold: `
    bg-[var(--accent-gold)] text-white border border-[var(--accent-gold)]
    hover:bg-[var(--accent-gold-dark)] hover:border-[var(--accent-gold-dark)]
    hover:shadow-[0_4px_20px_rgba(184,138,36,0.40)]
    active:scale-[0.97]
  `,
  ghost: `
    bg-transparent text-[var(--text-muted)] border border-transparent
    hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]
    hover:bg-[var(--surface-card)]
    active:scale-[0.97]
  `,
  danger: `
    bg-red-600/10 text-red-500 border border-red-500/30
    hover:bg-red-600 hover:text-white hover:border-red-600
    hover:shadow-[0_4px_16px_rgba(220,38,38,0.35)]
    active:scale-[0.97]
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        cursor-pointer select-none
        outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/60 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 w-4 h-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};

export default Button;
