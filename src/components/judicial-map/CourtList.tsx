import React from 'react';
import type { CourtNodeData } from '../../data/sudTjData';
import { CourtListItem } from './CourtListItem';

interface CourtListProps {
  courts: CourtNodeData[];
  accent: string;
  selectedCourtId?: string;
  dimmedIds: Set<string>;
  onSelect: (court: CourtNodeData) => void;
}

export const CourtList: React.FC<CourtListProps> = ({
  courts,
  accent,
  selectedCourtId,
  dimmedIds,
  onSelect,
}) => {
  if (courts.length === 0) return null;
  return (
    <div className="w-full flex flex-col gap-0.5" role="list">
      {courts.map((court) => (
        <div key={court.id} role="listitem">
          <CourtListItem
            court={court}
            accent={accent}
            selected={selectedCourtId === court.id}
            dimmed={dimmedIds.has(court.id)}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
};
