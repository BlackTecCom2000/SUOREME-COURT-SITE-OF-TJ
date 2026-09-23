import React from 'react';
import { 
  FolderKanban, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  CircleDot, 
  FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CaseRecord, MOCK_CASES } from './CaseSearchEngine';
import { Reveal } from '../Reveal';

interface CaseDashboardProps {
  onSelectCase: (c: CaseRecord) => void;
  onNewFiling: () => void;
}

export const CaseDashboard: React.FC<CaseDashboardProps> = ({ onSelectCase, onNewFiling }) => {
  const { language } = useLanguage();

  const myActiveCases = MOCK_CASES.slice(0, 2);

  return (
    <section id="my-cases" className="relative py-12 sm:py-16 px-4 sm:px-8 md:px-12 site-container select-none">
      <Reveal delay={50}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-theme-gold mb-2 uppercase tracking-wider">
              <FolderKanban size={14} />
              <span>
                {language === 'tj' ? 'ДЕЛАҲОИ ШАХСӢ' : language === 'en' ? 'CITIZEN WORKSPACE' : 'ЛИЧНЫЙ КАБИНЕТ'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-theme-text tracking-tight">
              {language === 'tj' ? 'Парвандаҳои ман' : language === 'en' ? 'My Cases Dashboard' : 'Мои дела в производстве'}{' '}
              <span
                title={
                  language === 'tj'
                    ? 'Маълумоти намоишӣ: кабинети шахсӣ баъди авторизатсия дастрас мешавад'
                    : language === 'en'
                      ? 'Demo data: personal workspace unlocks after sign-in'
                      : 'Демо-данные: личный кабинет станет доступен после входа'
                }
                className="align-middle ml-1 px-2 py-0.5 rounded-full border border-theme-gold/40 text-theme-gold font-mono text-[10px] uppercase tracking-widest"
              >
                Demo
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNewFiling}
              className="btn-primary"
            >
              <FileText size={14} />
              <span>{language === 'tj' ? 'Пешниҳоди аризаи нав' : language === 'en' ? 'File New Claim' : 'Подать новое заявление'}</span>
            </button>
          </div>
        </div>
      </Reveal>

      {/* Case Timeline Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myActiveCases.map((caseItem, idx) => (
          <Reveal key={caseItem.id} delay={100 + idx * 70}>
            <div className="rounded-3xl border border-theme-border/70 bg-theme-surface/80 backdrop-blur-xl p-6 sm:p-7 shadow-theme-card flex flex-col justify-between h-full hover:border-theme-borderHover transition-all duration-300">
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-theme-text bg-theme-bg px-3 py-1 rounded-xl border border-theme-border">
                      {caseItem.caseNumber}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded-full bg-theme-gold/15 text-theme-gold border border-theme-gold/30">
                      {language === 'tj' ? caseItem.categoryTj : language === 'en' ? caseItem.categoryEn : caseItem.categoryRu}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-theme-textMuted">
                    {caseItem.registrationDate}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-theme-text mb-2">
                  {language === 'tj' ? caseItem.partiesTj : language === 'en' ? caseItem.partiesEn : caseItem.partiesRu}
                </h3>

                <p className="text-xs text-theme-textSec leading-relaxed mb-6">
                  {language === 'tj' ? caseItem.summaryTj : language === 'en' ? caseItem.summaryEn : caseItem.summaryRu}
                </p>

                {/* Micro Timeline in Card */}
                <div className="rounded-2xl bg-theme-bg/60 border border-theme-border/60 p-4 mb-6">
                  <div className="text-[10px] font-mono uppercase text-theme-textMuted mb-3 flex items-center justify-between">
                    <span>{language === 'tj' ? 'ТАЪРИХИ РАВАНД' : language === 'en' ? 'CASE PROGRESS' : 'ХОД ДЕЛА'}</span>
                    <span className="text-theme-gold">
                      {language === 'tj' ? 'ҚАДАМИ 3 АЗ 4 • ДЕМО' : language === 'en' ? 'STEP 3 OF 4 • DEMO' : 'ШАГ 3 ИЗ 4 • ДЕМО'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-theme-textSec">{language === 'tj' ? 'Ариза пешниҳод шуд' : language === 'en' ? 'Claim Filed' : 'Подано в электронном виде'}</span>
                        <span className="font-mono text-[10px] text-theme-textMuted">{caseItem.registrationDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-theme-textSec">{language === 'tj' ? 'Бақайдгирӣ ва судя' : language === 'en' ? 'Registered & Assigned' : 'Зарегистрировано, назначен судья'}</span>
                        <span className="font-mono text-[10px] text-theme-textMuted">{caseItem.registrationDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <CircleDot size={15} className="text-theme-gold animate-pulse shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-theme-gold font-medium">{language === 'tj' ? 'Маҷлиси судӣ таъин гардид' : language === 'en' ? 'Hearing Scheduled' : 'Назначено судебное заседание'}</span>
                        <span className="font-mono text-[10px] text-theme-gold font-bold">{caseItem.nextHearingDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Next Action & Details */}
              <div className="pt-4 border-t border-theme-border/40 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-theme-textMuted uppercase block">
                    {language === 'tj' ? 'Амали навбатӣ' : language === 'en' ? 'Next Procedural Action' : 'Следующее действие'}
                  </span>
                  <span className="text-xs font-semibold text-theme-text flex items-center gap-1.5 mt-0.5">
                    <Calendar size={13} className="text-theme-gold" />
                    <span>{caseItem.nextHearingDate || '—'}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCase(caseItem)}
                  className="btn-outline text-xs group-hover:border-theme-gold group-hover:text-theme-gold"
                >
                  <span>{language === 'tj' ? 'Кабинети парванда' : language === 'en' ? 'Workspace' : 'Кабинет дела'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
