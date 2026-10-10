import React from 'react';
import { TAJIKISTAN_UNITS } from '../../data/tajikistanGeo';

export interface MapCluster {
  id: string;
  label: string;
  count: number;
}

interface TajikistanMapProps {
  /** selected court-catalog cluster id (or null) */
  selected: string | null;
  /** parent toggles selection (same handler as the region list) */
  onSelect: (clusterId: string) => void;
  /** court catalog clusters (labels + real court counts) */
  clusters: MapCluster[];
  /** language for the tooltip line: 'tj' | 'ru' | 'en' */
  language?: string;
}

/* Label nudges so tiny Dushanbe (enclave inside RRP) stays readable. */
const LABEL_DY: Record<string, number> = {
  Dushanbe: 9,
  DistrictsofRepublicanSubordin: -2,
  'Gorno-Badakhshan': 0,
  Khatlon: 0,
  Sughd: 0,
};

const courtsWord = (n: number, language: string): string => {
  if (language === 'en') return n === 1 ? 'court' : 'courts';
  if (language === 'tj') return 'суд';
  return 'судов';
};

/**
 * Real administrative map of Tajikistan (GADM ADM1, simplified locally).
 * Five true polygons — Dushanbe city is a separate enclave inside RRP —
 * but Dushanbe + RRP select the single `dushanbe_rrp` court cluster, because
 * the catalog groups them and inventing a split of court counts is forbidden.
 * No tiles, no keys, no network: renders offline, syncs through the shared
 * selected-cluster state with the region list.
 */
export const TajikistanMap: React.FC<TajikistanMapProps> = ({
  selected,
  onSelect,
  clusters,
  language = 'ru',
}) => {
  const byId = React.useMemo(() => {
    const m: Record<string, MapCluster> = {};
    clusters.forEach((c) => { m[c.id] = c; });
    return m;
  }, [clusters]);

  return (
    <svg
      viewBox="0 0 200 145"
      className="w-full h-full max-h-[190px]"
      role="group"
      aria-label={
        language === 'en'
          ? 'Map of Tajikistan by region'
          : language === 'tj'
            ? 'Харитаи Тоҷикистон аз рӯи минтақаҳо'
            : 'Карта Таджикистана по регионам'
      }
    >
      {TAJIKISTAN_UNITS.map((u) => {
        const cluster = byId[u.cluster];
        const isActive = selected === u.cluster;
        const title = cluster
          ? `${cluster.label} — ${cluster.count} ${courtsWord(cluster.count, language)}`
          : u.label;
        return (
          <g
            key={u.id}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            aria-label={title}
            className="tjk-unit"
            onClick={() => onSelect(u.cluster)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(u.cluster);
              }
            }}
          >
            <title>{title}</title>
            <path
              d={u.d}
              style={{
                fill: isActive
                  ? 'color-mix(in srgb, var(--accent-gold) 32%, transparent)'
                  : 'color-mix(in srgb, var(--text-muted) 20%, transparent)',
                stroke: isActive ? 'var(--accent-gold)' : 'color-mix(in srgb, var(--text-muted) 48%, transparent)',
                strokeWidth: isActive ? 1.2 : 0.8,
              }}
            />
            {u.id === 'Dushanbe' && (
              <circle
                cx={u.cx}
                cy={u.cy}
                r={1.8}
                style={{ fill: isActive ? 'var(--accent-gold)' : 'var(--text-muted)' }}
              />
            )}
            <text
              x={u.cx}
              y={u.cy + (LABEL_DY[u.id] ?? 0)}
              textAnchor="middle"
              fontSize="6.5"
              className="tjk-label"
              style={{
                fill: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                stroke: 'var(--bg-primary)',
              }}
            >
              {u.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
