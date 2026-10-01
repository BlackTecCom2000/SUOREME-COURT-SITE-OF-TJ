import React, { forwardRef } from 'react';

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="font-sans text-xs font-bold uppercase tracking-wide text-theme-text">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-theme-textMuted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 px-4 rounded-xl font-sans text-sm
              bg-theme-surface text-theme-text border border-theme-border placeholder:text-theme-textMuted
              transition-all duration-200
              focus:outline-none focus:border-theme-gold focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-gold)_30%,transparent)]
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${error ? 'border-[var(--theme-danger)] focus:border-[var(--theme-danger)] focus:ring-[color-mix(in_srgb,var(--theme-danger)_30%,transparent)]' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-theme-textMuted">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs text-[var(--theme-danger)] font-mono mt-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-theme-textSec font-sans mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

AdminInput.displayName = 'AdminInput';
