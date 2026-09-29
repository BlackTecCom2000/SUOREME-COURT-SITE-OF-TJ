import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

// Portal select — same prop API as AdminSelect, theme tokens.
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  helperText?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, helperText, error, id, className = '', ...rest },
  ref
) {
  const inputId = id || `select-${label ? String(label).replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).slice(2)}`;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="u-label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined}
          className={`glass-input lg-material lg-button text-md pl-4 pr-10 appearance-none cursor-pointer ${
            error ? 'border-[var(--status-error)]' : ''
          }`}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="absolute right-3.5 text-theme-textMuted pointer-events-none" aria-hidden="true" />
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

export default Select;
