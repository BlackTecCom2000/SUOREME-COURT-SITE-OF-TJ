import React, { useState } from 'react';
import { CourtNodeData, RegionCluster } from '../../../data/sudTjData';
import { useLanguage } from '../../../context/LanguageContext';
import { BlueprintCourtNode } from './BlueprintCourtNode';

import { Shield, MapPin, ChevronDown } from 'lucide-react';

interface BlueprintRegionalColumnProps {
  cluster: RegionCluster & { courts: CourtNodeData[] };
  columnNumber: number;
  onSelectCourt: (court: CourtNodeData) => void;
  onSelectRegion?: (regionId: string) => void;
  selectedCourtId?: string;
  selectedRegion?: string;
  activeCourtTypeFilter?: string;
  searchQuery?: string;
  isFocused?: boolean;
  onHoverColumn?: (regionId: string | null) => void;
}

export const BlueprintRegionalColumn: React.FC<BlueprintRegionalColumnProps> = ({
  cluster,
  columnNumber,
  onSelectCourt,
  onSelectRegion,
  selectedCourtId,
  selectedRegion = 'all',
  activeCourtTypeFilter = 'all',
  searchQuery = '',
  isFocused = false,
  onHoverColumn,
}) => {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const isRegionSelected = selectedRegion === cluster.id;
  const isRegionMuted = selectedRegion !== 'all' && !isRegionSelected;

  const isMatched = (c: CourtNodeData) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return !!(
        c.nameRu.toLowerCase().includes(q) ||
        c.nameTj.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        (c.domain && c.domain.toLowerCase().includes(q))
      );
    }
    if (activeCourtTypeFilter !== 'all') {
      if (activeCourtTypeFilter === 'city') return c.type === 'city';
      if (activeCourtTypeFilter === 'district') return c.type === 'district';
      if (activeCourtTypeFilter === 'military') return c.type === 'military';
      if (activeCourtTypeFilter === 'regional') return c.type === 'regional';
      return false;
    }
    return true;
  };

  const isDimmed = (c: CourtNodeData) => {
    if (isRegionMuted) return true;
    if (searchQuery.trim()) {
      return !isMatched(c);
    }
    if (activeCourtTypeFilter !== 'all') {
      return !isMatched(c);
    }
    return false;
  };

  // Find Regional Court, Military Court, and Ordinary Courts
  const regionalCourt =
    cluster.courts.find((c) => c.type === 'regional') || cluster.courts[0];
  const militaryCourt =
    cluster.courts.find((c) => c.type === 'military') || {
      id: `harbi-${cluster.id}`,
      nameRu: `Военный суд гарнизона ${cluster.shortNameRu}`,
      nameTj: `Суди ҳарбии гарнизони ${cluster.shortNameTj}`,
      domain: `${cluster.id}-harbii.sud.tj`,
      type: 'military' as const,
      regionId: cluster.id,
      url: `http://${cluster.id}-harbii.sud.tj`,
      addressRu: '',
      addressTj: '',
      phone: '',
      email: '',
      status: 'online' as const,
    };

  const ordinaryCourts = cluster.courts.filter(
    (c) => c.type !== 'regional' && c.type !== 'military'
  );
  const cityCount = ordinaryCourts.filter((c) => c.type === 'city').length;
  const districtCount = ordinaryCourts.filter((c) => c.type === 'district').length;

  const headerPillTitle =
    columnNumber === 1
      ? language === 'tj'
        ? 'NODE 1: ВМКБ (GBAO)'
        : language === 'en'
        ? 'NODE 1: GBAO CLUSTER'
        : 'NODE 1: ВМКБ (ГБАО)'
      : columnNumber === 2
      ? language === 'tj'
        ? 'NODE 2: ХАТЛОН'
        : language === 'en'
        ? 'NODE 2: KHATLON CLUSTER'
        : 'NODE 2: ХАТЛОН'
      : columnNumber === 3
      ? language === 'tj'
        ? 'NODE 3: СУҒД'
        : language === 'en'
        ? 'NODE 3: SUGHD CLUSTER'
        : 'NODE 3: СОГД'
      : language === 'tj'
      ? 'NODE 4: ДУШАНБЕ (РРП)'
      : language === 'en'
      ? 'NODE 4: DUSHANBE CLUSTER'
      : 'NODE 4: ДУШАНБЕ (РРП)';

  // Court list: default 5-6, expand shows all — prevents infinite cards
  const visibleCourts = expanded ? ordinaryCourts : ordinaryCourts.slice(0, 5);
  let gridRows: CourtNodeData[][] = [];
  if (cluster.id === 'gbao') {
    for (let i = 0; i < visibleCourts.length; i += 2) {
      gridRows.push(visibleCourts.slice(i, i + 2));
    }
  } else {
    for (let i = 0; i < visibleCourts.length; i += 3) {
      gridRows.push(visibleCourts.slice(i, i + 3));
    }
  }

  return (
    <div
      onMouseEnter={() => onHoverColumn?.(cluster.id)}
      onMouseLeave={() => onHoverColumn?.(null)}
      className={`
        relative flex-1 min-w-[340px] max-w-[460px] flex flex-col items-center select-none transition-all duration-300
        ${isFocused || isRegionSelected ? 'scale-101 z-30 opacity-100' : isRegionMuted ? 'opacity-35 hover:opacity-75 z-10' : 'opacity-100 z-20'}
      `}
    >
      {/* 1. Regional header — unified glass, region color only as dot accent */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectRegion?.(cluster.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectRegion?.(cluster.id);
          }
        }}
        className={`
          relative w-full py-2.5 px-4 rounded-full cursor-pointer glass glass-card group flex items-center justify-center gap-2
          ${isRegionSelected ? 'glass-active !border-[var(--court-gold)] text-theme-text' : 'hover:border-[var(--court-gold)]/40 text-theme-text'}
        `}
        aria-pressed={isRegionSelected}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cluster.colorHex, boxShadow: `0 0 6px ${cluster.colorHex}60` }} aria-hidden="true" />
        <span className="font-mono font-bold text-[11px] uppercase tracking-widest text-center truncate">
          {headerPillTitle}
        </span>
      </div>

      {/* 2. Region card — unified Global GlassSurface 24px, accent only via top line */}
      <div
        className={`
          relative w-full glass glass-card p-3.5 mt-2.5 flex flex-col items-center
          ${isRegionSelected ? 'glass-active' : ''}
        `}
      >
        {/* Tiny accent line — region color as small identifier */}
        <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60" style={{ backgroundColor: cluster.colorHex }} aria-hidden="true" />
        {/* TOP ROW: Regional Court Main Node (fake server-metrics placeholder removed — no telemetry source) */}
        <div className="w-full flex items-center gap-3 mb-2.5">
          {/* Regional Court Primary Node */}
          <div className="flex-1">
            <BlueprintCourtNode
              court={regionalCourt}
              colorHex={cluster.colorHex}
              isRegionalHeaderNode={true}
              height="72px"
              isSelected={selectedCourtId === regionalCourt.id}
              isHighlighted={isMatched(regionalCourt)}
              isDimmed={isDimmed(regionalCourt)}
              onSelect={onSelectCourt}
            />
          </div>
        </div>

        {/* Subtle informational divider */}
        <div className="w-full h-px bg-white/10 my-2" aria-hidden="true" />

        {/* Compact statistics — subtle glass, no inner heavy borders */}
        <div className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl glass border border-white/10 font-mono text-[10px] text-theme-textMuted">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cluster.colorHex }} aria-hidden="true" /> 1 {language === 'tj' ? 'вилоятӣ' : language === 'en' ? 'regional' : 'областной'}</span>
          <span className="opacity-30">•</span>
          <span>{cityCount} {language === 'tj' ? 'шаҳрӣ' : language === 'en' ? 'city' : 'городских'}</span>
          <span className="opacity-30">•</span>
          <span>{districtCount} {language === 'tj' ? 'ноҳия' : language === 'en' ? 'district' : 'районных'}</span>
        </div>

        {/* 3. CITY & DISTRICT COURTS — default 5-6, show all */}
        <div className="w-full flex flex-col gap-1.5 mt-2">
          {gridRows.map((row, rowIdx) => (
            <div
              key={`row-${cluster.id}-${rowIdx}`}
              className="w-full grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
              }}
            >
              {row.map((court) => (
                <BlueprintCourtNode
                  key={`court-${court.id}`}
                  court={court}
                  colorHex={cluster.colorHex}
                  height="52px"
                  isSelected={selectedCourtId === court.id}
                  isHighlighted={isMatched(court)}
                  isDimmed={isDimmed(court)}
                  onSelect={onSelectCourt}
                />
              ))}
            </div>
          ))}
        </div>
        {ordinaryCourts.length > 5 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 w-full py-1.5 rounded-xl glass border border-white/10 hover:border-[var(--court-gold)]/40 text-[10px] font-mono uppercase tracking-wider text-theme-textMuted hover:text-theme-text transition-colors flex items-center justify-center gap-1.5 min-h-[32px]"
            aria-expanded={expanded}
          >
            <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded
              ? language === 'tj' ? 'Пинҳон кардан' : language === 'en' ? 'Show less' : 'Скрыть'
              : language === 'tj' ? `Нишон додани ҳама (${ordinaryCourts.length})` : language === 'en' ? `Show all (${ordinaryCourts.length})` : `Показать все (${ordinaryCourts.length})`}
          </button>
        )}

        {/* 4. MILITARY COURT — minimal separator */}
        <div className="w-full flex items-center justify-center mt-3 pt-2 border-t border-white/5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSelectCourt(militaryCourt)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCourt(militaryCourt);
              }
            }}
            className={`
              relative w-full max-w-[340px] py-1.5 px-3 glass glass-card flex items-center justify-center gap-2 transition-all duration-200
              ${isDimmed(militaryCourt) ? 'opacity-30' : 'opacity-100'}
              ${selectedCourtId === militaryCourt.id || isMatched(militaryCourt) ? 'glass-active' : ''}
            `}
          >
            <Shield
              size={12}
              className="shrink-0"
              style={{ color: cluster.colorHex }}
              aria-hidden="true"
            />
            <MapPin size={10} className="shrink-0 opacity-50" aria-hidden="true" />
            <span className="font-mono font-medium tracking-wider text-[10px] uppercase truncate text-theme-text">
              {language === 'tj' ? militaryCourt.nameTj : militaryCourt.nameRu}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
