import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Eye, Scale, Gavel } from 'lucide-react';

export type JusticeStage = 'themis' | 'scales' | 'hammer';

interface JusticeStoryNavigatorProps {
  activeStage: JusticeStage;
  onSelectStage: (stage: JusticeStage) => void;
}

export const JusticeStoryNavigator: React.FC<JusticeStoryNavigatorProps> = ({
  activeStage,
  onSelectStage,
}) => {
  const { language } = useLanguage();

  const stages: { id: JusticeStage; number: string; title: string; subtitle: string; icon: any }[] = [
    {
      id: 'themis',
      number: '01',
      title: language === 'tj' ? 'ФЕМИДА' : language === 'en' ? 'THEMIS' : 'ФЕМИДА',
      subtitle: language === 'tj' ? 'БЕҒАРАЗӢ' : language === 'en' ? 'IMPARTIALITY' : 'БЕСПРИСТРАСТНОСТЬ',
      icon: Eye,
    },
    {
      id: 'scales',
      number: '02',
      title: language === 'tj' ? 'ТАРОЗУ' : language === 'en' ? 'SCALES' : 'ВЕСЫ',
      subtitle: language === 'tj' ? 'МУВОЗИНАТ' : language === 'en' ? 'BALANCE' : 'БАЛАНС',
      icon: Scale,
    },
    {
      id: 'hammer',
      number: '03',
      title: language === 'tj' ? 'ГУРЗИ СУДӢ' : language === 'en' ? 'GAVEL' : 'МОЛОТ',
      subtitle: language === 'tj' ? 'ҚАРОРИ СУДӢ' : language === 'en' ? 'DECISION' : 'РЕШЕНИЕ',
      icon: Gavel,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label={language === 'tj' ? 'Марҳилаҳои адолат' : language === 'en' ? 'Stages of Justice' : 'Стадии правосудия'}
      className="flex flex-col gap-2.5 w-full select-none"
    >
      {stages.map((st) => {
        const Icon = st.icon;
        const isActive = activeStage === st.id;

        return (
          <button
            key={st.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectStage(st.id)}
            className={`
              relative w-full p-4 rounded-xl text-left border transition-all duration-300
              flex items-center justify-between group
              ${
                isActive
                  ? 'border-[#dfbe7e] bg-[#dfbe7e]/15 text-white shadow-[0_0_20px_rgba(223,190,126,0.3)] scale-102'
                  : 'border-white/10 bg-[#060b18]/70 text-white/70 hover:border-[#dfbe7e]/50 hover:bg-[#060b18] hover:text-white'
              }
            `}
          >
            {/* Active Left Indicator Bar */}
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#dfbe7e] shadow-[0_0_8px_#dfbe7e]" />
            )}

            <div className="flex items-center gap-3.5 pl-1.5">
              <div
                className={`
                  p-2 rounded-lg border transition-colors
                  ${
                    isActive
                      ? 'border-[#dfbe7e]/80 bg-[#dfbe7e]/20 text-[#ffe082]'
                      : 'border-white/10 bg-white/5 text-white/50 group-hover:text-white'
                  }
                `}
              >
                <Icon size={16} />
              </div>

              <div>
                <div className="font-mono text-[9px] text-[#dfbe7e] uppercase tracking-widest leading-none mb-1 font-bold">
                  {st.number} {st.subtitle}
                </div>
                <h4 className="font-serif font-bold text-sm text-white leading-none tracking-wide">
                  {st.title}
                </h4>
              </div>
            </div>

            <div className="font-mono text-[10px] text-white/40 group-hover:text-[#dfbe7e] transition-colors">
              ➔
            </div>
          </button>
        );
      })}
    </div>
  );
};
