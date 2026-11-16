import React from 'react';

/**
 * The loading placeholder shown while the application chunk boots.
 *
 * It is rendered by BOTH the server entry (first paint, before any JS runs)
 * and the client entry (chunk still in flight). It therefore has to look like
 * the portal: the same glass material, the same gold, the same typography —
 * not a bare gray screen with a blue spinner.
 */
export const BootFallback: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-theme-bg text-theme-text select-none">
    <div className="glass glass-card rounded-3xl px-8 py-6 flex flex-col items-center gap-3">
      <span
        className="w-9 h-9 rounded-full border-2 border-theme-gold/25 border-t-theme-gold animate-spin"
        aria-hidden="true"
      />
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-theme-textSec">
        Загрузка портала
      </span>
    </div>
    <span className="sr-only">Загрузка портала…</span>
  </div>
);

export default BootFallback;
