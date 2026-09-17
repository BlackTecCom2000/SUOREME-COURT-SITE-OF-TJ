import React from 'react';
import { Shield, MapPin } from 'lucide-react';
import { CourtNodeData, getCourtName, getCourtShortName } from '../../data/sudTjData';
import { useLanguage } from '../../context/LanguageContext';

interface CourtNodeProps {
  court: CourtNodeData;
  colorHex: string;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onSelect: (court: CourtNodeData) => void;
  compact?: boolean;
}

export const CourtNode: React.FC<CourtNodeProps> = ({
  court,
  colorHex,
  isHighlighted = false,
  isSelected = false,
  onSelect,
  compact = false,
}) => {
  const { language } = useLanguage();
  const courtName = getCourtName(court, language);
  const shortName = getCourtShortName(court, language);

  return (
    <button
      type="button"
      aria-label={courtName}
      onClick={() => onSelect(court)}
      style={{
        borderColor: isSelected
          ? colorHex
          : isHighlighted
          ? colorHex
          : undefined,
        boxShadow: isSelected
          ? `0 0 20px ${colorHex}35`
          : isHighlighted
          ? `0 0 15px ${colorHex}25`
          : undefined,
      }}
      className={`group relative w-full text-left p-3 rounded-xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-theme-borderHover hover:bg-theme-surfaceHover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-gold transition-all duration-200 cursor-pointer flex flex-col justify-between select-none shadow-sm ${
        isSelected ? 'ring-1' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            style={{ backgroundColor: colorHex }}
            className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs"
          />
          <span className="font-mono text-[10px] text-theme-textMuted truncate">
            {court.domain}
          </span>
        </div>

        {court.type === 'military' && (
          <Shield size={12} className="text-violet-400 shrink-0" />
        )}
      </div>

      <div className="mt-1.5">
        <h5
          className={`font-medium text-theme-text group-hover:text-theme-gold transition-colors leading-tight ${
            compact ? 'text-xs line-clamp-2' : 'text-sm'
          }`}
          title={courtName}
        >
          {shortName}
        </h5>
      </div>

      {!compact && (
        <div className="mt-2 pt-1.5 border-t border-theme-border flex items-center justify-between text-[10px] font-mono text-theme-textMuted">
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            <span className="truncate max-w-[140px]">{court.addressRu}</span>
          </span>
          <span className="text-theme-gold">SUD.TJ</span>
        </div>
      )}
    </button>
  );
};
