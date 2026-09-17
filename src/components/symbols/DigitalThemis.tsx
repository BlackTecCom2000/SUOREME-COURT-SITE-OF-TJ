import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface DigitalThemisProps {
  className?: string;
}

export const DigitalThemis: React.FC<DigitalThemisProps> = ({
  className = '',
}) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 6;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center pointer-events-auto ${className}`}
      aria-label={t('themisScales.badge')}
    >
      <style>{`
        @keyframes themisBreathe {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes dataScan {
          0% {
            stroke-dashoffset: 300;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* Atmospheric Backlight */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className={`w-[380px] h-[520px] rounded-full blur-3xl transition-all duration-700 ${
            isDark
              ? 'bg-gradient-to-b from-[#c5a059]/15 via-cyan-500/10 to-transparent'
              : 'bg-gradient-to-b from-[#b88a24]/10 via-blue-500/10 to-transparent'
          }`}
        />
      </div>

      {/* Main SVG Vector Silhouette & Contour Mesh */}
      <div
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative w-full max-w-[380px] aspect-[3/4] flex items-center justify-center"
      >
        <svg
          viewBox="0 0 400 560"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
          style={{ animation: 'themisBreathe 8s ease-in-out infinite' }}
        >
          <defs>
            {/* Golden Rim Gradient */}
            <linearGradient id="themisGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#ffffff' : '#0b1b33'} stopOpacity="0.9" />
              <stop offset="40%" stopColor={isDark ? '#dfbe7e' : '#b88a24'} stopOpacity="0.8" />
              <stop offset="80%" stopColor={isDark ? '#c5a059' : '#ca8a04'} stopOpacity="0.6" />
              <stop offset="100%" stopColor={isDark ? '#38bdf8' : '#0284c7'} stopOpacity="0.5" />
            </linearGradient>

            {/* Dark Translucent Body Gradient */}
            <linearGradient id="themisBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#1a1a24' : '#ffffff'} stopOpacity={isDark ? 0.85 : 0.95} />
              <stop offset="50%" stopColor={isDark ? '#101018' : '#f1f5f9'} stopOpacity={isDark ? 0.90 : 0.95} />
              <stop offset="100%" stopColor={isDark ? '#08080c' : '#e2e8f0'} stopOpacity={isDark ? 0.95 : 0.98} />
            </linearGradient>

            <filter id="themisGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Halo of Wisdom & Sovereignty */}
          <g opacity="0.5" transform="translate(200, 100)">
            <circle cx="0" cy="0" r="48" stroke={isDark ? '#dfbe7e' : '#b88a24'} strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="44" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="0.8" strokeOpacity="0.6" />
          </g>

          {/* 2. Flowing Mantle Robes / Silhouette Body */}
          <path
            d="M170 120 C140 180, 110 280, 95 480 C150 500, 250 500, 305 480 C290 280, 260 180, 230 120 Z"
            fill="url(#themisBody)"
            stroke="url(#themisGoldRim)"
            strokeWidth="1.5"
            filter="url(#themisGlow)"
          />

          {/* 3. Robe Folds / Mesh Network Lines */}
          <g stroke="url(#themisGoldRim)" strokeWidth="0.8" opacity="0.65">
            <path d="M175 140 Q200 170 225 140" />
            <path d="M165 175 Q200 210 235 175" />
            <path d="M155 220 Q200 250 245 220" />
            <path d="M145 270 Q200 300 255 270" />

            <path d="M200 170 Q195 330 170 480" strokeDasharray="3 3" />
            <path d="M200 170 Q205 330 230 480" strokeDasharray="3 3" />
            <path d="M180 200 Q150 350 120 480" />
            <path d="M220 200 Q250 350 280 480" />
          </g>

          {/* 4. Head, Crown & Blindfold (Impartiality) */}
          <g transform="translate(200, 95)">
            <ellipse cx="0" cy="0" rx="22" ry="28" fill="url(#themisBody)" stroke="url(#themisGoldRim)" strokeWidth="1.5" />
            <path d="M-14 -20 L-8 -14 L0 -24 L8 -14 L14 -20 L10 -8 L-10 -8 Z" fill={isDark ? '#dfbe7e' : '#b88a24'} opacity="0.85" />
            <rect x="-22" y="-4" width="44" height="10" rx="3" fill={isDark ? '#0e0e14' : '#ffffff'} stroke={isDark ? '#dfbe7e' : '#b88a24'} strokeWidth="1.2" />
            <line x1="-20" y1="1" x2="20" y2="1" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="2 2" />
            <path d="M0 6 L2 14 L-2 16" stroke={isDark ? '#dfbe7e' : '#b88a24'} strokeWidth="0.8" opacity="0.6" />
          </g>

          {/* 5. Raised Right Arm */}
          <g stroke="url(#themisGoldRim)" strokeWidth="1.6" fill="url(#themisBody)">
            <path d="M225 140 Q290 120 330 90 L340 98 Q300 135 230 160 Z" />
            <rect x="325" y="86" width="12" height="14" rx="2" fill={isDark ? '#dfbe7e' : '#b88a24'} opacity="0.85" />
          </g>

          {/* 6. Left Hand & Book of Law Foundation */}
          <g transform="translate(90, 240)">
            <path d="M80 -80 Q30 -20 20 20" stroke="url(#themisGoldRim)" strokeWidth="1.6" />
            <rect x="0" y="20" width="34" height="44" rx="4" fill={isDark ? '#0e0e14' : '#ffffff'} stroke={isDark ? '#dfbe7e' : '#b88a24'} strokeWidth="1.2" />
            <line x1="8" y1="30" x2="26" y2="30" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" />
            <line x1="8" y1="38" x2="26" y2="38" stroke={isDark ? '#dfbe7e' : '#b88a24'} strokeWidth="1" />
            <line x1="8" y1="46" x2="20" y2="46" stroke={isDark ? '#ffffff' : '#0f172a'} strokeWidth="0.8" />
          </g>

          {/* 7. Floating Circuit Traces along Mantle */}
          <g stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" style={{ animation: 'dataScan 6s linear infinite' }}>
            <path d="M140 320 L160 360 L150 420" />
            <path d="M260 320 L240 360 L250 420" />
          </g>

          {/* 8. Star Nodes */}
          <circle cx="200" cy="95" r="2" fill={isDark ? '#ffffff' : '#0b1b33'} />
          <circle cx="335" cy="92" r="3" fill={isDark ? '#dfbe7e' : '#b88a24'} className="animate-pulse" />
          <circle cx="100" cy="260" r="2.5" fill={isDark ? '#38bdf8' : '#0284c7'} />
          <circle cx="200" cy="280" r="2" fill={isDark ? '#dfbe7e' : '#b88a24'} />
          <circle cx="170" cy="480" r="2" fill={isDark ? '#38bdf8' : '#0284c7'} />
          <circle cx="230" cy="480" r="2" fill={isDark ? '#38bdf8' : '#0284c7'} />
        </svg>
      </div>

      {/* Title Subtext */}
      <div className="mt-3 font-mono text-[11px] text-theme-textMuted text-center tracking-wider uppercase">
        <span>{t('themisScales.themisMotto')}</span>
      </div>
    </div>
  );
};
