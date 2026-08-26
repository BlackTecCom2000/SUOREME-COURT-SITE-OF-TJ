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
                  ? 'border-theme-gold bg-theme-gold/15 text-theme-text shadow-[0_0_20px_rgba(223,190,126,0.3)] scale-102'
                  : 'border-theme-border bg-theme-surface/80 text-theme-textSec hover:border-theme-gold/60 hover:bg-theme-surface hover:text-theme-text'
              }
            `}
          >
            {/* Active Left Indicator Bar */}
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-theme-gold shadow-[0_0_8px_var(--accent-gold)]" />
            )}

            <div className="flex items-center gap-3.5 pl-1.5">
              <div
                className={`
                  p-2 rounded-lg border transition-colors
                  ${
                    isActive
                      ? 'border-theme-gold/80 bg-theme-gold/20 text-theme-gold'
                      : 'border-theme-border bg-theme-bg/60 text-theme-textMuted group-hover:text-theme-text'
                  }
                `}
              >
                <Icon size={16} />
              </div>

              <div>
                <div className="font-mono text-[9px] text-theme-gold uppercase tracking-widest leading-none mb-1 font-bold">
                  {st.number} {st.subtitle}
                </div>
                <h4 className="font-serif font-bold text-sm text-theme-text leading-none tracking-wide">
                  {st.title}
                </h4>
              </div>
            </div>

            <div className="font-mono text-[10px] text-theme-textMuted group-hover:text-theme-gold transition-colors">
              ➔
            </div>
          </button>
        );
      })}
    </div>
  );
};
