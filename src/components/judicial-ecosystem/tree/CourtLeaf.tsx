import React from 'react';
import { CourtNodeData, getCourtShortName, getCourtName } from '../../../data/sudTjData';
import { useLanguage } from '../../../context/LanguageContext';
import { Shield } from 'lucide-react';

interface CourtLeafProps {
  court: CourtNodeData;
  colorHex: string;
  isHighlighted: boolean;
  isSelected: boolean;
  onSelect: (court: CourtNodeData) => void;
  x: number;
  y: number;
  visible: boolean;
}

export const CourtLeaf: React.FC<CourtLeafProps> = ({
  court,
  colorHex,
  isHighlighted,
  isSelected,
  onSelect,
  x,
  y,
  visible,
}) => {
  const { language } = useLanguage();
  const isMilitary = court.type === 'military';
  const isRegional = court.type === 'regional';

  const shortLabel = getCourtShortName(court, language);
  const fullTitle = getCourtName(court, language);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={fullTitle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(court);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(court);
      }}
      className={`
        absolute flex items-center justify-center cursor-pointer group select-none
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        ${isSelected ? 'z-50' : 'z-20'}
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        width: '148px',
        height: '42px',
      }}
    >
      <div
        className={`
          w-full h-full rounded-lg border px-2.5 flex items-center justify-center relative
          backdrop-blur-xl transition-all duration-250
          ${
            isSelected
              ? 'border-theme-gold bg-theme-surface shadow-[0_0_20px_rgba(223,190,126,0.5)] scale-105'
              : isHighlighted
              ? 'border-[#dfbe7e] bg-theme-surface shadow-[0_0_18px_rgba(223,190,126,0.4)] scale-105'
              : 'border-theme-border/80 hover:border-theme-gold/80 bg-theme-surface/90 hover:bg-theme-surface hover:shadow-md hover:scale-105'
          }
        `}
        style={{
          borderLeftWidth: isRegional ? '4px' : '2px',
          borderLeftColor: colorHex,
        }}
      >
        {/* Military indicator badge */}
        {isMilitary && (
          <Shield
            size={13}
            className="text-red-400 absolute left-1.5 top-1/2 -translate-y-1/2 shrink-0"
          />
        )}

        {/* Short readable text label in Times New Roman / Serif */}
        <span
          className={`
            font-serif text-[12px] sm:text-[13px] font-bold text-center tracking-wide text-theme-text
            leading-tight px-1 line-clamp-2
            ${isMilitary ? 'pl-3' : ''}
          `}
          title={fullTitle}
        >
          {shortLabel}
        </span>
      </div>

      {/* Floating Precision Tooltip on Hover */}
      <div
        className="
          absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none z-50 w-max max-w-[260px] p-2 rounded-lg
          bg-theme-surface border border-theme-border shadow-2xl text-center
        "
      >
        <span className="text-[11px] font-mono text-theme-text leading-tight block">
          {fullTitle}
        </span>
        <span className="text-[9px] font-mono text-theme-gold uppercase tracking-wider block mt-1">
          {court.domain}
        </span>
      </div>
    </div>
  );
};
