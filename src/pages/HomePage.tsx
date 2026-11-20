import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Section01Hero } from '../components/sections/Section01Hero';
import { QuickActionsGrid } from '../components/digital-court/QuickActionsGrid';
import { CaseSearchEngine, CaseRecord } from '../components/digital-court/CaseSearchEngine';
import { CaseDashboard } from '../components/digital-court/CaseDashboard';
import { Section02Mission } from '../components/sections/Section02Mission';
import { Section04JudicialSystem } from '../components/sections/Section04JudicialSystem';
import { Section05CourtServices } from '../components/sections/Section05CourtServices';
import { Section06JudicialInformation } from '../components/sections/Section06JudicialInformation';
import { Section07Contacts } from '../components/sections/Section07Contacts';
import { Section08Heroes } from '../components/sections/Section08Heroes';
import { InViewLoad } from '../components/InViewLoad';

const Section03DigitalJustice = React.lazy(() => import('../components/sections/Section03DigitalJustice').then(m => ({ default: m.Section03DigitalJustice })));
const LegislativeLibrary = React.lazy(() => import('../components/digital-court/LegislativeLibrary').then(m => ({ default: m.LegislativeLibrary })));
const CaseWorkspaceModal = React.lazy(() => import('../components/digital-court/CaseWorkspaceModal').then(m => ({ default: m.CaseWorkspaceModal })));
const DocumentCenter = React.lazy(() => import('../components/digital-court/DocumentCenter').then(m => ({ default: m.DocumentCenter })));
const NewFilingModal = React.lazy(() => import('../components/digital-court/NewFilingModal').then(m => ({ default: m.NewFilingModal })));

import { ModalTab } from '../components/JudicialModal';
import { CourtNodeData } from '../data/sudTjData';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../context/LanguageContext';

interface SiteSection {
  id: string;
  key: string;
  visible: number;
  sort_order: number;
}

// Default order matching original homepage
const DEFAULT_SECTIONS: Array<{ key: string; order: number }> = [
  { key: 'judicial_info', order: 0 },
  { key: 'quick_actions', order: 1 },
  { key: 'case_search', order: 2 },
  { key: 'my_cases', order: 3 },
  { key: 'mission', order: 4 },
  { key: 'digital_justice', order: 5 },
  { key: 'courts', order: 6 },
  { key: 'court_services', order: 7 },
  { key: 'library', order: 8 },
  { key: 'hero', order: 9 },
  { key: 'contacts', order: 10 },
  { key: 'heroes', order: 11 },
];

export const HomePage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(
    language === 'tj' ? 'Суди Олии Ҷумҳурии Тоҷикистон' : language === 'en' ? 'Supreme Court of Tajikistan' : 'Верховный суд Республики Таджикистан'
  );
  const {
    handleOpenSectionModal
  } = useOutletContext<{
    handleOpenSectionModal: (tab: ModalTab, court?: CourtNodeData) => void;
    handleOpenAiAssistant?: () => void;
  }>();

  const [selectedCaseForWorkspace, setSelectedCaseForWorkspace] = useState<CaseRecord | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [documentCenterOpen, setDocumentCenterOpen] = useState(false);
  const [newFilingOpen, setNewFilingOpen] = useState(false);

  const [siteSections, setSiteSections] = useState<SiteSection[]>([]);

  useEffect(() => {
    fetch('/api/site-sections')
      .then(r => r.ok ? r.json() : [])
      .then((data: SiteSection[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSiteSections(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case 'file_claim':
      case 'file_appeal':
        setNewFilingOpen(true);
        break;
      case 'track_case':
        handleScrollToSection('case-search');
        break;
      case 'acts_bank':
        handleOpenSectionModal('acts');
        break;
      case 'calc_duty':
        handleOpenSectionModal('duties');
        break;
      case 'reception':
        handleOpenSectionModal('reception');
        break;
      default:
        handleOpenSectionModal('esud');
        break;
    }
  };

  const handleSelectCase = (c: CaseRecord) => {
    setSelectedCaseForWorkspace(c);
    setWorkspaceOpen(true);
  };

  // Build visibility + order maps from published sections
  const visibilityMap = new Map<string, boolean>();
  const orderMap = new Map<string, number>();

  if (siteSections.length > 0) {
    for (const s of siteSections) {
      visibilityMap.set(s.key, s.visible === 1);
      orderMap.set(s.key, s.sort_order);
    }
  }

  const isVisible = (key: string) => {
    if (visibilityMap.has(key)) return visibilityMap.get(key)!;
    return true; // default visible
  };

  const getOrder = (key: string, defaultOrder: number) => {
    if (orderMap.has(key)) return orderMap.get(key)!;
    return defaultOrder;
  };

  // Build renderable sections
  const renderSection = (key: string): React.ReactNode => {
    switch (key) {
      case 'hero':
        return isVisible('hero') ? (
          <Section01Hero
            onOpenESud={() => handleOpenSectionModal('esud')}
            onOpenFiling={() => setNewFilingOpen(true)}
            onScrollNext={() => handleScrollToSection('contacts')}
          />
        ) : null;
      case 'quick_actions':
        return isVisible('quick_actions') ? (
          <div id="quick-actions">
            <QuickActionsGrid onAction={handleQuickAction} />
          </div>
        ) : null;
      case 'case_search':
        return isVisible('case_search') ? <CaseSearchEngine onSelectCase={handleSelectCase} /> : null;
      case 'my_cases':
        return isVisible('my_cases') ? (
          <CaseDashboard
            onSelectCase={handleSelectCase}
            onNewFiling={() => setNewFilingOpen(true)}
          />
        ) : null;
      case 'mission':
        return isVisible('mission') ? (
          <Section02Mission
            onOpenAbout={() => handleOpenSectionModal('about')}
            onOpenCollegium={() => handleOpenSectionModal('about')}
          />
        ) : null;
      case 'digital_justice':
        return isVisible('digital_justice') ? (
          <InViewLoad rootMargin="400px">
            <Section03DigitalJustice
              onOpenActs={() => handleOpenSectionModal('acts')}
            />
          </InViewLoad>
        ) : null;
      case 'courts':
        return isVisible('courts') ? (
          <Section04JudicialSystem
            onOpenService={(serviceKey, court) => handleOpenSectionModal(serviceKey as ModalTab, court)}
          />
        ) : null;
      case 'court_services':
      case 'services':
        return isVisible(key) ? (
          <Section05CourtServices
            onOpenService={(serviceKey) => {
              if (serviceKey === 'docs') setDocumentCenterOpen(true);
              else handleOpenSectionModal(serviceKey as ModalTab);
            }}
            onOpenAppeals={() => setNewFilingOpen(true)}
            onOpenDocs={() => setDocumentCenterOpen(true)}
          />
        ) : null;
      case 'library':
        return isVisible('library') ? (
          <InViewLoad rootMargin="400px">
            <LegislativeLibrary />
          </InViewLoad>
        ) : null;
      case 'judicial_info':
      case 'legislation':
      case 'news':
        return isVisible(key) ? (
          <Section06JudicialInformation
            onOpenActs={() => handleOpenSectionModal('acts')}
            onOpenNews={() => handleOpenSectionModal('news')}
          />
        ) : null;
      case 'contacts':
        return isVisible('contacts') ? (
          <Section07Contacts
            onOpenContacts={() => handleOpenSectionModal('contacts')}
          />
        ) : null;
      case 'heroes':
        return isVisible('heroes') ? <Section08Heroes /> : null;
      default:
        return null;
    }
  };

  // Build the list of sections to render, sorted by order
  let sectionsToRender: Array<{ key: string; order: number }> = DEFAULT_SECTIONS.map(s => ({
    key: s.key,
    order: getOrder(s.key, s.order),
  }));

  // If site_sections available, also include any sections not in defaults
  if (siteSections.length > 0) {
    const defaultKeys = new Set(DEFAULT_SECTIONS.map(s => s.key));
    for (const ss of siteSections) {
      if (!defaultKeys.has(ss.key) && ss.key !== 'useful' && ss.key !== 'footer') {
        sectionsToRender.push({ key: ss.key, order: ss.sort_order });
      }
    }
    // Sort by order
    sectionsToRender.sort((a, b) => a.order - b.order);
  }

  return (
    <>
      {sectionsToRender.map(({ key }) => {
        const el = renderSection(key);
        return el ? <React.Fragment key={key}>{el}</React.Fragment> : null;
      })}

      {/* Modals for Modern Digital Justice Workspace */}
      <React.Suspense fallback={null}>
        {workspaceOpen && (
          <CaseWorkspaceModal
            caseData={selectedCaseForWorkspace}
            isOpen={workspaceOpen}
            onClose={() => {
              setWorkspaceOpen(false);
              setSelectedCaseForWorkspace(null);
            }}
          />
        )}

        {documentCenterOpen && (
          <DocumentCenter
            isOpen={documentCenterOpen}
            onClose={() => setDocumentCenterOpen(false)}
          />
        )}

        {newFilingOpen && (
          <NewFilingModal
            isOpen={newFilingOpen}
            onClose={() => setNewFilingOpen(false)}
          />
        )}
      </React.Suspense>
    </>
  );
};