import React, { useEffect, useState } from 'react';
import { Minimize2, Search } from 'lucide-react';
import { CourtNodeData, ALL_COURTS } from '../../data/sudTjData';
import { JudicialTreeView } from './JudicialTreeView';
import { useLanguage } from '../../context/LanguageContext';

interface ImmersivePresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourt: (court: CourtNodeData) => void;
  selectedCourt?: CourtNodeData | null;
}

export const ImmersivePresentationModal: React.FC<ImmersivePresentationModalProps> = ({
  isOpen,
  onClose,
  onSelectCourt,
  selectedCourt,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCourts = ALL_COURTS.length + 1; // + Supreme Court
  const totalCities = ALL_COURTS.filter((c) => c.type === 'city').length;
  const totalDistricts = ALL_COURTS.filter((c) => c.type === 'district').length;
  const totalMilitary = ALL_COURTS.filter((c) => c.type === 'military').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-title"
      className="fixed inset-0 z-50 flex flex-col bg-theme-bg text-theme-text overflow-hidden animate-in fade-in duration-300 pointer-events-auto"
    >
      {/* 1. Immersive Top HUD Navigation Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-6 border-b border-theme-border/60 glass z-20">
        
        {/* Title & Live Status */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-theme-gold uppercase tracking-widest">
                [ 4K IMMERSIVE VIEW ]
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 id="presentation-title" className="text-base sm:text-lg font-medium text-theme-text uppercase">
              {t('network.title1')} {t('network.title2')}
            </h2>
          </div>
        </div>

        {/* Mode Toggle & Search in Top Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          


          {/* Search */}
          <div className="relative w-48 sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('network.searchPlaceholder')}
              className="w-full bg-theme-bg border border-theme-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold"
            />
          </div>

          {/* Close / Exit Fullscreen Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={t('network.exitFullscreen')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-mono text-xs uppercase transition-all shadow-sm"
          >
            <Minimize2 size={14} />
            <span className="hidden sm:inline">{t('network.exitFullscreen')}</span>
          </button>
        </div>
      </div>

      {/* 2. Macro National Statistics HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-2 border-b border-theme-border/60 font-mono text-xs text-theme-textSec">
        <div className="flex items-center gap-2">
          <span className="text-theme-gold font-bold">{totalCourts}</span>
          <span className="text-theme-textMuted">{t('registry.totalCourts')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">{totalCities}</span>
          <span className="text-theme-textMuted">{t('registry.cityCourts')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">{totalDistricts}</span>
          <span className="text-theme-textMuted">{t('registry.districtCourts')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-violet-400 font-bold">{totalMilitary}</span>
          <span className="text-theme-textMuted">{t('registry.militaryCourts')}</span>
        </div>
      </div>

      {/* 3. Main Fullscreen Visualization Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <JudicialTreeView
            searchQuery={searchQuery}
            onSelectCourt={onSelectCourt}
            selectedCourtId={selectedCourt?.id}
          />
      </div>
    </div>
  );
};
