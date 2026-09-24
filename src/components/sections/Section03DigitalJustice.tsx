import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  BookOpen, 
  ShieldCheck, 
  X
} from 'lucide-react';
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
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  return (
    <section
      id="digital-justice"
      aria-label={t('nav.digitalJustice')}
      className="relative py-14 lg:py-28 px-4 sm:px-8 md:px-12 text-theme-text overflow-hidden border-t border-theme-border/30 transition-colors duration-700 select-none"
    >
      <DigitalDataRain density="sparse" speed="slow" opacity={0.12} colorTheme="cyan" />

      <div className="site-container relative z-10 space-y-6">
        
        {/* Section Top Header Indicator */}
        <Reveal delay={50}>
          <div className="flex items-center justify-between font-mono text-xs text-theme-textSec mb-4">
            <div className="flex items-center gap-3">
              <span className="tracking-widest text-theme-gold font-semibold">( 03 )</span>
              <span className="text-theme-textMuted">[ 003 / 007 ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-1" />
              <span className="text-[10px] text-theme-textMuted tracking-wider uppercase">
                {language === 'tj' ? 'АДОЛАТИ РАҚАМӢ ВА САНАДҲОИ СУДӢ' : language === 'en' ? 'DIGITAL JUSTICE EXPERIENCE' : 'ЦИФРОВОЕ ПРАВОСУДИЕ'}
              </span>
            </div>
            <div className="font-mono text-xs text-theme-gold hidden sm:flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>SUD.TJ // 3D JUSTICE MATRIX</span>
            </div>
          </div>
        </Reveal>

        {/* Section Title */}
        <div className="max-w-3xl mb-10">
          <Reveal delay={120}>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-semibold tracking-tight uppercase mb-3 text-theme-text">
              {language === 'tj' ? 'АДОЛАТ АЗ ' : language === 'en' ? 'JUSTICE BEGINS WITH ' : 'ПРАВОСУДИЕ НАЧИНАЕТСЯ С '}
              <span className="italic font-light text-theme-gold">
                {language === 'tj' ? 'ҚОНУН' : language === 'en' ? 'THE LAW' : 'ЗАКОНА'}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-sm sm:text-base leading-relaxed text-theme-textSec max-w-2xl">
              {language === 'tj'
                ? 'Се рамзи бунёдии адолати судӣ — беғаразӣ (Фемида), тавозуни манфиатҳо (Тарозу) ва қувваи қатъии санад (Гурзи судӣ) — дар низоми рақамии Тоҷикистон таҷассум ёфтаанд.'
                : language === 'en'
                ? 'Three foundational pillars of justice — impartiality (Themis), balance (Scales), and finality of judgment (Gavel) — form the living interactive architecture of Tajikistan’s legal system.'
                : 'Три фундаментальных символа правосудия — беспристрастность (Фемида), баланс интересов (Весы) и законная сила решения (Молот) — воплощены в цифровой экосистеме судебной власти.'}
            </p>
          </Reveal>
        </div>

        {/* Main 3-Column Unified Composition: LEFT CONTROLS ➔ CENTER 3D VIEWPORT ➔ RIGHT HISTORICAL CONTEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-12">
          
          {/* LEFT: Stage Navigator */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-5">
            <Reveal delay={250}>
              <div className="p-4 glass glass-card">
                <span className="font-mono text-[10px] text-theme-gold uppercase tracking-widest block font-bold mb-1">
                  [ 01 / 03 SYMBOLS ]
                </span>
                <p className="text-xs text-theme-textSec leading-relaxed">
                  {language === 'tj'
                    ? 'Барои омӯхтани ҳар як рамзи мустақили судӣ объекти заруриро интихоб кунед.'
                    : language === 'en'
                    ? 'Select an artifact to examine its role in the judicial decision-making process.'
                    : 'Выберите артефакт для изучения этапов отправления правосудия.'}
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <JusticeStoryNavigator
                activeStage={activeStage}
                onSelectStage={setActiveStage}
              />
            </Reveal>

            <div className="hidden lg:block p-3 glass glass-chip text-[11px] font-mono text-theme-textMuted text-center">
              <span className="text-theme-gold font-semibold">↻ ПОВЕРНИТЕ ОБЪЕКТ</span>
            </div>
          </div>

          {/* CENTER: Dedicated 3D Viewport (60-75% visual prominence) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[500px] lg:min-h-[560px] relative content-card overflow-hidden group">
            
            {/* Ambient Background Glow Spot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
              <div className="w-[85%] h-[85%] rounded-full bg-theme-gold/10 blur-3xl" />
            </div>

            {/* Visual Canvas: Majestic Pure 3D Display (Purely Visual, No Buttons) */}
            <JusticeScene3D 
              activeSymbol={activeStage}
              isInsightMode={false}
              balanceState="neutral"
              triggerStrike={false}
            />
          </div>

          {/* RIGHT: Historical & Constitutional Context Panel */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-5">
            <Reveal delay={250}>
              <div className="p-5 sm:content-card flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] text-theme-gold uppercase tracking-widest font-bold">
                      {activeStage === 'themis'
                        ? language === 'tj' ? 'ПРИНСИПИ БЕҒАРАЗӢ' : language === 'en' ? 'IMPARTIALITY' : 'БЕСПРИСТРАСТНОСТЬ'
                        : activeStage === 'scales'
                        ? language === 'tj' ? 'МУВОЗИНАТИ ҚОНУН' : language === 'en' ? 'EQUILIBRIUM' : 'РАВНОВЕСИЕ'
                        : language === 'tj' ? 'ҚУВВАИ ҚОНУНИИ САНАД' : language === 'en' ? 'LEGAL FORCE' : 'СИЛА РЕШЕНИЯ'}
                    </span>
                    <BookOpen size={14} className="text-theme-gold" />
                  </div>

                  <h3 className="font-sans font-semibold text-base sm:text-lg text-theme-text leading-snug mb-3">
                    {activeStage === 'themis'
                      ? language === 'tj' ? 'Баробарии ҳама дар назди қонун ва суд' : language === 'en' ? 'Equality of all before the law and court' : 'Равенство всех перед законом и судом'
                      : activeStage === 'scales'
                      ? language === 'tj' ? 'Мувозинати дақиқи далелҳо ва манфиатҳо' : language === 'en' ? 'Exact balance of evidence and statutory law' : 'Взвешенная оценка доказательств сторон'
                      : language === 'tj' ? 'Қабули қарори қатъӣ ва сабти он дар реестр' : language === 'en' ? 'Final verdict enforced & ledger recorded' : 'Окончательность судебного акта'}
                  </h3>

                  {/* Curated Historical Information */}
                  <div className="space-y-2.5 text-xs text-theme-textSec leading-relaxed mb-4">
                    {activeStage === 'themis' && (
                      <>
                        <p>
                          {language === 'tj'
                            ? 'Фемида дар фарҳанги ҳуқуқӣ рамзи адолат ва тафтиши беғаразона мебошад. Чашмбанди ӯ таҷассумгари баробарии комили шаҳрвандон, новобаста аз мавқеи иҷтимоӣ мебошад.'
                            : language === 'en'
                            ? 'The blindfold of Lady Justice embodies strict judicial impartiality, ensuring decisions rest solely on evidence without bias or prejudice.'
                            : 'Повязка на глазах Фемиды символизирует беспристрастность: перед лицом правосудия все равны, независимо от социального статуса и положения.'}
                        </p>
                        <p className="font-mono text-[11px] text-theme-gold">
                          Конститутсияи ҶТ // Моддаи 84
                        </p>
                      </>
                    )}

                    {activeStage === 'scales' && (
                      <>
                        <p>
                          {language === 'tj'
                            ? 'Тарозу рамзи баробарвазнии даъвоҳо ва муқоисаи ҳуҷҷатҳост. Ҳар як далели мурофиавӣ дар тарозуи адолат дақиқ ва қонунӣ баҳогузорӣ мешавад.'
                            : language === 'en'
                            ? 'The dual pans measure the statutory weight of claims versus defenses, illustrating equitable judicial scrutiny.'
                            : 'Чаши весов олицетворяют состязательность сторон и взвешенную правовую оценку каждого процессуального аргумента.'}
                        </p>
                        <p className="font-mono text-[11px] text-theme-gold">
                          Кодекси мурофиавии граждании ҶТ
                        </p>
                      </>
                    )}

                    {activeStage === 'hammer' && (
                      <>
                        <p>
                          {language === 'tj'
                            ? 'Гурзи судӣ рамзи эътибори қонунӣ пайдо кардани санад ва қатъияти қарори баровардашудаи суд мебошад, ки иҷрои он барои ҳама ҳатмист.'
                            : language === 'en'
                            ? 'The judicial gavel signals the authoritative finality of judgment, which is cryptographically sealed in the public acts registry.'
                            : 'Судейский молот символизирует законную силу вступившего в действие постановления, обязательного к исполнению на всей территории страны.'}
                        </p>
                        <p className="font-mono text-[11px] text-theme-gold">
                          Электронный реестр sud.tj/acts
                        </p>
                      </>
                    )}
                  </div>

                  {/* Button to Open Detailed Storytelling Panel */}
                  <button
                    type="button"
                    onClick={() => setStoryModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl border border-theme-gold/40 bg-theme-gold/10 hover:bg-theme-gold/20 text-theme-gold font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors mb-2.5"
                  >
                    <BookOpen size={13} />
                    <span>{language === 'tj' ? 'ТАЪРИХИ СИМВОЛ' : language === 'en' ? 'EXPLORE HISTORY' : 'УЗНАТЬ ИСТОРИЮ'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenActs}
                  className="btn-outline w-full justify-between text-xs hover:border-theme-gold hover:text-theme-gold"
                >
                  <span>{t('digitalJustice.ctaActs')}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <JudicialActPreview onOpenActs={onOpenActs} />
            </Reveal>
          </div>

        </div>

        {/* Bottom Interactive Story Path Timeline */}
        <Reveal delay={350}>
          <JusticeStoryTimeline
            activeStage={activeStage}
            onSelectStage={(st) => setActiveStage(st)}
            onOpenActs={onOpenActs}
          />
        </Reveal>

      </div>

      {/* Detailed Storytelling Modal for Artifact History */}
      <AnimatePresence>
        {storyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass glass-premium p-6 sm:p-8 text-theme-text flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-theme-border">
                <div className="flex items-center gap-2.5">
                  <BookOpen size={20} className="text-theme-gold" />
                  <h3 className="text-base sm:text-lg font-bold text-theme-text">
                    {activeStage === 'themis'
                      ? language === 'tj' ? 'Таърих ва фалсафаи Фемида' : language === 'en' ? 'History of Lady Justice (Themis)' : 'История и символика Фемиды'
                      : activeStage === 'scales'
                      ? language === 'tj' ? 'Таърихи Тарозуи Адолат' : language === 'en' ? 'History of the Scales of Justice' : 'История Весов правосудия'
                      : language === 'tj' ? 'Таърихи Гурзи судӣ' : language === 'en' ? 'History of the Judicial Gavel' : 'История судейского молота'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="p-1.5 glass glass-chip text-theme-textMuted hover:text-theme-text"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-5 space-y-4 text-xs sm:text-sm text-theme-textSec leading-relaxed">
                {activeStage === 'themis' && (
                  <>
                    <div className="p-4 glass glass-card space-y-2">
                      <h5 className="font-bold text-theme-text text-sm">1. Происхождение и развитие образа</h5>
                      <p>
                        Фемида (Темис) — древнегреческая богиня права и законного порядка. В античной традиции она олицетворяет не карательную силу, а божественный порядок, мудрость и беспристрастный суд.
                      </p>
                    </div>
                    <div className="p-4 glass glass-card space-y-2">
                      <h5 className="font-bold text-theme-text text-sm">2. Значение повязки, весов и меча</h5>
                      <p>
                        <strong>Повязка на глазах</strong> появилась в XVI веке как символ беспристрастия — судья не должен взирать на богатство, статус или влияние сторон. <strong>Весы</strong> в правой руке символизируют точное взвешивание доказательств. <strong>Меч</strong> олицетворяет силу закона и неотвратимость защиты прав человека.
                      </p>
                    </div>
                    <div className="p-4 glass glass-card space-y-2">
                      <h5 className="font-bold text-theme-text text-sm">3. Цифровая трансформация</h5>
                      <p>
                        В современной судебной системе Республики Таджикистан принципы Фемиды реализуются через объективное автоматическое распределение дел между судьями без человеческого фактора.
                      </p>
                    </div>
                  </>
                )}

                {activeStage === 'scales' && (
                  <>
                    <div className="p-4 glass glass-card space-y-2">
                      <h5 className="font-bold text-theme-text text-sm">1. Древнейший символ равновесия</h5>
                      <p>
                        Весы как символ правосудия восходят к Древнему Египту (суд Осириса) и символизируют баланс между добром и злом, виной и невиновностью, правами и обязанностями.
                      </p>
                    </div>
                    <div className="p-4 glass glass-card space-y-2">
                      <h5 className="font-bold text-theme-text text-sm">2. Состязательность и равенство сторон</h5>
                      <p>
                        В судопроизводстве две чаши весов символизируют сторону истца и сторону ответчика (обвинения и защиты). Суд взвешивает юридическую силу доводов с абсолютной математической точностью.
                      </p>
                    </div>
                  </>
                )}

                {activeStage === 'hammer' && (
                  <>
                    <div className="p-4 glass glass-card space-y-2">
                      <h5 className="font-bold text-theme-text text-sm">1. Традиция и власть судебного вердикта</h5>
                      <p>
                        Судейский молот (гавел) происходит из старинных традиций средневековых судов и собраний. Удар молота символизирует тишину в зале суда, переход от прений сторон к вынесению решения и вступление акта в законную силу.
                      </p>
                    </div>
                    <div className="p-4 glass glass-card space-y-2">
                      <h5 className="font-bold text-theme-text text-sm">2. Цифровая фиксация решения</h5>
                      <p>
                        В платформе «Электронный суд» момент вынесения решения заверяется судейской усиленной квалифицированной ЭЦП с криптографической временной меткой (TSA).
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-theme-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="btn-primary text-xs"
                >
                  {language === 'tj' ? 'Фаҳмо' : language === 'en' ? 'Understood' : 'Закрыть'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
