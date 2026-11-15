import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    if (!menuOpen) return;

    const updatePosition = () => {
      const button = menuButtonRef.current;
      const panel = menuPanelRef.current;
      if (!button || !panel) return;
      const rect = button.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        setMenuOpen(false);
        return;
      }
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
      const top = rect.bottom + height + 8 <= window.innerHeight
        ? rect.bottom + 8
        : Math.max(8, rect.top - height - 8);
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [menuOpen]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuButtonRef.current?.contains(target) || menuPanelRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
    };
  }, [menuOpen]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="liquid-glass-title-pod px-6 py-4 sm:px-8 sm:py-5 flex items-center gap-3 sm:gap-5 shadow-lg">
        <img
          src={`/emblems/emblem-${language}.png`}
          alt=""
          aria-hidden="true"
          className="w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_14px_rgba(232,199,106,0.45)] shrink-0"
          loading="lazy"
        />
        <div className="text-left sm:text-center">
          <h2 className="type-glass font-bold text-xl sm:text-2xl tracking-[0.08em] uppercase text-[var(--jm-text)] leading-tight">
            {title}
          </h2>
          <div className="font-semibold text-xs sm:text-sm tracking-[0.08em] uppercase text-[var(--jm-gold)] leading-tight">
            {subtitle}
          </div>
          <div className="font-mono text-2xs sm:text-[11px] tracking-[0.22em] text-[var(--jm-muted)] mt-1.5">
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
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="judmap-menu-popover"
              aria-label={menuLabel}
              className="tap-target press-tactile h-11 w-11 rounded-[10px] border border-[var(--jm-border)] bg-[var(--jm-surface)] text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:border-[var(--jm-gold)] transition-colors flex items-center justify-center"
            >
              <LayoutGrid size={16} />
            </button>
            {menuOpen && typeof document !== 'undefined' && createPortal(
              <div
                ref={menuPanelRef}
                id="judmap-menu-popover"
                style={{ position: 'fixed', top: 0, left: 0, zIndex: 1001 }}
                className="w-52 max-w-[calc(100vw-16px)] rounded-xl border border-[var(--jm-border)] bg-[var(--jm-surface)] shadow-[0_10px_40px_rgba(0,0,0,0.20)] overflow-hidden"
              >
                  <button
                    type="button"
                    onClick={menuAction(onResetFilters)}
                    className="w-full text-left px-4 py-2.5 font-mono text-xs text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:bg-[var(--jm-gold)]/10 transition-colors flex items-center gap-2 border-b border-[var(--jm-border)]"
                  >
                    <RotateCcw size={13} />
                    <span>{resetLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={menuAction(onOpenImmersive)}
                    className="w-full text-left px-4 py-2.5 font-mono text-xs text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:bg-[var(--jm-gold)]/10 transition-colors flex items-center gap-2 border-b border-[var(--jm-border)]"
                  >
                    <Maximize2 size={13} />
                    <span>{fullscreenLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={menuAction(() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
                    className="w-full text-left px-4 py-2.5 font-mono text-xs text-[var(--jm-text-2)] hover:text-[var(--jm-gold)] hover:bg-[var(--jm-gold)]/10 transition-colors flex items-center gap-2"
                  >
                    <ArrowUp size={13} />
                    <span>{topLabel}</span>
                  </button>
              </div>,
              document.body,
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
