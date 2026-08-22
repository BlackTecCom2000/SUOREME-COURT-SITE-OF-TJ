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
          <label htmlFor={selectId} className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-11 px-4 pr-10 rounded-xl font-sans text-sm appearance-none
              bg-slate-900/90 text-white
              border border-slate-700/80 transition-all duration-200
              focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white py-1">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
        {error ? (
          <span className="text-xs text-red-400 font-mono mt-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 font-mono mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

AdminSelect.displayName = 'AdminSelect';
