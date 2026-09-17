import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import type { CourtNodeData } from '../../data/sudTjData';
import { useLanguage } from '../../context/LanguageContext';
import { courtSiteIdForCourt } from '../../sites/registry';

interface CourtListItemProps {
  court: CourtNodeData;
  accent: string;
  selected: boolean;
  dimmed: boolean;
  onSelect: (court: CourtNodeData) => void;
}

export const CourtListItem: React.FC<CourtListItemProps> = ({
  court,
  accent,
  selected,
  dimmed,
  onSelect,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const siteId = courtSiteIdForCourt(court);

  const handleClick = () => {
    // Courts with a working internal site navigate there, others open the context hub
    if (siteId) navigate('/courts/' + siteId);
    else onSelect(court);
  };

  const name =
    language === 'en' ? court.nameEn || court.nameRu : language === 'tj' ? court.nameTj : court.nameRu;
  const typeLabel =
    court.type === 'city'
      ? language === 'tj' ? 'Суди шаҳрӣ' : language === 'en' ? 'City court' : 'Городской суд'
      : court.type === 'district'
      ? language === 'tj' ? 'Суди ноҳия' : language === 'en' ? 'District court' : 'Районный суд'
      : court.type === 'regional'
      ? language === 'tj' ? 'Суди вилоятӣ' : language === 'en' ? 'Regional court' : 'Областной суд'
      : court.type === 'military'
      ? language === 'tj' ? 'Суди ҳарбӣ' : language === 'en' ? 'Military court' : 'Военный суд'
      : language === 'tj' ? 'Суд' : language === 'en' ? 'Court' : 'Суд';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className="w-full flex items-center gap-2.5 px-2.5 py-3 min-h-[48px] rounded-[10px] border text-left transition-all duration-200 cursor-pointer group hover:-translate-y-[1px]"
      style={
        selected
          ? { borderColor: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }
          : { borderColor: 'transparent', borderBottomColor: 'var(--jm-border)' }
      }
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = accent + '88';
          (e.currentTarget as HTMLElement).style.background = accent + '0d';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      <MapPin size={15} strokeWidth={1.75} className="shrink-0 text-[var(--jm-muted)] transition-colors" />
      <span className="flex-1 min-w-0" style={{ opacity: dimmed ? 0.35 : 1 }}>
        <span className="block text-[13px] font-medium text-[var(--jm-text)] leading-snug">{name}</span>
        <span className="block font-mono text-[10px] text-[var(--jm-muted)] leading-tight mt-0.5">{typeLabel}</span>
      </span>
      <ChevronRight size={14} className="shrink-0 text-[var(--jm-muted)] group-hover:translate-x-0.5 transition-all" />
    </button>
  );
};
