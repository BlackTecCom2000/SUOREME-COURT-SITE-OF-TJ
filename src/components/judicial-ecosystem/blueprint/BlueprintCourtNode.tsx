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
        relative rounded-lg p-1.5 flex flex-col items-center justify-center text-center cursor-pointer select-none
        border transition-all duration-300 group
        ${isDimmed ? 'opacity-30 grayscale-[40%]' : 'opacity-100'}
        ${
          isDark
            ? isSelected
              ? 'bg-[#0b1428] shadow-[0_0_22px_rgba(223,190,126,0.9)] scale-105 z-30 border-white ring-2 ring-amber-400'
              : isHighlighted
              ? 'bg-[#0e172e] shadow-[0_0_18px_rgba(223,190,126,0.7)] scale-105 z-30 border-amber-400'
              : 'bg-[#060c1c]/90 hover:bg-[#09132a] hover:scale-102 z-10'
            : isSelected
            ? 'bg-white shadow-[0_4px_18px_rgba(184,138,36,0.5)] scale-105 z-30 border-slate-950 ring-2 ring-amber-500'
            : isHighlighted
            ? 'bg-[#fefce8] shadow-[0_4px_14px_rgba(202,138,4,0.4)] scale-105 z-30 border-amber-600'
            : 'bg-white/95 hover:bg-white hover:scale-102 z-10'
        }
      `}
      style={{
        width,
        height,
        borderColor: isSelected
          ? isDark ? '#ffffff' : '#0f172a'
          : isHighlighted
          ? isDark ? '#dfbe7e' : '#ca8a04'
          : `${colorHex}${isDark ? '90' : '70'}`,
        boxShadow: isDark
          ? isSelected
            ? `0 0 20px ${colorHex}, 0 0 10px #dfbe7e`
            : isHighlighted
            ? '0 0 16px rgba(223, 190, 126, 0.6)'
            : `0 2px 8px rgba(0, 0, 0, 0.5), inset 0 0 8px ${colorHex}15`
          : isSelected
          ? `0 4px 14px ${colorHex}60`
          : isHighlighted
          ? '0 4px 12px rgba(202, 138, 4, 0.35)'
          : `0 2px 6px rgba(0, 0, 0, 0.06), inset 0 0 4px ${colorHex}10`,
      }}
    >
      {/* Type Prefix */}
      <span
        className={`
          font-serif leading-none tracking-tight block truncate max-w-full px-1
          ${
            isDark
              ? isRegionalHeaderNode
                ? 'text-[11px] mb-1 text-white/90 font-medium'
                : 'text-[8.5px] sm:text-[9px] mb-0.5 text-white/70'
              : isRegionalHeaderNode
              ? 'text-[11px] mb-1 text-slate-700 font-medium'
              : 'text-[8.5px] sm:text-[9px] mb-0.5 text-slate-500'
          }
        `}
      >
        {typePrefix}
      </span>

      {/* Main Short Name in Bold Serif */}
      <h5
        className={`
          font-serif font-bold leading-tight tracking-wide block truncate max-w-full px-0.5
          ${
            isDark
              ? isRegionalHeaderNode
                ? 'text-[14px] sm:text-[15px] text-[#ffe082]'
                : isSelected || isHighlighted
                ? 'text-[#ffe082]'
                : 'text-white'
              : isRegionalHeaderNode
              ? 'text-[14px] sm:text-[15px] text-[#854d0e]'
              : isSelected || isHighlighted
              ? 'text-[#854d0e]'
              : 'text-slate-900'
          }
        `}
      >
        {isRegionalHeaderNode
          ? court.nameTj.replace(/^(Суди вилояти|Суди шаҳри) /i, '').toUpperCase()
          : shortName}
      </h5>
    </div>
  );
};
