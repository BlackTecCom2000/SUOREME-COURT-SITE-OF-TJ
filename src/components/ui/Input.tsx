import React, { forwardRef } from 'react';

// Portal input — same prop API as AdminInput, shared tokens.
// The field is a piece of the same glass material as the cards around it, not
// an opaque box: a form control that reads as a different surface breaks the
// illusion immediately. Label is a real <label> (click-to-focus), the error is
// wired with aria-describedby, and text is 16px because anything smaller in a
// text field fails to read comfortably.
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
  const inputId =
    id || `input-${label ? String(label).replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).slice(2)}`;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="u-label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-theme-textMuted pointer-events-none" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined}
          className={`glass-input lg-material lg-button text-md ${
            leftIcon ? 'pl-10' : 'px-4'
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-[var(--status-error)]' : ''}`}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3.5 text-theme-textMuted pointer-events-none" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <span id={`${inputId}-error`} role="alert" className="text-xs text-[var(--status-error)]">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-hint`} className="text-xs text-theme-textMuted">
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
