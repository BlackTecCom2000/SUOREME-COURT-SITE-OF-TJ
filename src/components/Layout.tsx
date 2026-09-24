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
const GlobalSearchModal = React.lazy(() => import('./GlobalSearchModal').then(m => ({ default: m.GlobalSearchModal })));
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
        
        {!isStandalone && (
        <footer className="relative z-20 glass px-4 py-8 sm:px-8 md:px-12 text-theme-textMuted font-mono text-xs mt-auto">
          <div className="site-container grid grid-cols-1 gap-4 mb-6">
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
          </div>
          {/* IA link groups mirror the information architecture */}
          <div className="site-container grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              {
                title: language === 'en' ? 'Court' : language === 'tj' ? 'Суд' : 'Суд',
                links: [
                  { label: language === 'en' ? 'About' : language === 'tj' ? 'Дар бораи суд' : 'О суде', to: '/about' },
                  { label: language === 'en' ? 'Leadership' : language === 'tj' ? 'Роҳбарият' : 'Руководство', to: '/leadership' },
                  { label: language === 'en' ? 'E-Library' : language === 'tj' ? 'Китобхона' : 'Библиотека', to: '/library' },
                  { label: language === 'en' ? 'Sitemap' : language === 'tj' ? 'Харитаи сомона' : 'Карта сайта', to: '/sitemap' },
                ],
              },
              {
                title: language === 'en' ? 'Services' : language === 'tj' ? 'Хизматрасониҳо' : 'Услуги',
                tabs: [
                  { label: language === 'en' ? 'Hearings' : language === 'tj' ? 'Мурофиаҳо' : 'Заседания', tab: 'hearings' as ModalTab },
                  { label: language === 'en' ? 'Acts' : language === 'tj' ? 'Санадаҳо' : 'Акты', tab: 'acts' as ModalTab },
                  { label: language === 'en' ? 'Duty calculator' : language === 'tj' ? 'Боҷ' : 'Пошлина', tab: 'duties' as ModalTab },
                  { label: language === 'en' ? 'Appeals' : language === 'tj' ? 'Муроҷиатҳо' : 'Обращения', tab: 'appeals' as ModalTab },
                ],
              },
              {
                title: language === 'en' ? 'Information' : language === 'tj' ? 'Иттилоот' : 'Информация',
                tabs: [
                  { label: language === 'en' ? 'News' : language === 'tj' ? 'Хабарҳо' : 'Новости', tab: 'news' as ModalTab },
                  { label: language === 'en' ? 'Announcements' : language === 'tj' ? 'Эълонҳо' : 'Объявления', tab: 'announcements' as ModalTab },
                  { label: language === 'en' ? 'Vacancies' : language === 'tj' ? 'Ҷойҳои холӣ' : 'Вакансии', tab: 'vacancies' as ModalTab },
                  { label: language === 'en' ? 'Journal' : language === 'tj' ? 'Маҷалла' : 'Журнал', tab: 'journal' as ModalTab },
                ],
              },
            ].map((group) => (
              <nav key={group.title} aria-label={group.title} className="p-4 rounded-xl border border-theme-border bg-theme-bg/60">
                <div className="text-[10px] uppercase tracking-widest text-theme-gold mb-2">{group.title}</div>
                <ul className="space-y-1">
                  {group.links?.map((l) => (
                    <li key={l.to + l.label}>
                      <a href={l.to} onClick={(e) => { e.preventDefault(); navigate(l.to); }} className="text-xs text-theme-textSec hover:text-theme-gold transition-colors">
                        {l.label}
                      </a>
                    </li>
                  ))}
                  {group.tabs?.map((l) => (
                    <li key={l.tab + l.label}>
                      <button type="button" onClick={() => handleOpenSectionModal(l.tab)} className="text-xs text-theme-textSec hover:text-theme-gold transition-colors">
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          {/* Useful sites — running ticker along the bottom of the site */}
          <div className="site-container mb-6">
            <div className="flex items-center gap-3 px-4 pt-3">
              <span className="text-[10px] uppercase tracking-widest text-theme-gold whitespace-nowrap">
                {language === 'en' ? 'Useful links' : language === 'tj' ? 'Сомонаҳои муфид' : 'Полезные сайты'}
              </span>
              <span className="h-px flex-1 bg-theme-gold/25" aria-hidden="true" />
            </div>
            <div
              className="ticker mt-2 rounded-xl border border-theme-border bg-theme-bg/60 overflow-hidden"
              role="marquee"
              aria-label={language === 'en' ? 'Useful links' : language === 'tj' ? 'Сомонаҳои муфид' : 'Полезные сайты'}
            >
              <div className="ticker-track">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    className="ticker-run"
                    aria-hidden={copy === 1 ? 'true' : undefined}
                  >
                    {USEFUL_LINKS.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={copy === 1 ? -1 : undefined}
                        className="ticker-item"
                      >
                        <ExternalLink size={11} />
                        <span>{pickLink(l)}</span>
                        <span className="ticker-dot" aria-hidden="true">•</span>
                      </a>
                    ))}
                  </div>
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
            <div className="flex items-center gap-4">
              <a
                href="/sitemap"
                className="hover:text-theme-gold transition-colors"
              >
                {language === 'en' ? 'Sitemap' : language === 'tj' ? 'Харитаи сомона' : 'Карта сайта'}
              </a>
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
