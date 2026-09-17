import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';
import type { CourtNodeData } from '../../data/sudTjData';
import { useLanguage } from '../../context/LanguageContext';
import { courtSiteIdForCourt } from '../../sites/registry';

interface MilitaryCourtButtonProps {
  court: CourtNodeData;
  accent: string;
  selected: boolean;
  dimmed: boolean;
  onSelect: (court: CourtNodeData) => void;
}

export const MilitaryCourtButton: React.FC<MilitaryCourtButtonProps> = ({
  court,
  accent,
  selected,
  dimmed,
  onSelect,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const siteId = courtSiteIdForCourt(court);
  const name =
    language === 'en' ? court.nameEn || court.nameRu : language === 'tj' ? court.nameTj : court.nameRu;
  return (
    <button
      type="button"
      onClick={() => {
        if (siteId) navigate('/courts/' + siteId);
        else onSelect(court);
      }}
      aria-pressed={selected}
      className="w-full flex items-center gap-2.5 px-3 py-3 min-h-[48px] rounded-[10px] border text-left transition-all duration-200 cursor-pointer group hover:-translate-y-[1px] mt-2"
      style={
        selected
          ? { borderColor: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }
          : { borderColor: 'var(--jm-border)', background: 'transparent' }
      }
      onMouseEnter={(e) => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = accent;
      }}
      onMouseLeave={(e) => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--jm-border)';
      }}
    >
      <Shield size={15} strokeWidth={1.75} className="shrink-0" style={{ color: accent }} />
      <span className="flex-1 min-w-0 text-[13px] font-medium text-[var(--jm-text)] leading-snug" style={{ opacity: dimmed ? 0.35 : 1 }}>
        {name}
      </span>
      <ChevronRight size={14} className="shrink-0 text-[var(--jm-muted)] group-hover:translate-x-0.5 transition-all" />
    </button>
  );
};
