import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { InteractiveProcessFlow } from '../digital-court/InteractiveProcessFlow';

interface Section01HeroProps {
  onOpenESud: () => void;
  onOpenFiling?: () => void;
  onScrollNext: () => void;
}

export const Section01Hero: React.FC<Section01HeroProps> = ({
  onOpenESud,
  onOpenFiling,
  onScrollNext,
}) => {
  const { language, t } = useLanguage();
  // Live portal counters — real /api/stats only, never hardcoded.
  const [liveStats, setLiveStats] = useState<{ courts?: number; acts?: number; hearings?: number } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/stats', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        setLiveStats({
          courts: Number(d.courts) || 0,
          acts: Number(d.acts) || 0,
          hearings: Number(d.hearings) || 0,
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      id="hero"
      aria-label={t('nav.home')}
      className="relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-between pt-20 lg:pt-28 pb-10 lg:pb-16 text-theme-text overflow-hidden select-none"
    >
      {/* Background ambient rain */}
      <DigitalDataRain density="sparse" speed="slow" opacity={0.16} colorTheme="gold" />

      {/* Top Meta Indicator */}
      <div className="px-4 sm:px-8 md:px-12 site-container mb-6">
        <Reveal delay={100}>
          <div className="flex items-center justify-between font-mono text-theme-textSec text-xs">
            <div className="flex items-center gap-3">
              <span className="tracking-widest text-theme-gold font-semibold">( 06 )</span>
              <span className="text-theme-textMuted">[ 006 / 007 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
                {language === 'tj' ? 'ПЛАТФОРМАИ РАҚАМИИ АДОЛАТИ СУДӢ' : language === 'en' ? 'DIGITAL JUSTICE PLATFORM' : 'ЦИФРОВАЯ СУДЕБНАЯ ПЛАТФОРМА'}
              </span>
            </div>
            <div className="font-mono text-xs text-theme-textSec hidden md:flex items-center gap-2">
              <img
                src={`/emblems/emblem-${language}.png`}
                alt="Герб Суди Олии ҶТ"
                className="w-5 h-5 object-contain rounded-full drop-shadow-sm"
              />
              <span>SUD.TJ // SUPREME COURT OF TJ</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Main Split Grid: Left Authority & CTA + Right Live Process Visualizer */}
      <div className="px-4 sm:px-8 md:px-12 site-container my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Institutional Authority & Direct Primary CTA */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <Reveal delay={120}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-theme-gold/30 bg-theme-gold/10 text-theme-gold font-mono text-xs mb-4">
                <Sparkles size={13} />
                <span>
                  {language === 'tj' ? 'НИЗОМИ «СУДИ ЭЛЕКТРОНӢ»' : language === 'en' ? 'E-JUSTICE ECOSYSTEM' : 'СИСТЕМА «ЭЛЕКТРОННЫЙ СУД»'}
                </span>
              </div>
            </Reveal>

            <div className="text-3xl font-medium uppercase leading-[1.06] tracking-tight text-theme-text drop-shadow-sm sm:text-5xl md:text-6xl">
              <Reveal delay={0} priority={true}>
                <div>
                  {t('hero.line1')}{' '}
                  <span className="normal-case italic font-light text-theme-gold">
                    {t('hero.line1Italic')}
                  </span>
                </div>
              </Reveal>
              <Reveal delay={150} priority={true}>
                <div className="text-theme-text">
                  {t('hero.line2')}
                </div>
              </Reveal>
            </div>

            <Reveal delay={300}>
              <p className="mt-5 text-sm sm:text-base leading-relaxed text-theme-textSec font-normal max-w-lg">
                {language === 'tj'
                  ? 'Муҳити ягонаи рақамӣ барои пешниҳод, баррасӣ ва пайгирии парвандаҳои судӣ дар тамоми Ҷумҳурии Тоҷикистон.'
                  : language === 'en'
                  ? 'Unified national digital justice platform for electronic filing, automated judicial routing, and online trial management.'
                  : 'Единая цифровая среда для подачи, рассмотрения и процессуального сопровождения судебных дел в Республике Таджикистан.'}
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={380}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onOpenFiling || onOpenESud}
                  aria-label="Подать документ"
                  className="btn-primary shadow-lg shadow-theme-gold/20"
                >
                  <FileText size={15} />
                  <span>
                    {language === 'tj' ? 'Пешниҳоди ҳуҷҷат' : language === 'en' ? 'File Document' : 'Подать документ'}
                  </span>
                  <ArrowUpRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={onOpenESud}
                  aria-label="Войти в систему"
                  className="btn-secondary"
                >
                  <ShieldCheck size={15} className="text-theme-gold" />
                  <span>
                    {language === 'tj' ? 'Воридшавӣ бо ЭЦП' : language === 'en' ? 'Sign In (PKI)' : 'Войти в систему'}
                  </span>
                </button>
              </div>
            </Reveal>

            {/* Live portal counters (real /api/stats; skeleton until loaded) */}
            <Reveal delay={450}>
              <div className="mt-8 pt-6 border-t border-theme-border/40 grid grid-cols-3 gap-4 text-left font-mono">
                <div>
                  <span className="text-xs text-theme-textMuted uppercase block">
                    {language === 'tj' ? 'Судҳо' : language === 'en' ? 'Courts' : 'Суды'}
                  </span>
                  <span className="text-lg font-bold text-theme-text" aria-live="polite">
                    {liveStats ? liveStats.courts : '…'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-theme-textMuted uppercase block">
                    {language === 'tj' ? 'Санадҳо' : language === 'en' ? 'Acts' : 'Акты'}
                  </span>
                  <span className="text-lg font-bold text-theme-gold" aria-live="polite">
                    {liveStats ? liveStats.acts : '…'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-theme-textMuted uppercase block">
                    {language === 'tj' ? 'Маҷлисҳо' : language === 'en' ? 'Hearings' : 'Заседания'}
                  </span>
                  <span className="text-lg font-bold text-emerald-400" aria-live="polite">
                    {liveStats ? liveStats.hearings : '…'}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: Live Interactive Court Process Visualizer */}
          <div className="lg:col-span-6">
            <Reveal delay={200}>
              <InteractiveProcessFlow />
            </Reveal>
          </div>

        </div>
      </div>

      {/* Bottom Scroll Down trigger */}
      <div className="px-5 sm:px-8 md:px-12 max-w-7xl mx-auto w-full mt-4 flex justify-between items-center text-xs font-mono text-theme-textMuted">
        <span>SUD.TJ // DIGITAL JUSTICE 2026</span>
        <button
          type="button"
          onClick={onScrollNext}
          className="flex items-center gap-1.5 text-theme-textSec hover:text-theme-gold transition-colors"
        >
          <span>{language === 'tj' ? 'Ба пеш' : language === 'en' ? 'Explore' : 'Исследовать'}</span>
          <ArrowDown size={13} className="text-theme-gold animate-bounce" />
        </button>
      </div>
    </section>
  );
};

