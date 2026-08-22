import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { JusticeStage } from './JusticeStoryNavigator';

interface JusticeStoryTimelineProps {
  activeStage: JusticeStage;
  onSelectStage: (stage: JusticeStage) => void;
  onOpenActs: () => void;
}

export const JusticeStoryTimeline: React.FC<JusticeStoryTimelineProps> = ({
  activeStage,
  onSelectStage,
  onOpenActs,
}) => {
  const { language } = useLanguage();

  const steps = [
    {
      num: '01',
      key: 'law',
      label: language === 'tj' ? 'ҚОНУН' : language === 'en' ? 'LAW' : 'ЗАКОН',
      desc: language === 'tj' ? 'Асоси ҳуқуқӣ' : language === 'en' ? 'Legal Basis' : 'Основа права',
      target: 'themis' as JusticeStage,
    },
    {
      num: '02',
      key: 'themis',
      label: language === 'tj' ? 'БЕҒАРАЗӢ' : language === 'en' ? 'IMPARTIALITY' : 'БЕСПРИСТРАСТНОСТЬ',
      desc: language === 'tj' ? 'Фемида' : language === 'en' ? 'Themis' : 'Фемида',
      target: 'themis' as JusticeStage,
    },
    {
      num: '03',
      key: 'scales',
      label: language === 'tj' ? 'МУВОЗИНАТ' : language === 'en' ? 'BALANCE' : 'БАЛАНС',
      desc: language === 'tj' ? 'Тарозуи адолат' : language === 'en' ? 'Scales' : 'Весы',
      target: 'scales' as JusticeStage,
    },
    {
      num: '04',
      key: 'hammer',
      label: language === 'tj' ? 'ҚАРОР' : language === 'en' ? 'DECISION' : 'РЕШЕНИЕ',
      desc: language === 'tj' ? 'Гурзи судӣ' : language === 'en' ? 'Gavel' : 'Молот',
      target: 'hammer' as JusticeStage,
    },
    {
      num: '05',
      key: 'act',
      label: language === 'tj' ? 'САНАДИ СУДӢ' : language === 'en' ? 'JUDICIAL ACT' : 'СУДЕБНЫЙ АКТ',
      desc: language === 'tj' ? 'Пойгоҳи санадҳо' : language === 'en' ? 'Acts Registry' : 'База актов',
      isAct: true,
      target: 'hammer' as JusticeStage,
    },
  ];

  return (
    <div className="w-full pt-6 border-t border-white/10 select-none">
      <div className="flex items-center justify-between font-mono text-[10px] text-[#dfbe7e] uppercase tracking-widest mb-4">
        <span>[ {language === 'tj' ? 'МАСИРИ АДОЛАТИ СУДӢ' : language === 'en' ? 'THE PATH OF JUSTICE' : 'ПУТЬ ПРАВОСУДИЯ'} ]</span>
        <span className="text-white/40">01 ➔ 05</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
        {steps.map((s) => {
          const isActive =
            (s.target === activeStage && !s.isAct) ||
            (s.key === 'law' && activeStage === 'themis');

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                if (s.isAct) {
                  onOpenActs();
                } else {
                  onSelectStage(s.target);
                }
              }}
              className={`
                relative p-3 rounded-xl border text-left transition-all duration-300 group
                ${
                  isActive
                    ? 'border-[#dfbe7e] bg-[#dfbe7e]/15 shadow-[0_0_15px_rgba(223,190,126,0.3)] scale-102'
                    : 'border-white/10 bg-[#060b18]/60 hover:border-[#dfbe7e]/50 hover:bg-[#060b18]'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[9px] text-[#dfbe7e] font-bold">
                  {s.num}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfbe7e] opacity-60 group-hover:opacity-100" />
              </div>

              <h5 className="font-serif font-bold text-xs text-white leading-tight mb-0.5 truncate">
                {s.label}
              </h5>
              <span className="text-[10px] text-white/50 font-mono block truncate">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
