import React from 'react';
import { Reveal } from '../Reveal';
import { SAMPLE_DOCUMENTS } from '../../data/sudTjData';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { Send, FileDown, ShieldAlert, ArrowUpRight, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Section09CitizenAppealsProps {
  onOpenAppeals: () => void;
  onOpenDocs: () => void;
}

export const Section09CitizenAppeals: React.FC<Section09CitizenAppealsProps> = ({
  onOpenAppeals,
  onOpenDocs,
}) => {
  const { language, t } = useLanguage();

  return (
    <section
      id="appeals"
      aria-label={t('nav.appeals')}
      className="relative py-20 sm:py-28 md:py-32 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden select-none border-t border-theme-border/30"
    >
      <DigitalDataRain density="medium" speed="slow" opacity={0.25} colorTheme="gold" />

      {/* Top Indicator */}
      <Reveal delay={100}>
        <div className="flex items-center justify-between font-mono text-theme-textSec max-w-xs sm:max-w-none text-xs mb-8">
          <div className="flex items-center gap-3">
            <span className="tracking-widest text-theme-gold font-semibold">( I )</span>
            <span className="text-theme-textMuted">[ 009 / 010 ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-2" />
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
              {t('appeals.badge')}
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
                {t('appeals.title1')}{' '}
                <span className="normal-case italic font-light text-theme-gold">
                  {t('appeals.title1Italic')}
                </span>
              </div>
            </Reveal>
            <Reveal delay={250}>
              <div className="text-theme-text">
                {t('appeals.title2')}
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={350}>
          <div className="max-w-md">
            <p className="text-sm text-theme-textSec leading-relaxed">
              {t('appeals.description')}
            </p>
          </div>
        </Reveal>
      </div>

      {/* 2-Column Split: Internet Reception vs Downloadable Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Official E-Reception Box */}
        <div className="lg:col-span-6">
          <Reveal delay={200}>
            <div className="p-7 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md shadow-theme-card flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-theme-bg/60 border border-theme-border">
                    <Send size={22} className="text-theme-gold" />
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {t('appeals.receptionGuarantee')}
                  </span>
                </div>

                <h3 className="text-xl font-medium text-theme-text mb-3">
                  {t('appeals.receptionTitle')}
                </h3>

                <p className="text-xs sm:text-sm text-theme-textSec leading-relaxed mb-6 font-normal">
                  {t('appeals.description')}
                </p>

                <div className="space-y-3 font-mono text-xs text-theme-textSec border-t border-theme-border pt-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-theme-gold shrink-0" />
                    <span>{t('appeals.receptionPersonal')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-theme-textMuted">
                    <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                    <span>{t('appeals.receptionNotice')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-theme-border">
                <button
                  type="button"
                  onClick={onOpenAppeals}
                  className="w-full py-3.5 rounded-full bg-theme-gold text-black font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:shadow-theme-glow transition-all"
                >
                  <Send size={14} />
                  <span>{t('appeals.ctaSubmitAppeal')}</span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Downloadable Procedural Documents */}
        <div className="lg:col-span-6">
          <Reveal delay={300}>
            <div className="p-7 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md shadow-theme-card flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-theme-bg/60 border border-theme-border">
                    <FileDown size={22} className="text-cyan-400" />
                  </div>
                  <span className="font-mono text-[10px] text-theme-textMuted uppercase tracking-wider">
                    SUD.TJ // DOCS
                  </span>
                </div>

                <h3 className="text-xl font-medium text-theme-text mb-4">
                  {t('appeals.docsTitle')}
                </h3>

                <div className="space-y-2.5">
                  {SAMPLE_DOCUMENTS.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={onOpenDocs}
                      className="group p-3.5 rounded-xl bg-theme-bg/60 border border-theme-border hover:border-theme-gold transition-all cursor-pointer flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <div className="font-mono text-[10px] text-theme-gold uppercase mb-0.5">
                          {language === 'en' ? (doc.categoryEn || doc.categoryRu) : language === 'tj' ? doc.categoryTj : doc.categoryRu}
                        </div>
                        <div className="text-xs font-medium text-theme-text group-hover:text-theme-gold transition-colors">
                          {language === 'en' ? (doc.titleEn || doc.titleRu) : language === 'tj' ? doc.titleTj : doc.titleRu}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-theme-textMuted shrink-0">
                        <span>{doc.format}</span>
                        <ArrowUpRight size={13} className="text-theme-textMuted group-hover:text-theme-gold" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-theme-border flex justify-end">
                <button
                  type="button"
                  onClick={onOpenDocs}
                  className="font-mono text-xs text-theme-gold hover:text-theme-text flex items-center gap-1.5 transition-colors"
                >
                  <span>{t('appeals.docsAll')}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
};
