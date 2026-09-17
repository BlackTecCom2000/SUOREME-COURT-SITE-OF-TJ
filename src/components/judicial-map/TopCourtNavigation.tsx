import React from 'react';
import { Landmark, TrendingUp, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TopCourtNavigationProps {
  onSelectSupreme: () => void;
  supremeSelected: boolean;
}

const cardBase =
  'relative rounded-[18px] border p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 backdrop-blur-[14px] min-h-[128px]';

export const TopCourtNavigation: React.FC<TopCourtNavigationProps> = ({
  onSelectSupreme,
  supremeSelected,
}) => {
  const { language } = useLanguage();

  const strings = {
    constitutional: {
      title:
        language === 'tj' ? 'СУДИ КОНСТИТУТСИОНӢ' : language === 'en' ? 'CONSTITUTIONAL COURT' : 'КОНСТИТУЦИОННЫЙ СУД',
      sub:
        language === 'tj'
          ? 'Кафолати Қонуни Асосӣ'
          : language === 'en'
          ? 'Guardian of the Constitution'
          : 'Гарантия Основного Закона',
    },
    supreme: {
      title: language === 'tj' ? 'СУДИ ОЛӢ' : language === 'en' ? 'SUPREME COURT' : 'ВЕРХОВНЫЙ СУД',
      sub:
        language === 'tj'
          ? 'Ҷумҳурии Тоҷикистон'
          : language === 'en'
          ? 'Republic of Tajikistan'
          : 'Республики Таджикистан',
    },
    economic: {
      title:
        language === 'tj'
          ? 'СУДИ ОЛИИ ИҚТИСОДӢ'
          : language === 'en'
          ? 'SUPREME ECONOMIC COURT'
          : 'ВЫСШИЙ ЭКОНОМИЧЕСКИЙ СУД',
      sub:
        language === 'tj'
          ? 'Адололати иқтисодӣ'
          : language === 'en'
          ? 'Economic justice'
          : 'Экономическая справедливость',
    },
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 items-stretch" role="navigation" aria-label="Top courts">
      {/* LEFT: Constitutional Court */}
      <a
        href="https://constcourt.tj"
        target="_blank"
        rel="noreferrer"
        className={`${cardBase} border-[var(--jm-border)] bg-[rgba(8,18,32,0.72)] hover:border-[var(--jm-cyan)] hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(22,191,255,0.12)] group`}
      >
        <span className="p-2 rounded-full border border-[var(--jm-cyan)]/40 bg-[var(--jm-cyan)]/10 text-[var(--jm-cyan)]">
          <Landmark size={17} strokeWidth={1.75} />
        </span>
        <span className="font-bold text-[13px] sm:text-sm tracking-[0.06em] uppercase text-[var(--jm-text)] leading-snug">
          {strings.constitutional.title}
        </span>
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--jm-muted)] group-hover:text-[var(--jm-cyan)] transition-colors leading-snug">
          {strings.constitutional.sub}
        </span>
        <ExternalLink size={11} className="absolute top-2.5 right-2.5 text-[var(--jm-muted)] group-hover:text-[var(--jm-cyan)] transition-colors" />
      </a>

      {/* CENTER: Supreme Court (highlighted) */}
      <button
        type="button"
        onClick={onSelectSupreme}
        aria-pressed={supremeSelected}
        className={`${cardBase} border-[var(--jm-gold)] bg-[rgba(232,199,106,0.07)] hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(232,199,106,0.16)] ${
          supremeSelected ? 'ring-1 ring-[var(--jm-gold)] shadow-[0_0_25px_rgba(232,199,106,0.16)]' : ''
        }`}
      >
        <img
          src={`/emblems/emblem-${language}.png`}
          alt=""
          aria-hidden="true"
          className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(232,199,106,0.5)]"
          loading="lazy"
        />
        <span className="font-bold text-[15px] sm:text-base tracking-[0.08em] uppercase text-white leading-snug">
          {strings.supreme.title}
        </span>
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--jm-gold)] leading-snug">
          {strings.supreme.sub}
        </span>
      </button>

      {/* RIGHT: Supreme Economic Court */}
      <a
        href="https://sud.tj"
        target="_blank"
        rel="noreferrer"
        className={`${cardBase} border-[var(--jm-border)] bg-[rgba(8,18,32,0.72)] hover:border-[#38BDF8] hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(56,189,248,0.12)] group`}
      >
        <span className="p-2 rounded-full border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]">
          <TrendingUp size={17} strokeWidth={1.75} />
        </span>
        <span className="font-bold text-[13px] sm:text-sm tracking-[0.06em] uppercase text-[var(--jm-text)] leading-snug">
          {strings.economic.title}
        </span>
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--jm-muted)] group-hover:text-[#38BDF8] transition-colors leading-snug">
          {strings.economic.sub}
        </span>
        <ExternalLink size={11} className="absolute top-2.5 right-2.5 text-[var(--jm-muted)] group-hover:text-[#38BDF8] transition-colors" />
      </a>
    </div>
  );
};
