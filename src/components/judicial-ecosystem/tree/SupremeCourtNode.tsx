import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { SUPREME_COURT_NODE, getCourtName } from '../../../data/sudTjData';
import { NationalEmblem } from '../NationalEmblem';

interface SupremeCourtNodeProps {
  onClick: () => void;
  isSelected?: boolean;
}

export const SupremeCourtNode: React.FC<SupremeCourtNodeProps> = ({
  onClick,
  isSelected = false,
}) => {
  const { language, t } = useLanguage();

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={getCourtName(SUPREME_COURT_NODE, language)}
      className={`
        relative w-[340px] h-[74px] rounded-xl cursor-pointer select-none
        flex items-center gap-3.5 px-4
        border transition-all duration-300
        backdrop-blur-xl shadow-lg
        ${
          isSelected
            ? 'border-theme-gold bg-theme-surface shadow-[0_0_30px_rgba(223,190,126,0.35)] scale-105'
            : 'border-[#dfbe7e]/60 hover:border-[#dfbe7e] bg-theme-surface/95 hover:bg-theme-surface hover:shadow-[0_0_25px_rgba(223,190,126,0.2)]'
        }
      `}
      style={{
        boxShadow: isSelected
          ? '0 0 25px rgba(223, 190, 126, 0.4)'
          : '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* State Emblem */}
      <div className="shrink-0 flex items-center justify-center">
        <NationalEmblem size={44} />
      </div>

      {/* Typography Hierarchy */}
      <div className="flex-1 min-w-0 text-left">
        <div className="font-mono text-[9px] text-[#dfbe7e] font-bold tracking-widest uppercase mb-0.5 opacity-90">
          {t('network.supremeCourtNodeRole')}
        </div>
        <h3 className="font-serif font-bold text-[14px] sm:text-[15px] text-theme-text leading-tight tracking-wide line-clamp-2">
          {getCourtName(SUPREME_COURT_NODE, language)}
        </h3>
      </div>

      {/* Authority Badge */}
      <div className="shrink-0 flex flex-col items-end justify-center pl-2 border-l border-theme-border/60">
        <span className="w-2 h-2 rounded-full bg-theme-gold animate-pulse shadow-[0_0_8px_#dfbe7e]" />
        <span className="font-mono text-[8px] text-theme-textMuted uppercase mt-1">
          RT.00
        </span>
      </div>
    </div>
  );
};
