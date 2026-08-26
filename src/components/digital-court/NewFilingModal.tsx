import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface NewFilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewFilingModal: React.FC<NewFilingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    court: 'supreme',
    category: 'civil',
    claimSum: '',
    claimTitle: '',
    claimDesc: '',
    plaintiffName: '',
    plaintiffId: '',
    plaintiffPhone: '',
    defendantName: '',
    defendantAddress: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseNum, setSubmittedCaseNum] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep((prev) => (prev + 1) as any);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generated = `01-${Math.floor(1000 + Math.random() * 9000)}/26`;
      setSubmittedCaseNum(generated);
      setIsSubmitting(false);
      setStep(4);
      if (onSuccess) onSuccess();
    }, 1500);
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
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl border border-theme-border bg-theme-bg shadow-2xl flex flex-col overflow-hidden text-theme-text"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-theme-border bg-theme-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-theme-text">
                {language === 'tj' ? 'Пешниҳоди электронии ариза' : language === 'en' ? 'Electronic Claim Filing' : 'Подача электронного заявления'}
              </h3>
              <p className="text-xs text-theme-textMuted font-mono">
                {language === 'tj' ? 'Қадам ба қадам бо санҷиши ЭЦП' : language === 'en' ? 'Multi-step e-filing with PKI verification' : 'Пошаговый мастер подачи иска в суд'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-textMuted hover:text-theme-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="px-6 py-3 border-b border-theme-border/60 bg-theme-surface/30 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className={`py-1 rounded-lg ${step === 1 ? 'bg-theme-gold text-black font-bold' : step > 1 ? 'text-theme-gold' : 'text-theme-textMuted'}`}>
              1. {language === 'tj' ? 'Интихоби суд' : language === 'en' ? 'Court Selection' : 'Выбор суда'}
            </div>
            <div className={`py-1 rounded-lg ${step === 2 ? 'bg-theme-gold text-black font-bold' : step > 2 ? 'text-theme-gold' : 'text-theme-textMuted'}`}>
              2. {language === 'tj' ? 'Иштирокчиён' : language === 'en' ? 'Litigants' : 'Стороны'}
            </div>
            <div className={`py-1 rounded-lg ${step === 3 ? 'bg-theme-gold text-black font-bold' : 'text-theme-textMuted'}`}>
              3. {language === 'tj' ? 'Ҳуҷҷатҳо ва ЭЦП' : language === 'en' ? 'E-Sign' : 'ЭЦП и отправка'}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-theme-textMuted uppercase mb-1.5">
                  {language === 'tj' ? 'Мақомоти судӣ' : language === 'en' ? 'Target Court' : 'Судебный орган'}
                </label>
                <select
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs focus:outline-none focus:border-theme-gold"
                >
                  <option value="supreme">Суди Олии Ҷумҳурии Тоҷикистон (Верховный суд)</option>
                  <option value="economic">Суди Олии иқтисодии ҶТ (Высший экономический суд)</option>
                  <option value="dushanbe">Суди шаҳри Душанбе (Суд города Душанбе)</option>
                  <option value="somoni">Суди ноҳияи Исмоили Сомонии ш. Душанбе</option>
                  <option value="sino">Суди ноҳияи Синои ш. Душанбе</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-theme-textMuted uppercase mb-1.5">
                  {language === 'tj' ? 'Намуди мурофиа' : language === 'en' ? 'Proceedings Category' : 'Вид судопроизводства'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs focus:outline-none focus:border-theme-gold"
                >
                  <option value="civil">Гражданское (Мурофиаи гражданӣ)</option>
                  <option value="economic">Экономическое (Баҳсҳои иқтисодӣ)</option>
                  <option value="family">Семейное (Муносибатҳои оилавӣ)</option>
                  <option value="admin">Административное (Мурофиаи маъмурӣ)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-theme-textMuted uppercase mb-1.5">
                  {language === 'tj' ? 'Мавзӯи даъво' : language === 'en' ? 'Claim Title' : 'Предмет исковых требований'}
                </label>
                <input
                  type="text"
                  value={formData.claimTitle}
                  onChange={(e) => setFormData({ ...formData, claimTitle: e.target.value })}
                  placeholder={language === 'tj' ? 'Масалан: Рӯёнидани қарзи шартномавӣ' : 'Например: Взыскание задолженности по договору'}
                  className="w-full h-11 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs focus:outline-none focus:border-theme-gold"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-theme-textMuted uppercase mb-1.5">
                  {language === 'tj' ? 'Маблағи даъво (бо сомонӣ)' : language === 'en' ? 'Claim Amount (TJS)' : 'Сумма иска (в сомони)'}
                </label>
                <input
                  type="number"
                  value={formData.claimSum}
                  onChange={(e) => setFormData({ ...formData, claimSum: e.target.value })}
                  placeholder="25000"
                  className="w-full h-11 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs focus:outline-none focus:border-theme-gold"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/50 space-y-3">
                <span className="font-mono text-xs text-sky-400 font-bold block uppercase">
                  {language === 'tj' ? 'Маълумот оид ба Даъвогар' : language === 'en' ? 'Plaintiff Information' : 'Сведения об Истце'}
                </span>
                <input
                  type="text"
                  placeholder="Ф.И.О. или Наименование организации"
                  value={formData.plaintiffName}
                  onChange={(e) => setFormData({ ...formData, plaintiffName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs"
                />
                <input
                  type="text"
                  placeholder="ИНН / ПИНФЛ заявителя"
                  value={formData.plaintiffId}
                  onChange={(e) => setFormData({ ...formData, plaintiffId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs"
                />
              </div>

              <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/50 space-y-3">
                <span className="font-mono text-xs text-amber-400 font-bold block uppercase">
                  {language === 'tj' ? 'Маълумот оид ба Ҷавобгар' : language === 'en' ? 'Defendant Information' : 'Сведения об Ответчике'}
                </span>
                <input
                  type="text"
                  placeholder="Ф.И.О. или Наименование ответчика"
                  value={formData.defendantName}
                  onChange={(e) => setFormData({ ...formData, defendantName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs"
                />
                <input
                  type="text"
                  placeholder="Адрес местонахождения / регистрации"
                  value={formData.defendantAddress}
                  onChange={(e) => setFormData({ ...formData, defendantAddress: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-theme-border bg-theme-surface/40 text-center">
                <UploadCloud size={32} className="text-theme-gold mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-theme-text">Исковое_заявление_подписанное.pdf</h4>
                <span className="font-mono text-[10px] text-emerald-400">PDF/A • Ready for Submission</span>
              </div>

              <div className="p-4 rounded-2xl border border-theme-gold/30 bg-theme-gold/5 flex items-center gap-3">
                <ShieldCheck size={24} className="text-theme-gold shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-theme-text">Электронная цифровая подпись (ЭЦП)</div>
                  <div className="text-[11px] text-theme-textSec">Сертификат заявителя проверен в Национальном удостоверяющем центре.</div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-theme-text">
                {language === 'tj' ? 'Ариза бомуваффақият қабул шуд!' : language === 'en' ? 'Claim Successfully Submitted!' : 'Исковое заявление успешно зарегистрировано!'}
              </h3>
              <div className="font-mono text-sm p-3 rounded-2xl bg-theme-surface border border-theme-border inline-block text-theme-gold font-bold">
                УИН ДЕЛА: {submittedCaseNum}
              </div>
              <p className="text-xs text-theme-textSec max-w-md mx-auto">
                {language === 'tj'
                  ? 'Парванда ба таври худкор ба судяи дахлдор вобаста карда мешавад. Огоҳинома дар бораи таъини маҷлис ба почта ва кабинети шахсӣ фиристода мешавад.'
                  : language === 'en'
                  ? 'Case is automatically routed for judge assignment. Hearing notification will be dispatched to your account.'
                  : 'Дело автоматически направлено на распределение состава суда. Оповещение о назначении заседания поступит в ваш личный кабинет.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-surface/60 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn-outline text-xs"
            >
              <ArrowLeft size={13} />
              <span>{language === 'tj' ? 'Қафо' : language === 'en' ? 'Back' : 'Назад'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              <span>{isSubmitting ? 'Отправка...' : step === 3 ? (language === 'tj' ? 'Ирсол ба суд' : language === 'en' ? 'Submit to Court' : 'Подписать и отправить') : (language === 'tj' ? 'Давом додан' : language === 'en' ? 'Next' : 'Далее')}</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn-primary text-xs w-full"
            >
              {language === 'tj' ? 'Ба кабинети парванда' : language === 'en' ? 'Go to Workspace' : 'Перейти в кабинет дела'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
