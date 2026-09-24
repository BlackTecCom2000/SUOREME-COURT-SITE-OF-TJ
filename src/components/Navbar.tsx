import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Eye, 
  Moon, 
  Sun, 
  Globe2, 
  Menu, 
  X, 
  Search, 
  Sparkles, 
  Lock, 
  FileText, 
  Compass, 
  ChevronRight, 
  Landmark, 
  Layers, 
  ChevronDown,
  Gavel,
  Calculator,
  HelpCircle,
  Calendar,
  Building,
  BookOpen,
  Settings
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../i18n';
import { motion } from 'motion/react';

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
  onOpenSectionModal?: (tab: string) => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenESud?: () => void;
  onOpenFiling?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isHighContrast,
  onToggleContrast,
  onOpenSection,
  onOpenSectionModal,
  onOpenSearch,
  onOpenAiAssistant,
  onOpenESud,
  onOpenFiling,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuPopoverOpen, setMenuPopoverOpen] = useState(false);
  const [supremeCourtOpen, setSupremeCourtOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Scroll-spy: highlight the anchor section currently in view (home only).
  const [activeSection, setActiveSection] = useState<string | null>(null);
  useEffect(() => {
    if (!isHome) {
      setActiveSection(null);
      return;
    }
    const ids = ['hero', 'quick-actions', 'case-search', 'my-cases', 'digital-justice', 'courts', 'information', 'contacts'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection('#' + (e.target as HTMLElement).id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome, location.pathname]);

  const navLinks: NavItem[] = [
    { key: 'home', nameKey: 'nav.home', href: '#hero' },
    { key: 'caseSearch', nameKey: 'nav.search', href: '#case-search' },
    { key: 'myCases', nameKey: 'nav.myCases', href: '#my-cases' },
    { key: 'digitalJustice', nameKey: 'nav.digitalJustice', href: '#digital-justice' },
    { key: 'courts', nameKey: 'nav.courts', href: '#courts' },
    { key: 'acts', nameKey: 'nav.acts', href: '#information' },
    { key: 'contacts', nameKey: 'nav.contacts', href: '#contacts' },
  ];

  const eServices: { id: string; titleTj: string; titleRu: string; titleEn: string; tab: string; icon: any }[] = [
    { id: 'hearings', titleTj: 'Рӯйхати мурофиаҳо', titleRu: 'График судебных заседаний', titleEn: 'Hearings Schedule', tab: 'hearings', icon: Calendar },
    { id: 'acts', titleTj: 'Бонки санадҳои судӣ', titleRu: 'Банк судебных актов', titleEn: 'Judicial Acts Database', tab: 'acts', icon: BookOpen },
    { id: 'duties', titleTj: 'Ҳисобкунаки боҷи давлатӣ', titleRu: 'Калькулятор госпошлины', titleEn: 'State Duty Calculator', tab: 'duties', icon: Calculator },
    { id: 'docs', titleTj: 'Ҳуҷҷатҳои намунавӣ', titleRu: 'Образцы заявлений и бланки', titleEn: 'Document Templates', tab: 'docs', icon: FileText },
    { id: 'appeals', titleTj: 'Муроҷиати электронӣ', titleRu: 'Электронные обращения', titleEn: 'Electronic Appeals', tab: 'appeals', icon: HelpCircle },
    { id: 'courts', titleTj: 'Харитаи судҳои ҷумҳурӣ', titleRu: 'Сеть и контакты судов', titleEn: 'Judicial Court Network', tab: 'courts', icon: Building },
  ];

  const openServiceTab = (tab: string) => {
    setMenuPopoverOpen(false);
    setMobileMenuOpen(false);
    if (onOpenSectionModal) onOpenSectionModal(tab);
  };

  const supremeCourtMenu = [
    {
      id: 'leadership',
      titleTj: 'Роҳбарияти Суди Олӣ',
      titleRu: 'Руководство Верховного суда',
      titleEn: 'Leadership of the Supreme Court',
      descTj: 'Раис, муовинон ва судяҳои Суди Олӣ',
      descRu: 'Председатель, заместители и судьи',
      descEn: 'Chief Justice, deputies and judges',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        window.location.href = '/leadership';
      },
    },
    {
      id: 'plenum',
      titleTj: 'Пленуми Суди Олӣ',
      titleRu: 'Пленум Верховного суда',
      titleEn: 'Supreme Court Plenum',
      descTj: 'Қарорҳои дастурии Пленум ва ҷамъбасти амалия',
      descRu: 'Постановления Пленума и обобщения',
      descEn: 'Plenum resolutions and practices',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('plenum');
      },
    },
    {
      id: 'structure',
      titleTj: 'Сохтори Суди Олӣ',
      titleRu: 'Структура Верховного суда',
      titleEn: 'Court Structure',
      descTj: 'Дастгоҳ ва сохторҳои таркибии судӣ',
      descRu: 'Аппарат и структурные подразделения',
      descEn: 'Apparatus and structural units',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('structure');
      },
    },
    {
      id: 'collegiums',
      titleTj: 'Коллегияҳои Суди Олӣ',
      titleRu: 'Судебные коллегии',
      titleEn: 'Judicial Collegiums',
      descTj: 'Маданӣ, оилавӣ, ҷиноятӣ, маъмурӣ ва ҳарбӣ',
      descRu: 'Гражданская, семейная, уголовная, админ, военная',
      descEn: 'Civil, family, criminal, admin, military',
      hasSubmenu: true,
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('collegiums');
      },
    },
    {
      id: 'presidium',
      titleTj: 'Раёсати Суди Олӣ',
      titleRu: 'Президиум Верховного суда',
      titleEn: 'Supreme Court Presidium',
      descTj: 'Ҳайат ва ваколатҳои Раёсати суд',
      descRu: 'Состав и компетенция Президиума',
      descEn: 'Composition and powers of Presidium',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('presidium');
      },
    },
    {
      id: 'history',
      titleTj: 'Таърихи Суди Олӣ',
      titleRu: 'История Верховного суда',
      titleEn: 'History of Supreme Court',
      descTj: 'Марҳилаҳои ташаккули адолати судӣ дар Тоҷикистон',
      descRu: 'Этапы становления правосудия Таджикистана',
      descEn: 'Historical evolution of the judiciary',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('history');
      },
    },
    {
      id: 'training',
      titleTj: 'Маркази таълимии судяҳо',
      titleRu: 'Учебный центр судей',
      titleEn: 'Judicial Training Center',
      descTj: 'Такмили ихтисос ва бозомӯзии касбӣ',
      descRu: 'Повышение квалификации и переподготовка',
      descEn: 'Professional training and qualification',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('training');
      },
    },
    {
      id: 'legislation',
      titleTj: 'Санадҳои қонунгузорӣ',
      titleRu: 'Законодательные акты',
      titleEn: 'Legislative Acts & Codes',
      descTj: '24 Қонун, Кодекс ва санадҳои асосии ҶТ',
      descRu: '24 Закона, Кодекса и нормативных акта РТ',
      descEn: '24 Major Laws, Codes & Acts of Tajikistan',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('legislation');
      },
    },
    {
      id: 'reception',
      titleTj: 'Ҷадвали қабули шаҳрвандон',
      titleRu: 'График приёма граждан',
      titleEn: 'Citizen Reception Schedule',
      descTj: 'Рӯзҳо ва соатҳои қабули шахсӣ',
      descRu: 'Дни и часы личного приёма граждан',
      descEn: 'Days and hours of citizen reception',
      action: () => {
        setMenuPopoverOpen(false);
        setMobileMenuOpen(false);
        if (onOpenSectionModal) onOpenSectionModal('reception');
      },
    },
  ];

  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    setMobileMenuOpen(false);
    setMenuPopoverOpen(false);
    if (item.href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(item.href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // Anchor lives on the homepage: go home first, then scroll (fixes dead
      // menu buttons on /about, /leadership, /news/*, /sitemap, …).
      navigate('/');
      window.setTimeout(() => {
        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
      }, 450);
      return;
    }

    if (item.actionId && onOpenSection) {
      e.preventDefault();
      onOpenSection(item.actionId);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none">
      <div className="site-container px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 flex items-center justify-between">
        
        {/* Top Left: Emblem, Title & Quick Controls */}
        <div className="pointer-events-auto flex items-center gap-3 glass glass-card p-1.5 sm:p-2">
          <a
            href="#hero"
            className="flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-white/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-gold group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 border border-theme-gold/40 bg-theme-bg/80 shadow-md shadow-theme-gold/15 group-hover:scale-105 group-hover:border-theme-gold transition-all duration-300 flex items-center justify-center shrink-0">
              <img
                src={`/emblems/emblem-${language}.png`}
                alt="Эмблема Верховного Суда Республики Таджикистан"
                className="w-full h-full object-contain rounded-full drop-shadow-sm"
              />
            </div>
            <div className="w-[140px] sm:w-[210px] md:w-[230px] flex flex-col justify-center overflow-hidden">
              <div className="font-serif text-xs sm:text-sm font-bold text-theme-text leading-tight group-hover:text-theme-gold transition-colors truncate">
                {t('nav.title')}
              </div>
              <div className="font-mono text-[9px] text-theme-textMuted leading-none mt-0.5 truncate">
                {t('nav.subtitle')}
              </div>
            </div>
          </a>

          <div className="h-6 w-px bg-theme-border mx-0.5 hidden sm:block" />

          {/* Multilingual Selector with Smooth Sliding Morph Indicator */}
          <div className="relative flex items-center rounded-xl border border-theme-border bg-theme-bg/60 p-0.5 shadow-inner">
            <span className="pl-1.5 pr-1 text-theme-textMuted select-none pointer-events-none">
              <Globe2 size={11} />
            </span>
            {(['ru', 'tj', 'en'] as Language[]).map((l) => {
              const isActive = language === l;
              const label = l === 'ru' ? 'RU' : l === 'tj' ? 'TJ' : 'EN';
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`relative px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-colors z-10 ${
                    isActive
                      ? 'text-black font-bold'
                      : 'text-theme-textMuted hover:text-theme-text'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeLanguagePill"
                      className="absolute inset-0 bg-theme-gold rounded-lg shadow-xs -z-10"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      }}
                    />
                  )}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-theme-border hover:border-theme-borderHover hover:text-theme-text transition-colors bg-theme-bg/60 text-theme-textSec flex items-center justify-center shadow-xs"
            title={isDark ? t('nav.themeLight') : t('nav.themeDark')}
            aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
          >
            {isDark ? (
              <Sun size={13} className="text-amber-400" />
            ) : (
              <Moon size={13} className="text-indigo-600" />
            )}
          </button>

          {/* Accessibility Switcher */}
          <button
            type="button"
            onClick={onToggleContrast}
            className={`p-1.5 rounded-xl border transition-colors flex items-center gap-1 shadow-xs ${
              isHighContrast
                ? 'border-yellow-400 text-yellow-400 bg-black/60'
                : 'border-theme-border hover:border-theme-borderHover hover:text-theme-text bg-theme-bg/60 text-theme-textSec'
            }`}
            title={t('nav.accessibility')}
            aria-label={t('nav.accessibility')}
          >
            <Eye size={13} />
          </button>
        </div>

        {/* Top Right: Compact Action Buttons & Menu Button */}
        <div className="pointer-events-auto flex items-center gap-2 relative">
          
          {/* Universal Search trigger */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              title={language === 'tj' ? 'Ҷустуҷӯ' : language === 'en' ? 'Search' : 'Поиск'}
              className="p-2 sm:px-3 sm:py-2 glass glass-chip text-theme-text hover:border-theme-gold hover:text-theme-gold transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <Search size={14} />
              <span className="hidden md:inline">{language === 'tj' ? 'Ҷустуҷӯ' : language === 'en' ? 'Search' : 'Поиск'}</span>
            </button>
          )}

          {/* AI Legal Assistant trigger */}
          {onOpenAiAssistant && (
            <button
              type="button"
              onClick={onOpenAiAssistant}
              title={language === 'tj' ? 'Ёвари ҳуқуқӣ' : language === 'en' ? 'AI Legal Assistant' : 'Юридический AI-помощник'}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-theme-gold/15 backdrop-blur-xl border border-theme-gold/40 text-theme-gold hover:bg-theme-gold/25 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold shadow-md"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">{language === 'tj' ? 'Ёвар' : language === 'en' ? 'AI Assistant' : 'AI-Помощник'}</span>
            </button>
          )}

          {/* Admin Panel trigger */}
          <div className="relative group">
            <a
              href="/admin"
              className="p-2 sm:px-3 sm:py-2 glass glass-chip text-theme-text hover:border-theme-gold hover:text-theme-gold transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <Settings size={14} />
              <span className="hidden lg:inline">{language === 'tj' ? 'Админ' : language === 'en' ? 'Admin' : 'Админ'}</span>
            </a>
            {/* Custom Tooltip (hover + keyboard focus) */}
            <div className="absolute top-full right-0 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50">
              <div className="bg-gray-900 border border-gray-700 text-white text-[10px] font-mono py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                {language === 'tj' ? 'Панели идоракунӣ' : language === 'en' ? 'Admin Panel' : 'Админ-панель'}
              </div>
            </div>
          </div>



          {/* Direct E-Court Sign In CTA */}
          {onOpenESud && (
            <button
              type="button"
              onClick={onOpenESud}
              className="btn-primary text-xs h-9 px-3 sm:px-4 hidden sm:inline-flex"
            >
              <Lock size={12} />
              <span>{language === 'tj' ? 'Воридшавӣ' : language === 'en' ? 'Sign In' : 'Войти'}</span>
            </button>
          )}

          {/* Desktop Navigation Popover Menu Trigger */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setMenuPopoverOpen(!menuPopoverOpen)}
              className={`p-2.5 glass glass-chip transition-colors flex items-center gap-1.5 text-xs font-mono ${
                menuPopoverOpen ? 'border-theme-gold text-theme-gold shadow-theme-gold/20' : 'border-theme-border text-theme-text hover:border-theme-gold'
              }`}
            >
              <Compass size={16} />
              <span>{language === 'tj' ? 'Мундариҷа' : language === 'en' ? 'Explore' : 'Навигация'}</span>
            </button>

            {/* Desktop Popover Mega-Menu Dropdown */}
            {menuPopoverOpen && (
              <div className="absolute right-0 top-12 w-[760px] content-card animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="grid grid-cols-12 gap-5">
                  
                  {/* Column 1 (5 cols): Official Supreme Court Institutional Structure (8 Items) */}
                  <div className="col-span-5 border-r border-theme-border/60 pr-4">
                    <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-theme-border/60 text-[11px] font-mono text-theme-gold font-bold uppercase tracking-wider">
                      <Landmark size={14} />
                      <span>{language === 'tj' ? 'Суди Олии ҶТ (8 Бахш)' : language === 'en' ? 'Supreme Court Structure' : 'Верховный суд РТ'}</span>
                    </div>
                    <ul className="flex flex-col gap-1 list-none p-0 m-0">
                      {supremeCourtMenu.map((item) => {
                        const title = language === 'en' ? item.titleEn : language === 'tj' ? item.titleTj : item.titleRu;
                        const desc = language === 'en' ? item.descEn : language === 'tj' ? item.descTj : item.descRu;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={item.action}
                              className="w-full text-left p-1.5 px-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-theme-gold/30 transition-all group cursor-pointer flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-1">
                                <div className="text-xs font-serif font-bold text-theme-text group-hover:text-theme-gold transition-colors truncate">
                                  {title}
                                </div>
                                <div className="text-[10px] font-mono text-theme-textMuted leading-tight truncate">
                                  {desc}
                                </div>
                              </div>
                              <ChevronRight size={12} className="text-theme-textMuted group-hover:text-theme-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Column 2 (4 cols): Electronic Judicial Services & Modules */}
                  <div className="col-span-4 border-r border-theme-border/60 pr-3">
                    <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-theme-border/60 text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      <Gavel size={14} />
                      <span>{language === 'tj' ? 'Хизматрасониҳои электронӣ' : language === 'en' ? 'E-Judicial Services' : 'Электронные услуги'}</span>
                    </div>
                    <ul className="flex flex-col gap-1 list-none p-0 m-0">
                      {eServices.map((service) => {
                        const Icon = service.icon;
                        const title = language === 'en' ? service.titleEn : language === 'tj' ? service.titleTj : service.titleRu;
                        return (
                          <li key={service.id}>
                            <button
                              type="button"
                              onClick={() => openServiceTab(service.tab)}
                              className="w-full text-left p-1.5 px-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-emerald-500/30 transition-all group flex items-center gap-2"
                            >
                              <Icon size={13} className="text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-mono text-theme-textSec group-hover:text-theme-text transition-colors truncate">
                                {title}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Column 3 (3 cols): Main Sections & E-Court Trigger */}
                  <div className="col-span-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-theme-border/60 text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                        <Layers size={14} />
                        <span>{language === 'tj' ? 'Саҳифаҳо' : language === 'en' ? 'Pages' : 'Страницы'}</span>
                      </div>
                      <ul className="flex flex-col gap-1 list-none p-0 m-0">
                        {navLinks.map((item) => {
                          const active = activeSection === item.href;
                          return (
                          <li key={item.key}>
                            <a
                              href={item.href}
                              onClick={(e) => handleLinkClick(e, item)}
                              aria-current={active ? 'true' : undefined}
                              className={`flex items-center justify-between p-1.5 px-2 rounded-xl text-xs font-mono transition-colors ${
                                active
                                  ? 'text-theme-gold bg-theme-gold/10 border border-theme-gold/30'
                                  : 'text-theme-textSec hover:text-theme-text hover:bg-white/10 border border-transparent'
                              }`}
                            >
                              <span className="capitalize truncate">{t(item.nameKey)}</span>
                              <ArrowUpRight size={12} className="text-theme-gold shrink-0" />
                            </a>
                          </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-theme-border/60 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuPopoverOpen(false);
                          if (onOpenESud) onOpenESud();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-theme-gold/15 border border-theme-gold/40 text-theme-gold text-xs font-mono font-bold hover:bg-theme-gold/25 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Lock size={13} />
                        <span>{language === 'tj' ? 'Суди электронӣ' : language === 'en' ? 'E-Court Portal' : 'Электронный суд'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t('nav.close') : 'Menu'}
              className="p-2 glass glass-chip text-theme-text transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Slide-down Overlay Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 glass glass-premium p-5 pt-20 flex flex-col justify-between md:hidden pointer-events-auto animate-in fade-in duration-200 overflow-y-auto">
          <div className="space-y-4">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between p-3 glass glass-card">
              <div className="flex items-center gap-2 text-xs font-mono text-theme-textMuted">
                <Globe2 size={14} className="text-theme-gold" />
                <span>{language === 'tj' ? 'Забони сомона' : language === 'en' ? 'Language' : 'Язык портала'}</span>
              </div>
              <div className="relative flex items-center rounded-xl border border-theme-border bg-theme-bg/80 p-0.5 shadow-inner">
                {(['ru', 'tj', 'en'] as Language[]).map((l) => {
                  const isActive = language === l;
                  const label = l === 'ru' ? 'RU' : l === 'tj' ? 'TJ' : 'EN';
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l)}
                      className={`relative px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors z-10 ${
                        isActive
                          ? 'text-black font-bold'
                          : 'text-theme-textMuted hover:text-theme-text'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeMobileLanguagePill"
                          className="absolute inset-0 bg-theme-gold rounded-lg shadow-xs -z-10"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supreme Court Accordion Section */}
            <div className="p-3 rounded-2xl border border-theme-border bg-theme-surface/60">
              <button
                type="button"
                onClick={() => setSupremeCourtOpen(!supremeCourtOpen)}
                className="w-full flex items-center justify-between text-xs font-mono font-bold text-theme-gold uppercase tracking-wider"
              >
                <span className="flex items-center gap-1.5">
                  <Landmark size={14} />
                  {language === 'tj' ? 'Суди Олии ҶТ (8 Бахш)' : language === 'en' ? 'Supreme Court Structure' : 'Верховный суд РТ'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${supremeCourtOpen ? 'rotate-180' : ''}`} />
              </button>

              {supremeCourtOpen && (
                <ul className="flex flex-col gap-1 list-none p-0 mt-3 pt-2 border-t border-theme-border/60">
                  {supremeCourtMenu.map((item) => {
                    const title = language === 'en' ? item.titleEn : language === 'tj' ? item.titleTj : item.titleRu;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={item.action}
                          className="w-full text-left py-1.5 px-2 rounded-lg text-xs font-serif text-theme-textSec hover:text-theme-text hover:bg-theme-bg/80 flex items-center justify-between"
                        >
                          <span>{title}</span>
                          <ChevronRight size={12} className="text-theme-gold" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Mobile quick actions parity (search + AI assistant) */}
            <div className="grid grid-cols-2 gap-2">
              {onOpenSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-theme-surface/60 border border-theme-border text-xs font-mono text-theme-textSec"
                >
                  <Search size={14} className="text-theme-gold" />
                  <span>{language === 'tj' ? 'Ҷустуҷӯ' : language === 'en' ? 'Search' : 'Поиск'}</span>
                </button>
              )}
              {onOpenAiAssistant && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAiAssistant();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-theme-gold/15 border border-theme-gold/40 text-xs font-mono text-theme-gold font-bold"
                >
                  <Sparkles size={14} />
                  <span>{language === 'tj' ? 'Ёвар' : language === 'en' ? 'AI Assistant' : 'AI-Помощник'}</span>
                </button>
              )}
            </div>

            {/* Mobile e-services accordion parity (same 6 services as desktop) */}
            <div className="p-3 rounded-2xl border border-theme-border bg-theme-surface/60">
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider"
              >
                <span className="flex items-center gap-1.5">
                  <Gavel size={14} />
                  {language === 'tj' ? 'Хизматрасониҳои электронӣ' : language === 'en' ? 'E-Services' : 'Э-услуги'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileServicesOpen && (
                <ul className="flex flex-col gap-1 list-none p-0 mt-3 pt-2 border-t border-theme-border/60">
                  {eServices.map((service) => {
                    const Icon = service.icon;
                    const title = language === 'en' ? service.titleEn : language === 'tj' ? service.titleTj : service.titleRu;
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          onClick={() => openServiceTab(service.tab)}
                          className="w-full text-left py-1.5 px-2 rounded-lg text-xs font-mono text-theme-textSec hover:text-theme-text hover:bg-theme-bg/80 flex items-center gap-2"
                        >
                          <Icon size={13} className="text-emerald-400 shrink-0" />
                          <span className="truncate">{title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Portal Links */}
            <div>
              <span className="font-mono text-[10px] text-theme-textMuted uppercase tracking-widest block mb-2 px-1">
                {language === 'tj' ? 'Бахшҳои асосии сомона' : language === 'en' ? 'Portal Navigation' : 'Навигация'}
              </span>
              <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
                {navLinks.map((item) => {
                  const active = activeSection === item.href;
                  return (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item)}
                      aria-current={active ? 'true' : undefined}
                      className={`flex items-center justify-between font-mono text-xs py-2 px-2.5 rounded-xl border transition-colors ${
                        active
                          ? 'text-theme-gold bg-theme-gold/10 border-theme-gold/40'
                          : 'text-theme-textSec hover:text-theme-text bg-theme-surface/40 border-theme-border/60'
                      }`}
                    >
                      <span className="capitalize">{t(item.nameKey)}</span>
                      <ArrowUpRight size={13} className="text-theme-gold" />
                    </a>
                  </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-theme-border flex flex-col gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenFiling) onOpenFiling();
              }}
              className="btn-primary w-full justify-center text-xs h-10"
            >
              <FileText size={14} />
              <span>{language === 'tj' ? 'Пешниҳоди ҳуҷҷат' : language === 'en' ? 'File Document' : 'Подать документ'}</span>
            </button>
            <div className="flex items-center justify-between text-[10px] font-mono text-theme-textMuted pt-1">
              <span>SUD.TJ // DIGITAL JUSTICE</span>
              <span>© 2026</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
