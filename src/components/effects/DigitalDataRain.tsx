import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useDeviceCapability } from '../../context/DeviceCapabilityContext';

export interface DigitalDataRainProps {
  density?: 'sparse' | 'medium' | 'dense';
  speed?: 'slow' | 'medium' | 'fast';
  opacity?: number;
  colorTheme?: 'gold' | 'cyan' | 'mixed';
  className?: string;
}

const DATA_TOKENS = [
  'JUD-001',
  'CASE-2026',
  '101001',
  'ACT-014',
  'LAW-003',
  'PLENUM-017',
  'TJK',
  '010101',
  'COURT',
  'SUD.TJ',
  'ECourt',
  'DOC-2026',
  'DECISION',
  '110010',
  'APPEAL',
  'ARCHIVE',
  'VERIFIED',
  'OPEN',
  'CONST-94',
  'LEX-TJ',
  'ART-19',
  '001101',
  'CAS-89',
  'CIVIL',
  'CRIM',
];

interface ParticleColumn {
  id: number;
  leftPercent: number;
  delaySec: number;
  durationSec: number;
  tokens: string[];
  depthLayer: 'bg' | 'mid' | 'fg';
  isAccent: boolean;
  accentColorDark: string;
  accentColorLight: string;
}

export const DigitalDataRain: React.FC<DigitalDataRainProps> = ({
  density = 'medium',
  speed = 'medium',
  opacity = 0.35,
  colorTheme = 'mixed',
  className = '',
}) => {
  const { isDark } = useTheme();
  const { tier, isReducedMotion } = useDeviceCapability();

  // If low-end or reduced motion, disable the particle animation entirely
  if (tier === 'low-end' || isReducedMotion) {
    return null;
  }

  // Adjust column count based on capability
  let rawColumnCount = density === 'sparse' ? 10 : density === 'dense' ? 24 : 16;
  if (tier === 'medium') {
    rawColumnCount = Math.floor(rawColumnCount / 2); // Cut particles in half for medium devices
  }
  const columnCount = rawColumnCount;

  const speedMultiplier = speed === 'slow' ? 1.4 : speed === 'fast' ? 0.7 : 1.0;

  const columns: ParticleColumn[] = useMemo(() => {
    return Array.from({ length: columnCount }, (_, i) => {
      const leftPercent = Math.round(((i + 0.5) / columnCount) * 100);
      const delaySec = Number(((i * 1.37) % 7).toFixed(2));
      const depth = i % 3 === 0 ? 'bg' : i % 3 === 1 ? 'mid' : 'fg';
      const baseDuration = depth === 'bg' ? 16 : depth === 'mid' ? 12 : 9;
      const durationSec = Number((baseDuration * speedMultiplier).toFixed(2));

      // Select 3-6 tokens per column
      const tokenCount = 3 + (i % 3);
      const tokens: string[] = [];
      for (let t = 0; t < tokenCount; t++) {
        const tokenIndex = (i * 5 + t * 7) % DATA_TOKENS.length;
        tokens.push(DATA_TOKENS[tokenIndex]);
      }

      const isAccent = i % 4 === 0;
      let accentColorDark = '#dfbe7e';
      let accentColorLight = '#b88a24';

      if (colorTheme === 'cyan' || (colorTheme === 'mixed' && i % 2 === 0)) {
        accentColorDark = '#38bdf8';
        accentColorLight = '#0284c7';
      }

      return {
        id: i,
        leftPercent,
        delaySec,
        durationSec,
        tokens,
        depthLayer: depth,
        isAccent,
        accentColorDark,
        accentColorLight,
      };
    });
  }, [columnCount, speedMultiplier, colorTheme]);

  const effectiveOpacity = isDark ? opacity : opacity * 0.75;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      style={{ opacity: effectiveOpacity }}
    >
      <style>{`
        @keyframes digitalDataFall {
          0% {
            transform: translate3d(0, -100%, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translate3d(0, 100vh, 0);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-digital-data {
            animation: none !important;
            opacity: 0.25 !important;
          }
        }
      `}</style>

      {columns.map((col) => {
        const fontSize =
          col.depthLayer === 'bg'
            ? 'text-[8px] sm:text-[9px] blur-[0.5px] opacity-40'
            : col.depthLayer === 'fg'
            ? 'text-[10px] sm:text-[11px] opacity-90'
            : 'text-[9px] sm:text-[10px] opacity-65';

        const defaultTokenColor = isDark ? '#ffffff' : '#334155';
        const accentTokenColor = isDark ? col.accentColorDark : col.accentColorLight;

        return (
          <div
            key={col.id}
            style={{
              left: `${col.leftPercent}%`,
              animation: `digitalDataFall ${col.durationSec}s linear infinite`,
              animationDelay: `-${col.delaySec}s`,
            }}
            className={`animate-digital-data absolute top-0 flex flex-col items-center gap-4 font-mono leading-none tracking-widest ${fontSize}`}
          >
            {col.tokens.map((token, tIdx) => (
              <span
                key={tIdx}
                style={{
                  color: col.isAccent && tIdx === 0 ? accentTokenColor : defaultTokenColor,
                }}
                className="whitespace-nowrap drop-shadow-sm font-light select-none transition-colors duration-300"
              >
                {token}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};
