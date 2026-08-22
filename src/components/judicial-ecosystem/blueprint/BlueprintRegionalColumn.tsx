import React from 'react';
import { CourtNodeData, RegionCluster } from '../../../data/sudTjData';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { BlueprintCourtNode } from './BlueprintCourtNode';
import { CourtQrCode } from '../CourtQrCode';
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
      return (
        c.nameRu.toLowerCase().includes(q) ||
        c.nameTj.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        c.domain.toLowerCase().includes(q)
      );
    }
    if (activeCourtTypeFilter !== 'all') {
      if (activeCourtTypeFilter === 'city') return c.type === 'city';
      if (activeCourtTypeFilter === 'district') return c.type === 'district';
      if (activeCourtTypeFilter === 'military') return c.type === 'military';
    }
    return false;
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

  // Regional capsule header title
  const headerPillTitle =
    columnNumber === 1
      ? language === 'tj'
        ? '1. ВИЛОЯТИ МУХТОРИ КӮҲИСТОНИ БАДАХШОН (ВМКБ)'
        : language === 'en'
        ? '1. GORNO-BADAKHSHAN AUTONOMOUS REGION (GBAO)'
        : '1. ГОРНО-БАДАХШАНСКАЯ АВТОНОМНАЯ ОБЛАСТЬ (ГБАО)'
      : columnNumber === 2
      ? language === 'tj'
        ? '2. ВИЛОЯТИ ХАТЛОН'
        : language === 'en'
        ? '2. KHATLON REGION'
        : '2. ХАТЛОНСКАЯ ОБЛАСТЬ'
      : columnNumber === 3
      ? language === 'tj'
        ? '3. ВИЛОЯТИ СУҒД'
        : language === 'en'
        ? '3. SUGHD REGION'
        : '3. СОГДИЙСКАЯ ОБЛАСТЬ'
      : language === 'tj'
      ? '4. ШАҲРИ ДУШАНБЕ ВА НОҲИЯҲОИ ТОБЕЪ (РРП)'
      : language === 'en'
      ? '4. DUSHANBE CITY & DISTRICTS (RRP)'
      : '4. ГОРОД ДУШАНБЕ И РАЙОНЫ (РРП)';

  // Column specific court grid slicing
  let gridRows: CourtNodeData[][] = [];
  if (cluster.id === 'gbao') {
    gridRows = [ordinaryCourts.slice(0, 4), ordinaryCourts.slice(4, 8)];
  } else if (cluster.id === 'khatlon') {
    gridRows = [
      ordinaryCourts.slice(0, 4),
      ordinaryCourts.slice(4, 9),
      ordinaryCourts.slice(9, 14),
      ordinaryCourts.slice(14, 19),
      ordinaryCourts.slice(19, 24),
    ];
  } else if (cluster.id === 'sugd') {
    gridRows = [
      ordinaryCourts.slice(0, 4),
      ordinaryCourts.slice(4, 8),
      ordinaryCourts.slice(8, 12),
      ordinaryCourts.slice(12, 18),
    ];
  } else {
    gridRows = [
      ordinaryCourts.slice(0, 4),
      ordinaryCourts.slice(4, 8),
      ordinaryCourts.slice(8, 12),
      ordinaryCourts.slice(12, 17),
    ];
  }

  return (
    <div
      onMouseEnter={() => onHoverColumn?.(cluster.id)}
      onMouseLeave={() => onHoverColumn?.(null)}
      className={`
        relative w-[440px] flex flex-col items-center select-none transition-all duration-300
        ${isFocused || isRegionSelected ? 'scale-102 z-30 opacity-100' : isRegionMuted ? 'opacity-40 hover:opacity-75 z-10' : 'opacity-100 z-20'}
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
          relative w-full h-[36px] rounded-full px-4 flex items-center justify-center cursor-pointer
          border shadow-md backdrop-blur-xl transition-all duration-300 group
          ${
            isDark
              ? isRegionSelected
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(223,190,126,0.4)]'
                : 'border-[#dfbe7e]/70 bg-[#060b18]/90 text-white hover:border-amber-400'
              : isRegionSelected
              ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-md ring-1 ring-amber-400'
              : 'border-[#ca8a04]/70 bg-white/95 text-slate-900 hover:border-amber-600'
          }
        `}
        style={{
          borderColor: isRegionSelected ? '#dfbe7e' : isDark ? cluster.colorHex : `${cluster.colorHex}cc`,
          boxShadow: isDark
            ? `0 0 16px ${cluster.colorHex}30`
            : `0 2px 10px ${cluster.colorHex}20`,
        }}
      >
        <span className="font-serif font-bold text-[12px] uppercase tracking-wider text-center block truncate drop-shadow-sm group-hover:scale-101 transition-transform">
          {headerPillTitle}
        </span>
      </div>

      {/* 2. REGIONAL MAIN BOX CONTAINER */}
      <div
        className={`
          relative w-full rounded-2xl p-4 mt-2.5 flex flex-col items-center
          border-2 backdrop-blur-2xl transition-all duration-300
          ${
            isDark
              ? 'bg-[#030712]/95 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
              : 'bg-slate-50/95 shadow-[0_6px_25px_rgba(0,0,0,0.08)]'
          }
          ${isRegionSelected ? 'ring-2 ring-amber-400/60' : ''}
        `}
        style={{
          borderColor: cluster.colorHex,
          boxShadow: isDark
            ? `0 0 25px ${cluster.colorHex}25, inset 0 0 15px ${cluster.colorHex}10`
            : `0 4px 20px ${cluster.colorHex}20, inset 0 0 10px ${cluster.colorHex}08`,
        }}
      >
        {/* TOP ROW: QR Code Box (Left) & Regional Court Main Card (Right) */}
        <div className="w-full flex items-center gap-3.5 mb-3">
          {/* Functional Court QR Code */}
          <div
            className={`
              shrink-0 w-[84px] h-[84px] rounded-xl p-1.5 flex flex-col items-center justify-center
              border transition-all
              ${isDark ? 'border-white/20 bg-[#080d1e]' : 'border-slate-300 bg-white'}
            `}
            style={{ borderColor: `${cluster.colorHex}80` }}
          >
            <CourtQrCode
              domain={regionalCourt?.domain || `${cluster.id}.sud.tj`}
              url={regionalCourt?.url || `https://${cluster.id}.sud.tj`}
              size={66}
            />
          </div>

          {/* Regional Court Primary Node */}
          <div className="flex-1">
            <BlueprintCourtNode
              court={regionalCourt}
              colorHex={cluster.colorHex}
              isRegionalHeaderNode={true}
              height="84px"
              isSelected={selectedCourtId === regionalCourt.id}
              isHighlighted={isMatched(regionalCourt)}
              isDimmed={isDimmed(regionalCourt)}
              onSelect={onSelectCourt}
            />
          </div>
        </div>

        {/* INTERNAL HIERARCHY CONNECTOR LINE */}
        <div className="w-full flex items-center justify-center my-1">
          <div
            className="w-12 h-[2px] rounded-full"
            style={{ backgroundColor: cluster.colorHex, opacity: isDark ? 0.8 : 0.6 }}
          />
        </div>

        {/* 3. CITY & DISTRICT COURTS GRID ROWS */}
        <div className="w-full flex flex-col gap-2 mt-1">
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
                  height="48px"
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
                    : 'border-white/20 bg-[#060c1c]/90 hover:border-white/60 hover:bg-[#0a142e]'
                  : selectedCourtId === militaryCourt.id
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md scale-102'
                  : isMatched(militaryCourt)
                  ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-md scale-102'
                  : 'border-slate-300 bg-white hover:border-slate-600 hover:bg-slate-100'
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
              className="shrink-0"
              style={{ color: cluster.colorHex }}
            />
            <span
              className={`font-serif font-semibold text-[11px] truncate ${
                isDark ? 'text-white/90' : 'text-slate-900'
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
