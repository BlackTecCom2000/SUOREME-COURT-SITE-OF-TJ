import React from 'react';
import { CourtNodeData, getCourtShortName, getCourtName } from '../../../data/sudTjData';
import { useLanguage } from '../../../context/LanguageContext';
import { MapPin, ChevronRight } from 'lucide-react';

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
      aria-pressed={isSelected}
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
        relative glass glass-card min-h-[44px] p-2.5 flex items-center gap-2 cursor-pointer select-none text-left
        ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
        ${isSelected ? 'glass-active !border-[var(--court-gold)]' : isHighlighted ? 'border-[var(--court-gold)]/40 bg-[var(--glass-surface-hover)]' : 'hover:border-white/20'}
        ${isRegionalHeaderNode ? 'py-3' : ''}
      `}
      style={{
        width,
        height,
        borderLeftWidth: '2px',
        borderLeftColor: isSelected || isHighlighted ? 'var(--court-gold)' : colorHex,
      }}
    >
      {/* Tiny accent dot — region color as small identifier */}
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colorHex }} aria-hidden="true" />
      <MapPin size={11} className="shrink-0 opacity-50" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[9px] uppercase tracking-wider text-theme-textMuted block truncate leading-none">{typePrefix}</span>
        <span className={`font-medium block truncate leading-tight ${isRegionalHeaderNode ? 'text-[13px] text-theme-text' : 'text-[11px] sm:text-xs text-theme-text'}`}>
          {isRegionalHeaderNode
            ? court.nameTj.replace(/^(Суди вилояти|Суди шаҳри) /i, '').toUpperCase()
            : shortName}
        </span>
      </div>
      <ChevronRight size={12} className="shrink-0 opacity-20 group-hover:opacity-60" aria-hidden="true" />
    </div>
  );
};
