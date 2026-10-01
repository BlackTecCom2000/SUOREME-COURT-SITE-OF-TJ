import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AdminSelectOption {
  value: string | number;
  label: string;
}

export interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: AdminSelectOption[];
  helperText?: string;
  error?: string;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, options, helperText, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="font-sans text-xs font-bold uppercase tracking-wider text-theme-text">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-11 px-4 pr-10 rounded-xl font-sans text-sm appearance-none
              bg-theme-surface text-theme-text
              border border-theme-border transition-all duration-200
              focus:outline-none focus:border-theme-gold focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-gold)_30%,transparent)]
              ${error ? 'border-[var(--theme-danger)] focus:border-[var(--theme-danger)]' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-theme-surface text-theme-text py-1">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 flex items-center justify-center text-theme-textMuted pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
        {error ? (
          <span className="text-xs text-[var(--theme-danger)] font-mono mt-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-theme-textMuted font-mono mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

AdminSelect.displayName = 'AdminSelect';
