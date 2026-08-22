import React from 'react';
import { Reveal } from '../Reveal';
import { JUDICIAL_ACTS } from '../../data/sudTjData';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { FileText, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Section07JudicialActsProps {
  onOpenActs: () => void;
}

export const Section07JudicialActs: React.FC<Section07JudicialActsProps> = ({
  onOpenActs,
}) => {
  const { language, t } = useLanguage();

  return (
    <section
      id="acts"
      aria-label={t('nav.acts')}
      className="relative py-20 sm:py-28 md:py-32 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden select-none border-t border-theme-border/30"
    >
      <DigitalDataRain density="medium" speed="medium" opacity={0.25} colorTheme="gold" />

      {/* Top Indicator */}
      <Reveal delay={100}>
        <div className="flex items-center justify-between font-mono text-theme-textSec max-w-xs sm:max-w-none text-xs mb-8">
          <div className="flex items-center gap-3">
            <span className="tracking-widest text-theme-gold font-semibold">( G )</span>
            <span className="text-theme-textMuted">[ 007 / 010 ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-2" />
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
              {t('acts.badge')}
            </span>
          </div>
        </div>
      </Reveal>

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div className="max-w-3xl">
          <div className="text-4xl sm:text-5xl md:text-6xl font-medium uppercase leading-[1.08] tracking-tight text-theme-text drop-shadow-sm">
            <Reveal delay={150}>
              <div>
                {t('acts.title1')}{' '}
                <span className="normal-case italic font-light text-theme-gold">
                  {t('acts.title1Italic')}
                </span>
              </div>
            </Reveal>
            <Reveal delay={250}>
              <div className="text-theme-text">
                {t('acts.title2')}
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={350}>
          <div className="max-w-md">
            <p className="text-sm text-theme-textSec leading-relaxed">
              {t('acts.description')}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Grid of Verified Acts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {JUDICIAL_ACTS.slice(0, 6).map((act, i) => (
          <Reveal key={act.id} delay={200 + i * 50}>
            <div
              onClick={onOpenActs}
              className="group p-5 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-theme-gold transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-theme-card"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-theme-textMuted mb-3">
                  <span className="text-theme-gold uppercase tracking-wider">
                    {language === 'en' ? (act.collegiumNameEn || act.collegiumNameRu) : language === 'tj' ? act.collegiumNameTj : act.collegiumNameRu}
                  </span>
                  <span>{act.date}</span>
                </div>
                <h4 className="text-sm font-medium text-theme-text group-hover:text-theme-gold transition-colors line-clamp-2 leading-snug">
                  {language === 'en' ? (act.titleEn || act.titleRu) : language === 'tj' ? act.titleTj : act.titleRu}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between font-mono text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={12} />
                  <span>{t('acts.inForce')}</span>
                </span>
                <span className="text-theme-textMuted group-hover:text-theme-text">PDF / QR</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* CTA Button */}
      <Reveal delay={500}>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onOpenActs}
            className="group inline-flex items-center gap-2 rounded-full border border-theme-gold bg-theme-gold/15 px-6 py-3 font-mono text-xs uppercase tracking-wider text-theme-text backdrop-blur-sm transition-all hover:bg-theme-gold hover:text-black hover:shadow-theme-glow"
          >
            <FileText size={14} className="text-theme-gold group-hover:text-black transition-colors" />
            <span>{t('acts.ctaOpenBank')}</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};
