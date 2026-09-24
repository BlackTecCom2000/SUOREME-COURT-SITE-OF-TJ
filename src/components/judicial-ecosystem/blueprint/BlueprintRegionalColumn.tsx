import React from 'react';
import { CourtNodeData, RegionCluster } from '../../../data/sudTjData';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { BlueprintCourtNode } from './BlueprintCourtNode';

import { Shield } from 'lucide-react';

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
  const { isDark } = useTheme();

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

  // Dynamic 2-column or 3-column grid for clean full-name readability without truncation
  let gridRows: CourtNodeData[][] = [];
  if (cluster.id === 'gbao') {
    // 7 courts: 4 rows (2 cols)
    for (let i = 0; i < ordinaryCourts.length; i += 2) {
      gridRows.push(ordinaryCourts.slice(i, i + 2));
    }
  } else {
    // Khatlon, Sughd, Dushanbe: 3 cols grid
    for (let i = 0; i < ordinaryCourts.length; i += 3) {
      gridRows.push(ordinaryCourts.slice(i, i + 3));
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
      {/* 1. TOP CAPSULE REGIONAL HEADER (CLICKABLE TO OPEN REGION SUMMARY) */}
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
          relative w-full py-2 px-4 rounded-xl cursor-pointer
          border transition-all duration-300 backdrop-blur-md group
          ${
            isDark
              ? isRegionSelected
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(223,190,126,0.3)]'
                : 'border-[#dfbe7e]/50 bg-[#060b18]/60 text-white hover:border-amber-400 hover:bg-[#0a142e]/70'
              : isRegionSelected
                ? 'border-amber-600 bg-[var(--glass-surface-active)] text-amber-950 shadow-md ring-1 ring-amber-400'
              : 'border-[#ca8a04]/50 bg-[var(--glass-surface)] text-slate-900 hover:border-amber-600 hover:bg-[var(--glass-surface-hover)]'
          }
        `}
        style={{
          borderColor: isRegionSelected ? '#dfbe7e' : isDark ? `${cluster.colorHex}99` : `${cluster.colorHex}bb`,
          boxShadow: isDark
            ? `0 0 10px ${cluster.colorHex}20`
            : `0 2px 6px ${cluster.colorHex}15`,
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-80" />
          <span className="font-mono font-bold text-[12px] uppercase tracking-widest text-center block truncate drop-shadow-sm group-hover:scale-101 transition-transform">
            {headerPillTitle}
          </span>
        </div>
      </div>

      {/* 2. REGIONAL MAIN BOX CONTAINER - SEMI-TRANSPARENT DEEP GLASS */}
      <div
        className={`
          relative w-full rounded-2xl p-3.5 mt-2.5 flex flex-col items-center
          border backdrop-blur-xl transition-all duration-300
          ${
            isDark
              ? 'bg-[#030712]/60 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
              : 'bg-[var(--glass-surface)] shadow-[0_6px_20px_rgba(0,0,0,0.06)]'
          }
          ${isRegionSelected ? 'ring-1 ring-amber-400/50' : ''}
        `}
        style={{
          borderColor: isDark ? `${cluster.colorHex}70` : `${cluster.colorHex}90`,
          boxShadow: isDark
            ? `0 0 16px ${cluster.colorHex}15, inset 0 0 10px ${cluster.colorHex}08`
            : `0 4px 14px ${cluster.colorHex}12, inset 0 0 8px ${cluster.colorHex}06`,
        }}
      >
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

        {/* INTERNAL HIERARCHY CONNECTOR LINE (Cyber Style) */}
        <div className="w-full flex items-center justify-center my-1.5 opacity-60">
          <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-80">
            <path d="M20 0 L20 20" stroke={cluster.colorHex} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <circle cx="20" cy="10" r="3" fill={cluster.colorHex} />
          </svg>
        </div>

        {/* 3. CITY & DISTRICT COURTS GRID ROWS - SPACIOUS & READABLE */}
        <div className="w-full flex flex-col gap-1.5 mt-1">
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

        {/* 4. MILITARY COURT BOTTOM SHIELD PILL */}
        <div className="w-full flex items-center justify-center mt-3 pt-2 border-t border-white/10">
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
              relative w-full max-w-[340px] py-1.5 px-3 rounded-xl cursor-pointer
              border flex items-center justify-center gap-2 transition-all duration-200
              ${isDimmed(militaryCourt) ? 'opacity-30' : 'opacity-100'}
              ${
                isDark
                  ? selectedCourtId === militaryCourt.id
                    ? 'border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-102'
                    : isMatched(militaryCourt)
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(223,190,126,0.6)] scale-102'
                    : 'border-white/20 bg-[#060c1c]/75 hover:border-white/60 hover:bg-[#0a142e]/80'
                  : selectedCourtId === militaryCourt.id
                  ? 'border-slate-900 bg-slate-900/90 text-white shadow-md scale-102'
                  : isMatched(militaryCourt)
                  ? 'border-amber-600 bg-[var(--glass-surface-active)] text-amber-950 shadow-md scale-102'
                  : 'border-slate-300 bg-[var(--glass-surface)] hover:border-slate-600 hover:bg-[var(--glass-surface-hover)]'
              }
            `}
            style={{
              borderColor:
                selectedCourtId === militaryCourt.id
                  ? isDark ? '#ffffff' : '#0f172a'
                  : isMatched(militaryCourt)
                  ? isDark ? '#dfbe7e' : '#ca8a04'
                  : `${cluster.colorHex}70`,
            }}
          >
            <Shield
              size={13}
              className="shrink-0 opacity-70"
              style={{ color: cluster.colorHex }}
            />
            <span
              className={`font-mono font-semibold tracking-wider text-[10px] uppercase truncate ${
                isDark ? 'text-white/80' : 'text-slate-800'
              }`}
            >
              {language === 'tj' ? militaryCourt.nameTj : militaryCourt.nameRu}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
