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
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-mono uppercase tracking-wider text-theme-textMuted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          className={`w-full h-11 pl-4 pr-10 rounded-xl bg-theme-bg border text-sm text-theme-text focus:outline-none focus:border-theme-gold transition-colors appearance-none cursor-pointer ${
            error ? 'border-red-500' : 'border-theme-border'
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
        <span role="alert" className="text-[11px] text-red-400">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-[11px] text-theme-textMuted">{helperText}</span>
      ) : null}
    </div>
  );
});
