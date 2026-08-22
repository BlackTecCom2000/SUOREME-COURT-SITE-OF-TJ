import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useLanguage } from '../context/LanguageContext';
import { JudicialModal, ModalTab } from './JudicialModal';
import { CourtNodeData } from '../data/sudTjData';

export const Layout: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('about');
  const [courtContext, setCourtContext] = useState<CourtNodeData | null>(null);

  const toggleContrast = () => setIsHighContrast(prev => !prev);

  const handleOpenSectionModal = (tab: ModalTab, court?: CourtNodeData) => {
    setActiveTab(tab);
    setCourtContext(court || null);
    setModalOpen(true);
  };

  const handleOpenSection = (sectionId: string) => {
    if (window.location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div
      className={`relative min-h-screen selection:bg-theme-gold/30 selection:text-theme-text transition-colors duration-400 bg-theme-bg text-theme-text ${
        isHighContrast ? 'contrast-125 brightness-110' : ''
      }`}
    >
      <Navbar
        isHighContrast={isHighContrast}
        onToggleContrast={toggleContrast}
        onOpenSection={handleOpenSection}
      />

      <main className="relative z-10 flex flex-col space-y-0 min-h-screen">
        <Outlet context={{ handleOpenSectionModal }} />
        
        <footer className="relative z-20 border-t border-theme-border bg-theme-surface/90 backdrop-blur-md px-5 py-8 sm:px-8 md:px-12 text-theme-textMuted font-mono text-xs shadow-sm mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-theme-text font-medium">SUD.TJ</span>
              <span>•</span>
              <span>{t('contacts.officialPortalNotice')}</span>
            </div>
            <div>
              <span>{t('contacts.copyright')}</span>
            </div>
          </div>
        </footer>
      </main>

      <JudicialModal
        isOpen={modalOpen}
        activeTab={activeTab}
        courtContext={courtContext}
        onClose={() => {
          setModalOpen(false);
          setCourtContext(null);
        }}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
};
