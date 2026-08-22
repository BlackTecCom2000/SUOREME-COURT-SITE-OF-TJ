import React from 'react';
import { Reveal } from '../Reveal';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { Send, Clock, Calculator, Video, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Section08ElectronicCourtProps {
  onOpenService: (serviceKey: string) => void;
}

export const Section08ElectronicCourt: React.FC<Section08ElectronicCourtProps> = ({
  onOpenService,
}) => {
  const { t } = useLanguage();

  const services = [
    {
      id: 'esud',
      titleKey: 'eservices.service1Title',
      descKey: 'eservices.service1Desc',
      badgeKey: 'eservices.service1Badge',
      icon: Send,
      colorClass: 'text-cyan-400',
    },
    {
      id: 'hearings',
      titleKey: 'eservices.service2Title',
      descKey: 'eservices.service2Desc',
      badgeKey: 'eservices.service2Badge',
      icon: Clock,
      colorClass: 'text-theme-gold',
    },
    {
      id: 'duties',
      titleKey: 'eservices.service3Title',
      descKey: 'eservices.service3Desc',
      badgeKey: 'eservices.service3Badge',
      icon: Calculator,
      colorClass: 'text-emerald-400',
    },
    {
      id: 'about',
      titleKey: 'eservices.service4Title',
      descKey: 'eservices.service4Desc',
      badgeKey: 'eservices.service4Badge',
      icon: Video,
      colorClass: 'text-violet-400',
    },
  ];

  return (
    <section
      id="eservices"
      aria-label={t('nav.eservices')}
      className="relative py-20 sm:py-28 md:py-32 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden select-none border-t border-theme-border/30"
    >
      <DigitalDataRain density="medium" speed="medium" opacity={0.25} colorTheme="cyan" />

      {/* Top Indicator */}
      <Reveal delay={100}>
        <div className="flex items-center justify-between font-mono text-theme-textSec max-w-xs sm:max-w-none text-xs mb-8">
          <div className="flex items-center gap-3">
            <span className="tracking-widest text-theme-gold font-semibold">( H )</span>
            <span className="text-theme-textMuted">[ 008 / 010 ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-2" />
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
              {t('eservices.badge')}
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
                {t('eservices.title1')}{' '}
                <span className="normal-case italic font-light text-theme-gold">
                  {t('eservices.title1Italic')}
                </span>
              </div>
            </Reveal>
            <Reveal delay={250}>
              <div className="text-theme-text">
                {t('eservices.title2')}
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={350}>
          <div className="max-w-md">
            <p className="text-sm text-theme-textSec leading-relaxed">
              {t('eservices.description')}
            </p>
          </div>
        </Reveal>
      </div>

      {/* 4 Interactive Service Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {services.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} delay={200 + idx * 70}>
              <div
                onClick={() => onOpenService(item.id)}
                className="group p-6 sm:p-7 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-theme-borderHover hover:bg-theme-surfaceHover transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[190px] shadow-theme-card relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-theme-bg/60 border border-theme-border">
                      <Icon size={22} className={item.colorClass} />
                    </div>
                    <span className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-theme-border bg-theme-bg/40 text-theme-textMuted uppercase tracking-wider">
                      {t(item.badgeKey)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-theme-text group-hover:text-theme-gold transition-colors mb-2">
                    {t(item.titleKey)}
                  </h3>

                  <p className="text-xs text-theme-textSec leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-theme-border flex items-center justify-between font-mono text-xs text-theme-textMuted group-hover:text-theme-text transition-colors">
                  <span className="flex items-center gap-1 text-theme-gold">
                    <ShieldCheck size={13} />
                    <span>SUD.TJ // SECURE</span>
                  </span>
                  <div className="flex items-center gap-1 text-theme-gold">
                    <span>{t('eservices.openService')}</span>
                    <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
