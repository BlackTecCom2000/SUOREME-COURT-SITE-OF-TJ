import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useA11y } from '../context/A11yContext';
import { JudicialModal, ModalTab } from './JudicialModal';
const NotificationCenterModal = React.lazy(() => import('./digital-court/NotificationCenterModal').then(m => ({ default: m.NotificationCenterModal })));
const AILegalAssistantModal = React.lazy(() => import('./digital-court/AILegalAssistantModal').then(m => ({ default: m.AILegalAssistantModal })));
const NewFilingModal = React.lazy(() => import('./digital-court/NewFilingModal').then(m => ({ default: m.NewFilingModal })));
const GlobalSearchModal = React.lazy(() => import('./GlobalSearchModal').then(m => ({ default: m.GlobalSearchModal })));
import { CourtNodeData } from '../data/sudTjData';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Court sub-sites (/courts/:courtId) and the standalone e-library (/library)
  // render their own attached navigation — the main portal navigation
  // must not appear there.
  const isCourtSite = location.pathname.startsWith('/courts/');
  const isStandalone = isCourtSite || location.pathname.startsWith('/library');
  const { isHighContrast, toggleContrast } = useA11y();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('about');
  const [courtContext, setCourtContext] = useState<CourtNodeData | null>(null);

  // Global modals
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [globalFilingOpen, setGlobalFilingOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);



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

  // Universal search: global portal search modal (content + acts + library).
  const handleSearchTrigger = () => {
    setGlobalSearchOpen(true);
  };

  return (
    <div
      className={`relative min-h-screen selection:bg-theme-gold/30 selection:text-theme-text transition-colors duration-400 bg-theme-bg text-theme-text ${
        isHighContrast ? 'contrast-125 brightness-110' : ''
      }`}
    >
      {!isStandalone && (
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
      )}

      <main className="relative z-10 flex flex-col space-y-0 min-h-screen">
        <Outlet 
          context={{ 
            handleOpenSectionModal,
            handleOpenAiAssistant: () => setAiAssistantOpen(true),
            handleOpenNotifications: () => setNotificationsOpen(true),
          }} 
        />
        
        {!isStandalone && <Footer onOpenSectionModal={handleOpenSectionModal} />}

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

        {/* Universal Search */}
        {globalSearchOpen && (
          <GlobalSearchModal
            isOpen={globalSearchOpen}
            onClose={() => setGlobalSearchOpen(false)}
          />
        )}
      </React.Suspense>
    </div>
  );
};
