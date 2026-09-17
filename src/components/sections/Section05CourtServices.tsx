import React, { useState } from 'react';
import { Reveal } from '../Reveal';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import {
  Send,
  FileDown,
  ArrowUpRight,
  Clock,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  LibraryBig,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Section05CourtServicesProps {
  onOpenService: (serviceKey: string) => void;
  onOpenAppeals: () => void;
  onOpenDocs: () => void;
}

export const Section05CourtServices: React.FC<Section05CourtServicesProps> = ({
  onOpenService,
  onOpenAppeals,
  onOpenDocs,
}) => {
  const { language, t } = useLanguage();
  const [calcClaimSum, setCalcClaimSum] = useState<string>('');
  const [calculatedDuty, setCalculatedDuty] = useState<number | null>(null);

  const calculateStateDuty = (val: string) => {
    setCalcClaimSum(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const duty = Math.max(80, Math.round(num * 0.02));
      setCalculatedDuty(duty);
    } else {
      setCalculatedDuty(null);
    }
  };

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
      id: 'docs',
      titleKey: 'appeals.docsTitle',
      descKey: 'eservices.service4Desc',
      badgeKey: 'eservices.service4Badge',
      icon: FileDown,
      colorClass: 'text-violet-400',
    },
    {
      id: 'legislation-library',
      titleKey: 'eservices.service5Title',
      descKey: 'eservices.service5Desc',
      badgeKey: 'eservices.service5Badge',
      icon: LibraryBig,
      colorClass: 'text-theme-gold',
    },
  ];

  return (
    <section
      id="services"
      aria-label={t('nav.eservices')}
      className="relative py-14 lg:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30 select-none"
    >
      <DigitalDataRain density="sparse" speed="medium" opacity={0.2} colorTheme="cyan" />

      <div className="site-container relative z-10 space-y-8">
        {/* Section Header Indicator */}
        <Reveal delay={50}>
          <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
            <span className="tracking-widest text-theme-gold font-semibold">( 05 )</span>
            <span className="text-theme-textMuted">[ 005 / 007 ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-1" />
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
              {t('eservices.badge')}
            </span>
          </div>
        </Reveal>

        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <Reveal delay={150}>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase mb-4">
                {t('eservices.title1')}{' '}
                <span className="italic font-light text-theme-gold">
                  {t('eservices.title1Italic')}
                </span>{' '}
                {t('eservices.title2')}
              </h2>
            </Reveal>
            <Reveal delay={250}>
              <p className="text-sm sm:text-base leading-relaxed text-theme-textSec font-normal">
                {t('eservices.description')}
              </p>
            </Reveal>
          </div>
        </div>

        {/* 5 Primary Interactive Service Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={200 + idx * 60}>
                <div
                  onClick={() => {
                    if (item.id === 'docs') onOpenDocs();
                    else if (item.id === 'legislation-library') {
                      document.getElementById('legislative-library')?.scrollIntoView({ behavior: 'smooth' });
                    } else onOpenService(item.id);
                  }}
                  className="group p-5 rounded-xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-theme-gold transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[180px] shadow-theme-card relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-theme-bg/60 border border-theme-border">
                        <Icon size={20} className={item.colorClass} />
                      </div>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-theme-border bg-theme-bg/40 text-theme-textMuted uppercase tracking-wider">
                        {t(item.badgeKey)}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-theme-text group-hover:text-theme-gold transition-colors mb-1.5">
                      {t(item.titleKey)}
                    </h3>

                    <p className="text-xs text-theme-textSec leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-theme-border flex items-center justify-between font-mono text-[10px] text-theme-textMuted group-hover:text-theme-text transition-colors">
                    <span className="text-theme-gold flex items-center gap-1">
                      <ShieldCheck size={12} />
                      <span>SUD.TJ</span>
                    </span>
                    <ArrowUpRight size={13} className="text-theme-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Integrated Lower Block: Live State Duty Calculator & Internet Reception */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: State Duty Live Calculator */}
          <div className="lg:col-span-5">
            <Reveal delay={300}>
              <div className="content-card flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-theme-gold uppercase tracking-wider mb-4">
                    <Calculator size={16} />
                    <span>{t('eservices.service3Title')}</span>
                  </div>

                  <p className="text-xs text-theme-textSec leading-relaxed mb-4">
                    {language === 'en'
                      ? 'Calculate exact court filing fee instantly based on the official Republic of Tajikistan judicial fee tariff (2%).'
                      : language === 'tj'
                      ? 'Ҳисоби фаврии боҷи давлатӣ барои муроҷиат ба суд мувофиқи тарифи расмӣ (2%).'
                      : 'Расчёт размера государственной пошлины при подаче искового заявления в суд (2%).'}
                  </p>

                  <div className="space-y-3 mb-4">
                    <input
                      type="number"
                      value={calcClaimSum}
                      onChange={(e) => calculateStateDuty(e.target.value)}
                      placeholder={language === 'en' ? 'Claim amount in TJS...' : language === 'tj' ? 'Маблағи даъво бо сомонӣ (TJS)...' : 'Сумма иска в сомони (TJS)...'}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text font-mono placeholder-theme-textMuted focus:outline-none focus:border-theme-gold"
                    />

                    {calculatedDuty !== null && (
                      <div className="font-mono text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                        <span>{language === 'en' ? 'State Duty Amount:' : language === 'tj' ? 'Маблағи боҷ:' : 'Размер пошлины:'}</span>
                        <span className="font-bold text-sm">{calculatedDuty} TJS</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-theme-border flex items-center justify-between text-[11px] text-theme-textMuted font-mono">
                  <span>{t('appeals.badge')}</span>
                  <span className="text-theme-gold">SUD.TJ // TARIFF</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: Internet Reception Appeal Submission Box */}
          <div className="lg:col-span-7">
            <Reveal delay={350}>
              <div className="content-card flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-mono text-xs text-theme-gold uppercase tracking-wider">
                      <Send size={16} />
                      <span>{t('appeals.receptionTitle')}</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase">
                      {t('appeals.receptionGuarantee')}
                    </span>
                  </div>

                  <p className="text-xs text-theme-textSec leading-relaxed mb-6 font-normal">
                    {t('appeals.description')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/50 text-xs">
                      <div className="font-mono text-[10px] text-theme-textMuted uppercase mb-1">
                        {t('appeals.receptionPersonal')}
                      </div>
                      <div className="font-mono text-xs text-theme-text">
                        {language === 'en' ? 'Tuesdays 09:00–12:00' : language === 'tj' ? 'Сешанбе 09:00–12:00' : 'Вторник 09:00–12:00'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-theme-border bg-theme-bg/50 text-xs">
                      <div className="font-mono text-[10px] text-theme-textMuted uppercase mb-1">
                        {t('appeals.receptionNotice')}
                      </div>
                      <div className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>{t('appeals.successMessage').slice(0, 30)}...</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="font-mono text-[11px] text-theme-textMuted">
                    {language === 'en' ? 'Electronic Secretariat of the Supreme Court' : language === 'tj' ? 'Котиботи электронии Суди Олии ҶТ' : 'Электронная канцелярия Верховного суда РТ'}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenAppeals}
                    className="btn-primary w-full sm:w-auto"
                  >
                    <Send size={14} />
                    <span>{t('appeals.ctaSubmitAppeal')}</span>
                  </button>
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};
