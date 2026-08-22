import React from 'react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import { DigitalThemis } from '../symbols/DigitalThemis';
import { DigitalJusticeScales } from '../symbols/DigitalJusticeScales';
import { DigitalDataRain } from '../effects/DigitalDataRain';

export const Section04ThemisScales: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="justice-age"
      aria-label={t('nav.justiceAge')}
      className="relative py-20 sm:py-28 md:py-32 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30"
    >
      <DigitalDataRain density="medium" speed="slow" opacity={0.3} colorTheme="gold" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <Reveal delay={50}>
          <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
            <span className="tracking-widest text-theme-gold font-semibold">( D )</span>
            <span className="text-theme-textMuted">[ 004 / 010 ]</span>
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase">
              {t('themisScales.badge')}
            </span>
          </div>
        </Reveal>

        {/* Section Title & Description */}
        <div className="max-w-3xl mb-12">
          <Reveal delay={150}>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase mb-6">
              {t('themisScales.title1')}{' '}
              <span className="italic font-light text-theme-gold">
                {t('themisScales.title1Italic')}
              </span>{' '}
              {t('themisScales.title2')}
            </h2>
          </Reveal>

          <Reveal delay={250}>
            <p className="text-sm sm:text-base leading-relaxed text-theme-textSec font-normal">
              {t('themisScales.description')}
            </p>
          </Reveal>
        </div>

        {/* 2 Major Symbolic Centerpieces: Digital Themis & Digital Scales */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Digital Themis */}
          <div className="lg:col-span-5 flex items-center justify-center p-6 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md shadow-theme-card relative overflow-hidden">
            <Reveal delay={200}>
              <DigitalThemis />
            </Reveal>
          </div>

          {/* Right Column: Digital Justice Scales & Constitutional Pillar */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md shadow-theme-card relative overflow-hidden flex items-center justify-center">
              <Reveal delay={300}>
                <DigitalJusticeScales />
              </Reveal>
            </div>

            {/* Constitutional Pillar Card */}
            <Reveal delay={400}>
              <div className="p-5 sm:p-6 rounded-xl border border-theme-border bg-theme-surface backdrop-blur-md flex items-center justify-between gap-4 shadow-theme-card">
                <div>
                  <div className="font-mono text-xs text-theme-gold uppercase tracking-wider mb-1">
                    {t('themisScales.constArticle5')}
                  </div>
                  <div className="text-xs sm:text-sm font-serif italic text-theme-textSec">
                    {t('themisScales.constQuote5')}
                  </div>
                </div>
                <div className="font-mono text-xs text-theme-textMuted shrink-0">
                  SUD.TJ
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
