import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  REGIONAL_CLUSTERS,
  SUPREME_COURT_NODE,
  CourtNodeData,
} from '../../data/sudTjData';
import { JudicialSystemDashboard } from '../judicial-map/JudicialSystemDashboard';
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

  return (
    <section
      id="courts"
      aria-label={t('network.title1') + ' ' + t('network.title2')}
      className="relative py-14 lg:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden select-none"
    >
      <DigitalDataRain density="sparse" speed="slow" opacity={0.18} colorTheme="gold" />

      <div className="site-container relative z-10 space-y-6">
        <JudicialSystemDashboard
          courts={allCourtsList}
          searchQuery={searchQuery}
          onSearchChange={(v) => {
            setSearchQuery(v);
            if (v.trim()) {
              setSelectedCourt(null);
              setIsSupremeCourtSelected(false);
            }
          }}
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
          activeCourtTypeFilter={activeCourtTypeFilter}
          onToggleTypeFilter={setActiveCourtTypeFilter}
          selectedCourtId={selectedCourt?.id}
          onSelectCourt={handleSelectCourt}
          onSelectSupreme={() => handleSelectCourt(SUPREME_COURT_NODE)}
          supremeSelected={isSupremeCourtSelected}
          onResetFilters={handleResetFilters}
          onOpenImmersive={() => setIsImmersiveOpen(true)}
        />

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
