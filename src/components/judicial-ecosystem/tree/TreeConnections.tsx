import React from 'react';
import { RegionCluster } from '../../../data/sudTjData';

interface TreeConnectionsProps {
  regions: RegionCluster[];
  regionPositions: { x: number; y: number }[];
  isMobile: boolean;
  vWidth: number;
  vHeight: number;
}

export const TreeConnections: React.FC<TreeConnectionsProps> = ({
  regions,
  regionPositions,
  isMobile,
  vWidth,
  vHeight
}) => {
  
  // Supreme Court anchor point
  const scX = vWidth / 2;
  const scY = 220; // Slightly lower because SupremeCourtNode is around 180px tall starting at Y=80

  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-0"
      width={vWidth}
      height={vHeight}
      viewBox={`0 0 ${vWidth} ${vHeight}`}
    >
      <defs>
        {regions.map((r) => (
          <linearGradient key={`grad-${r.id}`} id={`grad-${r.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dfbe7e" stopOpacity="0.3" />
            <stop offset="100%" stopColor={r.colorHex} stopOpacity="0.6" />
          </linearGradient>
        ))}
      </defs>

      {/* Lines from Supreme Court to Regions */}
      {regions.map((r, i) => {
        const pos = regionPositions[i];
        
        const targetY = pos.y - 45; // Top of the region node
        
        let pathData = '';

        if (isMobile) {
          // Simple vertical connections for mobile
          const cp1Y = scY + (targetY - scY) / 2;
          pathData = `M ${scX} ${scY} C ${scX} ${cp1Y}, ${pos.x} ${cp1Y}, ${pos.x} ${targetY}`;
        } else {
          // Desktop 2x2 layout
          if (pos.y < 500) {
            // Top row: curve directly to them
            const cpY = scY + (targetY - scY) / 2;
            pathData = `M ${scX} ${scY} C ${scX} ${cpY}, ${pos.x} ${cpY}, ${pos.x} ${targetY}`;
          } else {
            // Bottom row: route straight down the center column, then curve outwards
            // This avoids crossing over the top row courts
            const centerDropY = 600; // Drop straight down to Y=600 in the empty middle channel
            
            pathData = `
              M ${scX} ${scY} 
              L ${scX} ${centerDropY} 
              C ${scX} ${centerDropY + 50}, ${pos.x} ${centerDropY + 50}, ${pos.x} ${targetY}
            `;
          }
        }

        return (
          <g key={`path-${r.id}`}>
            <path
              d={pathData}
              fill="none"
              stroke={`url(#grad-${r.id})`}
              strokeWidth="2"
              className="transition-all duration-700 ease-in-out"
            />
            {/* Ambient slow data particles on all paths since all are open */}
            <circle r="2.5" fill="#dfbe7e" opacity="0.8">
              <animateMotion 
                dur={`${4 + (i * 1.5)}s`}
                repeatCount="indefinite" 
                path={pathData} 
                calcMode="linear" 
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};
