import React from 'react';
import { Building2, Landmark, MapPin, Shield } from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import { REGIONAL_CLUSTERS, getRegionName, getRegionShortName } from '../../data/sudTjData';
import { DigitalDataRain } from '../effects/DigitalDataRain';

interface Section05DigitalRegistryProps {
  onExploreNetwork: () => void;
}

export const Section05DigitalRegistry: React.FC<Section05DigitalRegistryProps> = ({
  onExploreNetwork,
}) => {
  const { language, t } = useLanguage();

  const totalCourtsCount = REGIONAL_CLUSTERS.reduce((acc, c) => acc + c.courts.length, 1);

  const stats = [
    {
      id: 'total',
      value: `${totalCourtsCount}+`,
      labelKey: 'registry.totalCourts',
      subKey: 'registry.totalCourtsSub',
      icon: Landmark,
      color: 'text-theme-gold',
    },
    {
      id: 'cities',
      value: '20',
      labelKey: 'registry.cityCourts',
      subKey: 'registry.cityCourtsSub',
      icon: Building2,
      color: 'text-cyan-400',
    },
    {
      id: 'districts',
      value: '45',
      labelKey: 'registry.districtCourts',
      subKey: 'registry.districtCourtsSub',
      icon: MapPin,
      color: 'text-emerald-400',
    },
    {
      id: 'military',
      value: '4',
      labelKey: 'registry.militaryCourts',
      subKey: 'registry.militaryCourtsSub',
      icon: Shield,
      color: 'text-violet-400',
    },
  ];

  return (
    <section
      id="registry"
      aria-label={t('nav.registry')}
      className="relative py-14 lg:py-28 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30"
    >
      <DigitalDataRain density="medium" speed="medium" opacity={0.25} colorTheme="mixed" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <Reveal delay={50}>
          <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
            <span className="tracking-widest text-theme-gold font-semibold">( E )</span>
            <span className="text-theme-textMuted">[ 005 / 010 ]</span>
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase">
              {t('registry.badge')}
            </span>
          </div>
        </Reveal>

        {/* Section Title & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
          <div className="lg:col-span-8">
            <Reveal delay={150}>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase">
                {t('registry.title1')}{' '}
                <span className="italic font-light text-theme-gold">
                  {t('registry.title1Italic')}
                </span>{' '}
                {t('registry.title2')}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4">
            <Reveal delay={250}>
              <p className="text-xs sm:text-sm text-theme-textSec leading-relaxed">
                {t('registry.description')}
              </p>
            </Reveal>
          </div>
        </div>

        {/* 4 Macro Statistics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={300 + idx * 50}>
                <div className="content-card hover:border-theme-borderHover transition-all flex flex-col justify-between min-h-[160px]">
                  <div className="flex items-center justify-between">
                    <Icon size={20} className={item.color} />
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-theme-text tracking-tight">
                      {item.value}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-theme-text mt-3">
                      {t(item.labelKey)}
                    </div>
                    <div className="font-mono text-[10px] text-theme-textMuted uppercase tracking-wider mt-1">
                      {t(item.subKey)}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* 4 Regional Clusters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGIONAL_CLUSTERS.map((cluster, idx) => (
            <Reveal key={cluster.id} delay={450 + idx * 50}>
              <div
                onClick={onExploreNetwork}
                className="group p-5 glass glass-card hover:border-theme-borderHover transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold" style={{ color: cluster.colorHex }}>
                    {getRegionShortName(cluster, language)}
                  </span>
                  <span className="font-mono text-xs text-theme-textMuted">
                    {cluster.courts.length} {t('registry.totalCourts')}
                  </span>
                </div>
                <div className="text-sm font-medium text-theme-text group-hover:text-theme-gold transition-colors">
                  {getRegionName(cluster, language)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
