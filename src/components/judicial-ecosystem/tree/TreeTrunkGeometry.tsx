import React from 'react';
import { RegionCluster, CourtNodeData } from '../../../data/sudTjData';

export interface RegionalLayoutDef {
  cluster: RegionCluster & { courts: CourtNodeData[] };
  x: number;
  y: number;
  courtPositions: { court: CourtNodeData; x: number; y: number }[];
}

interface TreeTrunkGeometryProps {
  vWidth: number;
  vHeight: number;
  regionalLayouts: RegionalLayoutDef[];
  highlightedCourtId?: string;
  animationPhase: number; // 0..8 for sequential growth
  isDarkTheme?: boolean;
}

export const TreeTrunkGeometry: React.FC<TreeTrunkGeometryProps> = ({
  vWidth,
  vHeight,
  regionalLayouts,
  highlightedCourtId,
  animationPhase,
}) => {
  const scX = 1000;
  const scY = 107; // bottom edge of Supreme Court node

  // Central continuous trunk path down the spine
  const trunkMainPath = `M ${scX} ${scY} L ${scX} 1060`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
      viewBox={`0 0 ${vWidth} ${vHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Central Trunk Vertical Gradient */}
        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dfbe7e" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#dfbe7e" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#c5a868" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#dfbe7e" stopOpacity="0.2" />
        </linearGradient>

        {/* Regional Branch Gradients */}
        {regionalLayouts.map(({ cluster }) => (
          <linearGradient
            key={`reg-grad-${cluster.id}`}
            id={`reg-grad-${cluster.id}`}
            x1={cluster.id === 'dushanbe_rrp' || cluster.id === 'khatlon' ? '100%' : '0%'}
            y1="0%"
            x2={cluster.id === 'dushanbe_rrp' || cluster.id === 'khatlon' ? '0%' : '100%'}
            y2="100%"
          >
            <stop offset="0%" stopColor="#dfbe7e" stopOpacity="0.85" />
            <stop offset="50%" stopColor={cluster.colorHex} stopOpacity="0.75" />
            <stop offset="100%" stopColor={cluster.colorHex} stopOpacity="0.9" />
          </linearGradient>
        ))}
      </defs>

      {/* 1. FOUNDATION ROOTS BASE (Subtle anchor geometry) */}
      <g opacity={animationPhase >= 1 ? 0.45 : 0} className="transition-opacity duration-1000">
        <path
          d={`M ${scX - 80} ${scY - 45} C ${scX - 140} 40, ${scX - 220} 20, ${scX - 260} 10`}
          stroke="#dfbe7e"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 4"
        />
        <path
          d={`M ${scX + 80} ${scY - 45} C ${scX + 140} 40, ${scX + 220} 20, ${scX + 260} 10`}
          stroke="#dfbe7e"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 4"
        />
      </g>

      {/* 2. CENTRAL TRUNK SPINE */}
      <g opacity={animationPhase >= 2 ? 1 : 0} className="transition-opacity duration-700">
        {/* Soft atmospheric trunk glow */}
        <path
          d={trunkMainPath}
          stroke="#dfbe7e"
          strokeWidth="10"
          strokeOpacity="0.1"
          fill="none"
          strokeLinecap="round"
        />
        {/* Main Tapered Solid Trunk Line */}
        <path
          d={trunkMainPath}
          stroke="url(#trunkGrad)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          filter="url(#subtleGlow)"
        />

        {/* Trunk Junction Dots */}
        {[200, 600].map((junctionY, idx) => (
          <circle
            key={`junction-${idx}`}
            cx={scX}
            cy={junctionY}
            r="4"
            fill="#dfbe7e"
            filter="url(#goldGlow)"
          />
        ))}
      </g>

      {/* 3. FOUR REGIONAL PRIMARY BRANCHES */}
      {regionalLayouts.map(({ cluster, x: regX, y: regY }, idx) => {
        // Animation phase for this region: 3 + idx (3=Dushanbe, 4=Sughd, 5=Khatlon, 6=GBAO)
        const isRegionActive = animationPhase >= 3 + idx;
        
        // Emergence point from central trunk
        const trunkOriginY = idx === 0 ? 180 : idx === 1 ? 200 : idx === 2 ? 580 : 600;
        
        // Natural organic cubic Bezier curve from trunk to region node
        // Top edge or center edge of region node
        const targetNodeX = idx % 2 === 0 ? regX + 160 : regX - 160; // closest horizontal edge
        const cp1X = idx % 2 === 0 ? scX - 140 : scX + 140;
        const cp1Y = trunkOriginY + (regY - trunkOriginY) * 0.15;
        const cp2X = idx % 2 === 0 ? targetNodeX + 80 : targetNodeX - 80;
        const cp2Y = regY - 10;

        const branchPath = `M ${scX} ${trunkOriginY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${targetNodeX} ${regY}`;

        return (
          <g key={`region-branch-${cluster.id}`}>
            {/* Primary Regional Branch Spline */}
            <path
              d={branchPath}
              stroke={`url(#reg-grad-${cluster.id})`}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              opacity={isRegionActive ? 0.9 : 0}
              className="transition-opacity duration-700 ease-out"
              filter="url(#subtleGlow)"
            />

            {/* Branch Junction Ring */}
            {isRegionActive && (
              <circle
                cx={targetNodeX}
                cy={regY}
                r="3.5"
                fill={cluster.colorHex}
                opacity="0.9"
              />
            )}

            {/* Data flow particle along primary branch (active when tree fully formed) */}
            {animationPhase >= 7 && (
              <circle r="2.8" fill={cluster.colorHex} filter="url(#goldGlow)">
                <animateMotion
                  dur={`${4.5 + idx * 0.8}s`}
                  repeatCount="indefinite"
                  path={branchPath}
                  calcMode="spline"
                  keySplines="0.25 0.1 0.25 1"
                />
              </circle>
            )}
          </g>
        );
      })}

      {/* 4. SUB-BRANCHES FROM REGIONS TO INDIVIDUAL COURTS */}
      {regionalLayouts.map(({ cluster, x: regX, y: regY, courtPositions }, idx) => {
        const isRegionActive = animationPhase >= 3 + idx;
        const areCourtsActive = animationPhase >= 7;

        return (
          <g key={`sub-branches-${cluster.id}`} opacity={isRegionActive ? 1 : 0} className="transition-opacity duration-500">
            {courtPositions.map(({ court, x: cX, y: cY }) => {
              const isHighlighted = highlightedCourtId === court.id;
              
              // Branch origin: bottom of the regional header box
              const sourceX = regX;
              const sourceY = regY + 27;

              // Branch target: top center of court leaf
              const targetX = cX;
              const targetY = cY - 21;

              // Smooth organic curvature to each court card
              const midY = sourceY + (targetY - sourceY) * 0.45;
              const subPath = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;

              return (
                <g key={`sub-path-${court.id}`}>
                  <path
                    d={subPath}
                    stroke={isHighlighted ? '#dfbe7e' : cluster.colorHex}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeOpacity={isHighlighted ? 0.95 : areCourtsActive ? 0.3 : 0}
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                    filter={isHighlighted ? 'url(#goldGlow)' : undefined}
                  />

                  {/* Highlight pulse if searched */}
                  {isHighlighted && (
                    <circle r="3" fill="#dfbe7e" filter="url(#goldGlow)">
                      <animateMotion dur="1.2s" repeatCount="indefinite" path={subPath} />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};
