import React from 'react';
import { Reveal } from '../Reveal';
import { PRESS_NEWS } from '../../data/sudTjData';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { MapPin, Phone, Mail, ArrowUpRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Section10SupremeCourtProps {
  onOpenNews: () => void;
  onOpenContacts: () => void;
}

export const Section10SupremeCourt: React.FC<Section10SupremeCourtProps> = ({
  onOpenNews,
  onOpenContacts,
}) => {
  const { language, t } = useLanguage();

  return (
    <section
      id="contacts"
      aria-label={t('nav.contacts')}
      className="relative py-20 sm:py-28 md:py-32 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden select-none border-t border-theme-border/30"
    >
      <DigitalDataRain density="medium" speed="slow" opacity={0.25} colorTheme="gold" />

      {/* Top Indicator */}
      <Reveal delay={100}>
        <div className="flex items-center justify-between font-mono text-theme-textSec max-w-xs sm:max-w-none text-xs mb-8">
          <div className="flex items-center gap-3">
            <span className="tracking-widest text-theme-gold font-semibold">( J )</span>
            <span className="text-theme-textMuted">[ 010 / 010 ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-2" />
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
              {t('contacts.badge')}
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
                {t('contacts.title1')}{' '}
                <span className="normal-case italic font-light text-theme-gold">
                  {t('contacts.title1Italic')}
                </span>
              </div>
            </Reveal>
            <Reveal delay={250}>
              <div className="text-theme-text">
                {t('contacts.title2')}
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={350}>
          <div className="max-w-md">
            <p className="text-sm text-theme-textSec leading-relaxed">
              {t('contacts.description')}
            </p>
          </div>
        </Reveal>
      </div>

      {/* 2-Column Split: Central Apparatus Contacts & Press News */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Column: Official Headquarters Dossier */}
        <div className="lg:col-span-6">
          <Reveal delay={200}>
            <div className="p-7 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md shadow-theme-card flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-theme-gold uppercase tracking-wider">
                    {t('contacts.headquarterTitle')}
                  </span>
                  <span className="font-mono text-[10px] text-theme-textMuted uppercase">
                    {t('contacts.cityCountry')}
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs text-theme-textSec mb-6">
                  <div className="p-4 rounded-xl bg-theme-bg/60 border border-theme-border flex items-start gap-3">
                    <MapPin size={18} className="text-theme-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-theme-textMuted uppercase block">
                        {t('contacts.legalAddressLabel')}
                      </span>
                      <span className="text-theme-text font-sans text-sm font-medium mt-0.5 block">
                        {t('contacts.legalAddressValue')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-theme-bg/60 border border-theme-border flex items-start gap-3">
                      <Phone size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-theme-textMuted uppercase block">
                          {t('contacts.hotlineLabel')}
                        </span>
                        <span className="text-theme-text font-medium mt-0.5 block">
                          +992 (37) 233-14-15
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-theme-bg/60 border border-theme-border flex items-start gap-3">
                      <Mail size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-theme-textMuted uppercase block">
                          {t('contacts.emailLabel')}
                        </span>
                        <span className="text-theme-text font-medium mt-0.5 block">
                          info@sud.tj
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-theme-border">
                <button
                  type="button"
                  onClick={onOpenContacts}
                  className="w-full py-3.5 rounded-full border border-theme-border bg-theme-surface hover:border-theme-gold hover:text-theme-text font-mono text-xs uppercase tracking-wider text-theme-textSec flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>{t('contacts.ctaAllContacts')}</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Press Center & Publications */}
        <div className="lg:col-span-6">
          <Reveal delay={300}>
            <div className="p-7 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md shadow-theme-card flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-theme-gold uppercase tracking-wider">
                    {t('contacts.pressTitle')}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenNews}
                    className="font-mono text-[10px] text-theme-textMuted hover:text-theme-text flex items-center gap-1 transition-colors"
                  >
                    <span>{t('contacts.pressAll')}</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>

                <div className="space-y-3">
                  {PRESS_NEWS.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={onOpenNews}
                      className="group p-4 rounded-xl bg-theme-bg/60 border border-theme-border hover:border-theme-gold transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-theme-textMuted mb-1">
                        <span>{item.date}</span>
                        <span className="text-theme-gold">{item.source}</span>
                      </div>
                      <h4 className="text-xs font-medium text-theme-text group-hover:text-theme-gold transition-colors leading-snug line-clamp-2">
                        {language === 'en' ? (item.titleEn || item.titleRu) : language === 'tj' ? item.titleTj : item.titleRu}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-theme-border flex items-center justify-between font-mono text-xs text-theme-textMuted">
                <span className="flex items-center gap-2 text-theme-gold">
                  <BookOpen size={14} />
                  <span>{t('contacts.magazineBtn')}</span>
                </span>
                <span className="text-emerald-400">PDF ONLINE</span>
              </div>
            </div>
          </Reveal>
        </div>

      </div>

      {/* Final Institutional Statement */}
      <Reveal delay={400}>
        <div className="p-8 rounded-3xl border border-theme-border bg-theme-surface backdrop-blur-xl text-center shadow-theme-card relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-serif tracking-tight text-theme-text mb-2">
              {t('contacts.title1')} {t('contacts.title2')}
            </h3>
            <p className="font-mono text-xs sm:text-sm text-theme-gold tracking-widest uppercase">
              {t('contacts.finalMotto')}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
