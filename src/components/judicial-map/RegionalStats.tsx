import React from 'react';
import { Building2, Scale } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SlidingNumber } from '../animate-ui/primitives/texts/sliding-number';

interface RegionalStatsProps {
  accent: string;
  cities: number;
  districts: number;
  activeFilter: 'all' | 'city' | 'district' | 'military';
  onToggleFilter: (t: 'city' | 'district') => void;
}

export const RegionalStats: React.FC<RegionalStatsProps> = ({
  accent,
  cities,
  districts,
  activeFilter,
  onToggleFilter,
}) => {
  const { language } = useLanguage();
  const cityLabel = language === 'tj' ? 'Суди шаҳрӣ' : language === 'en' ? 'City courts' : 'Городские суды';
  const districtLabel = language === 'tj' ? 'Суди ноҳия' : language === 'en' ? 'District courts' : 'Районные суды';

  const card = (active: boolean) => ({
    className: `flex-1 rounded-[10px] border p-2.5 flex items-center gap-2.5 text-left transition-all duration-200 cursor-pointer hover:-translate-y-[1px] min-h-[64px] ${
      active
        ? 'shadow-[0_0_25px_rgba(0,0,0,0.12)]'
        : 'bg-white/[0.02] hover:bg-white/[0.05]'
    }`,
    style: active
      ? { borderColor: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }
      : { borderColor: 'var(--jm-border)' },
  });

  return (
    <div className="w-full grid grid-cols-2 gap-2">
      <button type="button" onClick={() => onToggleFilter('city')} aria-pressed={activeFilter === 'city'} {...card(activeFilter === 'city')}>
        <span
          className="p-1.5 rounded-lg border shrink-0"
          style={{ color: accent, borderColor: accent + '55', background: accent + '14' }}
        >
          <Building2 size={15} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-lg sm:text-xl font-bold text-[var(--jm-text)] leading-none">
            <SlidingNumber value={cities} />
          </span>
          <span className="block font-mono text-[9px] sm:text-[10px] text-[var(--jm-muted)] leading-tight mt-1 truncate">
            {cityLabel}
          </span>
        </span>
      </button>
      <button type="button" onClick={() => onToggleFilter('district')} aria-pressed={activeFilter === 'district'} {...card(activeFilter === 'district')}>
        <span
          className="p-1.5 rounded-lg border shrink-0"
          style={{ color: accent, borderColor: accent + '55', background: accent + '14' }}
        >
          <Scale size={15} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-lg sm:text-xl font-bold text-[var(--jm-text)] leading-none">
            <SlidingNumber value={districts} />
          </span>
          <span className="block font-mono text-[9px] sm:text-[10px] text-[var(--jm-muted)] leading-tight mt-1 truncate">
            {districtLabel}
          </span>
        </span>
      </button>
    </div>
  );
};
