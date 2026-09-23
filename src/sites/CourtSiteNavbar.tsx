import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Building2, Calendar, ChevronRight, Clock, Compass, ExternalLink, Eye, Gavel, Globe2, Landmark, Lock, Mail, Moon, Newspaper, Phone, Scale, Search, Send, Settings, Sparkles, Sun, Users } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useA11y } from "../context/A11yContext";
import { CourtSiteConfig } from "./types";
import { pickTri } from "./types";
import { Language } from "../i18n";

interface CourtSiteNavbarProps {
  config: CourtSiteConfig;
  hasLeadership: boolean;
  onOpenSearch: () => void;
  onOpenAiAssistant: () => void;
  onOpenEsud: () => void;
  onOpenAppeals: () => void;
}

export const CourtSiteNavbar: React.FC<CourtSiteNavbarProps> = ({
  config,
  hasLeadership,
  onOpenSearch,
  onOpenAiAssistant,
  onOpenEsud,
  onOpenAppeals,
}) => {
  const { language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { isHighContrast, toggleContrast } = useA11y();
  const [menuPopoverOpen, setMenuPopoverOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuPopoverOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sectionItems = [
    ...(hasLeadership
      ? [{
          id: 'court-leadership',
          icon: Users,
          titleTj: 'Роҳбарияти суд', titleRu: 'Руководство суда', titleEn: 'Court leadership',
          descTj: 'Раис, муовинон ва судяҳо', descRu: 'Председатель и судьи', descEn: 'Chair and judges',
        }]
      : []),
    ...(config.receptionSchedule.length > 0
      ? [{
          id: 'court-reception',
          icon: Clock,
          titleTj: 'Ҷадвали қабул', titleRu: 'График приёма', titleEn: 'Reception schedule',
          descTj: 'Рӯзҳо ва вақти қабул', descRu: 'Дни и время приёма', descEn: 'Reception days and hours',
        }]
      : []),
    {
      id: 'court-hearings',
      icon: Calendar,
      titleTj: 'Рӯйхати парвандаҳо', titleRu: 'Списки дел', titleEn: 'Hearing lists',
      descTj: 'Маҷлисҳои таъиншуда', descRu: 'Назначенные заседания', descEn: 'Scheduled hearings',
    },
    {
      id: 'court-press',
      icon: Newspaper,
      titleTj: 'Маркази матбуот', titleRu: 'Пресс-центр', titleEn: 'Press center',
      descTj: 'Хабарҳо ва эълонҳо', descRu: 'Новости и объявления', descEn: 'News and notices',
    },
    {
      id: 'court-legislation',
      icon: Scale,
      titleTj: 'Қонунгузорӣ', titleRu: 'Законодательство', titleEn: 'Legislation',
      descTj: 'Кодексҳо ва қонунҳо', descRu: 'Кодексы и законы', descEn: 'Codes and laws',
    },
    {
      id: 'court-contacts',
      icon: Phone,
      titleTj: 'Тамос', titleRu: 'Контакты', titleEn: 'Contacts',
      descTj: 'Суроға ва телефонҳо', descRu: 'Адрес и телефоны', descEn: 'Address and phones',
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none">
      <div className="site-container px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 flex items-center justify-between gap-2">

        {/* Left: back + emblem + title + controls */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-theme-surface/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-theme-border shadow-lg min-w-0">
          <Link
            to="/"
            aria-label="SUD.TJ"
            title="SUD.TJ"
            className="p-1.5 rounded-xl text-theme-textMuted hover:text-theme-gold hover:bg-theme-bg/60 transition-colors shrink-0"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 px-1 py-0.5 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 border border-theme-gold/40 bg-theme-bg/80 shadow-md shadow-theme-gold/15 shrink-0 flex items-center justify-center">
              <img
                src={'/emblems/emblem-' + language + '.png'}
                alt={pickTri(config.name, language)}
                className="w-full h-full object-contain rounded-full drop-shadow-sm"
                loading="lazy"
              />
            </div>
            <div className="w-[132px] sm:w-[200px] md:w-[220px] flex flex-col justify-center overflow-hidden">
              <div className="font-serif text-xs sm:text-sm font-bold text-theme-text leading-tight truncate">
                {pickTri(config.shortName, language)}
              </div>
              <div className="font-mono text-[9px] text-theme-textMuted leading-none mt-0.5 truncate">
                {language === 'en' ? 'COURTS OF THE REPUBLIC OF TAJIKISTAN' : language === 'tj' ? 'СУДҲОИ ҶУМҲУРИИ ТОҶИКИСТОН' : 'СУДЫ РЕСПУБЛИКИ ТАДЖИКИСТАН'}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-theme-border mx-0.5 hidden sm:block" />

          {/* Language selector */}
          <div className="relative hidden sm:flex items-center rounded-xl border border-theme-border bg-theme-bg/60 p-0.5 shadow-inner">
            <span className="pl-1.5 pr-1 text-theme-textMuted select-none pointer-events-none">
              <Globe2 size={11} />
            </span>
            {(['ru', 'tj', 'en'] as Language[]).map((l) => {
              const isActive = language === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={'relative px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-colors z-10 ' + (isActive ? 'text-black font-bold' : 'text-theme-textMuted hover:text-theme-text')}
                >
                  {isActive && (
                    <motion.div
                      layoutId="courtActiveLanguagePill"
                      className="absolute inset-0 bg-theme-gold rounded-lg shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span>{l.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-theme-border hover:border-theme-borderHover hover:text-theme-text transition-colors bg-theme-bg/60 text-theme-textSec hidden sm:flex items-center justify-center shadow-xs"
            aria-label="theme"
          >
            {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-indigo-600" />}
          </button>

          {/* Accessibility */}
          <button
            type="button"
            onClick={toggleContrast}
            className={'p-1.5 rounded-xl border transition-colors hidden sm:flex items-center shadow-xs ' + (isHighContrast ? 'border-yellow-400 text-yellow-400 bg-black/60' : 'border-theme-border hover:border-theme-borderHover hover:text-theme-text bg-theme-bg/60 text-theme-textSec')}
            aria-label="accessibility"
          >
            <Eye size={13} />
          </button>
        </div>

        {/* Right: actions */}
        <div className="pointer-events-auto flex items-center gap-2 relative">
          <button
            type="button"
            onClick={onOpenSearch}
            title={language === 'tj' ? 'Ҷустуҷӯ' : language === 'en' ? 'Search' : 'Поиск'}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-theme-surface/90 backdrop-blur-xl border border-theme-border text-theme-text hover:border-theme-gold hover:text-theme-gold transition-colors flex items-center gap-1.5 text-xs font-mono shadow-md"
          >
            <Search size={14} />
            <span className="hidden md:inline">{language === 'tj' ? 'Ҷустуҷӯ' : language === 'en' ? 'Search' : 'Поиск'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAiAssistant}
            title={language === 'tj' ? 'Ёвари ҳуқуқӣ' : language === 'en' ? 'AI Legal Assistant' : 'Юридический AI-помощник'}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-theme-gold/15 backdrop-blur-xl border border-theme-gold/40 text-theme-gold hover:bg-theme-gold/25 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold shadow-md"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">{language === 'tj' ? 'Ёвар' : language === 'en' ? 'AI Assistant' : 'AI-Помощник'}</span>
          </button>

          <div className="relative group hidden sm:block">
            <a
              href={'/courts/' + config.id + '/admin'}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-theme-surface/90 backdrop-blur-xl border border-theme-border text-theme-text hover:border-theme-gold hover:text-theme-gold transition-colors flex items-center gap-1.5 text-xs font-mono shadow-md"
            >
              <Settings size={14} />
              <span className="hidden lg:inline">{language === 'tj' ? 'Админ' : language === 'en' ? 'Admin' : 'Админ'}</span>
            </a>
            <div className="absolute top-full right-0 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50">
              <div className="bg-gray-900 border border-gray-700 text-white text-[10px] font-mono py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                {language === 'tj' ? 'Админкаи суд' : language === 'en' ? 'Court admin' : 'Админка суда'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEsud}
            className="btn-primary text-xs h-9 px-3 sm:px-4 hidden sm:inline-flex"
          >
            <Lock size={12} />
            <span>{language === 'tj' ? 'Воридшавӣ' : language === 'en' ? 'Sign In' : 'Войти'}</span>
          </button>

          {/* Navigation mega-menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuPopoverOpen(!menuPopoverOpen)}
              className={'p-2.5 rounded-2xl bg-theme-surface/90 backdrop-blur-xl border transition-colors flex items-center gap-1.5 text-xs font-mono shadow-md ' + (menuPopoverOpen ? 'border-theme-gold text-theme-gold' : 'border-theme-border text-theme-text hover:border-theme-gold')}
            >
              <Compass size={16} />
              <span className="hidden md:inline">{language === 'tj' ? 'Мундариҷа' : language === 'en' ? 'Explore' : 'Навигация'}</span>
            </button>

            {menuPopoverOpen && (
              <div className="absolute right-0 top-12 w-[92vw] sm:w-[640px] content-card z-50">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  <div className="sm:col-span-7 sm:border-r sm:border-theme-border/60 sm:pr-4">
                    <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-theme-border/60 text-[11px] font-mono text-theme-gold font-bold uppercase tracking-wider">
                      <Landmark size={14} />
                      <span>{pickTri(config.shortName, language)}</span>
                    </div>
                    <ul className="flex flex-col gap-1 list-none p-0 m-0">
                      {sectionItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => scrollTo(item.id)}
                              className="w-full text-left p-1.5 px-2 rounded-xl hover:bg-theme-bg/80 border border-transparent hover:border-theme-gold/30 transition-all group flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-1 flex items-center gap-2">
                                <Icon size={13} className="text-theme-gold shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs font-serif font-bold text-theme-text group-hover:text-theme-gold transition-colors truncate">
                                    {language === 'en' ? item.titleEn : language === 'tj' ? item.titleTj : item.titleRu}
                                  </div>
                                  <div className="text-[10px] font-mono text-theme-textMuted leading-tight truncate">
                                    {language === 'en' ? item.descEn : language === 'tj' ? item.descTj : item.descRu}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight size={12} className="text-theme-textMuted group-hover:text-theme-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="sm:col-span-5">
                    <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-theme-border/60 text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      <Gavel size={14} />
                      <span>SUD.TJ</span>
                    </div>
                    <ul className="flex flex-col gap-1 list-none p-0 m-0">
                      <li>
                        <Link
                          to="/"
                          onClick={() => setMenuPopoverOpen(false)}
                          className="w-full text-left p-1.5 px-2 rounded-xl hover:bg-theme-bg/80 border border-transparent hover:border-emerald-500/30 transition-all group flex items-center gap-2"
                        >
                          <Building2 size={13} className="text-theme-textSec group-hover:text-emerald-400 shrink-0" />
                          <span className="text-xs font-medium text-theme-text">
                            {language === 'en' ? 'Main portal' : language === 'tj' ? 'Портали асосӣ' : 'Главный портал'}
                          </span>
                        </Link>
                      </li>
                      <li>
                        <a
                          href={config.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setMenuPopoverOpen(false)}
                          className="w-full text-left p-1.5 px-2 rounded-xl hover:bg-theme-bg/80 border border-transparent hover:border-emerald-500/30 transition-all group flex items-center gap-2"
                        >
                          <ExternalLink size={13} className="text-theme-textSec group-hover:text-emerald-400 shrink-0" />
                          <span className="text-xs font-medium text-theme-text">
                            {language === 'en' ? 'Old website' : language === 'tj' ? 'Сомонаи кӯҳна' : 'Старый сайт'}
                          </span>
                        </a>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMenuPopoverOpen(false); onOpenAppeals(); }}
                          className="w-full text-left p-1.5 px-2 rounded-xl hover:bg-theme-bg/80 border border-transparent hover:border-emerald-500/30 transition-all group flex items-center gap-2"
                        >
                          <Send size={13} className="text-theme-textSec group-hover:text-emerald-400 shrink-0" />
                          <span className="text-xs font-medium text-theme-text">
                            {language === 'en' ? 'Online reception' : language === 'tj' ? 'Интернет-қабулгоҳ' : 'Интернет-приёмная'}
                          </span>
                        </button>
                      </li>
                      <li>
                        <a
                          href={'mailto:' + config.contacts.email}
                          className="w-full text-left p-1.5 px-2 rounded-xl hover:bg-theme-bg/80 border border-transparent hover:border-emerald-500/30 transition-all group flex items-center gap-2"
                        >
                          <Mail size={13} className="text-theme-textSec group-hover:text-emerald-400 shrink-0" />
                          <span className="text-xs font-medium text-theme-text truncate">{config.contacts.email}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CourtSiteNavbar;

