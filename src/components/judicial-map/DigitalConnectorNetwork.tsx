import React from 'react';
import { regionAccent } from './regionAccent';

interface DigitalConnectorNetworkProps {
  activeRegionId?: string | null;
}

const BRANCHES = [
  { id: 'gbao', x: 150 },
  { id: 'khatlon', x: 450 },
  { id: 'sugd', x: 750 },
  { id: 'dushanbe_rrp', x: 1050 },
];

const MOBILE_STUBS = [80, 140, 200, 260];

export const DigitalConnectorNetwork: React.FC<DigitalConnectorNetworkProps> = ({
  activeRegionId = null,
}) => {
  const dim = (id: string) => (activeRegionId && activeRegionId !== id ? 0.28 : 1);

  return (
    <div className="w-full select-none" aria-hidden="true">
      {/* Desktop / tablet: full 4-branch circuit network */}
      <svg viewBox="0 0 1200 150" className="hidden md:block w-full h-[110px] lg:h-[130px] overflow-visible" preserveAspectRatio="xMidYMid meet">
        {/* Central trunk */}
        <line x1="600" y1="0" x2="600" y2="30" stroke="var(--jm-gold)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        {/* Central source node */}
        <rect x="594" y="30" width="12" height="12" rx="2" fill="var(--jm-gold)" />
        <circle cx="600" cy="36" r="10" fill="none" stroke="var(--jm-gold)" strokeWidth="1" opacity="0.5" className="jm-pulse-node" />
        <rect x="597.5" y="33.5" width="5" height="5" rx="1" fill="#fff" />
        {BRANCHES.map((b) => {
          const color = regionAccent(b.id);
          return (
            <g key={b.id} opacity={dim(b.id)} style={{ transition: 'opacity 0.3s ease' }}>
              {/* Multi-segment circuit branch: down, horizontal, down */}
              <path
                d={`M600 42 V66 H${b.x} V132`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="7 5"
                opacity="0.75"
                className="jm-flow"
              />
              {/* Elbow junction squares */}
              <rect x="596" y="62" width="8" height="8" rx="1.5" fill={color} opacity="0.9" />
              <rect x={b.x - 4} y={62} width="8" height="8" rx="1.5" fill="var(--jm-surface)" stroke={color} strokeWidth="1.5" />
              {/* Mid-run data dot */}
              <circle cx={(600 + b.x) / 2} cy={66} r="2.5" fill={color} className="jm-pulse-node" />
              {/* Endpoint node */}
              <rect x={b.x - 5} y={130} width="10" height="10" rx="2" fill={color} />
              <circle cx={b.x} cy={135} r="9" fill="none" stroke={color} strokeWidth="1" opacity="0.45" className="jm-pulse-node" />
            </g>
          );
        })}
      </svg>

      {/* Mobile: simplified vertical digital tree */}
      <svg viewBox="0 0 400 300" className="md:hidden w-full h-[240px] overflow-visible" preserveAspectRatio="xMidYMid meet">
        <line x1="200" y1="0" x2="200" y2="30" stroke="var(--jm-gold)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <rect x="194" y="30" width="12" height="12" rx="2" fill="var(--jm-gold)" />
        <line x1="200" y1="42" x2="200" y2="286" stroke="var(--jm-gold)" strokeWidth="1.5" opacity="0.4" />
        {MOBILE_STUBS.map((y, i) => {
          const id = BRANCHES[i].id;
          const color = regionAccent(id);
          return (
            <g key={id} opacity={dim(id)} style={{ transition: 'opacity 0.3s ease' }}>
              <line x1="200" y1={y} x2={i % 2 === 0 ? 150 : 250} y2={y} stroke={color} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" className="jm-flow" />
              <rect x={(i % 2 === 0 ? 150 : 250) - 4} y={y - 4} width="8" height="8" rx="1.5" fill={color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
