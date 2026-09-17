import React, { useState, useEffect } from 'react';
import { Network, Scale } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

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
  const { isDark } = useTheme();
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

      {/* 1. THREE TOP INSTITUTIONAL PANELS - Symmetrical Central Balance */}
      <div className="w-full flex items-center justify-center gap-6 relative z-10 px-8">
        {/* LEFT WING: ШӮРОИ СУДҲО (Council of Judges) */}
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
          className={`
            relative w-[230px] h-[98px] rounded-xl p-3.5 cursor-pointer
            border transition-all duration-300 backdrop-blur-xl
            flex flex-col items-center justify-center text-center group
            ${
              isDark
                ? 'border-[#dfbe7e]/70 bg-[#060b18]/80 shadow-[0_0_18px_rgba(223,190,126,0.18)] hover:border-[#dfbe7e] hover:shadow-[0_0_25px_rgba(223,190,126,0.35)]'
                : 'border-[#ca8a04]/70 bg-white/75 shadow-[0_4px_15px_rgba(202,138,4,0.15)] hover:border-[#ca8a04] hover:shadow-[0_6px_20px_rgba(202,138,4,0.25)]'
            }
          `}
        >
          <div
            className={`absolute inset-[3px] rounded-lg border pointer-events-none ${
              isDark ? 'border-[#dfbe7e]/25' : 'border-[#ca8a04]/20'
            }`}
          />
          <div
            className={`p-1.5 rounded-full border mb-1 transition-transform group-hover:scale-110 ${
              isDark
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-cyan-600/10 border-cyan-600/30 text-cyan-700'
            }`}
          >
            <Network size={16} />
          </div>
          <h4
            className={`font-mono font-bold text-[12px] tracking-wider uppercase leading-tight ${
              isDark ? 'text-cyan-300' : 'text-cyan-800'
            }`}
          >
            {language === 'tj' ? 'ШӮРОИ СУДҲО' : language === 'en' ? 'COUNCIL OF JUDGES' : 'СОВЕТ СУДЕЙ'}
          </h4>
          <span
            className={`font-mono text-[8px] uppercase tracking-widest leading-tight mt-0.5 opacity-70 ${
              isDark ? 'text-cyan-200' : 'text-cyan-900'
            }`}
          >
            {language === 'tj'
              ? 'БАНАҚШАГИРИИ СТРАТЕГӢ ВА ТАҲЛИЛ'
              : language === 'en'
              ? 'STRATEGIC PLANNING & ANALYSIS'
              : 'СТРАТЕГИЧЕСКОЕ ПЛАНИРОВАНИЕ'}
          </span>
        </div>

        {/* CENTER DOMINANT NODE: СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН (Supreme Court) */}
        <div
          onClick={onSelectSupremeCourt}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectSupremeCourt();
            }
          }}
          className={`
            relative w-[450px] h-[104px] rounded-2xl px-6 py-4 cursor-pointer
            border-2 transition-all duration-500
            backdrop-blur-2xl flex items-center justify-center gap-5
            ${
              isDark
                ? isSelected
                  ? 'border-[#ffea88] bg-[#0c1326]/75 shadow-[0_0_50px_rgba(255,234,136,0.6)] scale-105'
                  : 'border-[#dfbe7e] bg-[#070e20]/75 hover:border-[#ffea88] shadow-[0_0_35px_rgba(223,190,126,0.35)] hover:shadow-[0_0_50px_rgba(223,190,126,0.55)] hover:scale-102'
                : isSelected
                ? 'border-[#ca8a04] bg-[#f8fafc]/75 shadow-[0_10px_35px_rgba(202,138,4,0.4)] scale-105'
                : 'border-[#ca8a04]/80 bg-white/75 hover:border-[#ca8a04] shadow-[0_4px_25px_rgba(202,138,4,0.2)] hover:shadow-[0_8px_35px_rgba(202,138,4,0.35)] hover:scale-102'
            }
          `}
          style={{
            boxShadow: isDark
              ? '0 0 35px rgba(223, 190, 126, 0.35), inset 0 0 20px rgba(223, 190, 126, 0.2)'
              : '0 4px 25px rgba(202, 138, 4, 0.2), inset 0 0 10px rgba(202, 138, 4, 0.08)',
          }}
        >
          {/* Periodic Pulse Ripple */}
          {pulseActive && (
            <div className="absolute inset-0 rounded-2xl border-2 border-[#dfbe7e] pointer-events-none animate-ping opacity-60" />
          )}

          {/* Inner Double Border */}
          <div
            className={`absolute inset-[4px] rounded-xl border pointer-events-none ${
              isDark ? 'border-[#dfbe7e]/40' : 'border-[#ca8a04]/30'
            }`}
          />

          {/* Supreme Court Logo */}
          <div
            className={`shrink-0 flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-amber-600/10 border-amber-600/40 shadow-[0_2px_10px_rgba(217,119,6,0.2)]'
            }`}
          >
            <img 
              src={`/emblems/emblem-${language}.png`}
              alt="Логотип Верховного Суда"
              className="w-11 h-11 object-contain drop-shadow-md"
            />
          </div>

          {/* Supreme Court Title Typography */}
          <div className="flex flex-col text-left">
            <h3
              className={`font-mono font-bold text-[20px] tracking-wider leading-tight ${
                isDark ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-slate-900'
              }`}
            >
              {language === 'tj' ? 'СУДИ ОЛИИ' : language === 'en' ? 'SUPREME COURT OF' : 'ВЕРХОВНЫЙ СУД'}
            </h3>
            <h4
              className={`font-mono font-semibold text-[13px] tracking-[0.2em] uppercase leading-tight mt-0.5 ${
                isDark
                  ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]'
                  : 'text-amber-700'
              }`}
            >
              {language === 'tj'
                ? 'ҶУМҲУРИИ ТОҶИКИСТОН'
                : language === 'en'
                ? 'THE REPUBLIC OF TAJIKISTAN'
                : 'РЕСПУБЛИКИ ТАДЖИКИСТАН'}
            </h4>
          </div>
        </div>

        {/* RIGHT WING: РАЁСАТИ АДМИНИСТРАТСИЯ (Administrative Directorate) */}
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
          className={`
            relative w-[230px] h-[98px] rounded-xl p-3.5 cursor-pointer
            border transition-all duration-300 backdrop-blur-xl
            flex flex-col items-center justify-center text-center group
            ${
              isDark
                ? 'border-[#dfbe7e]/70 bg-[#060b18]/80 shadow-[0_0_18px_rgba(223,190,126,0.18)] hover:border-[#dfbe7e] hover:shadow-[0_0_25px_rgba(223,190,126,0.35)]'
                : 'border-[#ca8a04]/70 bg-white/75 shadow-[0_4px_15px_rgba(202,138,4,0.15)] hover:border-[#ca8a04] hover:shadow-[0_6px_20px_rgba(202,138,4,0.25)]'
            }
          `}
        >
          <div
            className={`absolute inset-[3px] rounded-lg border pointer-events-none ${
              isDark ? 'border-[#dfbe7e]/25' : 'border-[#ca8a04]/20'
            }`}
          />
          <div
            className={`p-1.5 rounded-full border mb-1 transition-transform group-hover:scale-110 ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-600/10 border-emerald-600/30 text-emerald-700'
            }`}
          >
            <Scale size={16} />
          </div>
          <h4
            className={`font-mono font-bold text-[12px] tracking-wider uppercase leading-tight ${
              isDark ? 'text-emerald-300' : 'text-emerald-800'
            }`}
          >
            {language === 'tj'
              ? 'РАЁСАТИ АДМИНИСТРАТИВӢ'
              : language === 'en'
              ? 'ADMINISTRATIVE DEPT'
              : 'АДМИНИСТРАЦИЯ'}
          </h4>
          <span
            className={`font-mono text-[8px] uppercase tracking-widest leading-tight mt-0.5 opacity-70 ${
              isDark ? 'text-emerald-200' : 'text-emerald-900'
            }`}
          >
            {language === 'tj'
              ? 'ИДОРАКУНӢ ВА ТАЪМИНИ ФАЪОЛИЯТ'
              : language === 'en'
              ? 'OPERATIONS & SUPPORT'
              : 'УПРАВЛЕНИЕ И ОБЕСПЕЧЕНИЕ'}
          </span>
        </div>
      </div>

      {/* 2. CONTINUOUS VERTICAL TRUNK & SYMMETRICAL BRANCHES */}
      <div className="relative w-full h-[152px] pointer-events-none">
        <svg
          viewBox="0 0 1920 152"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rayCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dfbe7e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="rayGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dfbe7e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="rayGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dfbe7e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#dfbe7e" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="rayVioletGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dfbe7e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dfbe7e" stopOpacity="1" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.9" />
            </linearGradient>

            <filter id="rayGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main Central Vertical Trunk (Originates from Supreme Court base Y=0 to Splitter Nexus Y=40) */}
          <line
            x1="960"
            y1="0"
            x2="960"
            y2="42"
            stroke="url(#trunkGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#rayGlowFilter)"
          />

          {/* Central Splitter Nexus Sunburst */}
          <circle
            cx="960"
            cy="42"
            r="8"
            fill="#dfbe7e"
            filter="url(#rayGlowFilter)"
            className="animate-pulse"
          />
          <circle cx="960" cy="42" r="4" fill="#ffffff" />

          {/* Symmetrical Regional Radiating Channels */}
          {/* Branch 1: Center Nexus (960, 42) -> Col 1 GBAO (252, 148) */}
          <path
            d="M 960 42 C 960 85, 252 85, 252 148"
            fill="none"
            stroke="url(#rayCyanGrad)"
            strokeWidth={activeRegionId === 'gbao' ? 4 : 2.5}
            strokeLinecap="round"
            filter="url(#rayGlowFilter)"
            strokeDasharray="6 3"
            style={{
              animation: 'centralRayFlow 25s linear infinite',
              opacity: activeRegionId && activeRegionId !== 'gbao' ? 0.35 : 1,
            }}
          />

          {/* Branch 2: Center Nexus (960, 42) -> Col 2 Khatlon (724, 148) */}
          <path
            d="M 960 42 C 960 85, 724 85, 724 148"
            fill="none"
            stroke="url(#rayGreenGrad)"
            strokeWidth={activeRegionId === 'khatlon' ? 4 : 2.5}
            strokeLinecap="round"
            filter="url(#rayGlowFilter)"
            strokeDasharray="6 3"
            style={{
              animation: 'centralRayFlow 25s linear infinite',
              opacity: activeRegionId && activeRegionId !== 'khatlon' ? 0.35 : 1,
            }}
          />

          {/* Branch 3: Center Nexus (960, 42) -> Col 3 Sughd (1196, 148) */}
          <path
            d="M 960 42 C 960 85, 1196 85, 1196 148"
            fill="none"
            stroke="url(#rayGoldGrad)"
            strokeWidth={activeRegionId === 'sugd' ? 4 : 2.5}
            strokeLinecap="round"
            filter="url(#rayGlowFilter)"
            strokeDasharray="6 3"
            style={{
              animation: 'centralRayFlow 25s linear infinite',
              opacity: activeRegionId && activeRegionId !== 'sugd' ? 0.35 : 1,
            }}
          />

          {/* Branch 4: Center Nexus (960, 42) -> Col 4 Dushanbe (1668, 148) */}
          <path
            d="M 960 42 C 960 85, 1668 85, 1668 148"
            fill="none"
            stroke="url(#rayVioletGrad)"
            strokeWidth={activeRegionId === 'dushanbe_rrp' ? 4 : 2.5}
            strokeLinecap="round"
            filter="url(#rayGlowFilter)"
            strokeDasharray="6 3"
            style={{
              animation: 'centralRayFlow 25s linear infinite',
              opacity: activeRegionId && activeRegionId !== 'dushanbe_rrp' ? 0.35 : 1,
            }}
          />

          {/* Symmetrical Target Pulse Beacons */}
          <circle cx="252" cy="148" r="4.5" fill="#00e5ff" filter="url(#rayGlowFilter)" />
          <circle cx="724" cy="148" r="4.5" fill="#10b981" filter="url(#rayGlowFilter)" />
          <circle cx="1196" cy="148" r="4.5" fill="#dfbe7e" filter="url(#rayGlowFilter)" />
          <circle cx="1668" cy="148" r="4.5" fill="#c084fc" filter="url(#rayGlowFilter)" />
        </svg>
      </div>
    </div>
  );
};
