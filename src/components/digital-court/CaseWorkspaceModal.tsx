import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  FileText, 
  Clock, 
  Calendar, 
  Users, 
  CreditCard, 
  History, 
  ShieldCheck, 
  Download, 
  Eye, 
  Video, 
  QrCode, 
  Building, 
  UserCheck, 
  FileCheck2,
  Lock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CaseRecord } from './CaseSearchEngine';

interface CaseWorkspaceModalProps {
  caseData: CaseRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

type WorkspaceTab = 'overview' | 'documents' | 'hearings' | 'notifications' | 'parties' | 'payments' | 'history';

export const CaseWorkspaceModal: React.FC<CaseWorkspaceModalProps> = ({
  caseData,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [selectedDocTitle, setSelectedDocTitle] = useState('');

  if (!isOpen || !caseData) return null;

  const tabs: { id: WorkspaceTab; nameTj: string; nameRu: string; nameEn: string; icon: React.ElementType }[] = [
    { id: 'overview', nameTj: 'Шарҳ', nameRu: 'Обзор', nameEn: 'Overview', icon: Clock },
    { id: 'documents', nameTj: 'Ҳуҷҷатҳо', nameRu: 'Документы', nameEn: 'Documents', icon: FileText },
    { id: 'hearings', nameTj: 'Маҷлисҳо', nameRu: 'Заседания', nameEn: 'Hearings', icon: Calendar },
    { id: 'notifications', nameTj: 'Огоҳиномаҳо', nameRu: 'Уведомления', nameEn: 'Notices', icon: ShieldCheck },
    { id: 'parties', nameTj: 'Иштирокчиён', nameRu: 'Участники', nameEn: 'Parties', icon: Users },
    { id: 'payments', nameTj: 'Пардохтҳо', nameRu: 'Платежи', nameEn: 'Payments', icon: CreditCard },
    { id: 'history', nameTj: 'Таърих', nameRu: 'История', nameEn: 'Audit Log', icon: History },
  ];

  const getTabLabel = (tab: (typeof tabs)[0]) => {
    if (language === 'tj') return tab.nameTj;
    if (language === 'en') return tab.nameEn;
    return tab.nameRu;
  };

  const handleOpenPdf = (title: string) => {
    setSelectedDocTitle(title);
    setPdfPreviewOpen(true);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 backdrop-blur-md bg-black/75 transition-opacity duration-300 pointer-events-auto"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-5xl h-[88vh] rounded-3xl border border-theme-border bg-theme-bg shadow-2xl flex flex-col overflow-hidden text-theme-text"
      >
        {/* Workspace Top Header */}
        <div className="px-6 py-5 border-b border-theme-border bg-theme-surface/60 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-base sm:text-lg font-bold px-3 py-1 rounded-xl bg-theme-bg border border-theme-border text-theme-gold">
              {caseData.caseNumber}
            </span>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {language === 'tj' ? caseData.statusTj : language === 'en' ? caseData.statusEn : caseData.statusRu}
            </span>
            <span className="font-mono text-xs text-theme-textMuted hidden sm:inline">
              {caseData.registrationDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-textMuted hover:text-theme-text hover:bg-theme-surfaceHover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Case Meta Subheader */}
        <div className="px-6 py-3.5 bg-theme-bg/80 border-b border-theme-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-theme-textSec">
            <span className="flex items-center gap-1.5">
              <Building size={14} className="text-theme-gold" />
              <span className="font-medium text-theme-text">{language === 'tj' ? caseData.courtTj : language === 'en' ? caseData.courtEn : caseData.courtRu}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck size={14} className="text-theme-gold" />
              <span>{language === 'tj' ? `Судя: ${caseData.judgeTj}` : language === 'en' ? `Judge: ${caseData.judgeEn}` : `Судья: ${caseData.judgeRu}`}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-theme-gold bg-theme-gold/10 px-3 py-1 rounded-lg border border-theme-gold/20">
            <span>{language === 'tj' ? 'Амали наздиктарин: 15.09.2026' : language === 'en' ? 'Next event: 15.09.2026' : 'Ближайшее событие: 15.09.2026'}</span>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 border-b border-theme-border bg-theme-surface/30 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-mono font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-theme-gold text-theme-gold font-bold bg-theme-gold/5'
                    : 'border-transparent text-theme-textMuted hover:text-theme-text hover:border-theme-border'
                }`}
              >
                <Icon size={14} />
                <span>{getTabLabel(tab)}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-theme-bg/50">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-theme-border bg-theme-surface/70 p-5">
                <h4 className="font-mono text-xs uppercase text-theme-gold tracking-wider mb-2">
                  {language === 'tj' ? 'МОҲИЯТИ ДАЪВО' : language === 'en' ? 'CASE SUMMARY' : 'СУТЬ ИСКОВЫХ ТРЕБОВАНИЙ'}
                </h4>
                <p className="text-sm text-theme-text leading-relaxed">
                  {language === 'tj' ? caseData.summaryTj : language === 'en' ? caseData.summaryEn : caseData.summaryRu}
                </p>
                <div className="mt-3 pt-3 border-t border-theme-border/40 text-xs text-theme-textSec">
                  {language === 'tj' ? caseData.partiesTj : language === 'en' ? caseData.partiesEn : caseData.partiesRu}
                </div>
              </div>

              {/* Complete Stage Timeline */}
              <div className="rounded-2xl border border-theme-border bg-theme-surface/70 p-5">
                <h4 className="font-mono text-xs uppercase text-theme-gold tracking-wider mb-4">
                  {language === 'tj' ? 'ХОДИ РАВАНДИ МУРОФИАВӢ' : language === 'en' ? 'PROCEDURAL TIMELINE' : 'ПРОЦЕССУАЛЬНЫЙ ТАЙМЛАЙН'}
                </h4>

                <div className="relative pl-6 border-l-2 border-theme-gold/40 space-y-6">
                  {/* Event 1 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-theme-bg" />
                    <div className="flex items-center justify-between text-xs font-mono text-theme-textMuted mb-1">
                      <span className="text-emerald-400 font-bold">12.02.2026 • 10:14</span>
                      <span>E-FILING #74921</span>
                    </div>
                    <p className="text-xs text-theme-text font-medium">
                      {language === 'tj' ? 'Аризаи даъвогӣ дар портали sud.tj ба қайд гирифта шуд' : language === 'en' ? 'Lawsuit petition registered in e-Court portal' : 'Исковое заявление зарегистрировано в системе «Электронный суд»'}
                    </p>
                  </div>

                  {/* Event 2 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-theme-bg" />
                    <div className="flex items-center justify-between text-xs font-mono text-theme-textMuted mb-1">
                      <span className="text-emerald-400 font-bold">14.02.2026 • 16:30</span>
                      <span>AUTO-ASSIGNMENT</span>
                    </div>
                    <p className="text-xs text-theme-text font-medium">
                      {language === 'tj' ? `Тақсимоти худкор ба судя: ${caseData.judgeTj}` : language === 'en' ? `Auto-assigned to judge: ${caseData.judgeEn}` : `Автораспределение дела судье: ${caseData.judgeRu}`}
                    </p>
                  </div>

                  {/* Event 3 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-theme-gold border-2 border-theme-bg animate-ping" />
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-theme-gold border-2 border-theme-bg" />
                    <div className="flex items-center justify-between text-xs font-mono text-theme-gold mb-1">
                      <span className="font-bold">15.09.2026 • 10:00</span>
                      <span>SCHEDULED SESSION</span>
                    </div>
                    <p className="text-xs text-theme-text font-medium">
                      {language === 'tj' ? 'Маҷлиси ошкорои судӣ дар толори № 4 (ва пайвастшавӣ тавассути ВКС)' : language === 'en' ? 'Open court hearing in Hall #4 (with Video-Conference option)' : 'Открытое судебное заседание в зале № 4 (и защищенная видеосвязь ВКС)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              {[
                { title: 'Исковое заявление с приложениями (PDF/A)', size: '2.4 MB', date: '12.02.2026', status: 'SIGNED_VERIFIED', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
                { title: 'Определение о принятии к производству', size: '640 KB', date: '14.02.2026', status: 'ISSUED_BY_COURT', hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4' },
                { title: 'Отзыв ответчика на исковое заявление', size: '1.8 MB', date: '28.02.2026', status: 'SUBMITTED', hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb' },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-theme-border bg-theme-surface/70 hover:bg-theme-surfaceHover flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-theme-bg border border-theme-border text-theme-gold">
                      <FileCheck2 size={20} />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-semibold text-theme-text">{doc.title}</h5>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-theme-textMuted mt-0.5">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Lock size={10} /> {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPdf(doc.title)}
                      className="btn-outline text-xs px-3 py-1.5"
                    >
                      <Eye size={13} />
                      <span>{language === 'tj' ? 'Дидан' : language === 'en' ? 'Preview' : 'Просмотр'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPdf(doc.title)}
                      className="btn-outline text-xs px-3 py-1.5"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hearings' && (
            <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface/70 text-center">
              <Calendar size={32} className="text-theme-gold mx-auto mb-3" />
              <h4 className="text-base font-semibold text-theme-text mb-1">
                {language === 'tj' ? 'Маҷлиси таъиншуда: 15.09.2026, 10:00' : language === 'en' ? 'Scheduled Hearing: 15.09.2026, 10:00' : 'Назначенное заседание: 15.09.2026, 10:00'}
              </h4>
              <p className="text-xs text-theme-textSec mb-4 max-w-md mx-auto">
                {language === 'tj'
                  ? 'Маҷлис дар бинои суди марказӣ, толори 4 сурат мегирад. Шумо метавонед тавассути ҳуҷраи маҷозии ВКС онлайн иштирок намоед.'
                  : language === 'en'
                  ? 'Session will be held in Hall #4. Verified participants can also join via remote encrypted video link.'
                  : 'Заседание состоится в зале № 4. Стороны могут подключиться к защищенному видеопротоколу суда.'}
              </p>
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Video size={14} />
                <span>{language === 'tj' ? 'Пайвастшавӣ ба ВКС' : language === 'en' ? 'Join Video Trial' : 'Подключиться к ВКС'}</span>
              </button>
            </div>
          )}

          {activeTab === 'parties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/70">
                <span className="font-mono text-[10px] uppercase text-sky-400 font-bold block mb-1">
                  {language === 'tj' ? 'ДАЪВОГАР' : language === 'en' ? 'PLAINTIFF' : 'ИСТЕЦ'}
                </span>
                <h5 className="text-sm font-semibold text-theme-text">ООО «Сомон Строй»</h5>
                <p className="text-xs text-theme-textSec mt-1">ИНН: 020048191 • Представитель по доверенности: Адвокат Хакимов Р.</p>
              </div>

              <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/70">
                <span className="font-mono text-[10px] uppercase text-amber-400 font-bold block mb-1">
                  {language === 'tj' ? 'ҶАВОБГАР' : language === 'en' ? 'DEFENDANT' : 'ОТВЕТЧИК'}
                </span>
                <h5 className="text-sm font-semibold text-theme-text">ОАО «Таджикгидро»</h5>
                <p className="text-xs text-theme-textSec mt-1">ИНН: 010023412 • Юридический департамент</p>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'payments' || activeTab === 'history') && (
            <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface/70 font-mono text-xs text-theme-textSec space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-theme-border/40">
                <span className="text-theme-text">SHA-256 System Event Integrity Verification</span>
                <span className="text-emerald-400 font-bold">100% VALID</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-theme-border/40">
                <span>Timestamp Authority (TSA): National Judicial PKI</span>
                <span className="text-theme-gold">RFC 3161</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Payment State Duty: 80 TJS</span>
                <span className="text-emerald-400">PAID & SETTLED</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-surface/60 flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-2 text-theme-textMuted">
            <QrCode size={14} className="text-theme-gold" />
            <span>CASE LEDGER: {caseData.id.toUpperCase()}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline text-xs px-4 py-1.5"
          >
            {language === 'tj' ? 'Пӯшидан' : language === 'en' ? 'Close' : 'Закрыть'}
          </button>
        </div>
      </motion.div>

      {/* Embedded PDF Viewer Modal Simulator */}
      {pdfPreviewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-3xl border border-theme-border bg-theme-bg p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-theme-gold" />
                <h5 className="text-sm font-semibold text-theme-text">{selectedDocTitle}</h5>
              </div>
              <button
                type="button"
                onClick={() => setPdfPreviewOpen(false)}
                className="p-1.5 rounded-lg bg-theme-surface text-theme-textMuted hover:text-theme-text"
              >
                <X size={16} />
              </button>
            </div>

            {/* Document sheet view */}
            <div className="flex-1 bg-white text-slate-900 rounded-xl p-8 overflow-y-auto font-serif text-xs leading-relaxed shadow-inner">
              <div className="text-center font-bold uppercase tracking-wider mb-6 text-sm">
                СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН<br />
                <span className="text-[10px] font-sans font-normal text-slate-500">ВЕРХОВНЫЙ СУД РЕСПУБЛИКИ ТАДЖИКИСТАН</span>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-600 mb-6">
                Парвандаи № {caseData.caseNumber}<br />
                Сана: {caseData.registrationDate}
              </div>
              <p className="mb-4">
                <strong>САНАДИ СУДӢ ОИД БА ПАРВАНДАИ РАҚАМИИ № {caseData.caseNumber}</strong>
              </p>
              <p className="mb-4">
                Дар рафти баррасии парвандаи судӣ тибқи тартиби пешбининамудаи Кодекси мурофиавии граждании Ҷумҳурии Тоҷикистон, талаботҳои даъвогӣ ва ваҷҳҳои пешниҳодгардида мавриди омӯзиш қарор дода шуданд.
              </p>
              <div className="mt-12 pt-6 border-t border-slate-300 flex items-center justify-between font-sans text-[10px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={24} className="text-blue-800" />
                  <div>
                    <div className="font-bold text-blue-900">ИМЗОИ РАҚАМИИ ЭЛЕКТРОНӢ</div>
                    <div className="text-slate-500">Шаҳодатнома: 0481-9921-AF • Суди Олӣ</div>
                  </div>
                </div>
                <div className="font-mono text-slate-500">
                  QR-VERIFIED // SUD.TJ
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPdfPreviewOpen(false)}
                className="btn-primary text-xs"
              >
                {language === 'tj' ? 'Фаҳмо' : language === 'en' ? 'Done' : 'Закрыть просмотр'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
