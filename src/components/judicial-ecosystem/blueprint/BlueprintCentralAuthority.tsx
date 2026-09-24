import React, { useState, useEffect } from 'react';
import { Network, Scale } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface BlueprintCentralAuthorityProps {
  onSelectSupremeCourt: () => void;
  isSelected?: boolean;
  onOpenCouncil?: () => void;
  onOpenAdministration?: () => void;
  activeRegionId?: string | null;
}

export const BlueprintCentralAuthority: React.FC<BlueprintCentralAuthorityProps> = ({
  onSelectSupremeCourt,
  isSelected = false,
  onOpenCouncil,
  onOpenAdministration,
  activeRegionId = null,
}) => {
  const { language } = useLanguage();
  const [pulseActive, setPulseActive] = useState(false);

  // Periodic 6s Judicial Beacon Pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 2000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center select-none z-20">
      <style>{`
        @keyframes centralRayFlow {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseBeacon {
          0% { transform: scale(0.8); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      {/* 1. Top institutional — 3 cards same system, gold subtle accent only */}
      <div className="w-full flex flex-wrap items-center justify-center gap-4 relative z-10 px-4">
        {/* LEFT: Council */}
        <div
          onClick={onOpenCouncil}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenCouncil?.();
            }
          }}
          className="relative w-[220px] h-[92px] glass glass-card p-3 cursor-pointer flex flex-col items-center justify-center text-center group hover:border-[var(--court-gold)]/30"
        >
          <div className="p-1.5 rounded-full border border-white/10 bg-white/5 text-theme-textMuted mb-1 group-hover:scale-105 transition-transform">
            <Network size={14} />
          </div>
          <h4 className="font-mono font-bold text-[11px] tracking-wider uppercase leading-tight text-theme-text">
            {language === 'tj' ? 'ШӮРОИ СУДҲО' : language === 'en' ? 'COUNCIL OF JUDGES' : 'СОВЕТ СУДЕЙ'}
          </h4>
          <span className="font-mono text-[7px] uppercase tracking-widest leading-tight mt-0.5 opacity-60 text-theme-textMuted">
            {language === 'tj'
              ? 'БАНАҚШАГИРИИ СТРАТЕГӢ ВА ТАҲЛИЛ'
              : language === 'en'
              ? 'STRATEGIC PLANNING & ANALYSIS'
              : 'СТРАТЕГИЧЕСКОЕ ПЛАНИРОВАНИЕ'}
          </span>
        </div>

        {/* CENTER: Supreme Court — same glass system, gold subtle accent when active */}
        <div
          onClick={onSelectSupremeCourt}
          role="button"
          tabIndex={0}
          aria-pressed={isSelected}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectSupremeCourt();
            }
          }}
          className={`
            relative w-[420px] h-[96px] glass glass-card px-5 py-3 cursor-pointer flex items-center justify-center gap-4
            ${isSelected ? 'glass-active !border-[var(--court-gold)]' : 'hover:border-[var(--court-gold)]/30'}
          `}
        >
          {pulseActive && (
            <div className="absolute inset-0 rounded-[24px] border border-[var(--court-gold)]/20 pointer-events-none animate-pulse opacity-40" />
          )}
          <div className="shrink-0 flex items-center justify-center p-2 rounded-xl border border-white/10 bg-white/5">
            <img
              src={`/emblems/emblem-${language}.png`}
              alt="Логотип Верховного Суда"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-mono font-bold text-[18px] tracking-wider leading-tight text-theme-text">
              {language === 'tj' ? 'СУДИ ОЛИИ' : language === 'en' ? 'SUPREME COURT OF' : 'ВЕРХОВНЫЙ СУД'}
            </h3>
            <h4 className="font-mono font-semibold text-[11px] tracking-[0.2em] uppercase leading-tight mt-0.5 text-[var(--court-gold)]">
              {language === 'tj'
                ? 'ҶУМҲУРИИ ТОҶИКИСТОН'
                : language === 'en'
                ? 'THE REPUBLIC OF TAJIKISTAN'
                : 'РЕСПУБЛИКИ ТАДЖИКИСТАН'}
            </h4>
          </div>
        </div>

        {/* RIGHT: Administrative — same glass, gold subtle */}
        <div
          onClick={onOpenAdministration}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenAdministration?.();
            }
          }}
          className="relative w-[220px] h-[92px] glass glass-card p-3 cursor-pointer flex flex-col items-center justify-center text-center group hover:border-[var(--court-gold)]/30"
        >
          <div className="p-1.5 rounded-full border border-white/10 bg-white/5 text-theme-textMuted mb-1 group-hover:scale-105 transition-transform">
            <Scale size={14} />
          </div>
          <h4 className="font-mono font-bold text-[11px] tracking-wider uppercase leading-tight text-theme-text">
            {language === 'tj'
              ? 'РАЁСАТИ АДМИНИСТРАТИВӢ'
              : language === 'en'
              ? 'ADMINISTRATIVE DEPT'
              : 'АДМИНИСТРАЦИЯ'}
          </h4>
          <span className="font-mono text-[7px] uppercase tracking-widest leading-tight mt-0.5 opacity-60 text-theme-textMuted">
            {language === 'tj'
              ? 'ИДОРАКУНӢ ВА ТАЪМИНИ ФАЪОЛИЯТ'
              : language === 'en'
              ? 'OPERATIONS & SUPPORT'
              : 'УПРАВЛЕНИЕ И ОБЕСПЕЧЕНИЕ'}
          </span>
        </div>
      </div>

      {/* 2. Subtle informational connector — replaces bright decorative trunk */}
      <div className="relative w-full h-[36px] pointer-events-none flex items-center justify-center" aria-hidden="true">
        <div className="w-full max-w-[720px] h-px bg-white/10 relative">
          <span className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-[var(--court-gold)]/40" />
          <span className={`absolute left-[12%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors ${activeRegionId === 'gbao' ? 'bg-[var(--court-gold)]' : 'bg-white/20'}`} />
          <span className={`absolute left-[36%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors ${activeRegionId === 'khatlon' ? 'bg-[var(--court-gold)]' : 'bg-white/20'}`} />
          <span className={`absolute left-[64%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors ${activeRegionId === 'sugd' ? 'bg-[var(--court-gold)]' : 'bg-white/20'}`} />
          <span className={`absolute left-[88%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors ${activeRegionId === 'dushanbe_rrp' ? 'bg-[var(--court-gold)]' : 'bg-white/20'}`} />
        </div>
      </div>
    </div>
  );
};
