import React, { useState } from 'react';
import { ArrowUpRight, Eye, Moon, Sun, Globe2, Menu, X } from 'lucide-react';
import { Reveal } from './Reveal';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../i18n';

interface NavItem {
  key: string;
  nameKey: string;
  href: string;
  actionId?: string;
}

interface NavbarProps {
  isHighContrast: boolean;
  onToggleContrast: () => void;
  onOpenSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isHighContrast,
  onToggleContrast,
  onOpenSection,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: NavItem[] = [
    { key: 'home', nameKey: 'nav.home', href: '#hero' },
    { key: 'mission', nameKey: 'nav.mission', href: '#mission' },
    { key: 'digitalJustice', nameKey: 'nav.digitalJustice', href: '#digital-justice' },
    { key: 'courts', nameKey: 'nav.courts', href: '#courts' },
    { key: 'eservices', nameKey: 'nav.eservices', href: '#services' },
    { key: 'acts', nameKey: 'nav.acts', href: '#information' },
    { key: 'contacts', nameKey: 'nav.contacts', href: '#contacts' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    setMobileMenuOpen(false);
    if (item.href.startsWith('#')) {
      const targetEl = document.querySelector(item.href);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    if (item.actionId && onOpenSection) {
      e.preventDefault();
      onOpenSection(item.actionId);
    }
  };

  const handleSelectLang = (l: Language) => {
    setLanguage(l);
  };

  return (
    <nav aria-label="Основная навигация">
      {/* Top Left Wordmark & Subtitle + Language, Theme, Accessibility Switcher */}
      <div className="fixed left-4 top-4 z-50 sm:left-8 sm:top-6 md:left-12 pointer-events-auto select-none">
        <Reveal delay={0}>
          <a
            href="#hero"
            className="font-mono text-base font-medium tracking-tight text-theme-text drop-shadow-md sm:text-xl md:text-2xl transition-opacity hover:opacity-90 inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-gold"
          >
            {t('nav.title')}
          </a>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-1 sm:mt-2 font-mono text-[9px] text-theme-textMuted sm:text-xs tracking-wider">
            {t('nav.subtitle')}
          </div>
        </Reveal>

        {/* Global Controls: Language, Theme Toggle, Accessibility */}
        <Reveal delay={250}>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-theme-textSec">
            
            {/* Multilingual Selector: RU · TJ · EN */}
            <div className="relative">
              <div className="flex items-center rounded-lg border border-theme-border bg-theme-surface backdrop-blur-md p-0.5 shadow-sm">
                <span className="pl-1.5 pr-1 text-theme-textMuted">
                  <Globe2 size={11} />
                </span>
                {(['ru', 'tj', 'en'] as Language[]).map((l) => {
                  const isActive = language === l;
                  const label = l === 'ru' ? 'RU' : l === 'tj' ? 'TJ' : 'EN';
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleSelectLang(l)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                        isActive
                          ? 'bg-theme-gold text-black font-bold shadow-xs'
                          : 'text-theme-textMuted hover:text-theme-text'
                      }`}
                      title={l === 'ru' ? 'Русский' : l === 'tj' ? 'Тоҷикӣ' : 'English'}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle (Sun / Moon) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-theme-border hover:border-theme-borderHover hover:text-theme-text transition-colors bg-theme-surface backdrop-blur-md flex items-center justify-center text-theme-textSec shadow-sm"
              title={isDark ? t('nav.themeLight') : t('nav.themeDark')}
              aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
            >
              {isDark ? (
                <Sun size={12} className="text-amber-400" />
              ) : (
                <Moon size={12} className="text-indigo-600" />
              )}
            </button>

            {/* High Contrast / Accessibility Switcher */}
            <button
              type="button"
              onClick={onToggleContrast}
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 backdrop-blur-md shadow-sm ${
                isHighContrast
                  ? 'border-yellow-400 text-yellow-400 bg-black/60'
                  : 'border-theme-border hover:border-theme-borderHover hover:text-theme-text bg-theme-surface text-theme-textSec'
              }`}
              title={t('nav.accessibility')}
              aria-label={t('nav.accessibility')}
            >
              <Eye size={12} />
              <span className="text-[9px] hidden sm:inline">{t('nav.accessibility')}</span>
            </button>
          </div>
        </Reveal>
      </div>

      {/* Mobile Hamburger Button (< md) */}
      <div className="fixed right-4 top-4 z-50 md:hidden pointer-events-auto">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t('nav.close') : 'Menu'}
          className="p-2 rounded-xl bg-theme-surface backdrop-blur-md border border-theme-border text-theme-text hover:bg-theme-surfaceHover transition-colors shadow-md"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Slide-down Overlay Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-theme-bg/95 backdrop-blur-xl p-6 pt-24 flex flex-col justify-between md:hidden pointer-events-auto animate-in fade-in duration-200">
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0 overflow-y-auto">
            {navLinks.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="flex items-center justify-between font-mono text-sm text-theme-textSec hover:text-theme-text py-1.5 border-b border-theme-border transition-colors"
                >
                  <span className="capitalize">{t(item.nameKey)}</span>
                  <ArrowUpRight size={14} className="text-theme-gold" />
                </a>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-theme-border flex items-center justify-between text-[11px] font-mono text-theme-textMuted">
            <span>SUD.TJ</span>
            <span>© 2026</span>
          </div>
        </div>
      )}

      {/* Desktop Vertical Corner Navigation (>= md) */}
      <div className="hidden md:block fixed right-6 top-6 lg:right-12 lg:top-7 z-50 pointer-events-auto">
        <ul className="flex flex-col items-end gap-1 list-none p-0 m-0 bg-theme-surface backdrop-blur-md p-2.5 rounded-2xl border border-theme-border shadow-xl">
          {navLinks.map((item, i) => (
            <li key={item.key}>
              <Reveal delay={50 + i * 35}>
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="group flex items-center gap-1 font-mono text-[11px] text-theme-textSec drop-shadow-sm transition-colors duration-200 hover:text-theme-text sm:text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-gold rounded px-1.5 py-0.5"
                >
                  <span className="capitalize">{t(item.nameKey)}</span>
                  <ArrowUpRight
                    size={11}
                    className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-theme-textMuted group-hover:text-theme-gold"
                    aria-hidden="true"
                  />
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
