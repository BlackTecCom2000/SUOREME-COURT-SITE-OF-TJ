import React from 'react';
import { CourtNodeData, getCourtShortName, getCourtName } from '../../../data/sudTjData';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

interface BlueprintCourtNodeProps {
  court: CourtNodeData;
  colorHex: string;
  isHighlighted?: boolean;
  isSelected?: boolean;
  isDimmed?: boolean;
  onSelect: (court: CourtNodeData) => void;
  width?: string;
  height?: string;
  isRegionalHeaderNode?: boolean;
}

export const BlueprintCourtNode: React.FC<BlueprintCourtNodeProps> = ({
  court,
  colorHex,
  isHighlighted = false,
  isSelected = false,
  isDimmed = false,
  onSelect,
  width = '100%',
  height = '52px',
  isRegionalHeaderNode = false,
}) => {
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const shortName = getCourtShortName(court, language);
  const fullName = getCourtName(court, language);

  const typePrefix =
    court.type === 'regional'
      ? language === 'tj'
        ? 'Суди вилояти'
        : language === 'en'
        ? 'Regional Court of'
        : 'Областной суд'
      : court.type === 'city'
      ? language === 'tj'
        ? 'Суди шаҳри'
        : language === 'en'
        ? 'City Court of'
        : 'Городской суд'
      : court.type === 'military'
      ? language === 'tj'
        ? 'Суди ҳарбии'
        : language === 'en'
        ? 'Military Court of'
        : 'Военный суд'
      : language === 'tj'
      ? 'Суди ноҳияи'
      : language === 'en'
      ? 'District Court of'
      : 'Районный суд';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={fullName}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(court);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(court);
        }
      }}
      className={`
        relative rounded-md p-2 flex flex-col items-center justify-center text-center cursor-pointer select-none
        border border-l-[3px] transition-all duration-300 group
        ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
        ${
          isDark
            ? isSelected
              ? 'bg-[#0f172a]/90 shadow-[0_0_20px_rgba(223,190,126,0.3)] scale-[1.03] z-30'
              : isHighlighted
              ? 'bg-[#0f172a]/80 shadow-[0_0_15px_rgba(223,190,126,0.2)] scale-[1.03] z-30'
              : 'bg-[#020617]/75 hover:bg-[#0f172a]/80 hover:scale-[1.02] z-10'
            : isSelected
            ? 'bg-[var(--glass-surface-active)] shadow-[0_4px_16px_rgba(0,0,0,0.1)] scale-[1.03] z-30'
            : isHighlighted
            ? 'bg-[var(--glass-surface-hover)] shadow-[0_4px_12px_rgba(202,138,4,0.1)] scale-[1.03] z-30'
            : 'bg-[var(--glass-surface)] hover:bg-[var(--glass-surface-hover)] hover:scale-[1.02] z-10'
        }
      `}
      style={{
        width,
        height,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.1)',
        borderLeftColor: isSelected || isHighlighted ? (isDark ? '#dfbe7e' : '#ca8a04') : colorHex,
      }}
    >
      {/* Node Status LED */}
      <div className="absolute top-1.5 left-1.5 flex items-center justify-center">
        <div className={`w-1.5 h-1.5 rounded-full ${isDimmed ? 'bg-slate-500/50' : 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]'}`} />
      </div>
      {/* Type Prefix */}
      <span
        className={`
          font-mono leading-none tracking-wider block truncate max-w-full px-1 uppercase
          ${
            isDark
              ? isRegionalHeaderNode
                ? 'text-[9px] mb-1 text-slate-400'
                : 'text-[8.5px] mb-0.5 text-slate-500'
              : isRegionalHeaderNode
              ? 'text-[9px] mb-1 text-slate-500'
              : 'text-[8.5px] mb-0.5 text-slate-400'
          }
        `}
      >
        {typePrefix}
      </span>

      {/* Main Short Name in Bold Serif */}
      <h5
        className={`
          font-mono font-semibold leading-tight tracking-wide block truncate max-w-full px-0.5
          ${
            isDark
              ? isRegionalHeaderNode
                ? 'text-[14px] text-white'
                : isSelected || isHighlighted
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-300'
              : isRegionalHeaderNode
              ? 'text-[14px] text-slate-900'
              : isSelected || isHighlighted
              ? 'text-slate-900 font-bold'
              : 'text-slate-700'
          }
          ${isRegionalHeaderNode ? 'text-[14px]' : 'text-[11px] sm:text-[12px]'}
        `}
      >
        {isRegionalHeaderNode
          ? court.nameTj.replace(/^(Суди вилояти|Суди шаҳри) /i, '').toUpperCase()
          : shortName}
      </h5>
    </div>
  );
};
