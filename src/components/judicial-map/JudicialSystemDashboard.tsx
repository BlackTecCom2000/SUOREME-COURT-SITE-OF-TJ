import React, { useMemo, useState } from 'react';
import type { CourtNodeData, RegionCluster } from '../../data/sudTjData';
import { REGIONAL_CLUSTERS } from '../../data/sudTjData';
import { regionAccent } from './regionAccent';
import { JudiciaryHeader } from './JudiciaryHeader';
import { TopCourtNavigation } from './TopCourtNavigation';
import { DigitalConnectorNetwork } from './DigitalConnectorNetwork';
import { RegionalCourtPanel } from './RegionalCourtPanel';
import { JudiciaryFooter } from './JudiciaryFooter';
import './judicial-map.css';

export interface JudicialSystemDashboardProps {
  courts: CourtNodeData[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onSelectRegion: (id: string) => void;
  activeCourtTypeFilter: 'all' | 'city' | 'district' | 'military';
  onToggleTypeFilter: (t: 'all' | 'city' | 'district' | 'military') => void;
  selectedCourtId?: string;
  onSelectCourt: (court: CourtNodeData) => void;
  onSelectSupreme: () => void;
  supremeSelected: boolean;
  onResetFilters: () => void;
  onOpenImmersive: () => void;
}

export const JudicialSystemDashboard: React.FC<JudicialSystemDashboardProps> = ({
  courts,
  searchQuery,
  onSearchChange,
  selectedRegion,
  onSelectRegion,
  activeCourtTypeFilter,
  onToggleTypeFilter,
  selectedCourtId,
  onSelectCourt,
  onSelectSupreme,
  supremeSelected,
  onResetFilters,
  onOpenImmersive,
}) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Hydrate static clusters with live CMS courts (fallback to bundled data)
  const hydratedClusters = useMemo(
    () =>
      REGIONAL_CLUSTERS.map((cluster) => ({
        ...cluster,
        courts: courts.length > 0 ? courts.filter((c) => c.regionId === cluster.id) : cluster.courts,
      })),
    [courts]
  );

  // Auto-focus region matching search (visual highlight only)
  const effectiveActiveRegion =
    selectedRegion !== 'all'
      ? selectedRegion
      : searchQuery.trim()
      ? (() => {
          const q = searchQuery.toLowerCase();
          const match = (hydratedClusters as Array<RegionCluster & { courts: CourtNodeData[] }>).find(
            (cl) =>
              cl.courts.some(
                (c) =>
                  c.nameRu.toLowerCase().includes(q) ||
                  c.nameTj.toLowerCase().includes(q) ||
                  (c.domain || '').toLowerCase().includes(q)
              )
          );
          return match ? match.id : hoveredRegionId;
        })()
      : hoveredRegionId;



  return (
    <div className="judmap relative w-full overflow-hidden rounded-[18px] border border-[var(--jm-border)]">
      {/* Background: base + soft radial glow + faint grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ backgroundColor: 'var(--jm-bg)' }} />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 34% at 50% 0%, rgba(232,199,106,0.07), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(var(--jm-border) 1px, transparent 1px), linear-gradient(90deg, var(--jm-border) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 55%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 55%)',
        }}
      />

      <div className="relative w-full max-w-[1500px] mx-auto px-6 sm:px-10 py-7 sm:py-9 flex flex-col gap-6 sm:gap-7">
        <JudiciaryHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onResetFilters={onResetFilters}
          onOpenImmersive={onOpenImmersive}
        />

        <TopCourtNavigation onSelectSupreme={onSelectSupreme} supremeSelected={supremeSelected} />

        <DigitalConnectorNetwork activeRegionId={effectiveActiveRegion} />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-start">
          {hydratedClusters.map((cluster, idx) => (
            <RegionalCourtPanel
              key={cluster.id}
              cluster={cluster}
              index={idx}
              accent={regionAccent(cluster.id, cluster.colorHex)}
              selected={selectedRegion === cluster.id}
              muted={selectedRegion !== 'all' && selectedRegion !== cluster.id}
              focused={effectiveActiveRegion === cluster.id || selectedRegion === cluster.id}
              selectedCourtId={selectedCourtId}
              searchQuery={searchQuery}
              typeFilter={activeCourtTypeFilter}
              onSelectRegion={onSelectRegion}
              onSelectCourt={onSelectCourt}
              onToggleTypeFilter={(t) => onToggleTypeFilter(activeCourtTypeFilter === t ? 'all' : t)}
              onHover={setHoveredRegionId}
            />
          ))}
        </div>

        <JudiciaryFooter />
      </div>
    </div>
  );
};
