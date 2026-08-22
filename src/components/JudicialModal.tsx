import React, { useEffect, useState } from 'react';
import {
  X,
  FileText,
  Search,
  Building2,
  Users,
  Send,
  Calendar,
  Shield,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  ExternalLink,
  Newspaper,
  FileDown,
  Clock,
} from 'lucide-react';
import {
  REGIONAL_COURTS,
  REGIONS,
  JUDICIAL_ACTS,
  HEARINGS_SCHEDULE,
  PRESS_NEWS,
  SAMPLE_DOCUMENTS,
} from '../data/sudTjData';
import { useLanguage } from '../context/LanguageContext';
import { StateDutyCalculator } from './calculator/StateDutyCalculator';

import { CourtNodeData } from '../data/sudTjData';

export type ModalTab =
  | 'about'
  | 'acts'
  | 'courts'
  | 'hearings'
  | 'news'
  | 'docs'
  | 'esud'
  | 'appeals'
  | 'duties'
  | 'contacts';

interface JudicialModalProps {
  isOpen: boolean;
  activeTab: ModalTab;
  courtContext?: CourtNodeData | null;
  onClose: () => void;
  onSelectTab: (tab: ModalTab) => void;
}

export const JudicialModal: React.FC<JudicialModalProps> = ({
  isOpen,
  activeTab,
  courtContext,
  onClose,
  onSelectTab,
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(courtContext?.shortNameRu || '');
  const [selectedCollegium, setSelectedCollegium] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [downloadedDocId, setDownloadedDocId] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Removed old calculateStateDuty since we use StateDutyCalculator


  const handleSimulateDownload = (docId: string) => {
    setDownloadedDocId(docId);
    setTimeout(() => setDownloadedDocId(null), 3000);
  };

  if (!isOpen) return null;

  // Filter Judicial Acts
  const filteredActs = JUDICIAL_ACTS.filter((act) => {
    const matchesCol = selectedCollegium === 'all' || act.collegium === selectedCollegium;
    const title = language === 'en' ? (act.titleEn || act.titleRu) : language === 'tj' ? act.titleTj : act.titleRu;
    const matchesSearch =
      searchQuery.trim() === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCol && matchesSearch;
  });

  // Filter Regional Courts
  const filteredCourts = REGIONAL_COURTS.filter((court) => {
    const matchesRegion = selectedRegion === 'all' || court.regionId === selectedRegion;
    const name = language === 'en' ? (court.nameEn || court.nameRu) : language === 'tj' ? court.nameTj : court.nameRu;
    const matchesSearch =
      searchQuery.trim() === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Filter Hearings
  const filteredHearings = HEARINGS_SCHEDULE.filter((h) => {
    const court = language === 'en' ? (h.courtEn || h.courtRu) : language === 'tj' ? h.courtTj : h.courtRu;
    const cat = language === 'en' ? (h.categoryEn || h.categoryRu) : language === 'tj' ? h.categoryTj : h.categoryRu;
    const parties = language === 'en' ? (h.partiesEn || h.partiesRu) : language === 'tj' ? h.partiesTj : h.partiesRu;
    const matchesSearch =
      searchQuery.trim() === '' ||
      court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parties.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 backdrop-blur-md bg-black/70 transition-opacity duration-300 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-theme-bgSec border border-theme-border rounded-2xl shadow-2xl overflow-hidden text-theme-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-surface">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-theme-gold" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-theme-textMuted uppercase tracking-widest block">
                  {language === 'en' ? 'SUD.TJ SYSTEM' : language === 'tj' ? 'Низоми иттилоотии sud.tj' : 'Информационная система sud.tj'}
                </span>
                {courtContext && (
                  <span className="font-mono text-[10px] text-amber-400 font-bold px-2 py-0.2 rounded bg-amber-500/10 border border-amber-400/30 uppercase truncate max-w-xs">
                    {courtContext.nameRu}
                  </span>
                )}
              </div>
              <h2 id="modal-title" className="font-mono text-sm sm:text-base font-medium tracking-tight text-theme-text">
                {t('contacts.title1')} {t('contacts.title2')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.close')}
            className="p-1.5 rounded-lg text-theme-textMuted hover:text-theme-text hover:bg-theme-surface transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-gold"
          >
            <X size={18} />
          </button>
        </div>

        {/* Horizontal Navigation Tab Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-6 py-2 border-b border-theme-border overflow-x-auto bg-theme-bg text-xs font-mono scrollbar-none">
          {[
            { id: 'about', labelRu: 'О суде', labelTj: 'Маълумот', labelEn: 'About Court' },
            { id: 'courts', labelRu: 'Суды РТ', labelTj: 'Судҳои ҷумҳурӣ', labelEn: 'Court Network' },
            { id: 'hearings', labelRu: 'Заседания', labelTj: 'Рӯйхати парвандаҳо', labelEn: 'Hearings' },
            { id: 'acts', labelRu: 'Судебные акты', labelTj: 'Санадҳо', labelEn: 'Judicial Acts' },
            { id: 'duties', labelRu: 'Госпошлина', labelTj: 'Боҷи давлатӣ', labelEn: 'State Duty' },
            { id: 'news', labelRu: 'Пресс-центр', labelTj: 'Матбуот', labelEn: 'Press Center' },
            { id: 'docs', labelRu: 'Бланки', labelTj: 'Ҳуҷҷатҳои намунавӣ', labelEn: 'Templates' },
            { id: 'esud', labelRu: 'Электронный суд', labelTj: 'Суди электронӣ', labelEn: 'E-Court' },
            { id: 'appeals', labelRu: 'Обращения', labelTj: 'Муроҷиат', labelEn: 'Appeals' },
            { id: 'contacts', labelRu: 'Контакты', labelTj: 'Тамос', labelEn: 'Contacts' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id as ModalTab)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-theme-gold text-black font-bold shadow-sm'
                  : 'text-theme-textSec hover:text-theme-text hover:bg-theme-surface'
              }`}
            >
              {language === 'en' ? tab.labelEn : language === 'tj' ? tab.labelTj : tab.labelRu}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-theme-textSec font-sans leading-relaxed scrollbar-thin">
          
          {/* TAB: Duties */}
          {activeTab === 'duties' && (
            <div className="space-y-4">
              <StateDutyCalculator language={language} />
            </div>
          )}
          
          {/* TAB 1: About */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Constitutional Status' : language === 'tj' ? 'Мақоми конститутсионӣ' : 'Конституционный статус'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {t('mission.title1')} {t('mission.title2')}
                </h3>
              </div>

              <p className="text-theme-text leading-relaxed">
                {t('hero.description')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-theme-text font-mono text-xs uppercase tracking-wider">
                    <Building2 size={16} className="text-theme-gold" />
                    <span>{language === 'en' ? 'Plenum & Presidium' : language === 'tj' ? 'Пленум ва Раёсат' : 'Пленум & Президиум'}</span>
                  </div>
                  <p className="text-xs text-theme-textSec">
                    {language === 'en'
                      ? 'Unification of judicial practice, binding interpretations of the law, and supervisory review.'
                      : language === 'tj'
                      ? 'Ҷамъбасти амалияи судӣ, додани тавзеҳот ва баррасии қарорҳо бо тартиби назоратӣ.'
                      : 'Обобщение практики, руководящие разъяснения по применению законов и пересмотр судебных решений.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-theme-text font-mono text-xs uppercase tracking-wider">
                    <Users size={16} className="text-cyan-400" />
                    <span>{language === 'en' ? '5 Collegiums' : language === 'tj' ? '5 Коллегия' : '5 Коллегий'}</span>
                  </div>
                  <p className="text-xs text-theme-textSec">
                    {language === 'en'
                      ? 'Civil, family, criminal, administrative, and military collegiums.'
                      : language === 'tj'
                      ? 'Коллегияҳои маданӣ, оилавӣ, ҷиноятӣ, маъмурӣ ва Коллегияи ҳарбӣ.'
                      : 'Коллегии по гражданским, семейным, уголовным, административным делам и Военная коллегия.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-theme-text font-mono text-xs uppercase tracking-wider">
                    <Shield size={16} className="text-emerald-400" />
                    <span>{language === 'en' ? 'Judicial Training Center' : language === 'tj' ? 'Маркази таълимии судяҳо' : 'Учебный центр судей'}</span>
                  </div>
                  <p className="text-xs text-theme-textSec">
                    {language === 'en'
                      ? 'Professional development and training for judges and court administrative personnel.'
                      : language === 'tj'
                      ? 'Баланд бардоштани тахассуси судяҳо ва кормандони дастгоҳи судҳои Ҷумҳурии Тоҷикистон.'
                      : 'Повышение квалификации судей и работников аппаратов судов Республики Таджикистан.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Courts */}
          {activeTab === 'courts' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-textMuted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('network.searchPlaceholder')}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold font-mono transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedRegion('all')}
                    className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                      selectedRegion === 'all'
                        ? 'border-theme-text bg-theme-text text-theme-bg font-semibold'
                        : 'border-theme-border text-theme-textSec hover:text-theme-text'
                    }`}
                  >
                    {t('network.allRegions')}
                  </button>
                  {REGIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRegion(r.id)}
                      className={`px-2.5 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                        selectedRegion === r.id
                          ? 'border-theme-gold bg-theme-gold/20 text-theme-text font-semibold'
                          : 'border-theme-border text-theme-textSec hover:text-theme-text'
                      }`}
                    >
                      {language === 'en' ? (r.nameRu) : language === 'tj' ? r.nameTj : r.nameRu}
                    </button>
                  ))}
                </div>
              </div>

              {/* Courts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {filteredCourts.map((court) => (
                  <a
                    key={court.domain}
                    href={court.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-theme-textMuted mb-1">
                        <span className="uppercase">{court.regionId}</span>
                        <ExternalLink size={12} className="group-hover:text-theme-gold transition-colors" />
                      </div>
                      <h4 className="text-xs font-medium text-theme-text group-hover:text-theme-gold">
                        {language === 'en' ? (court.nameEn || court.nameRu) : language === 'tj' ? court.nameTj : court.nameRu}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-theme-border font-mono text-[10px] text-theme-textMuted group-hover:text-theme-gold">
                      {court.domain}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Hearings */}
          {activeTab === 'hearings' && (
            <div className="space-y-5">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Open Court Proceedings' : language === 'tj' ? 'Мурофиаи кушодаи судӣ' : 'Открытое судопроизводство'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'Schedule of Scheduled Hearings' : language === 'tj' ? 'Рӯйхати парвандаҳои баррасишаванда' : 'Список дел, назначенных к слушанию'}
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {filteredHearings.map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all font-mono text-xs shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border pb-2 mb-2 text-theme-textMuted">
                      <span className="font-semibold text-theme-text">{h.id}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {h.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {h.time}
                        </span>
                        <span className="text-theme-gold">{h.room}</span>
                      </div>
                    </div>

                    <div className="text-theme-text text-sm font-sans font-medium mb-1">
                      {language === 'en' ? (h.categoryEn || h.categoryRu) : language === 'tj' ? h.categoryTj : h.categoryRu}
                    </div>
                    <div className="text-theme-textSec text-xs font-sans mb-2">
                      {language === 'en' ? (h.partiesEn || h.partiesRu) : language === 'tj' ? h.partiesTj : h.partiesRu}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-theme-textMuted">
                      <span>{language === 'en' ? (h.courtEn || h.courtRu) : language === 'tj' ? h.courtTj : h.courtRu}</span>
                      <span className="text-theme-text">{language === 'en' ? `Judge: ${h.judgeRu}` : language === 'tj' ? `Судя: ${h.judgeTj}` : `Судья: ${h.judgeRu}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Acts */}
          {activeTab === 'acts' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-textMuted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('acts.searchActs')}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold font-mono transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono scrollbar-none">
                  {[
                    { id: 'all', ru: 'Все', tj: 'Ҳама', en: 'All' },
                    { id: 'civil', ru: 'Гражданские', tj: 'Маданӣ', en: 'Civil' },
                    { id: 'family', ru: 'Семейные', tj: 'Оилавӣ', en: 'Family' },
                    { id: 'criminal', ru: 'Уголовные', tj: 'Ҷиноятӣ', en: 'Criminal' },
                    { id: 'admin', ru: 'Административные', tj: 'Маъмурӣ', en: 'Admin' },
                    { id: 'military', ru: 'Военные', tj: 'Ҳарбӣ', en: 'Military' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCollegium(c.id)}
                      className={`px-2.5 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                        selectedCollegium === c.id
                          ? 'border-theme-gold bg-theme-gold/20 text-theme-text font-semibold'
                          : 'border-theme-border text-theme-textSec hover:text-theme-text'
                      }`}
                    >
                      {language === 'en' ? c.en : language === 'tj' ? c.tj : c.ru}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {filteredActs.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-theme-textMuted mb-1.5">
                      <span className="text-theme-gold font-semibold">
                        {act.id}
                      </span>
                      <span>{act.date}</span>
                    </div>
                    <h4 className="text-sm text-theme-text font-medium mb-2 group-hover:text-theme-gold font-sans">
                      {language === 'en' ? (act.titleEn || act.titleRu) : language === 'tj' ? act.titleTj : act.titleRu}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-theme-textSec font-mono">
                      <span className="text-[11px] text-theme-textMuted">
                        {language === 'en' ? (act.collegiumNameEn || act.collegiumNameRu) : language === 'tj' ? act.collegiumNameTj : act.collegiumNameRu}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 size={12} />
                        {t('acts.inForce')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: News */}
          {activeTab === 'news' && (
            <div className="space-y-5">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {t('contacts.pressTitle')}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'News & Publications of the Supreme Court' : language === 'tj' ? 'Хабарҳо ва нашрияҳои Суди Олӣ' : 'Новости и публикации Верховного суда'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {PRESS_NEWS.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-theme-textMuted mb-2">
                        <span className="flex items-center gap-1.5 text-theme-gold">
                          <Newspaper size={12} />
                          <span>{item.source}</span>
                        </span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="text-sm font-medium text-theme-text mb-2 leading-snug">
                        {language === 'en' ? (item.titleEn || item.titleRu) : language === 'tj' ? item.titleTj : item.titleRu}
                      </h4>
                      <p className="text-xs text-theme-textSec leading-relaxed">
                        {language === 'en' ? (item.summaryEn || item.summaryRu) : language === 'tj' ? item.summaryTj : item.summaryRu}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Docs / Templates */}
          {activeTab === 'docs' && (
            <div className="space-y-5">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {t('appeals.docsTitle')}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'Procedural Claims & Document Templates' : language === 'tj' ? 'Ҳуҷҷатҳои намунавӣ ва аризаҳо' : 'Образцы процессуальных заявлений и бланков'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {SAMPLE_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-theme-textMuted mb-1.5">
                        <span className="text-theme-gold">{language === 'en' ? (doc.categoryEn || doc.categoryRu) : language === 'tj' ? doc.categoryTj : doc.categoryRu}</span>
                        <span>{doc.format} • {doc.size}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-theme-text mb-2">
                        {language === 'en' ? (doc.titleEn || doc.titleRu) : language === 'tj' ? doc.titleTj : doc.titleRu}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-theme-border flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSimulateDownload(doc.id)}
                        className="font-mono text-xs px-3 py-1.5 rounded-lg border border-theme-border hover:bg-theme-gold hover:text-black transition-colors flex items-center gap-1.5"
                      >
                        {downloadedDocId === doc.id ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-400" />
                            <span>{language === 'en' ? 'Downloaded' : language === 'tj' ? 'Боргирӣ шуд' : 'Скачано'}</span>
                          </>
                        ) : (
                          <>
                            <FileDown size={13} />
                            <span>{language === 'en' ? 'Download' : language === 'tj' ? 'Боргирӣ' : 'Скачать бланк'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: E-Sud */}
          {activeTab === 'esud' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {t('eservices.badge')}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {t('eservices.title1')} {t('eservices.title2')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border shadow-xs">
                  <div className="font-mono text-xs text-theme-text font-medium mb-1.5 flex items-center gap-2">
                    <FileText size={15} className="text-cyan-400" />
                    <span>01. {language === 'en' ? 'Claim Filing' : language === 'tj' ? 'Пешниҳоди даъво' : 'Подача иска'}</span>
                  </div>
                  <p className="text-xs text-theme-textSec">
                    {t('eservices.service1Desc')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border shadow-xs">
                  <div className="font-mono text-xs text-theme-text font-medium mb-1.5 flex items-center gap-2">
                    <Search size={15} className="text-theme-gold" />
                    <span>02. {language === 'en' ? 'Case Tracking' : language === 'tj' ? 'Пайгирии парванда' : 'Трекинг дела'}</span>
                  </div>
                  <p className="text-xs text-theme-textSec">
                    {t('eservices.service2Desc')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border shadow-xs">
                  <div className="font-mono text-xs text-theme-text font-medium mb-1.5 flex items-center gap-2">
                    <Shield size={15} className="text-emerald-400" />
                    <span>03. {language === 'en' ? 'Personal Cabinet' : language === 'tj' ? 'Утоқи шахсӣ' : 'Личный кабинет'}</span>
                  </div>
                  <p className="text-xs text-theme-textSec">
                    {language === 'en'
                      ? 'Secure digital dashboard for case rulings, transcripts, and notifications.'
                      : language === 'tj'
                      ? 'Дастрасӣ ба нусхаҳои электронии ҳалномаҳо ва санадҳои судӣ.'
                      : 'Доступ к электронным копиям решений, аудиопротоколам и судебным извещениям.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Appeals & State Duty */}
          {activeTab === 'appeals' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {t('appeals.badge')}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {t('appeals.receptionTitle')}
                </h3>
              </div>

              {/* Calculator */}
              <div className="w-full">
                <StateDutyCalculator language={language} />
              </div>

              {/* Appeal Form */}
              <div className="p-5 rounded-xl bg-theme-surface border border-theme-border space-y-4 shadow-xs">
                <div className="flex items-center gap-2 font-mono text-xs text-theme-text uppercase tracking-wider">
                  <Send size={16} className="text-theme-gold" />
                  <span>{t('appeals.ctaSubmitAppeal')}</span>
                </div>

                {appealSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                    {t('appeals.successMessage')}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAppealSubmitted(true);
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        required
                        type="text"
                        placeholder={t('appeals.fullName')}
                        className="bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text font-mono placeholder-theme-textMuted focus:outline-none focus:border-theme-gold"
                      />
                      <input
                        required
                        type="tel"
                        placeholder={t('appeals.phone')}
                        className="bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text font-mono placeholder-theme-textMuted focus:outline-none focus:border-theme-gold"
                      />
                    </div>
                    <textarea
                      required
                      rows={3}
                      placeholder={t('appeals.appealText')}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text font-mono placeholder-theme-textMuted focus:outline-none focus:border-theme-gold"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-theme-gold text-black px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold hover:shadow-theme-glow transition-all"
                    >
                      {t('appeals.send')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: Contacts */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {t('contacts.badge')}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {t('contacts.title1')} {t('contacts.title2')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 font-mono text-xs text-theme-text uppercase tracking-wider">
                    <Calendar size={16} className="text-theme-gold" />
                    <span>{language === 'en' ? 'Reception Schedule' : language === 'tj' ? 'Қабули шахсии шаҳрвандон' : 'Личный приём граждан'}</span>
                  </div>
                  <div className="space-y-2 text-xs text-theme-textSec">
                    <div className="flex justify-between border-b border-theme-border pb-1">
                      <span>{language === 'en' ? 'Chief Justice' : language === 'tj' ? 'Раиси Суди Олӣ' : 'Председатель Верховного суда'}</span>
                      <span className="font-mono text-theme-text">Вторник / Душанбе 09:00–12:00</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-theme-surface border border-theme-border space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 font-mono text-xs text-theme-text uppercase tracking-wider">
                    <MapPin size={16} className="text-cyan-400" />
                    <span>{t('nav.contacts')}</span>
                  </div>
                  <div className="space-y-2 text-xs text-theme-textSec">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-theme-textMuted shrink-0 mt-0.5" />
                      <span>{t('contacts.legalAddressValue')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-theme-textMuted shrink-0" />
                      <span className="font-mono">+992 (37) 233-14-15</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-theme-textMuted shrink-0" />
                      <span className="font-mono">info@sud.tj</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info strip */}
        <div className="px-6 py-3 border-t border-theme-border bg-theme-surface flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-theme-textMuted gap-2">
          <span>{t('contacts.copyright')} • SUD.TJ</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};
