import React, { useState, useEffect } from 'react';
import { Reveal } from '../Reveal';
import { JUDICIAL_ACTS } from '../../data/sudTjData';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { FileText, ArrowUpRight, CheckCircle2, Newspaper, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { JudicialNewsHub } from '../news/JudicialNewsHub';

interface Section06JudicialInformationProps {
  onOpenActs: () => void;
  onOpenNews: () => void;
}

export const Section06JudicialInformation: React.FC<Section06JudicialInformationProps> = ({
  onOpenActs,
  onOpenNews,
}) => {
  const { language, t } = useLanguage();
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.ok ? res.json() : [])
      .then(data => setNews(Array.isArray(data) ? data : []))
      .catch(() => setNews([]));
  }, []);

  return (
    <section
      id="information"
      aria-label={t('nav.acts')}
      className="relative py-14 lg:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30 select-none"
    >
      <DigitalDataRain density="sparse" speed="medium" opacity={0.2} colorTheme="gold" />

      <div className="site-container relative z-10 space-y-16">
        {/* Section Header Indicator */}
        <Reveal delay={50}>
          <div className="flex items-center gap-3 font-mono text-xs text-theme-textSec mb-4">
            <span className="tracking-widest text-theme-gold font-semibold">( 06 )</span>
            <span className="text-theme-textMuted">[ 006 / 007 ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
              {t('acts.badge')}
            </span>
          </div>
        </Reveal>

        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <Reveal delay={150}>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase mb-4">
                {t('acts.title1')}{' '}
                <span className="italic font-light text-theme-gold">
                  {t('acts.title1Italic')}
                </span>{' '}
                {t('acts.title2')}
              </h2>
            </Reveal>
            <Reveal delay={250}>
              <p className="text-sm sm:text-base leading-relaxed text-theme-textSec font-normal">
                {t('acts.description')}
              </p>
            </Reveal>
          </div>
        </div>

        {/* 🌟 FULL JUDICIAL PRESS & MEDIA PORTAL (3D NEWS SLIDER, REGIONAL NEWS & OFFICIAL ANNOUNCEMENTS) */}
        <Reveal delay={200}>
          <JudicialNewsHub onOpenNewsModal={() => onOpenNews()} />
        </Reveal>

        {/* 2-Column Split: Judicial Acts Database & Legal Bank */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Verified Judicial Acts & Plenum Decisions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 font-mono text-xs text-theme-textSec">
                <span className="text-theme-gold font-semibold flex items-center gap-2 uppercase tracking-wider">
                  <FileText size={16} />
                  <span>{t('acts.badge')}</span>
                </span>
                <span className="text-theme-textMuted">SUD.TJ // DATABASE</span>
              </div>

              <div className="space-y-3 mb-6">
                {JUDICIAL_ACTS.slice(0, 4).map((act, i) => (
                  <Reveal key={act.id} delay={200 + i * 50}>
                    <div
                      onClick={onOpenActs}
                      className="group p-4 rounded-xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-theme-gold transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-theme-textMuted mb-1">
                          <span className="text-theme-gold font-semibold uppercase">{act.id}</span>
                          <span>•</span>
                          <span>{act.date}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-medium text-theme-text group-hover:text-theme-gold transition-colors line-clamp-1">
                          {language === 'en' ? (act.titleEn || act.titleRu) : language === 'tj' ? act.titleTj : act.titleRu}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 size={11} />
                          <span>{t('acts.inForce')}</span>
                        </span>
                        <ArrowUpRight size={13} className="text-theme-textMuted group-hover:text-theme-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOpenActs}
                className="btn-secondary w-full justify-center"
              >
                <FileText size={14} />
                <span>{t('acts.ctaOpenBank')}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenActs()}
                className="btn-outline w-full justify-center"
              >
                <span>{language === 'tj' ? 'Санадҳои Қонунгузорӣ (24)' : language === 'en' ? 'Legislation & Codes (24)' : 'Законодательные акты (24)'}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Right: Press Center, News & "Мизони Қонун" */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 font-mono text-xs text-theme-textSec">
                <span className="text-theme-gold font-semibold flex items-center gap-2 uppercase tracking-wider">
                  <Newspaper size={16} />
                  <span>{t('contacts.pressTitle')}</span>
                </span>
                <span className="text-theme-textMuted">«МИЗОНИ ҚОНУН»</span>
              </div>

              <div className="space-y-3 mb-6">
                {news.length === 0 && <p className="text-sm text-theme-textSec">Нет новостей.</p>}
                {news.slice(0, 3).map((item, idx) => (
                  <Reveal key={item.id} delay={250 + idx * 60}>
                    <div
                      onClick={onOpenNews}
                      className="group p-4 rounded-xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-theme-gold transition-all duration-200 cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-theme-textMuted mb-1.5">
                        <span className="text-theme-gold font-semibold">ПРЕСС-ЦЕНТР</span>
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-theme-text group-hover:text-theme-gold transition-colors mb-1 line-clamp-2">
                        {language === 'en' ? (item.title_en || item.title_ru) : language === 'tj' ? (item.title_tj || item.title_ru) : item.title_ru}
                      </h4>
                      <p className="text-[11px] text-theme-textSec line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: (language === 'en' ? (item.body_en || item.body_ru) : language === 'tj' ? (item.body_tj || item.body_ru) : item.body_ru) || '' }}></p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenNews}
              className="btn-outline w-full justify-center"
            >
              <span>{t('contacts.ctaPress')}</span>
              <ExternalLink size={13} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
