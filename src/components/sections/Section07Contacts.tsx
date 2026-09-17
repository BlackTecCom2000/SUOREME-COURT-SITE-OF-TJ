import React from 'react';
import { Reveal } from '../Reveal';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { MapPin, Phone, Mail, ArrowUpRight, Calendar, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Section07ContactsProps {
  onOpenContacts: () => void;
}

export const Section07Contacts: React.FC<Section07ContactsProps> = ({
  onOpenContacts,
}) => {
  const { language, t } = useLanguage();

  return (
    <section
      id="contacts"
      aria-label={t('nav.contacts')}
      className="relative py-14 lg:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30 select-none"
    >
      <DigitalDataRain density="sparse" speed="slow" opacity={0.2} colorTheme="gold" />

      <div className="site-container relative z-10 space-y-8">
        {/* Section Header Indicator */}
        <Reveal delay={50}>
          <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
            <span className="tracking-widest text-theme-gold font-semibold">( 07 )</span>
            <span className="text-theme-textMuted">[ 007 / 007 ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
              {t('contacts.badge')}
            </span>
          </div>
        </Reveal>

        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <Reveal delay={150}>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase mb-4">
                {t('contacts.title1')}{' '}
                <span className="italic font-light text-theme-gold">
                  {t('contacts.title1Italic')}
                </span>{' '}
                {t('contacts.title2')}
              </h2>
            </Reveal>
            <Reveal delay={250}>
              <p className="text-sm sm:text-base leading-relaxed text-theme-textSec font-normal">
                {t('contacts.description')}
              </p>
            </Reveal>
          </div>
        </div>

        {/* 2-Column Split: Headquarters Contacts & Personal Reception Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left: Official Headquarters Dossier */}
          <div className="lg:col-span-7">
            <Reveal delay={200}>
              <div className="p-6 sm:content-card flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-theme-gold uppercase tracking-wider font-semibold flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{t('contacts.headquarterTitle')}</span>
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

                <button
                  type="button"
                  onClick={onOpenContacts}
                  className="btn-secondary w-full"
                >
                  <span>{t('contacts.ctaAllContacts')}</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right: Citizens Personal Reception Schedule */}
          <div className="lg:col-span-5">
            <Reveal delay={250}>
              <div className="p-6 sm:content-card flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-theme-gold uppercase tracking-wider font-semibold mb-4">
                    <Calendar size={16} />
                    <span>{language === 'en' ? 'Citizens Personal Reception' : language === 'tj' ? 'Ҷадвали қабули шаҳрвандон' : 'График приёма граждан'}</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs text-theme-textSec mb-6">
                    <div className="p-3.5 rounded-xl bg-theme-bg/60 border border-theme-border">
                      <div className="text-[10px] text-theme-textMuted uppercase mb-1">
                        {language === 'en' ? 'Chief Justice' : language === 'tj' ? 'Раиси Суди Олии ҶТ' : 'Председатель Верховного суда'}
                      </div>
                      <div className="text-theme-text font-medium flex items-center justify-between">
                        <span>{language === 'en' ? 'Tuesdays' : language === 'tj' ? 'Сешанбе' : 'Вторник'}</span>
                        <span className="text-theme-gold">09:00 – 12:00</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-theme-bg/60 border border-theme-border">
                      <div className="text-[10px] text-theme-textMuted uppercase mb-1">
                        {language === 'en' ? 'Deputy Chairpersons' : language === 'tj' ? 'Муовинони Раиси Суди Олӣ' : 'Заместители Председателя'}
                      </div>
                      <div className="text-theme-text font-medium flex items-center justify-between">
                        <span>{language === 'en' ? 'Thursdays' : language === 'tj' ? 'Панҷшанбе' : 'Четверг'}</span>
                        <span className="text-cyan-400">14:00 – 17:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-theme-border flex items-center gap-2 text-xs text-theme-textMuted">
                  <ShieldCheck size={14} className="text-theme-gold shrink-0" />
                  <span>{language === 'en' ? 'Prior appointment via registry required' : language === 'tj' ? 'Бо сабти пешакӣ тавассути котибот' : 'По предварительной записи через канцелярию'}</span>
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};
