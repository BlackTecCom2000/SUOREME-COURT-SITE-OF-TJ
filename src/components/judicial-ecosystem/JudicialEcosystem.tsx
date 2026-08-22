import React from 'react';
import { Section04JudicialSystem } from '../sections/Section04JudicialSystem';
import { Language, CourtNodeData } from '../../data/sudTjData';

interface JudicialEcosystemProps {
  lang?: Language;
  onOpenService?: (serviceTab: string, courtContext?: CourtNodeData) => void;
}

export const JudicialEcosystem: React.FC<JudicialEcosystemProps> = ({
  onOpenService,
}) => {
  return <Section04JudicialSystem onOpenService={onOpenService} />;
};
