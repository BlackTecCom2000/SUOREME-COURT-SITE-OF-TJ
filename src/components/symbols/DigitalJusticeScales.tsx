import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface DigitalJusticeScalesProps {
  className?: string;
}

export const DigitalJusticeScales: React.FC<DigitalJusticeScalesProps> = ({
  className = '',
}) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [tiltAngle, setTiltAngle] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth } = window;
      // Soft interactive tilt (-3 to +3 degrees)
      const ratio = e.clientX / innerWidth - 0.5;
      setTiltAngle(ratio * 6);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const leftLabel = t('themisScales.scalesLeftLabel');
  const rightLabel = t('themisScales.scalesRightLabel');

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center pointer-events-auto ${className}`}
      aria-label={t('themisScales.scalesMotto')}
    >
      <style>{`
        @keyframes balanceOscillate {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-1.5deg);
          }
          75% {
            transform: rotate(1.5deg);
          }
        }
      `}</style>

      {/* Atmospheric Backlight */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className={`w-[440px] h-[340px] rounded-full blur-3xl transition-all duration-700 ${
            isDark
              ? 'bg-gradient-to-b from-[#c5a059]/15 to-transparent'
              : 'bg-gradient-to-b from-[#b88a24]/10 to-transparent'
          }`}
        />
      </div>

      {/* Main SVG Vector Composition */}
      <div className="relative w-full max-w-[440px] aspect-[4/3] flex items-center justify-center">
        <svg
          viewBox="0 0 500 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="scalesGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#fef3c7' : '#fef08a'} />
              <stop offset="40%" stopColor={isDark ? '#dfbe7e' : '#ca8a04'} />
              <stop offset="80%" stopColor={isDark ? '#c5a059' : '#b88a24'} />
              <stop offset="100%" stopColor={isDark ? '#926c27' : '#78350f'} />
            </linearGradient>

            <linearGradient id="scalesNavyMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#262630' : '#1e293b'} />
              <stop offset="100%" stopColor={isDark ? '#101018' : '#0b1b33'} />
            </linearGradient>

            <linearGradient id="panGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#1a1a24' : '#ffffff'} stopOpacity={isDark ? 0.75 : 0.95} />
              <stop offset="100%" stopColor={isDark ? '#0a0a0f' : '#f1f5f9'} stopOpacity={isDark ? 0.88 : 0.95} />
            </linearGradient>

            <filter id="scalesGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. CENTRAL PILLAR & BASE */}
          <g transform="translate(250, 0)">
            {/* Triangular Base Pedestal */}
            <polygon
              points="-70,350 70,350 50,320 -50,320"
              fill="url(#scalesNavyMetal)"
              stroke="url(#scalesGold)"
              strokeWidth="2"
              filter="url(#scalesGlow)"
            />
            <line x1="-40" y1="335" x2="40" y2="335" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="3 2" />

            {/* Vertical Column */}
            <rect
              x="-6"
              y="70"
              width="12"
              height="250"
              rx="3"
              fill="url(#scalesNavyMetal)"
              stroke="url(#scalesGold)"
              strokeWidth="1.5"
            />
            <line x1="0" y1="80" x2="0" y2="310" stroke={isDark ? '#dfbe7e' : '#b88a24'} strokeWidth="1" opacity="0.7" />

            {/* Central Dial Ring */}
            <circle cx="0" cy="180" r="18" fill="url(#scalesNavyMetal)" stroke="url(#scalesGold)" strokeWidth="1.5" />
            <circle cx="0" cy="180" r="10" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="0" cy="180" r="3" fill={isDark ? '#dfbe7e' : '#b88a24'} />

            {/* Top Crown & Finial */}
            <circle cx="0" cy="65" r="14" fill="url(#scalesNavyMetal)" stroke="url(#scalesGold)" strokeWidth="2" />
            <polygon points="-8,55 0,38 8,55" fill="url(#scalesGold)" />
            <circle cx="0" cy="65" r="4" fill={isDark ? '#38bdf8' : '#0284c7'} />
          </g>

          {/* 2. TILTING CROSSBEAM & PANS */}
          <g
            style={{
              transformOrigin: '250px 65px',
              transform: `rotate(${tiltAngle}deg)`,
              transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* Horizontal Fulcrum Beam */}
            <path
              d="M70 65 Q250 50 430 65"
              stroke="url(#scalesGold)"
              strokeWidth="3.5"
              fill="none"
              filter="url(#scalesGlow)"
            />
            <path
              d="M80 65 Q250 54 420 65"
              stroke={isDark ? '#ffffff' : '#0b1b33'}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.8"
              fill="none"
            />

            {/* Left Suspension & Pan */}
            <g transform="translate(80, 65)">
              <circle cx="0" cy="0" r="4" fill="url(#scalesGold)" />
              <line x1="-30" y1="130" x2="0" y2="0" stroke="url(#scalesGold)" strokeWidth="1" />
              <line x1="30" y1="130" x2="0" y2="0" stroke="url(#scalesGold)" strokeWidth="1" />
              <line x1="0" y1="130" x2="0" y2="0" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="3 3" />

              {/* Left Pan Dish */}
              <ellipse
                cx="0"
                cy="135"
                rx="48"
                ry="12"
                fill="url(#panGlass)"
                stroke="url(#scalesGold)"
                strokeWidth="1.8"
                filter="url(#scalesGlow)"
              />
              <ellipse cx="0" cy="135" rx="36" ry="7" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="2 2" />

              {/* Left Label */}
              <text
                x="0"
                y="160"
                fill={isDark ? '#ffffff' : '#0b1b33'}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                letterSpacing="2"
                className="drop-shadow"
              >
                {leftLabel}
              </text>
            </g>

            {/* Right Suspension & Pan */}
            <g transform="translate(420, 65)">
              <circle cx="0" cy="0" r="4" fill="url(#scalesGold)" />
              <line x1="-30" y1="130" x2="0" y2="0" stroke="url(#scalesGold)" strokeWidth="1" />
              <line x1="30" y1="130" x2="0" y2="0" stroke="url(#scalesGold)" strokeWidth="1" />
              <line x1="0" y1="130" x2="0" y2="0" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="3 3" />

              {/* Right Pan Dish */}
              <ellipse
                cx="0"
                cy="135"
                rx="48"
                ry="12"
                fill="url(#panGlass)"
                stroke="url(#scalesGold)"
                strokeWidth="1.8"
                filter="url(#scalesGlow)"
              />
              <ellipse cx="0" cy="135" rx="36" ry="7" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="2 2" />

              {/* Right Label */}
              <text
                x="0"
                y="160"
                fill={isDark ? '#ffffff' : '#0b1b33'}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                letterSpacing="2"
                className="drop-shadow"
              >
                {rightLabel}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Subtitle / Balance Indicator */}
      <div className="mt-3 font-mono text-[11px] text-theme-textMuted text-center tracking-wider uppercase">
        <span>{t('themisScales.scalesMotto')}</span>
      </div>
    </div>
  );
};
