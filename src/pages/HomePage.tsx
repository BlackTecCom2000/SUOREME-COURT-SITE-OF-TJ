import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ScrollVideo } from '../components/ScrollVideo';
import { Section01Hero } from '../components/sections/Section01Hero';
import { QuickActionsGrid } from '../components/digital-court/QuickActionsGrid';
import { CaseSearchEngine, CaseRecord } from '../components/digital-court/CaseSearchEngine';
import { CaseDashboard } from '../components/digital-court/CaseDashboard';
import { Section02Mission } from '../components/sections/Section02Mission';
import { Section04JudicialSystem } from '../components/sections/Section04JudicialSystem';
import { Section05CourtServices } from '../components/sections/Section05CourtServices';
import { Section06JudicialInformation } from '../components/sections/Section06JudicialInformation';
import { Section07Contacts } from '../components/sections/Section07Contacts';
import { InViewLoad } from '../components/InViewLoad';

const Section03DigitalJustice = React.lazy(() => import('../components/sections/Section03DigitalJustice').then(m => ({ default: m.Section03DigitalJustice })));
const LegislativeLibrary = React.lazy(() => import('../components/digital-court/LegislativeLibrary').then(m => ({ default: m.LegislativeLibrary })));
const CaseWorkspaceModal = React.lazy(() => import('../components/digital-court/CaseWorkspaceModal').then(m => ({ default: m.CaseWorkspaceModal })));
const DocumentCenter = React.lazy(() => import('../components/digital-court/DocumentCenter').then(m => ({ default: m.DocumentCenter })));
const NewFilingModal = React.lazy(() => import('../components/digital-court/NewFilingModal').then(m => ({ default: m.NewFilingModal })));

import { ModalTab } from '../components/JudicialModal';
import { CourtNodeData } from '../data/sudTjData';

export const HomePage: React.FC = () => {
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

  return (
    <>
      <ScrollVideo />

      {/* Section 01: Hero with Live Process Pipeline [ 001 / 007 ] */}
      <Section01Hero
        onOpenESud={() => handleOpenSectionModal('esud')}
        onOpenFiling={() => setNewFilingOpen(true)}
        onScrollNext={() => handleScrollToSection('quick-actions')}
      />

      {/* Quick Actions Bar */}
      <div id="quick-actions">
        <QuickActionsGrid onAction={handleQuickAction} />
      </div>

      {/* Universal Case Search & Advanced Filter System */}
      <CaseSearchEngine onSelectCase={handleSelectCase} />

      {/* My Cases Dashboard & Timeline */}
      <CaseDashboard 
        onSelectCase={handleSelectCase} 
        onNewFiling={() => setNewFilingOpen(true)} 
      />

      {/* Section 02: Justice & Constitutional Values [ 002 / 007 ] */}
      <Section02Mission
        onOpenAbout={() => handleOpenSectionModal('about')}
        onOpenCollegium={() => handleOpenSectionModal('about')}
      />

      {/* Section 03: Digital Justice & Integrity Symbols [ 003 / 007 ] */}
      <InViewLoad rootMargin="400px">
        <Section03DigitalJustice
          onOpenActs={() => handleOpenSectionModal('acts')}
        />
      </InViewLoad>

      {/* Section 04: Interactive Judicial Network Tree [ 004 / 007 ] */}
      <Section04JudicialSystem
        onOpenService={(serviceKey, court) => handleOpenSectionModal(serviceKey as ModalTab, court)}
      />

      {/* Section 05: Court Services & Electronic Desk [ 005 / 007 ] */}
      <Section05CourtServices
        onOpenService={(serviceKey) => {
          if (serviceKey === 'docs') setDocumentCenterOpen(true);
          else handleOpenSectionModal(serviceKey as ModalTab);
        }}
        onOpenAppeals={() => setNewFilingOpen(true)}
        onOpenDocs={() => setDocumentCenterOpen(true)}
      />

      {/* Legislative Library: Animated 3D Book Collection */}
      <InViewLoad rootMargin="400px">
        <LegislativeLibrary />
      </InViewLoad>

      {/* Section 06: Judicial Information & Bank of Acts [ 006 / 007 ] */}
      <Section06JudicialInformation
        onOpenActs={() => handleOpenSectionModal('acts')}
        onOpenNews={() => handleOpenSectionModal('news')}
      />

      {/* Section 07: Contacts & Regional Map [ 007 / 007 ] */}
      <Section07Contacts
        onOpenContacts={() => handleOpenSectionModal('contacts')}
      />

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
