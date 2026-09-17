import React, { useState } from 'react';
import { LayoutGrid, Maximize2, RotateCcw, ArrowUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SearchControl } from './SearchControl';
import { LanguageSwitcher } from './LanguageSwitcher';

interface JudiciaryHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onOpenImmersive: () => void;
}

export const JudiciaryHeader: React.FC<JudiciaryHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onResetFilters,
  onOpenImmersive,
}) => {
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const title =
    language === 'tj' ? 'ҲОКИМИЯТИ СУДӢ' : language === 'en' ? 'JUDICIAL POWER' : 'СУДЕБНАЯ ВЛАСТЬ';
  const subtitle =
    language === 'tj'
      ? 'ҶУМҲУРИИ ТОҶИКИСТОН'
      : language === 'en'
      ? 'OF THE REPUBLIC OF TAJIKISTAN'
      : 'РЕСПУБЛИКИ ТАДЖИКИСТАН';
  const motto =
    language === 'tj'
      ? 'ҚОНУН • АДОЛАТ • БОВАРӢ'
      : language === 'en'
      ? 'LAW • JUSTICE • TRUST'
      : 'ЗАКОН • СПРАВЕДЛИВОСТЬ • ДОВЕРИЕ';

  const menuLabel = language === 'tj' ? 'Меню' : language === 'en' ? 'Menu' : 'Меню';
  const resetLabel = language === 'tj' ? 'Тоза кардани филтрҳо' : language === 'en' ? 'Reset filters' : 'Сбросить фильтры';
  const fullscreenLabel = language === 'tj' ? 'Намоиши васеъ' : language === 'en' ? 'Fullscreen view' : 'Полный экран';
  const topLabel = language === 'tj' ? 'Ба боло' : language === 'en' ? 'Back to top' : 'Наверх';

  const menuAction = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <img
          src={`/emblems/emblem-${language}.png`}
          alt=""
          aria-hidden="true"
          className="w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_14px_rgba(232,199,106,0.45)]"
          loading="lazy"
        />
        <div className="text-center">
          <h2 className="font-bold text-xl sm:text-2xl tracking-[0.08em] uppercase text-white leading-tight">
            {title}
          </h2>
          <div className="font-semibold text-xs sm:text-sm tracking-[0.08em] uppercase text-[var(--jm-gold)] leading-tight">
            {subtitle}
          </div>
          <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.22em] text-[var(--jm-muted)] mt-1.5">
            {motto}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex justify-start">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <SearchControl value={searchQuery} onChange={onSearchChange} />
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuLabel}
              className="h-10 w-10 rounded-[10px] border border-[var(--jm-border)] bg-[var(--jm-surface)] text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:border-[var(--jm-gold)] transition-colors flex items-center justify-center"
            >
              <LayoutGrid size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[var(--jm-border)] bg-[var(--jm-surface)] shadow-[0_10px_40px_rgba(0,0,0,0.20)] overflow-hidden z-50">
                  <button
                    type="button"
                    onClick={menuAction(onResetFilters)}
                    className="w-full text-left px-4 py-2.5 font-mono text-xs text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:bg-white/5 transition-colors flex items-center gap-2 border-b border-[var(--jm-border)]"
                  >
                    <RotateCcw size={13} />
                    <span>{resetLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={menuAction(onOpenImmersive)}
                    className="w-full text-left px-4 py-2.5 font-mono text-xs text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:bg-white/5 transition-colors flex items-center gap-2 border-b border-[var(--jm-border)]"
                  >
                    <Maximize2 size={13} />
                    <span>{fullscreenLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={menuAction(() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
                    className="w-full text-left px-4 py-2.5 font-mono text-xs text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <ArrowUp size={13} />
                    <span>{topLabel}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
