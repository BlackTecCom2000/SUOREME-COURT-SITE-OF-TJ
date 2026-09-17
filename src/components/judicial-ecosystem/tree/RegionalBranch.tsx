import React from 'react';
import { CourtNodeData, RegionCluster, getRegionShortName } from '../../../data/sudTjData';
import { useLanguage } from '../../../context/LanguageContext';
import { CourtLeaf } from './CourtLeaf';

interface RegionalBranchProps {
  cluster: RegionCluster & { courts: CourtNodeData[] };
  x: number;
  y: number;
  courtPositions: { court: CourtNodeData; x: number; y: number }[];
  onSelectCourt: (court: CourtNodeData) => void;
  selectedCourtId?: string;
  searchQuery: string;
  visible: boolean;
  courtsVisible: boolean;
}

export const RegionalBranch: React.FC<RegionalBranchProps> = ({
  cluster,
  x,
  y,
  courtPositions,
  onSelectCourt,
  selectedCourtId,
  searchQuery,
  visible,
  courtsVisible,
}) => {
  const { language, t } = useLanguage();

  const matchesSearch = (court: CourtNodeData) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      court.nameRu.toLowerCase().includes(q) ||
      court.nameTj.toLowerCase().includes(q) ||
      (court.nameEn && court.nameEn.toLowerCase().includes(q)) ||
      court.domain.toLowerCase().includes(q)
    );
  };

  const regionTitle = getRegionShortName(cluster, language);

  return (
    <>
      {/* 1. REGIONAL PRIMARY HEADER NODE */}
      <div
        className={`
          absolute flex items-center justify-center select-none z-30
          transition-all duration-700 ease-out
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        `}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '54px',
        }}
      >
        <div
          className="
            w-full h-full rounded-xl border flex items-center justify-between px-5
            backdrop-blur-xl bg-theme-surface/95 shadow-md
            transition-all duration-300
          "
          style={{
            borderColor: `${cluster.colorHex}80`,
            boxShadow: `0 4px 20px ${cluster.colorHex}25`,
          }}
        >
          {/* Left: Color Accent & Region Title */}
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{
                backgroundColor: cluster.colorHex,
                boxShadow: `0 0 10px ${cluster.colorHex}`,
              }}
            />
            <h4 className="font-serif text-[20px] sm:text-[22px] font-bold tracking-wider text-theme-text uppercase leading-none">
              {regionTitle}
            </h4>
          </div>

          {/* Right: Court Count Badge */}
          <div
            className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border"
            style={{
              borderColor: `${cluster.colorHex}50`,
              color: cluster.colorHex,
              backgroundColor: `${cluster.colorHex}15`,
            }}
          >
            {cluster.courts.length} {t('registry.totalCourts')}
          </div>
        </div>
      </div>

      {/* 2. SUBORDINATE COURT LEAF CLUSTER */}
      {courtPositions.map((pos) => (
        <CourtLeaf
          key={`court-leaf-${pos.court.id}`}
          court={pos.court}
          colorHex={cluster.colorHex}
          isHighlighted={matchesSearch(pos.court)}
          isSelected={selectedCourtId === pos.court.id}
          onSelect={onSelectCourt}
          x={pos.x}
          y={pos.y}
          visible={courtsVisible}
        />
      ))}
    </>
  );
};
