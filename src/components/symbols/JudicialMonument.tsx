import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

/** A single, physically coherent installation — the three symbols are no longer UI icons. */
export const JudicialMonument: React.FC = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [impact, setImpact] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setEntered(true);
    }, { threshold: 0.28 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const triggerImpact = () => {
    if (impact) return;
    setImpact(true);
    window.setTimeout(() => setImpact(false), 1450);
  };

  return (
    <div ref={ref} className={`judicial-monument ${entered ? 'is-revealed' : ''} ${impact ? 'has-impact' : ''}`}>
      <div className="judicial-monument__archive" aria-hidden="true">
        <span>ARCHIVE / CONSTITUTION / ARTICLE 5</span><span>TJ · JUSTICE · 001</span>
      </div>
      <div className="judicial-monument__scan" aria-hidden="true" />
      <img src="/judicial-monument.png" alt="" className="judicial-monument__image" />
      <div className="judicial-monument__labels" aria-hidden="true">
        <span className="judicial-monument__label judicial-monument__label--gavel">{t('digitalJustice.hammerDecision')}</span>
        <span className="judicial-monument__label judicial-monument__label--themis">LAW → JUSTICE</span>
        <span className="judicial-monument__label judicial-monument__label--scales">{t('themisScales.scalesMotto')}</span>
      </div>
      <button type="button" onClick={triggerImpact} className="judicial-monument__impact" aria-label={t('digitalJustice.hammerDecision')}>
        <span />
      </button>
    </div>
  );
};
