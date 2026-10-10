import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, MapPin, Phone, Mail, FileText, ChevronLeft, ChevronRight, ArrowUp, Map } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { APP_VERSION, APP_VERSION_LABEL } from '../version';
import { useNavigate } from 'react-router-dom';
import { PRESIDENT_MESSAGE, USEFUL_LINKS } from '../data/portalLinks';
import { REGIONAL_CLUSTERS } from '../data/sudTjData';
import { TajikistanMap } from './map/TajikistanMap';
import type { ModalTab } from './JudicialModal';

interface FooterProps {
  onOpenSectionModal?: (tab: ModalTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSectionModal }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const pickLink = (l: { labelRu: string; labelTj: string; labelEn: string }) => language === 'en' ? l.labelEn : language === 'tj' ? l.labelTj : l.labelRu;
  const tickerRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [marquee, setMarquee] = useState({ speed: 36, direction: 'left' as 'left'|'right', autoplay: true, pause_on_hover: true, pause_on_focus: true, logo_size: 84, gap: 12 });
  const [usefulSites, setUsefulSites] = useState<typeof USEFUL_LINKS>(USEFUL_LINKS);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    fetch('/api/useful-sites').then(r=> r.ok? r.json(): USEFUL_LINKS).then((d:any)=> { if(Array.isArray(d) && d.length) setUsefulSites(d.map((x:any)=> ({url:x.url, labelRu:x.label_ru||x.labelRu, labelTj:x.label_tj||x.labelTj, labelEn:x.label_en||x.labelEn}))); }).catch(()=>{});
    fetch('/api/marquee-config').then(r=> r.ok? r.json(): null).then((c:any)=> { if(c) setMarquee({speed:c.speed||36, direction:c.direction||'left', autoplay:!!c.autoplay, pause_on_hover:!!c.pause_on_hover, pause_on_focus:!!c.pause_on_focus, logo_size:c.logo_size||84, gap:c.gap||12}); }).catch(()=>{});
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollBy = (dir: number) => tickerRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  // Data-driven single source
  const courtNav = [
    { label: language === 'en' ? 'About' : language === 'tj' ? 'Дар бораи суд' : 'О суде', to: '/about' },
    { label: language === 'en' ? 'Leadership' : language === 'tj' ? 'Роҳбарият' : 'Руководство', to: '/leadership' },
    { label: language === 'en' ? 'E-Library' : language === 'tj' ? 'Китобхона' : 'Библиотека', to: '/library' },
    { label: language === 'en' ? 'Sitemap' : language === 'tj' ? 'Харитаи сомона' : 'Карта сайта', to: '/sitemap' },
  ];

  return (
    <>
      <footer className="relative z-20 mt-auto overflow-hidden select-none bg-transparent border-t border-theme-border">
        {/* Background — no white overlay, natural building shows through.
            v2.22.0: local veil so the facade never competes with card text —
            transparent at top (architecture stays crisp), settling into a
            soft theme wash toward the columns. Plain gradient, no blur layer. */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(223,190,126,0.04) 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-theme-bg/20 to-theme-bg/50"
          aria-hidden="true"
        />

        {/* Glass layer — light continuance, not dark */}
        <div className="relative">
          <div className="site-container px-4 sm:px-8 md:px-12 pt-10 pb-6">
            {/* President message — top glass highlight */}
            <div className="mb-8">
              <a
                href={PRESIDENT_MESSAGE.url}
                target="_blank"
                rel="noreferrer"
                className="glass glass-card p-4 flex items-start gap-3 group hover:border-theme-gold/40 transition-colors"
              >
                <ExternalLink size={15} className="text-theme-gold shrink-0 mt-0.5" />
                <span>
                  <span className="block text-xs uppercase tracking-widest text-theme-gold mb-1 font-semibold">
                    {language === 'en' ? 'President message' : language === 'tj' ? 'Паёми президент' : 'Послание президента'}
                  </span>
                  <span className="font-sans text-sm text-theme-text group-hover:text-theme-gold leading-snug">{pickLink(PRESIDENT_MESSAGE)}</span>
                </span>
              </a>
            </div>

            {/* 4-column premium footer — desktop 4 col, tablet 2 col, mobile stacked */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {/* 1 — СУДИ ОЛИИ — GlassNavigationColumn */}
              <nav aria-label={language === 'en' ? 'Supreme Court' : 'СУДИ ОЛИИ'} className="glass glass-card p-5 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-theme-gold mb-3 font-mono font-bold">СУДИ ОЛИИ</div>
                <ul className="flex-1 flex flex-col justify-between gap-1" role="list">
                  {courtNav.map((l) => (
                    <li key={l.to}>
                      <a href={l.to} onClick={(e) => { e.preventDefault(); navigate(l.to); }} className="tap-target flex items-center justify-between py-1.5 px-2 rounded-lg text-sm text-theme-textSec hover:text-theme-text hover:bg-theme-bg/60 border border-transparent hover:border-theme-border transition-colors">
                        <span>{l.label}</span>
                        <ChevronRight size={12} className="opacity-40" />
                      </a>
                    </li>
                  ))}
                  {[
                    { label: language === 'en' ? 'Hearings' : language === 'tj' ? 'Мурофиаҳо' : 'Заседания', tab: 'hearings' as ModalTab },
                    { label: language === 'en' ? 'Acts' : language === 'tj' ? 'Санадаҳо' : 'Акты', tab: 'acts' as ModalTab },
                  ].map((l) => (
                    <li key={l.tab}>
                      <button type="button" onClick={() => onOpenSectionModal?.(l.tab)} className="tap-target w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-sm text-theme-textSec hover:text-theme-gold hover:bg-theme-bg/60 border border-transparent hover:border-theme-border transition-colors text-left">
                        <span>{l.label}</span>
                        <ChevronRight size={12} className="opacity-40" />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* 2 — СОМОНАҲОИ СУДҲОИ ҶУМҲУРӢ — Courts directory GlassList, single source */}
              <section aria-label="СОМОНАҲОИ СУДҲОИ ҶУМҲУРӢ" className="glass glass-card p-5 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-theme-gold mb-3 font-mono font-bold">СОМОНАҲОИ СУДҲОИ ҶУМҲУРӢ</div>
                <div className="flex-1 max-h-[260px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                  {REGIONAL_CLUSTERS.map((rc) => (
                    <div key={rc.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedRegion(selectedRegion === rc.id ? null : rc.id)}
                        className={`tap-target w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between border transition-colors ${selectedRegion === rc.id ? 'bg-theme-gold/15 border-theme-gold/40 text-theme-text font-semibold' : 'border-transparent text-theme-textSec hover:text-theme-text hover:bg-theme-bg/60 hover:border-theme-border'}`}
                        aria-expanded={selectedRegion === rc.id}
                      >
                        <span>{rc.nameRu} <span className="opacity-60">({rc.courts.length})</span></span>
                        <ChevronRight size={12} className={`transition-transform ${selectedRegion === rc.id ? 'rotate-90' : ''}`} />
                      </button>
                      {selectedRegion === rc.id && (
                        <ul className="mt-1 ml-3 space-y-0.5 border-l border-theme-border pl-3">
                          {rc.courts.slice(0, 8).map((c) => (
                            <li key={c.id}>
                              <a href={`http://${c.domain ?? ''}`} target="_blank" rel="noreferrer" className="tap-target block py-1 text-xs text-theme-textSec hover:text-theme-gold transition-colors truncate">
                                {c.nameRu}
                              </a>
                            </li>
                          ))}
                          {rc.courts.length > 8 && <li className="text-2xs text-theme-textMuted">+{rc.courts.length - 8} {language === 'en' ? 'more' : 'еще'}</li>}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* 3 — Interactive Tajikistan map — Liquid Glass map interface.
                  v2.22.0: stronger silhouette + visible markers (was pale). */}
              <section aria-label="Карта" className="glass glass-card p-5 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-theme-gold mb-3 font-mono flex items-center gap-2 font-bold">
                  <Map size={12} /> {language === 'en' ? 'Judicial Map' : language === 'tj' ? 'Харита' : 'Карта'}
                </div>
                <div className="relative flex-1 min-h-[200px] rounded-[20px] overflow-hidden border border-theme-border bg-theme-bg/60 backdrop-blur-md flex items-center justify-center p-4">
                  {/* Real Tajikistan: GADM ADM1 polygons, simplified locally.
                      Dushanbe + RRP are separate shapes selecting one cluster. */}
                  <TajikistanMap
                    selected={selectedRegion}
                    onSelect={(id) => setSelectedRegion(selectedRegion === id ? null : id)}
                    clusters={REGIONAL_CLUSTERS.map((rc) => ({ id: rc.id, label: rc.shortNameRu, count: rc.courts.length }))}
                    language={language}
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-2xs font-mono text-theme-textMuted">
                    <span>{language === 'en' ? 'Select region' : language === 'tj' ? 'Минтақаро интихоб кунед' : 'Выберите регион'}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-theme-gold animate-pulse" /> LIVE</span>
                  </div>
                </div>
                <div className="mt-1.5 text-right font-mono text-2xs text-theme-textMuted opacity-70">
                  {language === 'en' ? 'Boundaries: GADM' : language === 'tj' ? 'Сарҳадҳо: GADM' : 'Границы: GADM'}
                </div>
                {/* Accessible alternative list for keyboard/screen reader */}
                <nav aria-label="Regions" className="mt-3 flex flex-wrap gap-1.5">
                  {REGIONAL_CLUSTERS.map((rc) => (
                    <button key={`foot-map-${rc.id}`} type="button" onClick={() => setSelectedRegion(rc.id)} className={`tap-target px-2.5 py-1 rounded-full text-2xs font-mono border transition-colors ${selectedRegion === rc.id ? 'bg-theme-gold text-black font-semibold border-theme-gold' : 'border-theme-border text-theme-textSec hover:text-theme-text hover:border-theme-gold/40 hover:bg-theme-bg/60'}`}>{rc.shortNameRu}</button>
                  ))}
                </nav>
              </section>

              {/* 4 — ТАМОС — GlassContactPanel, real contacts */}
              <section aria-label="ТАМОС" className="glass glass-card p-5 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-theme-gold mb-3 font-mono font-bold">ТАМОС</div>
                <address className="not-italic flex-1 flex flex-col justify-between gap-3 text-sm">
                  <div className="flex gap-3 p-3 rounded-xl glass-nest border">
                    <MapPin size={16} className="text-theme-gold shrink-0 mt-0.5" />
                    <div className="text-theme-textSec leading-snug text-xs">
                      <span className="block text-2xs uppercase text-theme-textMuted mb-1">{t('contacts.legalAddressLabel')}</span>
                      {t('contacts.legalAddressValue')}
                    </div>
                  </div>
                  <a href="mailto:info@sud.tj" className="flex gap-3 p-3 rounded-xl glass-nest border hover:border-theme-gold/40 transition-colors group">
                    <Mail size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-2xs uppercase text-theme-textMuted">E-mail</span>
                      <span className="text-theme-text group-hover:text-theme-gold text-xs font-medium">info@sud.tj</span>
                    </div>
                  </a>
                  <a href="tel:+992372331415" className="flex gap-3 p-3 rounded-xl glass-nest border hover:border-theme-gold/40 transition-colors group">
                    <Phone size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-2xs uppercase text-theme-textMuted">{t('contacts.hotlineLabel')}</span>
                      <span className="text-theme-text group-hover:text-theme-gold text-xs font-medium">+992 (37) 233-14-15</span>
                    </div>
                  </a>
                  <div className="flex gap-3 p-3 rounded-xl glass-nest border">
                    <FileText size={16} className="text-theme-textMuted shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-2xs uppercase text-theme-textMuted">Факс</span>
                      <span className="text-theme-textSec text-xs">+992 (37) 233-14-15</span>
                    </div>
                  </div>
                </address>
              </section>
            </div>

            {/* Useful Links — СОМОНАҲОИ МУФИД — infinite marquee, Liquid Glass, admin configurable */}
            <section aria-label="СОМОНАҲОИ МУФИД" className="glass glass-card p-5 mb-8 overflow-hidden">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-xs uppercase tracking-widest text-theme-gold font-mono font-bold">СОМОНАҲОИ МУФИД</h2>
                <div className="hidden sm:flex items-center gap-1.5">
                  <button type="button" aria-label="Prev" onClick={() => scrollBy(-1)} className="w-8 h-8 rounded-full glass border border-theme-border hover:border-theme-gold flex items-center justify-center text-theme-textMuted hover:text-theme-text transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button type="button" aria-label="Next" onClick={() => scrollBy(1)} className="w-8 h-8 rounded-full glass border border-theme-border hover:border-theme-gold flex items-center justify-center text-theme-textMuted hover:text-theme-text transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div
                className="ticker rounded-[16px] border border-theme-border overflow-hidden"
                role="marquee"
                aria-label={language === 'en' ? 'Useful links marquee' : 'Бегущая лента полезных сайтов'}
                onMouseEnter={() => { if (marquee.pause_on_hover) { const el = document.querySelector('.ticker-track') as HTMLElement; if (el) el.style.animationPlayState = 'paused'; }}}
                onMouseLeave={() => { if (marquee.pause_on_hover && marquee.autoplay) { const el = document.querySelector('.ticker-track') as HTMLElement; if (el) el.style.animationPlayState = 'running'; }}}
                onFocus={() => { if (marquee.pause_on_focus) { const el = document.querySelector('.ticker-track') as HTMLElement; if (el) el.style.animationPlayState = 'paused'; }}}
                onBlur={() => { if (marquee.pause_on_focus && marquee.autoplay) { const el = document.querySelector('.ticker-track') as HTMLElement; if (el) el.style.animationPlayState = 'running'; }}}
              >
                <div
                  className="ticker-track"
                  style={{ animationDuration: `${marquee.speed}s`, animationDirection: marquee.direction === 'right' ? 'reverse' as const : 'normal' as const, animationPlayState: marquee.autoplay ? 'running' as const : 'paused' as const, gap: `${marquee.gap}px` } as React.CSSProperties}
                >
                  {[0, 1].map((copy) => (
                    <div key={copy} className="ticker-run" aria-hidden={copy === 1 ? 'true' : undefined} style={{ gap: `${marquee.gap}px` } as React.CSSProperties}>
                      {usefulSites.map((l) => (
                        <a
                          key={`${copy}-${l.url}`}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={copy === 1 ? -1 : undefined}
                          role="listitem"
                          className="ticker-item glass border border-theme-border hover:border-theme-gold rounded-[16px] flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-gold group shrink-0"
                          style={{ width: `${Math.max(140, marquee.logo_size * 2.1)}px`, height: `${marquee.logo_size}px` } as React.CSSProperties}
                        >
                          <span className="w-9 h-9 rounded-full glass-nest border flex items-center justify-center text-2xs font-mono text-theme-textSec group-hover:text-theme-gold group-hover:bg-theme-bg transition-colors shrink-0" aria-hidden="true">
                            {pickLink(l).slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-[11px] font-medium text-theme-text leading-tight line-clamp-2">{pickLink(l)}</span>
                          <span className="text-2xs font-mono text-theme-textMuted truncate max-w-full px-2">{(() => { try { return new URL(l.url).hostname } catch { return l.url } })()}</span>
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-2xs font-mono text-theme-textMuted">
                <span className="sm:hidden">← swipe / touch →</span>
                <span className="hidden sm:inline opacity-60">{marquee.autoplay ? (language === 'en' ? 'Auto • hover to pause' : 'Авто • пауза при наведении') : (language === 'en' ? 'Paused' : 'Пауза')}</span>
                <span className="hidden sm:inline opacity-60">{marquee.speed}s • {marquee.direction}</span>
              </div>
              {/* hidden fallback scroll container for touch/keyboard when marquee disabled */}
              <div ref={tickerRef} className="hidden" aria-hidden="true" />
            </section>

            {/* Bottom bar — GlassBottomBar */}
            <div className="glass border-t border-theme-border !rounded-none -mx-4 sm:-mx-8 md:-mx-12 px-4 sm:px-8 md:px-12 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <span className="text-theme-text font-bold">SUD.TJ</span>
                <span className="opacity-60">•</span>
                <span className="text-theme-textSec">{t('contacts.officialPortalNotice')}</span>
                <span className="opacity-60">•</span>
                <a href="/sitemap" className="tap-target text-theme-textSec hover:text-theme-gold transition-colors underline-offset-2 hover:underline">{language === 'en' ? 'Sitemap' : language === 'tj' ? 'Харитаи сомона' : 'Карта сайта'}</a>
                <span className="opacity-60">•</span>
                <span className="text-theme-textMuted">{t('contacts.copyright')}</span>
              </div>
              <div className="flex items-center gap-3">
                {/* IT branding — GlassBrandBadge compact, only if real official element present */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-theme-gold/30 text-2xs font-mono text-theme-gold font-semibold">
                  <span style={{ fontSize: '12px' }} aria-hidden="true">⚖️</span> BlackTecCom
                </span>
                <span className="text-theme-textMuted hidden sm:inline" title={`Build ${APP_VERSION}`}>{APP_VERSION_LABEL}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back-to-top — FloatingGlassButton */}
      <button
        type="button"
        aria-label={language === 'en' ? 'Back to top' : language === 'tj' ? 'Ба боло' : 'Наверх'}
        onClick={scrollToTop}
        className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-40 w-11 h-11 rounded-full glass border border-theme-border flex items-center justify-center text-theme-textSec hover:text-theme-gold hover:border-theme-gold shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ${showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <ArrowUp size={18} />
      </button>
    </>
  );
};

export default Footer;
