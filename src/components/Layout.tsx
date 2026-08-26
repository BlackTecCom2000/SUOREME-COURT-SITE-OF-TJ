import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useLanguage } from '../context/LanguageContext';
import { JudicialModal, ModalTab } from './JudicialModal';
const NotificationCenterModal = React.lazy(() => import('./digital-court/NotificationCenterModal').then(m => ({ default: m.NotificationCenterModal })));
const AILegalAssistantModal = React.lazy(() => import('./digital-court/AILegalAssistantModal').then(m => ({ default: m.AILegalAssistantModal })));
const NewFilingModal = React.lazy(() => import('./digital-court/NewFilingModal').then(m => ({ default: m.NewFilingModal })));
import { CourtNodeData } from '../data/sudTjData';

export const Layout: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('about');
  const [courtContext, setCourtContext] = useState<CourtNodeData | null>(null);

  // Global modals
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [globalFilingOpen, setGlobalFilingOpen] = useState(false);

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

  const handleSearchTrigger = () => {
    const el = document.getElementById('case-search');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      handleOpenSection('case-search');
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
        onOpenSectionModal={(tab) => handleOpenSectionModal(tab as ModalTab)}
        onOpenSearch={handleSearchTrigger}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenAiAssistant={() => setAiAssistantOpen(true)}
        onOpenESud={() => handleOpenSectionModal('esud')}
        onOpenFiling={() => setGlobalFilingOpen(true)}
      />

      <main className="relative z-10 flex flex-col space-y-0 min-h-screen">
        <Outlet 
          context={{ 
            handleOpenSectionModal,
            handleOpenAiAssistant: () => setAiAssistantOpen(true),
            handleOpenNotifications: () => setNotificationsOpen(true),
          }} 
        />
        
        <footer className="relative z-20 border-t border-theme-border bg-theme-surface/90 backdrop-blur-md px-4 py-8 sm:px-8 md:px-12 text-theme-textMuted font-mono text-xs shadow-sm mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 site-container">
            <div className="flex items-center gap-3">
              <span className="text-theme-text font-medium">SUD.TJ</span>
              <span>•</span>
              <span>{t('contacts.officialPortalNotice')}</span>
            </div>
            <div>
              <span>{t('contacts.copyright')}</span>
            </div>
          </div>
          <div className="flex items-center justify-center mt-4 pt-4 border-t border-theme-border/40 site-container">
            <span className="flex items-center gap-2 text-theme-textMuted/70 text-[11px] tracking-wide">
              <span style={{ fontSize: '14px' }}>⚖️</span>
              Автор и разработчик:{' '}
              <span className="text-theme-gold font-semibold tracking-wider">Daler Jaborov \ BlackTecCom</span>
            </span>
          </div>
        </footer>

      </main>

      {/* Standard Section Modals */}
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

      <React.Suspense fallback={null}>
        {/* Notification Center */}
        {notificationsOpen && (
          <NotificationCenterModal
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        )}

        {/* AI Legal Assistant Modal */}
        {aiAssistantOpen && (
          <AILegalAssistantModal
            isOpen={aiAssistantOpen}
            onClose={() => setAiAssistantOpen(false)}
          />
        )}

        {/* Global Filing Modal */}
        {globalFilingOpen && (
          <NewFilingModal
            isOpen={globalFilingOpen}
            onClose={() => setGlobalFilingOpen(false)}
          />
        )}
      </React.Suspense>
    </div>
  );
};
