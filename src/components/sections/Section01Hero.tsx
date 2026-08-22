import React from 'react';
import { ArrowDown, ArrowUpRight, Scale, ShieldCheck } from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import { DigitalDataRain } from '../effects/DigitalDataRain';

interface Section01HeroProps {
  onOpenESud: () => void;
  onScrollNext: () => void;
}

export const Section01Hero: React.FC<Section01HeroProps> = ({
  onOpenESud,
  onScrollNext,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      aria-label={t('nav.home')}
      className="relative min-h-[92vh] flex flex-col justify-between pt-24 pb-12 sm:pb-16 text-theme-text overflow-hidden select-none"
    >
      {/* Subtle background data rain (sparse for zero collision) */}
      <DigitalDataRain density="sparse" speed="slow" opacity={0.2} colorTheme="gold" />

      {/* Top Meta Indicator */}
      <div className="px-5 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
        <Reveal delay={100}>
          <div className="flex items-center justify-between font-mono text-theme-textSec text-xs">
            <div className="flex items-center gap-3">
              <span className="tracking-widest text-theme-gold font-semibold">( 01 )</span>
              <span className="text-theme-textMuted">[ 001 / 007 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
                {t('hero.badge')}
              </span>
            </div>
            <div className="font-mono text-xs text-theme-textSec hidden md:flex items-center gap-2">
              <Scale size={14} className="text-theme-gold" />
              <span>SUD.TJ</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Main Bottom-Anchored Headline & Mission Composition */}
      <div className="flex flex-col justify-end gap-6 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto w-full mt-auto">
        {/* Large Editorial Headline with content-aware text-wrap */}
        <div className="max-w-4xl text-3xl font-medium uppercase leading-[1.06] tracking-tight text-theme-text drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
          <Reveal delay={150}>
            <div>
              {t('hero.line1')}{' '}
              <span className="normal-case italic font-light text-theme-gold">
                {t('hero.line1Italic')}
              </span>
            </div>
          </Reveal>
          <Reveal delay={250}>
            <div className="text-theme-text">
              {t('hero.line2')}
            </div>
          </Reveal>
        </div>

        {/* Subtitle & Institutional Call-To-Actions */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-t border-theme-border/40 pt-6">
          <Reveal delay={350}>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-theme-textSec font-normal">
              {t('hero.description')}
            </p>
          </Reveal>

          <Reveal delay={450}>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenESud}
                aria-label={t('hero.ctaESud')}
                className="btn-primary"
              >
                <ShieldCheck size={14} />
                <span>{t('hero.ctaESud')}</span>
                <ArrowUpRight size={14} />
              </button>

              <button
                type="button"
                onClick={onScrollNext}
                aria-label={t('hero.ctaExplore')}
                className="btn-secondary"
              >
                <span>{t('hero.ctaExplore')}</span>
                <ArrowDown size={14} className="text-theme-gold" />
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
