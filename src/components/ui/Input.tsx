import React, { forwardRef } from 'react';

// Portal input — same prop API as AdminInput, theme tokens.
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, leftIcon, rightIcon, id, className = '', ...rest },
  ref
) {
  const inputId = id || `input-${label ? String(label).replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).slice(2)}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-mono uppercase tracking-wider text-theme-textMuted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && <span className="absolute left-3.5 text-theme-textMuted pointer-events-none">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined}
          className={`w-full h-11 rounded-xl bg-theme-bg border text-sm text-theme-text placeholder:text-theme-textMuted focus:outline-none focus:border-theme-gold transition-colors ${
            leftIcon ? 'pl-10' : 'px-4'
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : 'border-theme-border'}`}
          {...rest}
        />
        {rightIcon && <span className="absolute right-3.5 text-theme-textMuted">{rightIcon}</span>}
      </div>
      {error ? (
        <span id={`${inputId}-error`} role="alert" className="text-[11px] text-red-400">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-hint`} className="text-[11px] text-theme-textMuted">
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
