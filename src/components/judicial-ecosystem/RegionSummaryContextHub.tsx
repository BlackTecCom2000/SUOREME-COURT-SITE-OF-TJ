import React from 'react';
import {
  RegionCluster,
  CourtNodeData,
  getRegionName,
  getCourtName,
} from '../../data/sudTjData';
import { useLanguage } from '../../context/LanguageContext';
import {
  Landmark,
  Building2,
  MapPin,
  Shield,
  ChevronRight,
  X,
} from 'lucide-react';

interface RegionSummaryContextHubProps {
  cluster: RegionCluster & { courts: CourtNodeData[] };
  onClose: () => void;
  onSelectCourt: (court: CourtNodeData) => void;
}

export const RegionSummaryContextHub: React.FC<RegionSummaryContextHubProps> = ({
  cluster,
  onClose,
  onSelectCourt,
}) => {
  const { language } = useLanguage();

  const regionName = getRegionName(cluster, language);
  const total = cluster.courts.length;
  const cities = cluster.courts.filter((c) => c.type === 'city').length;
  const districts = cluster.courts.filter((c) => c.type === 'district').length;
  const military = cluster.courts.filter((c) => c.type === 'military').length;

  const regionalCourt = cluster.courts.find((c) => c.type === 'regional') || cluster.courts[0];

  return (
    <div
      className={`
        relative w-full glass glass-panel p-5 sm:p-7 transition-all duration-300 animate-fadeIn select-none text-left
      `}
    >
      {/* 1. Top Breadcrumb & Close */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-theme-border">
        <div className="flex items-center gap-2 font-mono text-xs text-theme-textMuted">
          <span className="text-theme-gold font-semibold">
            {language === 'tj' ? 'Судҳои ҶТ' : language === 'en' ? 'Courts of RT' : 'Суды Республики'}
          </span>
          <ChevronRight size={13} className="text-theme-textMuted" />
          <span style={{ color: cluster.colorHex }} className="font-bold uppercase">
            {regionName}
          </span>
          <span className="text-theme-textMuted font-mono text-[11px]">({total} органов)</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть сводку региона"
          className="p-1.5 rounded-lg text-theme-textMuted hover:text-theme-text hover:bg-theme-bg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Region Title & Quick Portal Link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: cluster.colorHex }}
            />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-theme-textSec">
              Региональная судебная юрисдикция
            </span>
          </div>
          <h3 className="font-serif font-bold text-2xl text-theme-text tracking-wide">
            {cluster.nameRu}
          </h3>
        </div>

        {regionalCourt && (
          <button
            type="button"
            onClick={() => onSelectCourt(regionalCourt)}
            className="px-4 py-2 rounded-xl border border-theme-gold/40 bg-theme-gold/15 text-theme-gold hover:bg-theme-gold/25 font-mono text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <span>Карточка областного суда</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* 3. Regional Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono text-xs">
        <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/60 flex items-center justify-between">
          <div>
            <span className="text-2xs text-theme-textMuted uppercase block">Всего органов</span>
            <span className="text-lg font-bold text-theme-text">{total}</span>
          </div>
          <Landmark size={18} className="text-theme-gold" />
        </div>

        <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/60 flex items-center justify-between">
          <div>
            <span className="text-2xs text-theme-textMuted uppercase block">Городских судов</span>
            <span className="text-lg font-bold text-theme-text">{cities}</span>
          </div>
          <Building2 size={18} className="text-cyan-500" />
        </div>

        <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/60 flex items-center justify-between">
          <div>
            <span className="text-2xs text-theme-textMuted uppercase block">Районных судов</span>
            <span className="text-lg font-bold text-theme-text">{districts}</span>
          </div>
          <MapPin size={18} className="text-emerald-500" />
        </div>

        <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/60 flex items-center justify-between">
          <div>
            <span className="text-2xs text-theme-textMuted uppercase block">Гарнизон</span>
            <span className="text-lg font-bold text-theme-text">{military || 1}</span>
          </div>
          <Shield size={18} className="text-violet-500" />
        </div>
      </div>

      {/* 4. Quick Court Selector Chips in this Region */}
      <div>
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-theme-textSec block mb-2.5">
          Суды в составе региона ({cluster.courts.length}):
        </span>
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
          {cluster.courts.map((court) => (
            <button
              key={court.id}
              onClick={() => onSelectCourt(court)}
              className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-bg/80 hover:border-theme-gold hover:text-theme-gold text-theme-textSec font-serif text-xs transition-all text-left"
            >
              {getCourtName(court, language)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
