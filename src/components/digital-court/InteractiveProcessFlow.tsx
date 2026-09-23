import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Binary, 
  Scale, 
  Gavel, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  QrCode, 
  Cpu, 
  Sparkles,
  Lock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ProcessStep {
  id: string;
  stepNum: string;
  icon: React.ElementType;
  titleKey: string;
  subKey: string;
  detailKey: string;
  statusBadge: string;
  techDetail: string;
}

export const InteractiveProcessFlow: React.FC = () => {
  const { language } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const steps: ProcessStep[] = [
    {
      id: 'doc',
      stepNum: '01',
      icon: FileText,
      titleKey: language === 'tj' ? 'Пешниҳоди ариза' : language === 'en' ? 'Digital Filing' : 'Подача документа',
      subKey: language === 'tj' ? 'ЭЦП ва боргузории PDF' : language === 'en' ? 'E-Sign & PDF Validation' : 'ЭЦП и валидация PDF',
      detailKey: language === 'tj' 
        ? 'Ариза ва ҳуҷҷатҳо бо имзои электронии рақамӣ дар формати ҳимояшуда ворид мегарданд.' 
        : language === 'en' 
        ? 'Lawsuits and petitions are cryptographically signed using national e-signature PKI.' 
        : 'Электронное исковое заявление подписывается усиленной квалифицированной ЭЦП.',
      statusBadge: '256-BIT ENCRYPTION',
      techDetail: 'SHA-256 Hash • PDF/A-2b Standard',
    },
    {
      id: 'reg',
      stepNum: '02',
      icon: Binary,
      titleKey: language === 'tj' ? 'Бақайдгирии автоматӣ' : language === 'en' ? 'Instant Registration' : 'Регистрация и хэш',
      subKey: language === 'tj' ? 'Таъини рақами ягона' : language === 'en' ? 'Universal Case ID' : 'Присвоение УИН дела',
      detailKey: language === 'tj' 
        ? 'Ба парванда штрих-код ва рақами ягонаи электронӣ дода шуда, дар феҳрист қайд мешавад.' 
        : language === 'en' 
        ? 'System assigns an immutable Case ID and generates cryptographic tamper-proof ledger record.' 
        : 'Делу присваивается уникальный номер (напр. 02-481/26) с фиксацией точного времени.',
      statusBadge: 'LEDGER RECORDED',
      techDetail: 'Timestamp TS-RFC3161 • Auto-Index',
    },
    {
      id: 'court',
      stepNum: '03',
      icon: Cpu,
      titleKey: language === 'tj' ? 'Тақсимоти беғаразона' : language === 'en' ? 'Smart Assignment' : 'Автораспределение',
      subKey: language === 'tj' ? 'Интихоби автоматии судя' : language === 'en' ? 'Algorithmic Judge Routing' : 'Выбор состава суда',
      detailKey: language === 'tj' 
        ? 'Алгоритми шаффоф парвандаро ба судя бо назардошти сарборӣ ва ихтисос вобаста менамояд.' 
        : language === 'en' 
        ? 'Case is automatically routed to judges via impartial workload-balancing algorithm.' 
        : 'Автоматизированный модуль исключает человеческий фактор при назначении судьи.',
      statusBadge: 'ALGORITHMIC BALANCE',
      techDetail: 'Zero Bias • Workload Balancing',
    },
    {
      id: 'hearing',
      stepNum: '04',
      icon: Scale,
      titleKey: language === 'tj' ? 'Баррасии судӣ' : language === 'en' ? 'Hearing & Trial' : 'Судебный процесс',
      subKey: language === 'tj' ? 'ВКС ва протоколи рақамӣ' : language === 'en' ? 'Video Trial & E-Protocol' : 'ВКС и аудио-видеозапись',
      detailKey: language === 'tj' 
        ? 'Маҷлиси судӣ бо истифодаи алоқаи видеоӣ ва протоколсозии худкор сурат мегирад.' 
        : language === 'en' 
        ? 'Remote court hearings via secure video streaming and automated live audio/text protocol.' 
        : 'Заседание в зале или онлайн через защищенную ВКС с синхронным аудио-видео протоколом.',
      statusBadge: 'REAL-TIME PROT',
      techDetail: '4K Secure Stream • Live Audio-Log',
    },
    {
      id: 'verdict',
      stepNum: '05',
      icon: Gavel,
      titleKey: language === 'tj' ? 'Санади ниҳоӣ' : language === 'en' ? 'Digital Verdict' : 'Судебный акт с QR',
      subKey: language === 'tj' ? 'Қувваи қонунӣ ва QR' : language === 'en' ? 'Legal Force & QR Check' : 'Законная сила и реестр',
      detailKey: language === 'tj'
        ? 'Қарори судӣ ба бонки умумии санадҳои судӣ ворид мегардад (санҷиши QR баъди ҷорӣ шудани backend верификатсия).'
        : language === 'en'
        ? 'Judicial act is published to the public portal repository (QR verification arrives with the verification backend).'
        : 'Судебный акт публикуется в банке судебных актов (QR-проверка появится вместе с backend верификации).',
      statusBadge: language === 'tj' ? 'ДАР ФЕҲРИСТ' : language === 'en' ? 'IN REGISTRY' : 'В РЕЕСТРЕ',
      techDetail: 'Digital Watermark • Public Portal API',
    },
  ];

  // Auto-step progression
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  return (
    <div 
      className="relative rounded-2xl border border-theme-border/60 bg-theme-surface/75 backdrop-blur-xl p-5 sm:p-6 md:p-7 shadow-theme-card overflow-hidden select-none transition-all duration-300 hover:border-theme-borderHover"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Decorative Glow Spots */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-theme-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Top Header info */}
      <div className="flex items-center justify-between border-b border-theme-border/40 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-xs tracking-wider uppercase text-theme-text font-semibold flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-theme-gold" />
            {language === 'tj' ? 'РАВАНДИ РАҚАМИИ СУДӢ' : language === 'en' ? 'DIGITAL JUSTICE PIPELINE' : 'ЦИФРОВОЙ СУДЕБНЫЙ ПРОЦЕСС'}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-theme-textMuted">
          <span
            title={
              language === 'tj'
                ? 'Намоиши консептуалӣ, на низоми фаъол'
                : language === 'en'
                ? 'Conceptual demo, not a live system'
                : 'Концептуальное демо, а не действующая система'
            }
            className="px-2 py-0.5 rounded-full border border-theme-gold/40 text-theme-gold text-[10px] uppercase tracking-wider"
          >
            Demo
          </span>
          <span>{steps[activeStep].stepNum} / 05</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline text-theme-gold">{steps[activeStep].statusBadge}</span>
        </div>
      </div>

      {/* Step Buttons Chain */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          const isPassed = idx < activeStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                setActiveStep(idx);
                setIsAutoPlaying(false);
              }}
              className={`group relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl transition-all duration-300 text-center ${
                isActive
                  ? 'bg-theme-gold text-black shadow-lg shadow-theme-gold/20 scale-[1.03]'
                  : isPassed
                  ? 'bg-theme-bg/80 border border-theme-gold/40 text-theme-gold'
                  : 'bg-theme-bg/40 border border-theme-border/40 text-theme-textMuted hover:border-theme-borderHover hover:text-theme-text'
              }`}
            >
              <div className="mb-1">
                {isPassed ? (
                  <CheckCircle2 size={16} className="text-theme-gold" />
                ) : (
                  <Icon size={16} className={isActive ? 'text-black' : ''} />
                )}
              </div>
              <span className="font-mono text-[10px] font-bold tracking-wider">
                {step.stepNum}
              </span>
              <span className={`text-[9px] truncate max-w-full hidden md:block mt-0.5 ${isActive ? 'text-black font-semibold' : 'text-theme-textMuted'}`}>
                {step.titleKey.split(' ')[0]}
              </span>

              {/* Active Step Underline Indicator */}
              {isActive && (
                <motion.div
                  layoutId="step-indicator"
                  className="absolute -bottom-1 left-2 right-2 h-0.5 bg-black rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-theme-border/60 bg-theme-bg/60 p-4 sm:p-5 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
                {React.createElement(steps[activeStep].icon, { size: 22 })}
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-theme-text flex items-center gap-2">
                  <span>{steps[activeStep].titleKey}</span>
                  <Sparkles size={14} className="text-theme-gold" />
                </h4>
                <p className="text-xs text-theme-gold font-mono">
                  {steps[activeStep].subKey}
                </p>
              </div>
            </div>
            
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-full border border-theme-border bg-theme-surface text-theme-textMuted">
                <Lock size={10} className="text-theme-gold" />
                <span>{steps[activeStep].techDetail}</span>
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-theme-textSec leading-relaxed mb-4">
            {steps[activeStep].detailKey}
          </p>

          {/* Micro-flow visual footer */}
          <div className="pt-3 border-t border-theme-border/40 flex items-center justify-between text-[11px] font-mono text-theme-textMuted">
            <span className="flex items-center gap-1.5 text-theme-text">
              <QrCode size={13} className="text-theme-gold" />
              <span>SUD.TJ // DIGITAL REPOSITORY</span>
            </span>
            <div className="flex items-center gap-1 text-theme-gold">
              <span>{language === 'tj' ? 'Қадами навбатӣ' : language === 'en' ? 'Next step' : 'Следующий этап'}</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
