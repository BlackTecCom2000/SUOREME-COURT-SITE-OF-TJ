import React, { useState } from 'react';
import {
  Search,
  Maximize2,

  Shield,
} from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import {
  CourtNodeData,
  REGIONAL_CLUSTERS,
  getRegionName,
} from '../../data/sudTjData';

import { JudicialTreeView } from '../judicial-ecosystem/JudicialTreeView';
import { CourtDetailsDrawer } from '../judicial-ecosystem/CourtDetailsDrawer';
import { ImmersivePresentationModal } from '../judicial-ecosystem/ImmersivePresentationModal';
import { DigitalDataRain } from '../effects/DigitalDataRain';

interface Section06JudicialNetworkProps {
  onOpenService?: (serviceTab: string) => void;
}

export const Section06JudicialNetwork: React.FC<Section06JudicialNetworkProps> = ({
  onOpenService,
}) => {
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'city' | 'district' | 'military' | 'regional'>('all');
  const [selectedCourt, setSelectedCourt] = useState<CourtNodeData | null>(null);
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);

  return (
    <section
      id="courts"
      aria-label={t('nav.courts')}
      className="relative py-14 lg:py-28 overflow-hidden text-theme-text select-none border-t border-theme-border/30"
    >
      <DigitalDataRain density="sparse" speed="slow" opacity={0.2} colorTheme="cyan" />

      {/* 1. Header Row */}
      <div className="relative flex flex-col gap-6 px-5 sm:px-8 md:px-12 mb-6">
        <Reveal delay={100}>
          <div className="flex items-center justify-between font-mono text-theme-text max-w-xs sm:max-w-none text-xs">
            <div className="flex items-center gap-3">
              <span className="tracking-widest text-theme-gold font-semibold">( F )</span>
              <span className="text-theme-textMuted">[ 006 / 010 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-2" />
              <span className="font-mono text-[10px] text-theme-textMuted uppercase tracking-widest hidden sm:inline">
                {t('network.badge')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsImmersiveOpen(true)}
              aria-label={t('network.fullscreenBtn')}
              className="flex items-center gap-1.5 font-mono text-xs text-theme-gold hover:text-theme-text px-3.5 py-1.5 rounded-full glass border-theme-gold/40 hover:border-theme-gold transition-all"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">
                {t('network.fullscreenBtn')}
              </span>
            </button>
          </div>
        </Reveal>

        {/* Section Headline */}
        <div className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-medium uppercase leading-[1.05] tracking-tight text-theme-text drop-shadow-sm">
          <Reveal delay={180}>
            <div>
              {t('network.title1')}{' '}
              <span className="normal-case italic font-light text-theme-gold">
                {t('network.title1Italic')}
              </span>
            </div>
          </Reveal>
          <Reveal delay={260}>
            <div className="text-theme-text">
              {t('network.title2')}
            </div>
          </Reveal>
        </div>
      </div>

      {/* 2. Mode Selector (Network vs Tree) & Real-time Search */}
      <div className="px-5 sm:px-8 md:px-12 mb-6">
        <Reveal delay={320}>
          <div className="p-4 glass glass-panel flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Toggle (Removed) */}

            {/* Instant Search Bar */}
            <div className="relative w-full md:w-80">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-textMuted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('network.searchPlaceholder')}
                className="w-full bg-theme-bg/70 border border-theme-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-theme-textMuted hover:text-theme-text"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Court type filter chips */}
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label={language === 'tj' ? 'Филtri навъи суд' : language === 'en' ? 'Court type filters' : 'Фильтры типа суда'}
            >
              {(
                [
                  { id: 'all', tj: 'Ҳама', ru: 'Все', en: 'All' },
                  { id: 'city', tj: 'Шаҳрӣ', ru: 'Городские', en: 'City' },
                  { id: 'district', tj: 'Ноҳиявӣ', ru: 'Районные', en: 'District' },
                  { id: 'military', tj: 'Ҳарбӣ', ru: 'Военные', en: 'Military' },
                  { id: 'regional', tj: 'Вилоятӣ', ru: 'Областные', en: 'Regional' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={typeFilter === opt.id}
                  onClick={() => setTypeFilter(opt.id as typeof typeFilter)}
                  className={
                    'px-2.5 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider transition-colors ' +
                    (typeFilter === opt.id
                      ? 'border-theme-gold bg-theme-gold/15 text-theme-gold'
                      : 'border-theme-border text-theme-textMuted hover:border-theme-borderHover hover:text-theme-text')
                  }
                >
                  {language === 'tj' ? opt.tj : language === 'en' ? opt.en : opt.ru}
                </button>
              ))}
            </div>

          </div>
        </Reveal>
      </div>

      {/* 3. Main Dynamic Canvas Area */}
      <div className="px-5 sm:px-8 md:px-12 flex-1 flex flex-col justify-center my-4">
        <Reveal delay={380}>
          <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] min-h-[400px] md:min-h-[560px] max-h-[780px] glass glass-panel overflow-hidden">
            
              <JudicialTreeView
                searchQuery={searchQuery}
                activeCourtTypeFilter={typeFilter}
                onSelectCourt={(court) => setSelectedCourt(court)}
                selectedCourtId={selectedCourt?.id}
              />

            {/* Floating Quick Legend in Canvas Bottom Left */}
            <div className="absolute left-4 bottom-4 z-20 hidden md:flex items-center gap-3 glass glass-chip px-3.5 py-2 font-mono text-[10px] text-theme-textSec">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#dfbe7e] shadow-[0_0_8px_rgba(223,190,126,0.8)]" />
                <span>{t('network.legendSupreme')}</span>
              </div>
              <span>•</span>
              {REGIONAL_CLUSTERS.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.colorHex }} />
                  <span>{getRegionName(c, language)}</span>
                </div>
              ))}
              <span>•</span>
              <div className="flex items-center gap-1.5 text-violet-400">
                <Shield size={10} />
                <span>{t('network.legendMilitary')}</span>
              </div>
            </div>

            {/* Hint in Canvas Bottom Right */}
            <div className="absolute right-4 bottom-4 z-20 font-mono text-[10px] text-theme-textMuted glass glass-chip px-3 py-1.5 hidden sm:block">
              {t('network.legendHint')}
            </div>
          </div>
        </Reveal>
      </div>

      {/* 4. Court Details Side Drawer */}
      <CourtDetailsDrawer
        court={selectedCourt}
        onClose={() => setSelectedCourt(null)}
        onOpenService={onOpenService}
      />

      {/* 5. 4K Immersive Fullscreen Modal */}
      {isImmersiveOpen && (
        <ImmersivePresentationModal
          isOpen={isImmersiveOpen}
          onClose={() => setIsImmersiveOpen(false)}
          onSelectCourt={(court) => setSelectedCourt(court)}
        />
      )}
    </section>
  );
};
