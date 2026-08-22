import React, { useEffect, useState, useRef } from 'react';
import {
  CourtNodeData,
  REGIONAL_CLUSTERS,
  SUPREME_COURT_NODE,
  getSortedRegionalClusters,
} from '../../data/sudTjData';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BlueprintBackgroundCircuits } from './blueprint/BlueprintBackgroundCircuits';
import { BlueprintTopHeader } from './blueprint/BlueprintTopHeader';
import { BlueprintCentralAuthority } from './blueprint/BlueprintCentralAuthority';
import { BlueprintRegionalColumn } from './blueprint/BlueprintRegionalColumn';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface JudicialTreeViewProps {
  searchQuery?: string;
  selectedRegion?: string;
  activeCourtTypeFilter?: string;
  onSelectCourt: (court: CourtNodeData) => void;
  onSelectRegion?: (regionId: string) => void;
  selectedCourtId?: string;
}

const VIRTUAL_WIDTH = 1920;
const VIRTUAL_HEIGHT = 960;

export const JudicialTreeView: React.FC<JudicialTreeViewProps> = ({
  searchQuery = '',
  selectedRegion = 'all',
  activeCourtTypeFilter = 'all',
  onSelectCourt,
  onSelectRegion,
  selectedCourtId,
}) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [courtsData, setCourtsData] = useState<CourtNodeData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [expandedMobileRegion, setExpandedMobileRegion] = useState<string>('gbao');

  // 1. Fetch CMS Court Data (Fallback to verified local dataset)
  useEffect(() => {
    let isMounted = true;
    const fetchCourts = async () => {
      try {
        const response = await fetch('/api/courts');
        if (response.ok) {
          const data = await response.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const mappedCourts = data.map((c: any) => ({
              id: c.id.toString(),
              nameRu: c.name_ru || '',
              nameTj: c.name_tj || c.name_ru || '',
              nameEn: c.name_en || '',
              shortNameRu: c.short_name_ru,
              shortNameTj: c.short_name_tj,
              shortNameEn: c.short_name_en,
              regionId: c.region,
              type: c.type,
              domain: c.website || '',
              url: c.website ? `https://${c.website}` : '#',
              addressRu: c.address || '',
              addressTj: c.address || '',
              phone: c.phone || '',
              email: c.email || '',
              status: (c.status || 'online') as CourtNodeData['status'],
            }));
            setCourtsData(mappedCourts);
          }
        }
      } catch (err) {
        console.warn('Using local dataset for blueprint visualization', err);
      }
    };
    fetchCourts();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Auto-fit Virtual Coordinate Space to viewport center
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const mobile = width < 1024;
        setIsMobile(mobile);

        if (!mobile) {
          const scaleX = width / VIRTUAL_WIDTH;
          const scaleY = height / VIRTUAL_HEIGHT;
          // Scale to fit 95% of container with comfortable breathing room
          const scale = Math.min(scaleX, scaleY) * 0.95;
          setBaseScale(scale);
        } else {
          setBaseScale(1);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Hydrate clusters in strict reference order: 1. ВМКБ, 2. ХАТЛОН, 3. СУҒД, 4. ДУШАНБЕ + РРП
  const sortedClusters = getSortedRegionalClusters(REGIONAL_CLUSTERS);
  const hydratedClusters = sortedClusters.map((cluster) => ({
    ...cluster,
    courts:
      courtsData.length > 0
        ? courtsData.filter((c) => c.regionId === cluster.id)
        : cluster.courts,
  }));

  // Auto-focus region matching search
  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = hydratedClusters.find((cl) =>
        cl.courts.some(
          (c) =>
            c.nameRu.toLowerCase().includes(q) ||
            c.nameTj.toLowerCase().includes(q) ||
            c.domain.toLowerCase().includes(q)
        )
      );
      if (match) {
        setHoveredRegionId(match.id);
        setExpandedMobileRegion(match.id);
      }
    }
  }, [searchQuery]);

  // Sync mobile expanded region with selected region
  useEffect(() => {
    if (selectedRegion && selectedRegion !== 'all') {
      setExpandedMobileRegion(selectedRegion);
    }
  }, [selectedRegion]);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full h-[88vh] min-h-[700px] max-h-[1100px] overflow-hidden select-none rounded-2xl border transition-all duration-700
        ${
          isDark
            ? 'bg-[#02050e] border-[#dfbe7e]/30 shadow-2xl shadow-black/80'
            : 'bg-[#f8fafc] border-slate-300 shadow-xl shadow-slate-300/40'
        }
      `}
    >
      {/* DESKTOP VIRTUAL BLUEPRINT CANVAS - EXACT CENTER COORDINATE SYSTEM */}
      {!isMobile ? (
        <div
          className="absolute top-1/2 left-1/2 transition-transform duration-100 ease-out pointer-events-auto"
          style={{
            width: `${VIRTUAL_WIDTH}px`,
            height: `${VIRTUAL_HEIGHT}px`,
            transform: `translate(-50%, -50%) scale(${baseScale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* 1. Background Digital PCB Circuits & Outer Tech Borders */}
          <BlueprintBackgroundCircuits />

          {/* 2. Top Banner Header (Centered at X = 960) */}
          <div className="absolute top-[20px] left-1/2 -translate-x-1/2 z-30">
            <BlueprintTopHeader />
          </div>

          {/* 3. Central Authority Wing & Trunk (Centered at X = 960) */}
          <div className="absolute top-[96px] left-0 w-full z-20">
            <BlueprintCentralAuthority
              onSelectSupremeCourt={() => onSelectCourt(SUPREME_COURT_NODE)}
              isSelected={selectedCourtId === SUPREME_COURT_NODE.id}
              activeRegionId={selectedRegion !== 'all' ? selectedRegion : hoveredRegionId}
            />
          </div>

          {/* 4. Four Regional Columns - Exact Symmetrical Placement */}
          <div className="absolute top-[248px] left-[32px] w-[1856px] flex items-start justify-between z-20">
            {hydratedClusters.map((cluster, idx) => (
              <BlueprintRegionalColumn
                key={`blueprint-col-${cluster.id}`}
                cluster={cluster}
                columnNumber={idx + 1}
                onSelectCourt={onSelectCourt}
                onSelectRegion={onSelectRegion}
                selectedCourtId={selectedCourtId}
                selectedRegion={selectedRegion}
                activeCourtTypeFilter={activeCourtTypeFilter}
                searchQuery={searchQuery}
                isFocused={hoveredRegionId === cluster.id || selectedRegion === cluster.id}
                onHoverColumn={(id) => setHoveredRegionId(id)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* RESPONSIVE MOBILE VIEWPORT WITH ACCORDION */
        <div
          className={`w-full h-full overflow-y-auto px-4 py-6 flex flex-col gap-6 ${
            isDark ? 'bg-[#02050e]' : 'bg-[#f8fafc]'
          }`}
        >
          {/* Top Banner */}
          <div className="w-full flex justify-center scale-90 -my-2">
            <BlueprintTopHeader />
          </div>

          {/* Supreme Court Authority Card */}
          <div className="w-full flex justify-center">
            <div
              onClick={() => onSelectCourt(SUPREME_COURT_NODE)}
              className={`p-4 rounded-xl border text-center w-full max-w-sm cursor-pointer shadow-md transition-all ${
                selectedCourtId === SUPREME_COURT_NODE.id
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400'
                  : isDark
                  ? 'border-[#dfbe7e] bg-[#070e20] text-white'
                  : 'border-[#ca8a04] bg-white text-slate-900'
              }`}
            >
              <h3 className="font-serif font-bold text-base">
                {language === 'tj'
                  ? 'СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН'
                  : language === 'en'
                  ? 'SUPREME COURT OF TAJIKISTAN'
                  : 'ВЕРХОВНЫЙ СУД РЕСПУБЛИКИ ТАДЖИКИСТАН'}
              </h3>
            </div>
          </div>

          {/* 4 Regional Tabs / Accordion */}
          <div className="w-full flex flex-col gap-3">
            {hydratedClusters.map((cluster, idx) => {
              const isExpanded = expandedMobileRegion === cluster.id;
              return (
                <div
                  key={`mob-col-${cluster.id}`}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    isDark ? 'border-white/10 bg-[#060b18]' : 'border-slate-300 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const next = isExpanded ? '' : cluster.id;
                      setExpandedMobileRegion(next);
                      onSelectRegion?.(next || 'all');
                    }}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cluster.colorHex }}
                      />
                      <span className="font-serif font-bold text-sm text-left">
                        {cluster.nameTj}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-white/10 flex justify-center">
                      <BlueprintRegionalColumn
                        cluster={cluster}
                        columnNumber={idx + 1}
                        onSelectCourt={onSelectCourt}
                        onSelectRegion={onSelectRegion}
                        selectedCourtId={selectedCourtId}
                        selectedRegion={selectedRegion}
                        activeCourtTypeFilter={activeCourtTypeFilter}
                        searchQuery={searchQuery}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
