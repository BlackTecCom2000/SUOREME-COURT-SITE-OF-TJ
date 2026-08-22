import React, { useState } from 'react';
import { Scale, Gavel, Landmark } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

type ObjectId = 'themis' | 'hammer' | 'scales';
const copy: Record<ObjectId, { title: string; detail: string }> = {
  themis: { title: 'IMPARTIALITY', detail: 'The classical symbol of independent judgment, reconstructed as a digital monument.' },
  hammer: { title: 'DECISION', detail: 'A judicial decision is recorded with authority, restraint and responsibility.' },
  scales: { title: 'BALANCE', detail: 'Law and justice are held in deliberate, transparent balance.' },
};

export const JusticeObjectController: React.FC<{ active: ObjectId; onChange: (id: ObjectId) => void }> = ({ active, onChange }) => (
  <div className="justice-controller" role="tablist" aria-label="Justice objects">
    {(['themis', 'hammer', 'scales'] as ObjectId[]).map((id, index) => (
      <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => onChange(id)} className={active === id ? 'is-active' : ''}>
        {String(index + 1).padStart(2, '0')} {id}
      </button>
    ))}
  </div>
);

export const JusticeObjectInfoPanel: React.FC<{ active: ObjectId; decision: boolean; balance: string | null }> = ({ active, decision, balance }) => (
  <div className="justice-info" aria-live="polite">
    <span className="justice-info__eyebrow">DIGITAL JUDICIAL MONUMENT</span>
    <strong>{decision ? 'DECISION RECORDED' : balance ? balance.toUpperCase() : copy[active].title}</strong>
    <p>{copy[active].detail}</p>
  </div>
);

export const InteractiveThemis: React.FC<{ active: boolean; onSelect: () => void }> = ({ active, onSelect }) => (
  <button type="button" className={`justice-hotspot justice-hotspot--themis ${active ? 'is-active' : ''}`} onClick={onSelect} aria-label="Themis: impartiality">
    <Landmark size={15} /><span>IMPARTIALITY</span>
  </button>
);
export const InteractiveJudicialHammer: React.FC<{ active: boolean; onDecision: () => void }> = ({ active, onDecision }) => (
  <button type="button" className={`justice-hotspot justice-hotspot--hammer ${active ? 'is-active' : ''}`} onClick={onDecision} aria-label="Judicial hammer: record decision">
    <Gavel size={15} /><span>DECISION</span>
  </button>
);
export const InteractiveJusticeScales: React.FC<{ active: boolean; onBalance: (side: string) => void }> = ({ active, onBalance }) => (
  <div className={`justice-scales-control ${active ? 'is-active' : ''}`} aria-label="Justice scales">
    <button type="button" onClick={() => onBalance('LAW')} aria-label="Law"><Scale size={14} /> LAW</button>
    <button type="button" onClick={() => onBalance('BALANCE')} aria-label="Reset balance">BALANCE</button>
    <button type="button" onClick={() => onBalance('JUSTICE')} aria-label="Justice">JUSTICE <Scale size={14} /></button>
  </div>
);

export const InteractiveJusticeInstallation: React.FC<{ onDecision?: () => void }> = ({ onDecision }) => {
  const { t } = useLanguage();
  const [active, setActive] = useState<ObjectId>('themis');
  const [decision, setDecision] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const fireDecision = () => { setActive('hammer'); setDecision(true); onDecision?.(); window.setTimeout(() => setDecision(false), 2200); };
  const chooseBalance = (side: string) => { setActive('scales'); setBalance(side === 'BALANCE' ? null : side); window.setTimeout(() => setBalance(null), 2200); };
  return <div className={`interactive-installation active-${active} ${decision ? 'has-decision' : ''}`}>
    <img src="/judicial-monument.png" alt="" className="interactive-installation__asset" />
    <div className="interactive-installation__atmosphere" aria-hidden="true" />
    <div className="interactive-installation__metadata" aria-hidden="true"><span>ARCHIVE / ACT 001</span><span>LAW → JUSTICE → DECISION</span></div>
    <InteractiveThemis active={active === 'themis'} onSelect={() => setActive('themis')} />
    <InteractiveJudicialHammer active={active === 'hammer'} onDecision={fireDecision} />
    <InteractiveJusticeScales active={active === 'scales'} onBalance={chooseBalance} />
    <JusticeObjectController active={active} onChange={setActive} />
    <JusticeObjectInfoPanel active={active} decision={decision} balance={balance} />
    <span className="interactive-installation__hint">{t('digitalJustice.hammerSubtext')}</span>
  </div>;
};
