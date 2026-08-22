import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Scale, Eye, Sparkles, Gavel } from 'lucide-react';
import { Reveal } from '../Reveal';
import { useLanguage } from '../../context/LanguageContext';
import { DigitalDataRain } from '../effects/DigitalDataRain';
import { JusticeStoryNavigator, JusticeStage } from '../symbols/JusticeStoryNavigator';
import { JusticeStoryTimeline } from '../symbols/JusticeStoryTimeline';
import { JudicialActPreview } from '../symbols/JudicialActPreview';
import { JusticeScene3D } from '../symbols/JusticeScene3D';

interface Section03DigitalJusticeProps {
  onOpenActs: () => void;
}

export const Section03DigitalJustice: React.FC<Section03DigitalJusticeProps> = ({
  onOpenActs,
}) => {
  const { language, t } = useLanguage();
  const [activeStage, setActiveStage] = useState<JusticeStage>('themis');
  
  // 3D Scene states
  const [isInsightMode, setIsInsightMode] = useState(false);
  const [balanceState, setBalanceState] = useState<'neutral' | 'law' | 'justice' | 'restored'>('neutral');
  const [triggerStrike, setTriggerStrike] = useState(false);
  
  const [decisionRecorded, setDecisionRecorded] = useState(false);

  // Auto reset states on stage change
  useEffect(() => {
    setIsInsightMode(false);
    setBalanceState('neutral');
    setTriggerStrike(false);
    if (activeStage !== 'hammer') setDecisionRecorded(false);
  }, [activeStage]);

  const handleDecisionTriggered = () => {
    setTriggerStrike(true);
    setTimeout(() => {
      setDecisionRecorded(true);
      setTriggerStrike(false);
    }, 800);
  };

  const handleTilt = (side: 'law' | 'justice') => {
    setBalanceState(side);
  };

  const handleResetEquilibrium = () => {
    setBalanceState('restored');
    setTimeout(() => setBalanceState('neutral'), 2500);
    if (activeStage === 'scales') {
       // optional side effect for timeline
       setDecisionRecorded(true); 
    }
  };

  return (
    <section
      id="digital-justice"
      aria-label={t('nav.digitalJustice')}
      className="relative py-20 sm:py-28 px-5 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30 bg-[#030712] transition-colors duration-700"
    >
      <DigitalDataRain density="sparse" speed="slow" opacity={0.15} colorTheme="cyan" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <Reveal delay={50}>
          <div className="flex items-center justify-between font-mono text-xs text-theme-textSec mb-4">
            <div className="flex items-center gap-3">
              <span className="tracking-widest text-theme-gold font-semibold">( 03 )</span>
              <span className="text-theme-textMuted">[ 003 / 007 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-1" />
              <span className="text-[10px] text-theme-textMuted tracking-wider uppercase">
                {language === 'tj' ? 'АДОЛАТИ РАҚАМӢ' : language === 'en' ? 'DIGITAL JUSTICE' : 'ЦИФРОВОЕ ПРАВОСУДИЕ'}
              </span>
            </div>
          </div>
        </Reveal>

        <div className="max-w-3xl mb-10">
          <Reveal delay={150}>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight uppercase mb-3 text-white">
              {language === 'tj' ? 'АДОЛАТ АЗ ' : language === 'en' ? 'JUSTICE BEGINS WITH ' : 'ПРАВОСУДИЕ НАЧИНАЕТСЯ С '}
              <span className="italic font-light text-[#dfbe7e]">
                {language === 'tj' ? 'ҚОНУН' : language === 'en' ? 'THE LAW' : 'ЗАКОНА'}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={250}>
            <p className="text-sm sm:text-base leading-relaxed text-white/70 font-serif max-w-2xl">
              {language === 'tj'
                ? 'Се рамзи калидии адолати судӣ — беғаразӣ, мувозинат ва қабули қатъии қарор — дар низоми рақамии судии Ҷумҳурии Тоҷикистон таҷассум ёфтаанд.'
                : language === 'en'
                ? 'Three foundational pillars of judicial authority — impartiality, balance, and finality of judgment — form the living architecture of the Republic of Tajikistan’s legal system.'
                : 'Три фундаментальных символа правосудия — беспристрастность, баланс и окончательность судебного решения — воплощены в цифровой экосистеме судебной власти.'}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* LEFT: Controls */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Reveal delay={300}>
              <div className="p-4 rounded-xl border border-white/10 bg-[#060b18]/80 backdrop-blur-md">
                <span className="font-mono text-[10px] text-[#dfbe7e] uppercase tracking-widest block font-bold mb-1">
                  [ 01 / 03 STAGES ]
                </span>
                <p className="text-xs text-white/60 font-serif leading-relaxed">
                  {language === 'tj'
                    ? 'Барои омӯхтани ҳар як рамзи мустақили судӣ марҳилаи заруриро интихоб кунед.'
                    : language === 'en'
                    ? 'Select an artifact to examine its role in the judicial decision-making process.'
                    : 'Выберите артефакт для изучения этапов отправления правосудия.'}
                </p>
              </div>
            </Reveal>
            <Reveal delay={350}>
              <JusticeStoryNavigator
                activeStage={activeStage}
                onSelectStage={setActiveStage}
              />
            </Reveal>
          </div>

          {/* CENTER: Shared 3D Environment */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[500px] relative">
            <Reveal delay={200} className="w-full h-full absolute inset-0">
              <div className="w-full h-full relative rounded-2xl overflow-hidden border border-[#dfbe7e]/20 bg-[#02050e] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <JusticeScene3D 
                  activeStage={activeStage}
                  isInsightMode={isInsightMode}
                  balanceState={balanceState === 'neutral' || balanceState === 'restored' ? null : balanceState}
                  triggerStrike={triggerStrike}
                />
                
                {/* Overlay UI Controls */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
                  {/* Themis Controls */}
                  {activeStage === 'themis' && (
                    <button
                      type="button"
                      onClick={() => setIsInsightMode(prev => !prev)}
                      className={`pointer-events-auto px-4 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 backdrop-blur-md ${
                        isInsightMode
                          ? 'border-[#dfbe7e] bg-[#dfbe7e]/20 text-[#ffe082] shadow-[0_0_15px_rgba(223,190,126,0.4)]'
                          : 'border-white/15 bg-[#060b18]/80 text-white/75 hover:border-[#dfbe7e]/60 hover:text-white'
                      }`}
                    >
                      {isInsightMode ? <Sparkles size={14} className="text-[#dfbe7e] animate-spin" /> : <Eye size={14} />}
                      <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">
                        {isInsightMode
                          ? language === 'tj' ? 'РЕҶАИ БЕҒАРАЗӢ ФАЪОЛ' : language === 'en' ? 'INSIGHT MODE ACTIVE' : 'РЕЖИМ БЕСПРИСТРАСТНОСТИ'
                          : language === 'tj' ? 'БАРОИ ИНСАЙТ ЗЕР КУНЕД' : language === 'en' ? 'EXPLORE IMPARTIALITY' : 'ИССЛЕДОВАТЬ БЕСПРИСТРАСТНОСТЬ'}
                      </span>
                    </button>
                  )}
                  
                  {/* Scales Controls */}
                  {activeStage === 'scales' && (
                    <div className="pointer-events-auto flex items-center gap-3">
                      <button type="button" onClick={() => handleTilt('law')} className={`px-4 py-2 rounded-lg border text-xs font-serif font-bold transition-all ${balanceState === 'law' ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]' : 'border-white/10 bg-[#060b18]/80 text-white/70 hover:border-[#dfbe7e]'}`}>
                        {language === 'tj' ? 'ҚОНУН' : language === 'en' ? 'LAW' : 'ЗАКОН'}
                      </button>
                      <button type="button" onClick={handleResetEquilibrium} className={`px-5 py-2 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${balanceState === 'restored' ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-[#dfbe7e] bg-[#dfbe7e]/15 text-[#ffe082] hover:bg-[#dfbe7e]/30'}`}>
                        <Scale size={14} />
                        <span>{balanceState === 'restored' ? 'BALANCE RESTORED' : 'RESTORE BALANCE'}</span>
                      </button>
                      <button type="button" onClick={() => handleTilt('justice')} className={`px-4 py-2 rounded-lg border text-xs font-serif font-bold transition-all ${balanceState === 'justice' ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'border-white/10 bg-[#060b18]/80 text-white/70 hover:border-[#dfbe7e]'}`}>
                        {language === 'tj' ? 'АДОЛАТ' : language === 'en' ? 'JUSTICE' : 'ПРАВО'}
                      </button>
                    </div>
                  )}

                  {/* Hammer Controls */}
                  {activeStage === 'hammer' && (
                    <button
                      type="button"
                      onClick={handleDecisionTriggered}
                      className="pointer-events-auto px-6 py-2.5 rounded-full border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold"
                    >
                      <Gavel size={16} />
                      <span>{language === 'tj' ? 'ҚАРОР БАРОРЕД' : language === 'en' ? 'DELIVER DECISION' : 'ВЫНЕСТИ РЕШЕНИЕ'}</span>
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: Context Panel */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <Reveal delay={300}>
              <div className="p-5 rounded-2xl border border-white/10 bg-[#060b18]/90 backdrop-blur-xl shadow-xl">
                <span className="font-mono text-[10px] text-[#dfbe7e] uppercase tracking-widest block font-bold mb-2">
                  {activeStage === 'themis'
                    ? language === 'tj' ? 'ПРИНСИПИ БЕҒАРАЗӢ' : language === 'en' ? 'PRINCIPLE OF IMPARTIALITY' : 'ПРИНЦИП БЕСПРИСТРАСТНОСТИ'
                    : activeStage === 'scales'
                    ? language === 'tj' ? 'МУВОЗИНАТИ ҚОНУН ВА ҲУҚУҚ' : language === 'en' ? 'BALANCE OF LAW & RIGHTS' : 'БАЛАНС ЗАКОНА И ПРАВ'
                    : language === 'tj' ? 'ҚОНУНИЯТ ВА САНАДИ СУДӢ' : language === 'en' ? 'AUTHORITY OF JUDGMENT' : 'ЗАКОННАЯ СИЛА РЕШЕНИЯ'}
                </span>

                <h3 className="font-serif font-bold text-lg text-white leading-tight mb-2">
                  {activeStage === 'themis'
                    ? language === 'tj' ? 'Баробарии ҳама дар назди қонун ва суд' : language === 'en' ? 'Equality of all before the law and court' : 'Равенство всех перед законом и судом'
                    : activeStage === 'scales'
                    ? language === 'tj' ? 'Мувозинати дақиқи манфиатҳо ва адолат' : language === 'en' ? 'Exact balance of interests and justice' : 'Точное равновесие интересов и справедливости'
                    : language === 'tj' ? 'Қабули қарор дар асоси далелҳои қонунӣ' : language === 'en' ? 'Decision rendered on statutory evidence' : 'Решение на основе закона и доказательств'}
                </h3>

                <p className="text-xs text-white/70 font-serif leading-relaxed mb-4">
                  {activeStage === 'themis'
                    ? language === 'tj' ? 'Судя дар фаъолияти худ мустақил буда, танҳо ба Конститутсия ва қонун итоат мекунад.' : language === 'en' ? 'Judges are independent in their decisions and subject only to the Constitution and statutory law.' : 'Решение суда должно основываться исключительно на законе, а не на субъективных суждениях или стороннем влиянии.'
                    : activeStage === 'scales'
                    ? language === 'tj' ? 'Тарозу рамзи таҳлили мутавозини далелҳои ҳар ду ҷониби мурофиаи судӣ мебошад.' : language === 'en' ? 'The scales represent balanced weight and impartial scrutiny of both parties in legal proceedings.' : 'Весы символизируют взвешенную оценку доказательств сторон для достижения подлинной справедливости.'
                    : language === 'tj' ? 'Ҳар як қарори судӣ бо гурз сабт гардида, пас аз эътибор пайдо кардан дар махзани ягона нашр мешавад.' : language === 'en' ? 'Each judicial decision finalized by gavel impact is recorded into the unified public acts database.' : 'Каждое решение суда, закрепленное молотом правосудия, вносится в общедоступный банк судебных актов.'}
                </p>

                <button
                  type="button"
                  onClick={onOpenActs}
                  className="w-full py-2 px-3 rounded-lg border border-[#dfbe7e]/50 bg-[#dfbe7e]/10 hover:bg-[#dfbe7e]/20 text-[#ffe082] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between transition-all"
                >
                  <span>{t('digitalJustice.ctaActs')}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </Reveal>

            {decisionRecorded && (
              <Reveal delay={100}>
                <JudicialActPreview onOpenActs={onOpenActs} />
              </Reveal>
            )}
          </div>
        </div>

        <Reveal delay={400}>
          <JusticeStoryTimeline
            activeStage={activeStage}
            onSelectStage={(st) => {
              setActiveStage(st);
              if (st !== 'hammer') setDecisionRecorded(false);
            }}
            onOpenActs={onOpenActs}
          />
        </Reveal>
      </div>
    </section>
  );
};
