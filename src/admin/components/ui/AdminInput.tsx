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
          <label htmlFor={inputId} className="font-mono text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 px-4 rounded-[16px] font-sans text-sm
              bg-white/5 text-white placeholder-slate-500
              border border-white/20 transition-all duration-200 backdrop-blur-sm
              focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-slate-400">
              {rightIcon}
            </div>
          )}
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

AdminInput.displayName = 'AdminInput';
