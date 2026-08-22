import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ScrollVideo } from '../components/ScrollVideo';
import { Section01Hero } from '../components/sections/Section01Hero';
import { Section02Mission } from '../components/sections/Section02Mission';
import { Section03DigitalJustice } from '../components/sections/Section03DigitalJustice';
import { Section04JudicialSystem } from '../components/sections/Section04JudicialSystem';
import { Section05CourtServices } from '../components/sections/Section05CourtServices';
import { Section06JudicialInformation } from '../components/sections/Section06JudicialInformation';
import { Section07Contacts } from '../components/sections/Section07Contacts';
import { ModalTab } from '../components/JudicialModal';
import { CourtNodeData } from '../data/sudTjData';

export const HomePage: React.FC = () => {
  const { handleOpenSectionModal } = useOutletContext<{ 
    handleOpenSectionModal: (tab: ModalTab, court?: CourtNodeData) => void 
  }>();

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <ScrollVideo />

      {/* Section 01: Hero [ 001 / 007 ] */}
      <Section01Hero
        onOpenESud={() => handleOpenSectionModal('esud')}
        onScrollNext={() => handleScrollToSection('mission')}
      />

      {/* Section 02: Justice & Values [ 002 / 007 ] */}
      <Section02Mission
        onOpenAbout={() => handleOpenSectionModal('about')}
        onOpenCollegium={() => handleOpenSectionModal('about')}
      />

      {/* Section 03: Digital Justice [ 003 / 007 ] */}
      <Section03DigitalJustice
        onOpenActs={() => handleOpenSectionModal('acts')}
      />

      {/* Section 04: Judicial System [ 004 / 007 ] */}
      <Section04JudicialSystem
        onOpenService={(serviceKey, court) => handleOpenSectionModal(serviceKey as ModalTab, court)}
      />

      {/* Section 05: Court Services [ 005 / 007 ] */}
      <Section05CourtServices
        onOpenService={(serviceKey) => handleOpenSectionModal(serviceKey as ModalTab)}
        onOpenAppeals={() => handleOpenSectionModal('appeals')}
        onOpenDocs={() => handleOpenSectionModal('docs')}
      />

      {/* Section 06: Judicial Information [ 006 / 007 ] */}
      <Section06JudicialInformation
        onOpenActs={() => handleOpenSectionModal('acts')}
        onOpenNews={() => handleOpenSectionModal('news')}
      />

      {/* Section 07: Contacts [ 007 / 007 ] */}
      <Section07Contacts
        onOpenContacts={() => handleOpenSectionModal('contacts')}
      />
    </>
  );
};
