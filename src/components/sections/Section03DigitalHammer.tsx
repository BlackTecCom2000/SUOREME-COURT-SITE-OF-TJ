import React from 'react';
import { ArrowUpRight, ShieldCheck, Database, QrCode } from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import { DigitalJudicialHammer } from '../symbols/DigitalJudicialHammer';
import { DigitalDataRain } from '../effects/DigitalDataRain';

interface Section03DigitalHammerProps {
  onOpenActs: () => void;
}

export const Section03DigitalHammer: React.FC<Section03DigitalHammerProps> = ({
  onOpenActs,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id="digital-justice"
      aria-label={t('nav.digitalJustice')}
      className="relative py-14 lg:py-28 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden"
    >
      <DigitalDataRain density="medium" speed="medium" opacity={0.3} colorTheme="cyan" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <Reveal delay={50}>
          <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
            <span className="tracking-widest text-theme-gold font-semibold">( C )</span>
            <span className="text-theme-textMuted">[ 003 / 010 ]</span>
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase">
              {t('digitalJustice.badge')}
            </span>
          </div>
        </Reveal>

        {/* 2-Column Asymmetric Layout: Left Text, Right Interactive Hammer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Reveal delay={150}>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase mb-6">
                {t('digitalJustice.title1')}{' '}
                <span className="italic font-light text-theme-gold">
                  {t('digitalJustice.title1Italic')}
                </span>{' '}
                {t('digitalJustice.title2')}
              </h2>
            </Reveal>

            <Reveal delay={250}>
              <p className="text-sm sm:text-base leading-relaxed text-theme-textSec font-normal mb-8 max-w-xl">
                {t('digitalJustice.description')}
              </p>
            </Reveal>

            {/* 3 Pillars of Digital Legal Integrity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <Reveal delay={300}>
                <div className="content-card">
                  <ShieldCheck size={18} className="text-theme-gold mb-2" />
                  <div className="font-mono text-xs font-semibold text-theme-text mb-1">
                    {t('digitalJustice.pillar1Title')}
                  </div>
                  <div className="text-[11px] text-theme-textMuted leading-tight">
                    {t('digitalJustice.pillar1Desc')}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={350}>
                <div className="content-card">
                  <QrCode size={18} className="text-cyan-400 mb-2" />
                  <div className="font-mono text-xs font-semibold text-theme-text mb-1">
                    {t('digitalJustice.pillar2Title')}
                  </div>
                  <div className="text-[11px] text-theme-textMuted leading-tight">
                    {t('digitalJustice.pillar2Desc')}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="content-card">
                  <Database size={18} className="text-emerald-400 mb-2" />
                  <div className="font-mono text-xs font-semibold text-theme-text mb-1">
                    {t('digitalJustice.pillar3Title')}
                  </div>
                  <div className="text-[11px] text-theme-textMuted leading-tight">
                    {t('digitalJustice.pillar3Desc')}
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={450}>
              <div>
                <button
                  type="button"
                  onClick={onOpenActs}
                  className="group inline-flex items-center gap-2 rounded-full border border-theme-gold bg-theme-gold/15 px-6 py-3 font-mono text-xs uppercase tracking-wider text-theme-text backdrop-blur-sm transition-all hover:bg-theme-gold hover:text-black hover:shadow-theme-glow"
                >
                  <span>{t('digitalJustice.ctaActs')}</span>
                  <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right Centerpiece: Digital Judicial Hammer */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <Reveal delay={200}>
              <DigitalJudicialHammer />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
