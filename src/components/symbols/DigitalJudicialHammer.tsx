import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface DigitalJudicialHammerProps {
  className?: string;
  onImpactTrigger?: () => void;
}

export const DigitalJudicialHammer: React.FC<DigitalJudicialHammerProps> = ({
  className = '',
}) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [isImpacted, setIsImpacted] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleTriggerGavel = () => {
    if (isImpacted) return;
    setIsImpacted(true);
    setTimeout(() => setIsImpacted(false), 1200);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 12;
      const y = (e.clientY / innerHeight - 0.5) * 8;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      onClick={handleTriggerGavel}
      className={`relative select-none flex flex-col items-center justify-center cursor-pointer group ${className}`}
      aria-label={t('digitalJustice.badge')}
    >
      <style>{`
        @keyframes gavelHover {
          0%, 100% {
            transform: translateY(0px) rotate(-18deg);
          }
          50% {
            transform: translateY(-8px) rotate(-16deg);
          }
        }
        @keyframes gavelImpact {
          0% {
            transform: translateY(-20px) rotate(-28deg);
          }
          40% {
            transform: translateY(6px) rotate(-5deg);
          }
          65% {
            transform: translateY(-3px) rotate(-14deg);
          }
          100% {
            transform: translateY(0px) rotate(-18deg);
          }
        }
        @keyframes shockwaveExpand {
          0% {
            transform: scale(0.3);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
      `}</style>

      {/* Ambient background volumetric glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className={`w-80 h-80 rounded-full blur-3xl transition-all duration-700 ${
            isDark
              ? 'bg-[#c5a059]/15 group-hover:bg-[#c5a059]/25'
              : 'bg-[#b88a24]/10 group-hover:bg-[#b88a24]/20'
          }`}
        />
        <div
          className={`w-60 h-60 rounded-full blur-2xl transition-all duration-700 ${
            isDark
              ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
              : 'bg-blue-500/10 group-hover:bg-blue-500/15'
          }`}
        />
      </div>

      {/* Shockwave Rings on Gavel Impact */}
      {isImpacted && (
        <div className="absolute bottom-20 pointer-events-none flex items-center justify-center">
          <div
            className={`w-48 h-20 rounded-[100%] border ${
              isDark
                ? 'border-[#dfbe7e]/80 shadow-[0_0_25px_rgba(223,190,126,0.5)]'
                : 'border-[#b88a24]/80 shadow-[0_0_25px_rgba(184,138,36,0.4)]'
            }`}
            style={{ animation: 'shockwaveExpand 1.1s cubic-bezier(0.1, 0.9, 0.2, 1) forwards' }}
          />
          <div
            className={`w-48 h-20 rounded-[100%] border ${
              isDark
                ? 'border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                : 'border-blue-500/60 shadow-[0_0_20px_rgba(2,132,199,0.3)]'
            }`}
            style={{ animation: 'shockwaveExpand 1.1s cubic-bezier(0.1, 0.9, 0.2, 1) 0.15s forwards' }}
          />
        </div>
      )}

      {/* Main SVG Vector Composition: Gavel & Sounding Block */}
      <div
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center"
      >
        <svg
          viewBox="0 0 500 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Metallic Gold Gradient */}
            <linearGradient id="hammerGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#fef3c7' : '#fef08a'} />
              <stop offset="35%" stopColor={isDark ? '#dfbe7e' : '#ca8a04'} />
              <stop offset="70%" stopColor={isDark ? '#c5a059' : '#b88a24'} />
              <stop offset="100%" stopColor={isDark ? '#926c27' : '#78350f'} />
            </linearGradient>

            {/* Titanium / Navy Metal Gradient */}
            <linearGradient id="titaniumBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#2a2a32' : '#1e293b'} />
              <stop offset="50%" stopColor={isDark ? '#18181f' : '#0f172a'} />
              <stop offset="100%" stopColor={isDark ? '#0d0d11' : '#0b1b33'} />
            </linearGradient>

            {/* Cyan / Blue Highlight Gradient */}
            <linearGradient id="cyanData" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isDark ? '#38bdf8' : '#0284c7'} />
              <stop offset="100%" stopColor={isDark ? '#06b6d4' : '#0369a1'} />
            </linearGradient>

            <filter id="hammerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. BASE: Sounding Block */}
          <g transform="translate(140, 290)">
            <polygon
              points="10,40 40,10 180,10 210,40 190,70 30,70"
              fill="url(#titaniumBody)"
              stroke="url(#hammerGold)"
              strokeWidth="2"
              filter="url(#hammerGlow)"
            />
            <polygon
              points="25,40 45,20 175,20 195,40 180,60 40,60"
              fill={isDark ? '#0e0e12' : '#ffffff'}
              stroke={isDark ? '#38bdf8' : '#0284c7'}
              strokeWidth="1"
              strokeOpacity="0.6"
              strokeDasharray="4 2"
            />
            <line x1="60" y1="40" x2="160" y2="40" stroke="url(#hammerGold)" strokeWidth="1" strokeOpacity="0.8" />
            <circle cx="60" cy="40" r="2.5" fill={isDark ? '#38bdf8' : '#0284c7'} />
            <circle cx="110" cy="40" r="3" fill={isDark ? '#dfbe7e' : '#b88a24'} />
            <circle cx="160" cy="40" r="2.5" fill={isDark ? '#38bdf8' : '#0284c7'} />

            {/* Base Metadata Tag */}
            <text
              x="110"
              y="53"
              fill={isDark ? '#dfbe7e' : '#b88a24'}
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="2"
              opacity="0.85"
            >
              {t('digitalJustice.hammerDecision')}
            </text>
          </g>

          {/* 2. GAVEL (Judicial Hammer) */}
          <g
            style={{
              transformOrigin: '250px 300px',
              animation: isImpacted
                ? 'gavelImpact 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
                : 'gavelHover 6s ease-in-out infinite',
            }}
          >
            {/* Gavel Handle */}
            <path
              d="M240 170 L380 70 C390 62 405 72 397 84 L260 185 Z"
              fill="url(#titaniumBody)"
              stroke="url(#hammerGold)"
              strokeWidth="1.5"
            />
            <path
              d="M310 120 L370 78 C375 75 385 82 380 87 L320 130 Z"
              fill="url(#hammerGold)"
              opacity="0.6"
            />
            <line
              x1="265"
              y1="155"
              x2="350"
              y2="95"
              stroke={isDark ? '#38bdf8' : '#0284c7'}
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Gavel Head */}
            <rect
              x="150"
              y="150"
              width="130"
              height="60"
              rx="8"
              transform="rotate(-25 150 150)"
              fill="url(#titaniumBody)"
              stroke="url(#hammerGold)"
              strokeWidth="2.5"
              filter="url(#hammerGlow)"
            />

            {/* Bevels */}
            <rect
              x="135"
              y="145"
              width="24"
              height="70"
              rx="4"
              transform="rotate(-25 135 145)"
              fill="url(#hammerGold)"
              stroke={isDark ? '#ffffff' : '#0f172a'}
              strokeWidth="1"
              strokeOpacity="0.8"
            />
            <rect
              x="250"
              y="92"
              width="24"
              height="70"
              rx="4"
              transform="rotate(-25 250 92)"
              fill="url(#hammerGold)"
              stroke={isDark ? '#ffffff' : '#0f172a'}
              strokeWidth="1"
              strokeOpacity="0.8"
            />

            {/* Circuit Ring Inlays */}
            <rect
              x="175"
              y="140"
              width="14"
              height="60"
              rx="2"
              transform="rotate(-25 175 140)"
              fill="url(#cyanData)"
              opacity="0.6"
            />
            <rect
              x="220"
              y="118"
              width="14"
              height="60"
              rx="2"
              transform="rotate(-25 220 118)"
              fill="url(#cyanData)"
              opacity="0.6"
            />

            {/* Center Emblem Crest */}
            <circle
              cx="208"
              cy="165"
              r="10"
              fill={isDark ? '#0e0e14' : '#ffffff'}
              stroke="url(#hammerGold)"
              strokeWidth="1.5"
            />
            <circle cx="208" cy="165" r="4" fill={isDark ? '#dfbe7e' : '#b88a24'} />
          </g>

          {/* Floating Data Micro-Particles */}
          <g fill={isDark ? '#dfbe7e' : '#b88a24'} opacity="0.6">
            <circle cx="120" cy="180" r="1.5" />
            <circle cx="340" cy="140" r="2" />
            <circle cx="280" cy="240" r="1.5" />
            <circle cx="190" cy="90" r="2" />
          </g>
          <g fill={isDark ? '#38bdf8' : '#0284c7'} opacity="0.6">
            <circle cx="160" cy="220" r="1.8" />
            <circle cx="310" cy="200" r="1.5" />
            <circle cx="230" cy="70" r="1.8" />
          </g>
        </svg>
      </div>

      {/* Bottom Interactive Prompt / Subtitle */}
      <div className="mt-2 text-center font-mono text-[11px] text-theme-textMuted group-hover:text-theme-text transition-colors">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-theme-gold animate-pulse" />
          <span>{t('digitalJustice.hammerSubtext')}</span>
        </span>
      </div>
    </div>
  );
};
