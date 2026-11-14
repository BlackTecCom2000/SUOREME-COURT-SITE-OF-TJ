import React, { useMemo } from 'react';
import { Building2, ChevronDown, Landmark, Mountain, Wheat } from 'lucide-react';
import type { CourtNodeData, RegionCluster } from '../../data/sudTjData';
import { getRegionShortName } from '../../data/sudTjData';
import { useLanguage } from '../../context/LanguageContext';
import { RegionalStats } from './RegionalStats';
import { CourtList } from './CourtList';
import { MilitaryCourtButton } from './MilitaryCourtButton';

interface RegionalCourtPanelProps {
  cluster: RegionCluster & { courts: CourtNodeData[] };
  index: number;
  accent: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  selected: boolean;
  muted: boolean;
  focused: boolean;
  selectedCourtId?: string;
  searchQuery: string;
  typeFilter: 'all' | 'city' | 'district' | 'military';
  onSelectCourt: (court: CourtNodeData) => void;
  onToggleTypeFilter: (t: 'city' | 'district') => void;
  onHover: (id: string | null) => void;
}

const REGION_ICONS = [Mountain, Wheat, Landmark, Building2];

const matchCourt = (c: CourtNodeData, searchQuery: string, typeFilter: string): boolean => {
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    return (
      c.nameRu.toLowerCase().includes(q) ||
      c.nameTj.toLowerCase().includes(q) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
      (c.domain || '').toLowerCase().includes(q)
    );
  }
  if (typeFilter !== 'all') return c.type === typeFilter;
  return false;
};

export const RegionalCourtPanel: React.FC<RegionalCourtPanelProps> = ({
  cluster,
  index,
  accent,
  expanded,
  onToggleExpanded,
  selected,
  muted,
  focused,
  selectedCourtId,
  searchQuery,
  typeFilter,
  onSelectCourt,
  onToggleTypeFilter,
  onHover,
}) => {
  const { language } = useLanguage();
  const Icon = REGION_ICONS[index % REGION_ICONS.length];

  const regionalCourt = useMemo(
    () => cluster.courts.find((c) => c.type === 'regional') || cluster.courts[0],
    [cluster]
  );
  const militaryCourt: CourtNodeData | null = useMemo(() => {
    const found = cluster.courts.find((c) => c.type === 'military');
    if (found) return found;
    if (cluster.courts.length === 0) return null;
    return {
      id: `harbi-${cluster.id}`,
      nameRu: `Военный суд гарнизона ${cluster.shortNameRu}`,
      nameTj: `Суди ҳарбии гарнизони ${cluster.shortNameTj}`,
      nameEn: `Garrison military court of ${cluster.shortNameEn || cluster.shortNameRu}`,
      domain: `${cluster.id}-harbii.sud.tj`,
      type: 'military',
      regionId: cluster.id,
      url: `http://${cluster.id}-harbii.sud.tj`,
      status: 'online',
    } as CourtNodeData;
  }, [cluster]);

  const ordinaryCourts = useMemo(
    () =>
      cluster.courts.filter(
        (c) => c.type !== 'regional' && c.type !== 'military' && c.type !== 'supreme'
      ),
    [cluster]
  );
  const cityCount = useMemo(
    () => cluster.courts.filter((c) => c.type === 'city').length,
    [cluster]
  );
  const districtCount = useMemo(
    () => cluster.courts.filter((c) => c.type === 'district').length,
    [cluster]
  );

  const isDimmed = (c: CourtNodeData): boolean => {
    if (muted) return true;
    if (searchQuery.trim() || typeFilter !== 'all') return !matchCourt(c, searchQuery, typeFilter);
    return false;
  };
  const dimmedIds = useMemo(() => {
    const s = new Set<string>();
    [...ordinaryCourts, ...(regionalCourt ? [regionalCourt] : [])].forEach((c) => {
      if (isDimmed(c)) s.add(c.id);
    });
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordinaryCourts, regionalCourt, muted, searchQuery, typeFilter]);

  const title = getRegionShortName(cluster, language);
  const subtitle =
    language === 'tj' ? 'Суди вилоятӣ' : language === 'en' ? 'Regional court' : 'Областной суд';

  return (
    <section
      aria-label={title}
      onMouseEnter={() => onHover(cluster.id)}
      onMouseLeave={() => onHover(null)}
      className={`w-full rounded-[18px] border judmap-panel p-3.5 sm:p-4 flex flex-col gap-2.5 transition-all duration-300 jm-enter ${expanded ? '' : 'self-start'}`}
      style={{
        borderColor: selected ? accent : undefined,
        opacity: muted ? 0.45 : 1,
        boxShadow: focused || selected ? `0 0 25px ${accent}1f` : undefined,
        animationDelay: `${Math.min(index, 5) * 90}ms`,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-controls={`judmap-courts-${cluster.id}`}
        aria-pressed={selected}
        className="tap-target w-full flex items-center gap-3 text-left group cursor-pointer rounded-[10px] focus-visible:outline-2 focus-visible:outline-[var(--jm-gold)]"
      >
        <span className="font-mono text-[11px] font-bold tracking-widest text-[var(--jm-muted)] group-hover:text-[var(--jm-text)] transition-colors">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span aria-hidden="true" className="w-6 h-px shrink-0" style={{ background: accent }} />
        <span className="flex-1 min-w-0">
          <span className="block text-sm sm:text-[15px] font-bold tracking-[0.03em] uppercase text-[var(--jm-text)] truncate">
            {title}
          </span>
          <span className="block font-mono text-2xs text-[var(--jm-muted)] leading-tight mt-0.5 truncate">
            {subtitle}
          </span>
        </span>
        <span
          className="p-2 rounded-full border shrink-0 transition-transform group-hover:scale-105"
          style={{ color: accent, borderColor: accent + '55', background: accent + '14' }}
        >
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={`shrink-0 text-[var(--jm-muted)] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="flex flex-wrap gap-x-3 gap-y-1 pl-1 font-mono text-[10px] text-[var(--jm-muted)]">
        <span>{cityCount} {language === 'tj' ? 'шаҳр' : language === 'en' ? 'city' : 'город'}</span>
        <span>{districtCount} {language === 'tj' ? 'ноҳия' : language === 'en' ? 'district' : 'район'}</span>
        <span>{militaryCourt ? 1 : 0} {language === 'tj' ? 'ҳарбӣ' : language === 'en' ? 'military' : 'воен.'}</span>
      </div>

      <div id={`judmap-courts-${cluster.id}`} hidden={!expanded} className="flex flex-col gap-3.5">
      {/* Regional court */}
      {regionalCourt && (
        <CourtList
          courts={[regionalCourt]}
          accent={accent}
          selectedCourtId={selectedCourtId}
          dimmedIds={dimmedIds}
          onSelect={onSelectCourt}
        />
      )}

      {/* Statistics */}
      <RegionalStats
        accent={accent}
        cities={cityCount}
        districts={districtCount}
        activeFilter={typeFilter}
        onToggleFilter={onToggleTypeFilter}
      />

      {/* Ordinary courts */}
      <CourtList
        courts={ordinaryCourts}
        accent={accent}
        selectedCourtId={selectedCourtId}
        dimmedIds={dimmedIds}
        onSelect={onSelectCourt}
      />

      {/* Military court */}
      {militaryCourt && (
        <MilitaryCourtButton
          court={militaryCourt}
          accent={accent}
          selected={selectedCourtId === militaryCourt.id}
          dimmed={isDimmed(militaryCourt)}
          onSelect={onSelectCourt}
        />
      )}
      </div>
    </section>
  );
};
