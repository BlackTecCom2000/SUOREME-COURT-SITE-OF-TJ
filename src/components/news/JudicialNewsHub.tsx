import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { OFFICIAL_ANNOUNCEMENTS, REGIONAL_COURT_NEWS } from '../../data/sudTjData';
import { Judicial3DNewsSlider } from './Judicial3DNewsSlider';
import { Bell, MapPin, Newspaper, Clock, Globe, ChevronRight } from 'lucide-react';
import { Reveal } from '../Reveal';

interface JudicialNewsHubProps {
  onOpenNewsModal?: (tab?: string) => void;
}

export const JudicialNewsHub: React.FC<JudicialNewsHubProps> = ({
  onOpenNewsModal,
}) => {
  const { language } = useLanguage();
  const [activeRegionTab, setActiveRegionTab] = useState<'dushanbe' | 'ntj' | 'sugd' | 'khatlon' | 'vmkb'>('dushanbe');

  const filteredRegionalNews = REGIONAL_COURT_NEWS.filter(item => item.region === activeRegionTab || activeRegionTab === 'dushanbe');

  return (
    <div className="w-full space-y-12 select-none">
      
      {/* 🌟 1. ВЕРХНИЙ БЛОК: 3D-СЛАЙДЕР ГЛАВНЫХ НОВОСТЕЙ + СВЕЖИЕ СОБЫТИЯ (ХАБАРҲОИ ОХИРИН) */}
      <div className="w-full">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b-2 border-cyan-500/80 mb-6 pb-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider px-4 py-1.5 rounded-t-lg shadow-md">
            <Newspaper size={16} />
            <span>{language === 'tj' ? 'ХАБАРҲОИ ОХИРИН' : language === 'en' ? 'LATEST NEWS' : 'ПОСЛЕДНИЕ НОВОСТИ'}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenNewsModal?.('news')}
            className="text-xs font-mono text-theme-gold hover:underline flex items-center gap-1"
          >
            <span>{language === 'tj' ? 'Ҳамаи хабарҳо' : language === 'en' ? 'View All' : 'Все новости'}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 3D Interactive News Slider Stage */}
        <div className="w-full rounded-3xl border border-theme-border bg-theme-surface/70 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
          <Judicial3DNewsSlider
            onOpenNewsItem={() => onOpenNewsModal?.('news')}
            onOpenAllNews={() => onOpenNewsModal?.('news')}
          />
        </div>
      </div>

      {/* 🌟 2. СРЕДНИЙ БЛОК: ХАБАРҲОИ МИНТАҚАВӢ (РЕГИОНАЛЬНЫЕ НОВОСТИ) С ФИЛЬТРОМ ОБЛАСТЕЙ */}
      <div className="w-full">
        {/* Regional Header Ribbon with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-cyan-500/80 mb-6 pb-2 gap-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider px-4 py-1.5 rounded-t-lg shadow-md">
            <MapPin size={16} />
            <span>{language === 'tj' ? 'ХАБАРҲОИ МИНТАҚАВӢ' : language === 'en' ? 'REGIONAL COURT NEWS' : 'РЕГИОНАЛЬНЫЕ НОВОСТИ'}</span>
          </div>

          {/* Region Switcher Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto font-serif text-xs font-semibold uppercase tracking-wider">
            {[
              { id: 'dushanbe', labelTj: 'ДУШАНБЕ', labelRu: 'ДУШАНБЕ' },
              { id: 'ntj', labelTj: 'НТҶ', labelRu: 'РРП' },
              { id: 'sugd', labelTj: 'СУҒД', labelRu: 'СОГД' },
              { id: 'khatlon', labelTj: 'ХАТЛОН', labelRu: 'ХАТЛОН' },
              { id: 'vmkb', labelTj: 'ВМКБ', labelRu: 'ГБАО' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRegionTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeRegionTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-sm font-bold'
                    : 'text-theme-textSec hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                {language === 'tj' ? tab.labelTj : tab.labelRu}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Grid of Regional News Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegionalNews.map((item, idx) => (
            <Reveal key={item.id} delay={100 + idx * 30}>
              <div
                onClick={() => onOpenNewsModal?.('news')}
                className="group p-4 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-cyan-500/60 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-theme-text group-hover:text-cyan-400 transition-colors leading-snug mb-3 line-clamp-3">
                    {language === 'en' ? (item.titleEn || item.titleRu) : language === 'tj' ? item.titleTj : item.titleRu}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-theme-textMuted border-t border-theme-border/40 pt-2.5 mt-2">
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold" title={language === 'tj' ? 'Манбаи хабар' : language === 'en' ? 'News source' : 'Источник новости'}>
                    <Globe size={12} /> {item.courtDomain}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {item.date}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 🌟 3. НИЖНИЙ БЛОК: ЭЪЛОНҲО (ОФИЦИАЛЬНЫЕ ОБЪЯВЛЕНИЯ И ОЗМУНҲО) */}
      <div className="w-full">
        {/* Announcements Ribbon */}
        <div className="flex items-center justify-between border-b-2 border-cyan-500/80 mb-6 pb-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider px-4 py-1.5 rounded-t-lg shadow-md">
            <Bell size={16} />
            <span>{language === 'tj' ? 'ЭЪЛОНҲО ВА ОЗМУНҲО' : language === 'en' ? 'OFFICIAL ANNOUNCEMENTS' : 'ОБЪЯВЛЕНИЯ И КОНКУРСЫ'}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenNewsModal?.('news')}
            className="text-xs font-mono text-theme-gold hover:underline flex items-center gap-1"
          >
            <span>{language === 'tj' ? 'Ҳамаи эълонҳо' : language === 'en' ? 'View All' : 'Все объявления'}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 2-Column Responsive Grid of Announcements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_ANNOUNCEMENTS.map((ann, idx) => (
            <Reveal key={ann.id} delay={120 + idx * 30}>
              <div
                onClick={() => onOpenNewsModal?.('news')}
                className="group p-4 rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-md hover:border-theme-gold hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-theme-text group-hover:text-theme-gold transition-colors leading-relaxed mb-3">
                    {language === 'en' ? (ann.titleEn || ann.titleRu) : language === 'tj' ? ann.titleTj : ann.titleRu}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-theme-textMuted border-t border-theme-border/40 pt-2.5 mt-2">
                  <span className="text-theme-gold font-semibold uppercase">
                    {ann.source || (language === 'tj' ? 'СУДИ ОЛИИ ҶТ' : language === 'en' ? 'SUPREME COURT OF RT' : 'СУДИ ОЛИИ ҶТ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {ann.date}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

    </div>
  );
};

export default JudicialNewsHub;
