import React from 'react';
import { ArrowUpRight, BookOpen, Shield, Users, Gavel, Scale } from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';

interface Section02MissionProps {
  onOpenAbout: () => void;
  onOpenCollegium: (collegiumKey: string) => void;
}

export const Section02Mission: React.FC<Section02MissionProps> = ({
  onOpenAbout,
  onOpenCollegium,
}) => {
  const { t } = useLanguage();

  const collegiums = [
    {
      id: 'civil',
      titleKey: 'mission.civilName',
      descKey: 'mission.civilDesc',
      icon: Scale,
      colorClass: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'family',
      titleKey: 'mission.familyName',
      descKey: 'mission.familyDesc',
      icon: Users,
      colorClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'criminal',
      titleKey: 'mission.criminalName',
      descKey: 'mission.criminalDesc',
      icon: Gavel,
      colorClass: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'admin',
      titleKey: 'mission.adminName',
      descKey: 'mission.adminDesc',
      icon: BookOpen,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'military',
      titleKey: 'mission.militaryName',
      descKey: 'mission.militaryDesc',
      icon: Shield,
      colorClass: 'text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <section
      id="mission"
      aria-label={t('nav.mission')}
      className="relative py-14 lg:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden"
    >
      {/* Background data rain */}

      <div className="site-container relative z-10">
        {/* Section Header with Liquid Glass UI Pod */}
        <Reveal delay={100}>
          <div className="liquid-glass-title-pod p-6 sm:p-8 md:p-10 max-w-4xl mb-10">
            <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
              <span className="tracking-widest text-theme-gold font-semibold">( 02 )</span>
              <span className="text-theme-textMuted">[ 002 / 007 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-gold animate-pulse ml-1" />
              <span className="text-2xs text-theme-textMuted tracking-wider uppercase">
                {t('mission.badge')}
              </span>
            </div>

            <h2 className="public-section-title text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight mb-2 text-theme-text drop-shadow-sm">
              {t('mission.title1')}{' '}
              <span className="italic font-light text-theme-gold">
                {t('mission.title1Italic')}
              </span>{' '}
              {t('mission.title2')}
            </h2>
          </div>
        </Reveal>

        {/* Constitutional Quote Banner */}
        <Reveal delay={250}>
          <div
            onClick={onOpenAbout}
            className="mb-12 p-6 sm:p-8 glass glass-card relative overflow-hidden cursor-pointer hover:border-theme-gold/60 transition-all"
          >
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-theme-gold/5 rounded-full blur-2xl pointer-events-none" />
            <div className="font-mono text-xs text-theme-gold uppercase tracking-wider mb-2">
              {t('mission.constArticle')}
            </div>
            <p className="text-base sm:text-xl font-serif italic text-theme-textSec leading-relaxed">
              {t('mission.constQuote')}
            </p>
          </div>
        </Reveal>

        {/* 5 Judicial Collegiums Grid */}
        <Reveal delay={300}>
          <div className="font-mono text-xs text-theme-textMuted uppercase tracking-wider mb-4">
            {t('mission.collegiumsTitle')}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collegiums.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={350 + idx * 60}>
                <div
                  onClick={() => onOpenCollegium(item.id)}
                  className="group p-5 glass glass-card hover:border-theme-borderHover transition-all cursor-pointer relative flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg glass">
                        <Icon size={18} className={item.colorClass} />
                      </div>
                      <ArrowUpRight
                        size={14}
                        className="text-theme-textMuted group-hover:text-theme-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <h3 className="font-medium text-sm sm:text-base text-theme-text mb-2">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-xs text-theme-textSec leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-theme-border flex items-center justify-between font-mono text-2xs text-theme-textMuted">
                    <span>SUD.TJ // COLLEGIUM</span>
                    <span className="text-theme-gold">{t('nav.openPortal')}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
