import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const JudiciaryFooter: React.FC = () => {
  const { language } = useLanguage();
  const principles =
    language === 'tj'
      ? ['ҚОНУН', 'АДОЛАТ', 'РУШД']
      : language === 'en'
      ? ['LAW', 'JUSTICE', 'DEVELOPMENT']
      : ['ЗАКОН', 'СПРАВЕДЛИВОСТЬ', 'РАЗВИТИЕ'];
  const tagline =
    language === 'tj'
      ? 'АДОЛАТИ РАҚАМӢ БАРОИ МАРДУМ'
      : language === 'en'
      ? 'DIGITAL JUSTICE FOR PEOPLE'
      : 'ЦИФРОВОЕ ПРАВОСУДИЕ ДЛЯ ЛЮДЕЙ';
  const courtName =
    language === 'tj'
      ? 'Ҳокимияти судии Ҷумҳурии Тоҷикистон'
      : language === 'en'
      ? 'Judiciary of the Republic of Tajikistan'
      : 'Судебная власть Республики Таджикистан';
  return (
    <footer className="w-full flex flex-col items-center gap-2 pt-6 pb-2 opacity-70 select-none">
      <div className="flex items-center gap-2.5">
        <img
          src={`/emblems/emblem-${language}.png`}
          alt=""
          aria-hidden="true"
          className="w-6 h-6 object-contain opacity-80"
          loading="lazy"
        />
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--jm-text-2)]">
          {courtName}
        </span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-[var(--jm-muted)]">
        {principles.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && <span aria-hidden="true">•</span>}
            <span>{p}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--jm-muted)]">{tagline}</div>
    </footer>
  );
};
