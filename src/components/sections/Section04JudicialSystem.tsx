import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Landmark,
  MapPin,
  Shield,
  Maximize2,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import {
  REGIONAL_CLUSTERS,
  SUPREME_COURT_NODE,
  CourtNodeData,
} from '../../data/sudTjData';
import { JudicialTreeView } from '../judicial-ecosystem/JudicialTreeView';
import { SelectedCourtContextHub } from '../judicial-ecosystem/SelectedCourtContextHub';
import { RegionSummaryContextHub } from '../judicial-ecosystem/RegionSummaryContextHub';
import { SupremeCourtContextHub } from '../judicial-ecosystem/SupremeCourtContextHub';
import { ImmersivePresentationModal } from '../judicial-ecosystem/ImmersivePresentationModal';
import { DigitalDataRain } from '../effects/DigitalDataRain';

interface Section04JudicialSystemProps {
  onOpenService?: (serviceKey: string, courtContext?: CourtNodeData) => void;
}

export const Section04JudicialSystem: React.FC<Section04JudicialSystemProps> = ({
  onOpenService,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<CourtNodeData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeCourtTypeFilter, setActiveCourtTypeFilter] = useState<'all' | 'city' | 'district' | 'military'>('all');
  const [isSupremeCourtSelected, setIsSupremeCourtSelected] = useState<boolean>(false);
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);
  const [courtsData, setCourtsData] = useState<CourtNodeData[]>([]);

  // 1. Fetch CMS Court Data
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
      } catch {
        // use local
      }
    };
    fetchCourts();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. All Courts dataset (CMS or fallback local)
  const allCourtsList = useMemo(() => {
    if (courtsData.length > 0) return courtsData;
    return REGIONAL_CLUSTERS.flatMap((c) => c.courts);
  }, [courtsData]);

  // 3. Region Scoped Courts
  const scopedCourtsList = useMemo(() => {
    if (selectedRegion === 'all') return allCourtsList;
    return allCourtsList.filter((c) => c.regionId === selectedRegion);
  }, [allCourtsList, selectedRegion]);

  // 4. Dynamic Live Statistics Calculations
  const statsMetrics = useMemo(() => {
    const total = scopedCourtsList.length + (selectedRegion === 'all' ? 1 : 0);
    const cities = scopedCourtsList.filter((c) => c.type === 'city').length;
    const districts = scopedCourtsList.filter((c) => c.type === 'district').length;
    const military = scopedCourtsList.filter((c) => c.type === 'military').length;

    return { total, cities, districts, military };
  }, [scopedCourtsList, selectedRegion]);

  // Handler: Selecting a court node
  const handleSelectCourt = (court: CourtNodeData) => {
    if (court.id === SUPREME_COURT_NODE.id) {
      setIsSupremeCourtSelected(true);
      setSelectedCourt(null);
    } else {
      setSelectedCourt(court);
      setIsSupremeCourtSelected(false);
    }
  };

  // Handler: Selecting a region
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedCourt(null);
    setIsSupremeCourtSelected(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedRegion('all');
    setActiveCourtTypeFilter('all');
    setSearchQuery('');
    setSelectedCourt(null);
    setIsSupremeCourtSelected(false);
  };

  // Stat card toggle
  const handleToggleStatFilter = (type: 'all' | 'city' | 'district' | 'military') => {
    if (activeCourtTypeFilter === type) {
      setActiveCourtTypeFilter('all');
    } else {
      setActiveCourtTypeFilter(type);
    }
  };

  // Active Region cluster object for Region Context Hub
  const activeCluster = useMemo(() => {
    if (selectedRegion === 'all') return null;
    const found = REGIONAL_CLUSTERS.find((r) => r.id === selectedRegion);
    if (!found) return null;
    return {
      ...found,
      courts: scopedCourtsList,
    };
  }, [selectedRegion, scopedCourtsList]);

  // Filter chip title for active filters
  const activeFilterLabel =
    activeCourtTypeFilter === 'city'
      ? t('network.cityCourts')
      : activeCourtTypeFilter === 'district'
      ? t('network.districtCourts')
      : activeCourtTypeFilter === 'military'
      ? t('network.militaryCourts')
      : null;

  return (
    <section
      id="courts"
      aria-label={t('network.title1') + ' ' + t('network.title2')}
      className="relative py-20 sm:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30 select-none"
    >
      <DigitalDataRain density="sparse" speed="slow" opacity={0.18} colorTheme="gold" />

      <div className="max-w-[1880px] mx-auto w-full relative z-10 space-y-6">
        
        {/* 1. SECTION HEADER INDICATOR & FULLSCREEN TRIGGER */}
        <Reveal delay={50}>
          <div className="flex items-center justify-between font-mono text-xs text-theme-textSec mb-2">
            <div className="flex items-center gap-3">
              <span className="tracking-widest text-theme-gold font-bold">( 04 )</span>
              <span className="text-theme-textMuted">[ 004 / 007 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              <span className="text-[10px] text-theme-textMuted tracking-widest uppercase hidden sm:inline">
                {t('network.badge')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {(selectedRegion !== 'all' || activeCourtTypeFilter !== 'all' || searchQuery || selectedCourt || isSupremeCourtSelected) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/80 text-amber-300 hover:text-white hover:bg-slate-800 text-[11px] font-mono transition-all"
                >
                  <RotateCcw size={12} />
                  <span>{t('network.resetFilter')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsImmersiveOpen(true)}
                aria-label={t('network.fullscreenBtn')}
                className="btn-outline text-[11px]"
              >
                <Maximize2 size={13} className="text-theme-gold" />
                <span className="hidden sm:inline">{t('network.fullscreenBtn')}</span>
              </button>
            </div>
          </div>
        </Reveal>

        {/* 2. SECTION TITLE & CONCISE INSTITUTIONAL DESCRIPTION */}
        <div className="max-w-4xl text-left">
          <Reveal delay={120}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight uppercase mb-3">
              {t('network.title1')}{' '}
              <span className="italic font-normal text-theme-gold">
                {t('network.title1Italic')}
              </span>{' '}
              {t('network.title2')}
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-theme-textSec font-normal max-w-3xl">
              {t('network.description')}
            </p>
          </Reveal>
        </div>

        {/* 3. DYNAMIC INTERACTIVE STATISTICS CONTROLLERS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Stat 1: Total Courts */}
          <button
            type="button"
            onClick={() => handleToggleStatFilter('all')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-sm group ${
              activeCourtTypeFilter === 'all'
                ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                : 'border-theme-border bg-theme-surface hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-theme-gold">
                <Landmark size={18} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">
                {selectedRegion !== 'all' ? 'В РЕГИОНЕ' : 'СИСТЕМА'}
              </span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-white leading-tight">
              {statsMetrics.total}
            </div>
            <div className="font-serif font-bold text-xs text-slate-200 mt-1">
              {t('network.totalCourts')}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
              {t('network.totalCourtsSub')}
            </div>
          </button>

          {/* Stat 2: City Courts */}
          <button
            type="button"
            onClick={() => handleToggleStatFilter('city')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-sm group ${
              activeCourtTypeFilter === 'city'
                ? 'border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-500/10'
                : 'border-theme-border bg-theme-surface hover:border-cyan-400/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Building2 size={18} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-cyan-300 transition-colors">
                ШАҲР
              </span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-white leading-tight">
              {statsMetrics.cities}
            </div>
            <div className="font-serif font-bold text-xs text-slate-200 mt-1">
              {t('network.cityCourts')}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
              {t('network.cityCourtsSub')}
            </div>
          </button>

          {/* Stat 3: District Courts */}
          <button
            type="button"
            onClick={() => handleToggleStatFilter('district')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-sm group ${
              activeCourtTypeFilter === 'district'
                ? 'border-emerald-400 bg-emerald-500/15 shadow-md shadow-emerald-500/10'
                : 'border-theme-border bg-theme-surface hover:border-emerald-400/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <MapPin size={18} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">
                НОҲИЯ
              </span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-white leading-tight">
              {statsMetrics.districts}
            </div>
            <div className="font-serif font-bold text-xs text-slate-200 mt-1">
              {t('network.districtCourts')}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
              {t('network.districtCourtsSub')}
            </div>
          </button>

          {/* Stat 4: Military Garrisons */}
          <button
            type="button"
            onClick={() => handleToggleStatFilter('military')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-sm group ${
              activeCourtTypeFilter === 'military'
                ? 'border-violet-400 bg-violet-500/15 shadow-md shadow-violet-500/10'
                : 'border-theme-border bg-theme-surface hover:border-violet-400/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Shield size={18} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-violet-300 transition-colors">
                ҲАРБӢ
              </span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-white leading-tight">
              {statsMetrics.military || 5}
            </div>
            <div className="font-serif font-bold text-xs text-slate-200 mt-1">
              {t('network.militaryCourts')}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
              {t('network.militaryCourtsSub')}
            </div>
          </button>
        </div>

        {/* 4. SMART SEARCH & REAL REGION HIERARCHY CONTROLS */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-xl">
          {/* Smart Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedCourt(null);
                  setIsSupremeCourtSelected(false);
                }
              }}
              placeholder={t('network.searchPlaceholder')}
              className="w-full h-10 pl-10 pr-8 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Symmetrical 4 Regional Filter Buttons in Mandatory Order */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono scrollbar-none w-full lg:w-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => handleSelectRegion('all')}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                selectedRegion === 'all'
                  ? 'border-amber-400 bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {t('network.allRegions')}
            </button>

            {/* 1. ВМКБ */}
            <button
              type="button"
              onClick={() => handleSelectRegion('gbao')}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                selectedRegion === 'gbao'
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-md'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              1. ВМКБ
            </button>

            {/* 2. Хатлон */}
            <button
              type="button"
              onClick={() => handleSelectRegion('khatlon')}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                selectedRegion === 'khatlon'
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-md'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              2. Хатлон
            </button>

            {/* 3. Суғд */}
            <button
              type="button"
              onClick={() => handleSelectRegion('sugd')}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                selectedRegion === 'sugd'
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-md'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              3. Суғд
            </button>

            {/* 4. Душанбе + РРП */}
            <button
              type="button"
              onClick={() => handleSelectRegion('dushanbe_rrp')}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                selectedRegion === 'dushanbe_rrp'
                  ? 'border-purple-400 bg-purple-500/20 text-purple-300 font-bold shadow-md'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              4. Душанбе + РРП
            </button>
          </div>
        </div>

        {/* Active Filter Notification Pill if Filtered */}
        {activeFilterLabel && (
          <div className="flex items-center justify-between p-2.5 px-4 rounded-xl border border-amber-400/40 bg-amber-500/10 text-xs font-mono text-amber-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles size={14} />
              <span>
                {t('network.filterLabel')}: <strong>{activeFilterLabel}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveCourtTypeFilter('all')}
              className="text-amber-400 hover:text-white underline font-semibold"
            >
              {t('network.resetFilter')} (✕)
            </button>
          </div>
        )}

        {/* 5. MAIN INTERACTIVE JUDICIAL TREE CANVAS (CENTRAL DOMINANT VISUAL) */}
        <div className="w-full rounded-2xl border border-theme-border bg-theme-surface/50 backdrop-blur-md overflow-hidden shadow-2xl">
          <JudicialTreeView
            searchQuery={searchQuery}
            selectedRegion={selectedRegion}
            activeCourtTypeFilter={activeCourtTypeFilter}
            onSelectCourt={handleSelectCourt}
            onSelectRegion={handleSelectRegion}
            selectedCourtId={selectedCourt?.id}
          />
        </div>

        {/* 6. CONTEXT HUBS AREA: INTEGRATED COURT / REGION / SUPREME COURT PANEL */}
        {isSupremeCourtSelected && (
          <div className="mt-4 animate-fadeIn">
            <SupremeCourtContextHub
              onClose={() => setIsSupremeCourtSelected(false)}
              onOpenService={onOpenService}
            />
          </div>
        )}

        {selectedCourt && !isSupremeCourtSelected && (
          <div className="mt-4 animate-fadeIn">
            <SelectedCourtContextHub
              court={selectedCourt}
              onClose={() => setSelectedCourt(null)}
              onOpenService={onOpenService}
            />
          </div>
        )}

        {selectedRegion !== 'all' && !selectedCourt && !isSupremeCourtSelected && activeCluster && (
          <div className="mt-4 animate-fadeIn">
            <RegionSummaryContextHub
              cluster={activeCluster}
              onClose={() => setSelectedRegion('all')}
              onSelectCourt={handleSelectCourt}
            />
          </div>
        )}
      </div>

      {/* 7. FULLSCREEN 4K PRESENTATION MODAL */}
      <ImmersivePresentationModal
        isOpen={isImmersiveOpen}
        onClose={() => setIsImmersiveOpen(false)}
        onSelectCourt={handleSelectCourt}
        selectedCourt={selectedCourt}
      />
    </section>
  );
};
export default Section04JudicialSystem;
