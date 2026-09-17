import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Navbar } from './Navbar';
import { useLanguage } from '../context/LanguageContext';
import { useA11y } from '../context/A11yContext';
import { JudicialModal, ModalTab } from './JudicialModal';
import { PRESIDENT_MESSAGE, USEFUL_LINKS } from '../data/portalLinks';
const NotificationCenterModal = React.lazy(() => import('./digital-court/NotificationCenterModal').then(m => ({ default: m.NotificationCenterModal })));
const AILegalAssistantModal = React.lazy(() => import('./digital-court/AILegalAssistantModal').then(m => ({ default: m.AILegalAssistantModal })));
const NewFilingModal = React.lazy(() => import('./digital-court/NewFilingModal').then(m => ({ default: m.NewFilingModal })));
import { CourtNodeData } from '../data/sudTjData';

export const Layout: React.FC = () => {
  const { t, language } = useLanguage();
  const pickLink = (l: { labelRu: string; labelTj: string; labelEn: string }) =>
    language === 'en' ? l.labelEn : language === 'tj' ? l.labelTj : l.labelRu;
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
        
        {!isStandalone && (
        <footer className="relative z-20 border-t border-theme-border bg-theme-surface/90 backdrop-blur-md px-4 py-8 sm:px-8 md:px-12 text-theme-textMuted font-mono text-xs shadow-sm mt-auto">
          <div className="site-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <a
              href={PRESIDENT_MESSAGE.url}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl border border-theme-gold/40 bg-theme-gold/10 hover:bg-theme-gold/20 transition-colors flex items-start gap-3 group"
            >
              <ExternalLink size={15} className="text-theme-gold shrink-0 mt-0.5" />
              <span>
                <span className="block text-[10px] uppercase tracking-widest text-theme-gold mb-1">
                  {language === 'en' ? 'President message' : language === 'tj' ? 'Паёми президент' : 'Послание президента'}
                </span>
                <span className="font-sans text-sm text-theme-text group-hover:text-theme-gold leading-snug">
                  {pickLink(PRESIDENT_MESSAGE)}
                </span>
              </span>
            </a>
            <div className="p-4 rounded-xl border border-theme-border bg-theme-bg/60">
              <div className="text-[10px] uppercase tracking-widest text-theme-gold mb-2">
                {language === 'en' ? 'Useful links' : language === 'tj' ? 'Сомонаҳои муфид' : 'Полезные сайты'}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {USEFUL_LINKS.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-theme-gold transition-colors"
                  >
                    <ExternalLink size={11} />
                    <span>{pickLink(l)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
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
        )}

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
