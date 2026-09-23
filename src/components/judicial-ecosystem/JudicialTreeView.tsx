import React, { useEffect, useState, useRef } from 'react';
import {
  CourtNodeData,
  REGIONAL_CLUSTERS,
  SUPREME_COURT_NODE,
  getSortedRegionalClusters,
} from '../../data/sudTjData';
import { useTheme } from '../../context/ThemeContext';
import { BlueprintBackgroundCircuits } from './blueprint/BlueprintBackgroundCircuits';
import { BlueprintTopHeader } from './blueprint/BlueprintTopHeader';
import { BlueprintCentralAuthority } from './blueprint/BlueprintCentralAuthority';
import { BlueprintRegionalColumn } from './blueprint/BlueprintRegionalColumn';

interface JudicialTreeViewProps {
  searchQuery?: string;
  selectedRegion?: string;
  activeCourtTypeFilter?: string;
  onSelectCourt: (court: CourtNodeData) => void;
  onSelectRegion?: (regionId: string) => void;
  selectedCourtId?: string;
}

export const JudicialTreeView: React.FC<JudicialTreeViewProps> = ({
  searchQuery = '',
  selectedRegion = 'all',
  activeCourtTypeFilter = 'all',
  onSelectCourt,
  onSelectRegion,
  selectedCourtId,
}) => {
  const { isDark } = useTheme();
  const [courtsData, setCourtsData] = useState<CourtNodeData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

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
            (c.domain && c.domain.toLowerCase().includes(q))
        )
      );
      if (match) {
        setHoveredRegionId(match.id);
      }
    }
  }, [searchQuery]);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full overflow-visible select-none rounded-3xl border transition-all duration-700 p-4 sm:p-6 lg:p-8
        ${
          isDark
            ? 'bg-[#02050e]/75 border-[#dfbe7e]/30 shadow-2xl shadow-black/80 backdrop-blur-xl'
            : 'bg-[#f8fafc]/80 border-slate-300 shadow-xl shadow-slate-300/40 backdrop-blur-xl'
        }
      `}
    >
      {/* 1. Background Digital PCB Circuits & Subtle Grid */}
      <BlueprintBackgroundCircuits />

      {/* 2. Top Banner Header */}
      <div className="w-full flex justify-center mb-4 relative z-30">
        <BlueprintTopHeader />
      </div>

      {/* 3. Central Authority Wing (Supreme Court Root + Supporting Units) */}
      <div className="w-full relative z-20 mb-6">
        <BlueprintCentralAuthority
          onSelectSupremeCourt={() => onSelectCourt(SUPREME_COURT_NODE)}
          isSelected={selectedCourtId === SUPREME_COURT_NODE.id}
          activeRegionId={selectedRegion !== 'all' ? selectedRegion : hoveredRegionId}
        />
      </div>

      {/* 4. Four Regional Columns - CSS Responsive Flex/Grid with Auto Height */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-start relative z-20">
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
  );
};

export default JudicialTreeView;
