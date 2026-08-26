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
  GraduationCap,
  Scale,
  BookOpen,
  Award,
  ArrowUpRight
} from 'lucide-react';
import {
  REGIONAL_COURTS,
  REGIONS,
  HEARINGS_SCHEDULE,
  LEGISLATIVE_ACTS,
} from '../data/sudTjData';
import { useLanguage } from '../context/LanguageContext';
import { StateDutyCalculator } from './calculator/StateDutyCalculator';
import { SupremeCourtStructureHub } from './judicial-ecosystem/SupremeCourtStructureHub';
import { CourtNodeData } from '../data/sudTjData';

export type ModalTab =
  | 'about'
  | 'leadership'
  | 'plenum'
  | 'structure'
  | 'collegiums'
  | 'presidium'
  | 'history'
  | 'training'
  | 'reception'
  | 'legislation'
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
  const [downloadedDocId, setDownloadedDocId] = useState<number | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [acts, setActs] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingActs, setLoadingActs] = useState(false);

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

  useEffect(() => {
    if (isOpen && activeTab === 'news' && news.length === 0) {
      setLoadingNews(true);
      fetch('/api/news').then(r => r.json()).then(d => { setNews(d); setLoadingNews(false); }).catch(() => setLoadingNews(false));
    }
    if (isOpen && (activeTab === 'acts' || activeTab === 'docs') && acts.length === 0) {
      setLoadingActs(true);
      fetch('/api/judicial_acts').then(r => r.json()).then(d => { setActs(d); setLoadingActs(false); }).catch(() => setLoadingActs(false));
    }
  }, [isOpen, activeTab, news.length, acts.length]);

  const handleSimulateDownload = (docId: number) => {
    setDownloadedDocId(docId);
    setTimeout(() => setDownloadedDocId(null), 3000);
  };

  if (!isOpen) return null;

  // Filter Judicial Acts
  const filteredActs = acts.filter((act) => {
    const matchesCol = selectedCollegium === 'all' || act.category === selectedCollegium;
    const title = language === 'en' ? (act.title_en || act.title_ru) : language === 'tj' ? act.title_tj : act.title_ru;
    const matchesSearch =
      searchQuery.trim() === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(act.id).includes(searchQuery);
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
            { id: 'leadership', labelRu: 'Руководство', labelTj: 'Роҳбарият', labelEn: 'Leadership' },
            { id: 'plenum', labelRu: 'Пленум', labelTj: 'Пленум', labelEn: 'Plenum' },
            { id: 'structure', labelRu: 'Структура', labelTj: 'Сохтор', labelEn: 'Structure' },
            { id: 'collegiums', labelRu: 'Коллегии', labelTj: 'Коллегияҳо', labelEn: 'Collegiums' },
            { id: 'presidium', labelRu: 'Президиум', labelTj: 'Раёсат', labelEn: 'Presidium' },
            { id: 'history', labelRu: 'История', labelTj: 'Таърих', labelEn: 'History' },
            { id: 'training', labelRu: 'Учебный центр', labelTj: 'Маркази таълимӣ', labelEn: 'Training' },
            { id: 'reception', labelRu: 'Приём граждан', labelTj: 'Қабули шаҳрвандон', labelEn: 'Reception' },
            { id: 'legislation', labelRu: 'Законодательство', labelTj: 'Санадҳои қонунгузорӣ', labelEn: 'Legislation' },
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

          {/* TAB: Leadership */}
          {activeTab === 'leadership' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                    {language === 'en' ? 'Judicial Leadership' : language === 'tj' ? 'Ҳайати роҳбарикунанда' : 'Руководство Верховного суда'}
                  </span>
                  <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                    {language === 'en' ? 'Leadership of the Supreme Court' : language === 'tj' ? 'Роҳбарияти Суди Олӣ' : 'Руководство Верховного суда'}
                  </h3>
                </div>
                <a
                  href="/leadership"
                  className="btn-secondary text-xs px-3 py-1.5 hidden sm:inline-flex items-center gap-1.5"
                >
                  <span>{language === 'tj' ? 'Саҳифаи пурра' : language === 'en' ? 'Full Page' : 'Полная страница'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="space-y-3">
                {[
                  {
                    nameTj: 'Мирзозода Рустам Пираҳмад',
                    nameRu: 'Мирзозода Рустам Пирахмад',
                    nameEn: 'Mirzozoda Rustam Pirahmad',
                    roleTj: 'Раиси Суди Олӣ',
                    roleRu: 'Председатель Верховного суда',
                    roleEn: 'Chief Justice of the Supreme Court',
                    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
                    initials: 'МР',
                    isChief: true,
                  },
                  {
                    nameTj: 'Лутфуллозода Шавкат',
                    nameRu: 'Лутфуллозода Шавкат',
                    nameEn: 'Lutfullozoda Shavkat',
                    roleTj: 'Муовини якуми Раис',
                    roleRu: 'Первый заместитель Председателя',
                    roleEn: 'First Deputy Chief Justice',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
                    initials: 'ЛШ',
                    isChief: false,
                  },
                  {
                    nameTj: 'Тағозода Абдуқаҳҳор Саидмурод',
                    nameRu: 'Тагозода Абдукаххор Саидмурод',
                    nameEn: 'Tagozoda Abdukahhor Saidmurod',
                    roleTj: 'Муовини Раис',
                    roleRu: 'Заместитель Председателя',
                    roleEn: 'Deputy Chief Justice',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
                    initials: 'ТА',
                    isChief: false,
                  },
                  {
                    nameTj: 'Раҷабзода Ҳотам Назар',
                    nameRu: 'Раджабзода Хотам Назар',
                    nameEn: 'Rajabzoda Hotam Nazar',
                    roleTj: 'Муовини Раис - Раиси коллегияи ҳарбӣ',
                    roleRu: 'Заместитель Председателя - Председатель военной коллегии',
                    roleEn: 'Deputy Chief Justice - Chairman of the Military Collegium',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
                    initials: 'РҲ',
                    isChief: false,
                  },
                ].map((person, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      person.isChief
                        ? 'bg-theme-surface border-theme-gold/40 shadow-sm'
                        : 'bg-theme-surface/70 border-theme-border hover:border-theme-gold/30'
                    }`}
                  >
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-theme-border/80 shrink-0 flex items-center justify-center font-serif font-bold text-theme-gold text-lg">
                      {person.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-theme-text mb-1">
                        {language === 'en' ? person.nameEn : language === 'tj' ? person.nameTj : person.nameRu}
                      </h4>
                      <p className="font-mono text-xs text-theme-gold font-medium">
                        {language === 'en' ? person.roleEn : language === 'tj' ? person.roleTj : person.roleRu}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border flex items-center gap-2 text-xs text-theme-textSec">
                <FileText size={14} className="text-rose-400 shrink-0" />
                <span className="font-mono text-[11px] text-theme-text">
                  Қонуни конститутсионии Ҷумҳурии Тоҷикистон «Дар бораи судҳои Ҷумҳурии Тоҷикистон» аз 26 июли соли 2014, № 1084 (90 Кб PDF)
                </span>
              </div>
            </div>
          )}

          {/* TAB: Plenum */}
          {activeTab === 'plenum' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Highest Judicial Forum' : language === 'tj' ? 'Мақоми олии дастурии судӣ' : 'Высший руководящий орган'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'Plenum of the Supreme Court' : language === 'tj' ? 'Пленуми Суди Олии Ҷумҳурии Тоҷикистон' : 'Пленум Верховного суда Республики Таджикистан'}
                </h3>
              </div>
              <p className="text-theme-text leading-relaxed">
                {language === 'en'
                  ? 'The Plenum of the Supreme Court functions as part of all judges of the Supreme Court and considers matters of legal interpretation, ensuring uniform application of the law across all judicial instances of the Republic of Tajikistan.'
                  : language === 'tj'
                  ? 'Пленуми Суди Олии Ҷумҳурии Тоҷикистон дар ҳайати ҳамаи судяҳои Суди Олӣ амал намуда, масъалаҳои муҳими татбиқи якхелаи қонунҳоро дар амалияи судӣ баррасӣ менамояд ва қарорҳои дастурӣ қабул мекунад.'
                  : 'Пленум Верховного суда действует в составе всех судей Верховного суда и рассматривает материалы обобщения судебной практики, давая руководящие разъяснения по единообразному применению законодательства.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border">
                  <div className="flex items-center gap-2 mb-2 text-theme-gold font-bold text-sm">
                    <Scale size={16} />
                    <span>{language === 'tj' ? 'Ваколатҳои асосии Пленум' : language === 'en' ? 'Plenum Authorities' : 'Полномочия Пленума'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-theme-textSec">
                    <li className="flex items-start gap-1.5">• <span>{language === 'tj' ? 'Қабули қарорҳои тавзеҳотӣ оид ба татбиқи қонунгузорӣ' : language === 'en' ? 'Adoption of binding interpretations on legislation' : 'Принятие разъясняющих постановлений по законам'}</span></li>
                    <li className="flex items-start gap-1.5">• <span>{language === 'tj' ? 'Ҷамъбасти амалияи судии ҳамаи зинаҳои судӣ' : language === 'en' ? 'Generalization of judicial practice across instances' : 'Обобщение судебной практики всех инстанций'}</span></li>
                    <li className="flex items-start gap-1.5">• <span>{language === 'tj' ? 'Тасдиқи ҳайати коллегияҳои судии Суди Олӣ' : language === 'en' ? 'Approval of Judicial Collegiums structure' : 'Утверждение составов судебных коллегий'}</span></li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border">
                  <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-sm">
                    <BookOpen size={16} />
                    <span>{language === 'tj' ? 'Қарорҳои дастурии охирин' : language === 'en' ? 'Recent Directives' : 'Постановления'}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 flex items-center justify-between">
                      <span className="font-mono text-theme-text">№ 1-2026 // Оид ба мурофиаи рақамӣ</span>
                      <span className="font-mono text-[10px] text-theme-gold">02.2026</span>
                    </div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 flex items-center justify-between">
                      <span className="font-mono text-theme-text">№ 4-2025 // Оид ба баҳсҳои молумулкӣ</span>
                      <span className="font-mono text-[10px] text-theme-gold">12.2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Structure */}
          {activeTab === 'structure' && (
            <div className="space-y-6">
              <SupremeCourtStructureHub
                onOpenLeadershipModal={() => onSelectTab('leadership')}
                onOpenPlenumModal={() => onSelectTab('plenum')}
                onOpenReceptionModal={() => onSelectTab('reception')}
                onOpenCollegiumsModal={() => onSelectTab('collegiums')}
              />

              {/* Exact Hierarchical Official Blueprint Reference */}
              <div className="p-4 sm:p-6 rounded-3xl bg-theme-surface border border-theme-border space-y-6">
                <div className="flex items-center justify-between border-b border-theme-border pb-3">
                  <span className="font-mono text-xs text-theme-gold uppercase tracking-widest font-bold">
                    [ СХЕМАИ ИЕРАРХИЯИ ДАСТГОҲ ВА ҲАЙАТҲО // BLUEPRINT ]
                  </span>
                  <span className="font-mono text-[10px] text-theme-textMuted uppercase">
                    СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН
                  </span>
                </div>

                {/* Level 1: Chief Justice */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => onSelectTab('leadership')}
                    className="px-6 py-2.5 rounded-2xl bg-theme-gold text-black font-serif font-bold text-sm uppercase tracking-wider shadow-md hover:brightness-110 transition-all text-center"
                  >
                    РАИСИ СУДИ ОЛӢ
                  </button>
                </div>

                {/* Level 2: Top Deputies & Central Organs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-theme-bg border border-theme-border font-mono font-medium">МУОВИНИ ЯКУМИ РАИС</div>
                  <div className="p-2.5 rounded-xl bg-theme-bg border border-theme-border font-mono font-medium">МУОВИНИ РАИС</div>
                  <div className="p-2.5 rounded-xl bg-theme-bg border border-theme-border font-mono font-medium">МУОВИНИ РАИС – РАИСИ КОЛЛЕГИЯИ ҲАРБӢ</div>
                  <button
                    type="button"
                    onClick={() => onSelectTab('plenum')}
                    className="p-2.5 rounded-xl bg-theme-bg border border-theme-gold/40 text-theme-gold font-mono font-bold hover:bg-theme-gold/15 transition-colors"
                  >
                    ПЛЕНУМИ СУДИ ОЛӢ
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTab('presidium')}
                    className="p-2.5 rounded-xl bg-theme-bg border border-theme-gold/40 text-theme-gold font-mono font-bold hover:bg-theme-gold/15 transition-colors"
                  >
                    РАЁСАТИ СУДИ ОЛӢ
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTab('training')}
                    className="p-2.5 rounded-xl bg-theme-bg border border-cyan-500/40 text-cyan-400 font-mono font-medium hover:bg-cyan-500/15 transition-colors"
                  >
                    МАРКАЗИ ТАЪЛИМИИ СУДЯҲО
                  </button>
                </div>

                {/* Level 3: 5 Judicial Collegiums */}
                <div className="pt-2 border-t border-theme-border/60">
                  <span className="font-mono text-[10px] text-theme-gold uppercase tracking-widest block mb-2 text-center">ҲАЙАТҲОИ СУДИИ СУДИ ОЛӢ</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => onSelectTab('collegiums')}
                      className="p-2 rounded-xl bg-theme-surface border border-theme-border font-mono text-[11px] hover:border-theme-gold transition-colors"
                    >
                      КОЛЛЕГИЯИ СУДӢ ОИД БА ПАРВАНДАҲОИ ҶИНОЯТӢ
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTab('collegiums')}
                      className="p-2 rounded-xl bg-theme-surface border border-theme-border font-mono text-[11px] hover:border-theme-gold transition-colors"
                    >
                      КОЛЛЕГИЯИ СУДӢ ОИД БА ҲУҚУҚВАЙРОНКУНИИ МАЪМУРӢ
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTab('collegiums')}
                      className="p-2 rounded-xl bg-theme-surface border border-theme-border font-mono text-[11px] hover:border-theme-gold transition-colors"
                    >
                      КОЛЛЕГИЯИ СУДӢ ОИД БА ПАРВАНДАҲОИ МАДАНӢ
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTab('collegiums')}
                      className="p-2 rounded-xl bg-theme-surface border border-theme-border font-mono text-[11px] hover:border-theme-gold transition-colors"
                    >
                      КОЛЛЕГИЯИ СУДӢ ОИД БА ПАРВАНДАҲОИ ОИЛАВӢ
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTab('collegiums')}
                      className="p-2 rounded-xl bg-theme-surface border border-theme-border font-mono text-[11px] hover:border-theme-gold transition-colors"
                    >
                      КОЛЛЕГИЯИ ҲАРБӢ
                    </button>
                  </div>
                </div>

                {/* Level 4: Apparatus Head & Directorates */}
                <div className="pt-2 border-t border-theme-border/60">
                  <div className="flex justify-center mb-3">
                    <div className="px-5 py-1.5 rounded-xl bg-slate-800 border border-slate-600 text-white font-mono text-xs font-bold uppercase">
                      РОҲБАРИ ДАСТГОҲ
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати ташкили кори судҳо</div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати баррасии муроҷиатҳо</div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати кадрҳо ва корҳои махсус</div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати коргузорӣ ва назорат</div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати омор ва ҷамъбасти амалияи судӣ</div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати марҳилаҳои якум, кассатсионӣ ва назоратӣ</div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати банақшагирӣ, муҳосибот ва таъминот</div>
                    <div className="p-2 rounded-xl bg-theme-bg/60 border border-theme-border/60 font-mono text-[11px]">Раёсати муносибатҳои байналмилалӣ ва меъёрӣ</div>
                  </div>
                </div>

                {/* Level 5: Collegium Secretariats */}
                <div className="pt-2 border-t border-theme-border/60">
                  <span className="font-mono text-[10px] text-theme-textMuted uppercase tracking-widest block mb-2 text-center">КОТИБОТҲОИ КОЛЛЕГИЯҲО</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-[10px] font-mono text-theme-textMuted">
                    <div className="p-1.5 rounded-lg bg-theme-bg/40 border border-theme-border/40">Котиботи Раиси Суди Олӣ</div>
                    <div className="p-1.5 rounded-lg bg-theme-bg/40 border border-theme-border/40">Котиботи коллегияи ҷиноятӣ</div>
                    <div className="p-1.5 rounded-lg bg-theme-bg/40 border border-theme-border/40">Котиботи коллегияи маъмурӣ</div>
                    <div className="p-1.5 rounded-lg bg-theme-bg/40 border border-theme-border/40">Котиботи коллегияи маданӣ</div>
                    <div className="p-1.5 rounded-lg bg-theme-bg/40 border border-theme-border/40">Котиботи коллегияи оилавӣ</div>
                    <div className="p-1.5 rounded-lg bg-theme-bg/40 border border-theme-border/40">Котиботи коллегияи ҳарбӣ</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: Collegiums */}
          {activeTab === 'collegiums' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Specialized Benches' : language === 'tj' ? 'Ҳайатҳои тахассусии судӣ' : 'Специализированные коллегии'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'Judicial Collegiums of the Supreme Court' : language === 'tj' ? 'Коллегияҳои Суди Олии Ҷумҳурии Тоҷикистон' : 'Судебные коллегии Верховного суда Республики Таджикистан'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: t('mission.civilName'), desc: t('mission.civilDesc'), code: 'COL-CIVIL' },
                  { name: t('mission.familyName'), desc: t('mission.familyDesc'), code: 'COL-FAMILY' },
                  { name: t('mission.criminalName'), desc: t('mission.criminalDesc'), code: 'COL-CRIMINAL' },
                  { name: t('mission.adminName'), desc: t('mission.adminDesc'), code: 'COL-ADMIN' },
                  { name: t('mission.militaryName'), desc: t('mission.militaryDesc'), code: 'COL-MILITARY' },
                ].map((col, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-theme-surface border border-theme-border hover:border-theme-gold/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-theme-gold">{col.code}</span>
                      <Shield size={14} className="text-theme-gold" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-theme-text mb-1">{col.name}</h4>
                    <p className="text-xs text-theme-textSec leading-relaxed">{col.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Presidium */}
          {activeTab === 'presidium' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Supervisory & Executive Board' : language === 'tj' ? 'Мақоми назоратӣ ва роҳбарӣ' : 'Президиум'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'Presidium of the Supreme Court' : language === 'tj' ? 'Раёсати Суди Олӣ' : 'Президиум Верховного суда'}
                </h3>
              </div>

              {/* Exact Presidium Members from Image */}
              <div className="space-y-4">
                {/* Presidium Chairman */}
                <div className="p-4 rounded-2xl bg-theme-surface border border-theme-gold/40 flex items-center gap-4">
                  <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-theme-border shrink-0 flex items-center justify-center font-serif font-bold text-theme-gold text-xl">
                    МР
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-theme-text">Мирзозода Рустам Пираҳмад</h4>
                    <p className="font-mono text-xs text-theme-gold font-medium">Раиси Раёсат</p>
                  </div>
                </div>

                {/* Presidium Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Лутфуллозода Шавкат', role: 'Аъзои Раёсат', initials: 'ЛШ' },
                    { name: 'Тағозода Абдуқаҳҳор Саидмурод', role: 'Аъзои Раёсат', initials: 'ТА' },
                    { name: 'Раҷабзода Ҳотам Назар', role: 'Аъзои Раёсат', initials: 'РҲ' },
                    { name: 'Солеҳзода Зарина Тағойназар', role: 'Аъзои Раёсат', initials: 'СЗ' },
                    { name: 'Ҳафиззода Тимур Ҷамшед', role: 'Аъзои Раёсат', initials: 'ҲТ' },
                    { name: 'Шарифзода Иноятулло Шарифҷон', role: 'Аъзои Раёсат', initials: 'ШИ' },
                  ].map((m, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-theme-surface/70 border border-theme-border flex items-center gap-3">
                      <div className="w-12 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-theme-border shrink-0 flex items-center justify-center font-serif font-bold text-theme-gold text-base">
                        {m.initials}
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-xs text-theme-text">{m.name}</h5>
                        <p className="font-mono text-[11px] text-theme-gold">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: History */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Chronicle of Justice' : language === 'tj' ? 'Таърихи адолати судӣ' : 'Летопись правосудия'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'History of the Supreme Court' : language === 'tj' ? 'Таърихи ташаккули Суди Олии ҶТ' : 'История Верховного суда Республики Таджикистан'}
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    year: '1924–1929',
                    title: language === 'tj' ? 'Таъсиси аввалин мақомоти судии Тоҷикистон' : language === 'en' ? 'Establishment of Early Judicial Bodies' : 'Формирование первых судебных органов',
                    desc: language === 'tj' ? 'Ташаккули аввалин судҳои халқӣ ва комиссариати адлия дар Ҷумҳурии Мухтори Тоҷикистон.' : language === 'en' ? 'Establishment of regional peoples courts and justice commissariat.' : 'Создание народных судов и комиссариата юстиции.'
                  },
                  {
                    year: '1991–1994',
                    title: language === 'tj' ? 'Даврони Истиқлоли давлатӣ ва Конститутсия' : language === 'en' ? 'State Independence and Constitution' : 'Государственная независимость и Конституция',
                    desc: language === 'tj' ? 'Қабули Конститутсияи соли 1994 ва эътирофи ҳокимияти судӣ ҳамчун шохаи мустақили ҳокимияти давлатӣ.' : language === 'en' ? 'Adoption of the 1994 Constitution recognizing judicial branch independence.' : 'Принятие Конституции 1994 года и признание независимости судебной власти.'
                  },
                  {
                    year: '2010–2026',
                    title: language === 'tj' ? 'Ислоҳоти судӣ-ҳуқуқӣ ва Адолати рақамӣ' : language === 'en' ? 'Judicial Reforms & Digital Justice' : 'Судебно-правовая реформа и цифровизация',
                    desc: language === 'tj' ? 'Татбиқи барномаҳои пайдарпайи ислоҳоти судӣ, ҷорӣ намудани суди электронӣ ва шаффофияти комил.' : language === 'en' ? 'Implementation of electronic filing, digital workflow, and transparency.' : 'Внедрение системы «Электронный суд» и цифровых технологий правосудия.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-theme-surface border border-theme-border flex flex-col sm:flex-row gap-3 items-start">
                    <span className="font-mono text-xs font-bold text-theme-gold bg-theme-gold/10 px-2.5 py-1 rounded-lg shrink-0">
                      {item.year}
                    </span>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-theme-text">{item.title}</h4>
                      <p className="text-xs text-theme-textSec mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Training Center */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Judicial Excellence' : language === 'tj' ? 'Такмили касбии судяҳо' : 'Профессиональное обучение'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'Judicial Training Center' : language === 'tj' ? 'Маркази таълимии судяҳои Суди Олии ҶТ' : 'Учебный центр судей при Верховном суде РТ'}
                </h3>
              </div>

              <p className="text-theme-text leading-relaxed">
                {language === 'en'
                  ? 'The Training Center provides specialized academic programs, continuous legal education, and professional qualification training for judges and judicial apparatus personnel.'
                  : language === 'tj'
                  ? 'Маркази таълимии судяҳои назди Суди Олии Ҷумҳурии Тоҷикистон ҷиҳати такмили дониши назариявӣ ва таҷрибавии судяҳо, коромӯзон ва кормандони дастгоҳи суд фаъолият мебарад.'
                  : 'Учебный центр осуществляет подготовку кандидатов на должности судей, повышение квалификации действующих судей и сотрудников аппаратов судов.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border">
                  <GraduationCap size={20} className="text-theme-gold mb-2" />
                  <h4 className="font-serif font-bold text-sm text-theme-text mb-1">{language === 'tj' ? 'Барномаҳои такмили ихтисос' : language === 'en' ? 'Qualification Programs' : 'Программы повышения квалификации'}</h4>
                  <p className="text-xs text-theme-textSec">{language === 'tj' ? 'Курсҳои мунтазам оид ба қонунгузории нави мурофиавӣ ва стандартҳои байналмилалӣ.' : language === 'en' ? 'Regular courses on procedural law updates and international standards.' : 'Регулярные курсы по новеллам законодательства и международным стандартам.'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border">
                  <Award size={20} className="text-cyan-400 mb-2" />
                  <h4 className="font-serif font-bold text-sm text-theme-text mb-1">{language === 'tj' ? 'Технологияҳои муосири судӣ' : language === 'en' ? 'Digital Technologies' : 'Судебные технологии'}</h4>
                  <p className="text-xs text-theme-textSec">{language === 'tj' ? 'Омӯзиши кор бо системаи суди электронӣ, амнияти иттилоотӣ ва мурофиаҳои видеоконфронс.' : language === 'en' ? 'Training in electronic case files, cyber resilience, and video-hearings.' : 'Обучение работе с электронным делопроизводством и видеоконференцсвязью.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Reception Schedule (Exact Table from Image) */}
          {activeTab === 'reception' && (
            <div className="space-y-6">
              <div className="border-l-2 border-theme-gold pl-4 py-1">
                <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                  {language === 'en' ? 'Direct Citizen Access' : language === 'tj' ? 'Қабули шахсии шаҳрвандон' : 'Личный приём граждан'}
                </span>
                <h3 className="text-xl font-medium text-theme-text tracking-tight mt-1">
                  {language === 'en' ? 'Citizen Reception Timetable' : language === 'tj' ? 'Ҷадвали қабули шаҳрвандон' : 'График приёма граждан'}
                </h3>
              </div>

              <div className="border border-theme-border rounded-2xl overflow-hidden bg-theme-surface shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans min-w-[600px]">
                  <thead>
                    <tr className="border-b border-theme-border bg-theme-bg/80 font-mono text-[10px] text-theme-textMuted uppercase tracking-wider">
                      <th className="p-3.5">МАНСАБИ ШАХСЕ, КИ ШАҲРВАНДОНРО ҚАБУЛ МЕНАМОЯД</th>
                      <th className="p-3.5">НОМУ НАСАБИ ШАХСИ МАНСАБДОР</th>
                      <th className="p-3.5 text-center">РӮЗҲОИ ҚАБУЛ</th>
                      <th className="p-3.5 text-center">СОАТИ ҚАБУЛ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border/60 text-theme-textSec">
                    <tr className="hover:bg-theme-bg/40 transition-colors">
                      <td className="p-3.5 font-medium text-theme-text">Раиси Суди Олӣ</td>
                      <td className="p-3.5 font-mono text-theme-text">Мирзозода Р.П.</td>
                      <td className="p-3.5 text-center font-mono text-theme-gold" rowSpan={4}>Сешанбе / Шанбе</td>
                      <td className="p-3.5 text-center font-mono" rowSpan={4}>08:00 – 12:00</td>
                    </tr>
                    <tr className="hover:bg-theme-bg/40 transition-colors">
                      <td className="p-3.5 font-medium text-theme-text">Муовини якуми Раиси Суди Олӣ</td>
                      <td className="p-3.5 font-mono text-theme-text">Лутфуллозода Ш.</td>
                    </tr>
                    <tr className="hover:bg-theme-bg/40 transition-colors">
                      <td className="p-3.5 font-medium text-theme-text">Муовини Раиси Суди Олӣ</td>
                      <td className="p-3.5 font-mono text-theme-text">Тағозода А.С.</td>
                    </tr>
                    <tr className="hover:bg-theme-bg/40 transition-colors">
                      <td className="p-3.5 font-medium text-theme-text">Муовини Раиси Суди Олӣ - Раиси коллегияи ҳарбӣ</td>
                      <td className="p-3.5 font-mono text-theme-text">Раҷабзода Ҳ.Н.</td>
                    </tr>

                    <tr className="hover:bg-theme-bg/40 transition-colors bg-theme-bg/20">
                      <td className="p-3.5 font-medium text-theme-text">Раисони коллегияҳои судии Суди Олӣ</td>
                      <td className="p-3.5 font-mono text-theme-text">Ҳафиззода Т.Ҷ.<br />Ҳаким Р.А.</td>
                      <td className="p-3.5 text-center font-mono text-theme-gold">Сешанбе<br />Шанбе</td>
                      <td className="p-3.5 text-center font-mono">08:00 – 12:00<br />08:00 – 12:00</td>
                    </tr>

                    <tr className="hover:bg-theme-bg/40 transition-colors">
                      <td className="p-3.5 font-medium text-theme-text">Судяи Суди Олии Ҷумҳурии Тоҷикистон</td>
                      <td className="p-3.5 font-mono text-theme-textMuted">(тибқи рӯйхат)</td>
                      <td className="p-3.5 text-center font-mono text-theme-gold">Ҳар рӯзи корӣ</td>
                      <td className="p-3.5 text-center font-mono">Тибқи навбатдорӣ</td>
                    </tr>

                    <tr className="hover:bg-theme-bg/40 transition-colors bg-theme-bg/20">
                      <td className="p-3.5 font-medium text-theme-text">Раисони коллегияҳои судӣ оид ба парвандаҳои маданӣ ва оилавии Суди Олии ҶТ</td>
                      <td className="p-3.5 font-mono text-theme-text">Ҳаким Р.А.</td>
                      <td className="p-3.5 text-center font-mono text-theme-gold">Панҷшанбе</td>
                      <td className="p-3.5 text-center font-mono">09:00 – 12:00<br />14:00 – 17:00</td>
                    </tr>

                    <tr className="hover:bg-theme-bg/40 transition-colors">
                      <td className="p-3.5 font-medium text-theme-text">Раисони коллегияҳои судӣ оид ба парвандаҳои ҷиноятӣ ва ҳуқуқвайронкунии маъмурии Суди Олии ҶТ</td>
                      <td className="p-3.5 font-mono text-theme-text">Ҳафиззода Т.Ҷ.</td>
                      <td className="p-3.5 text-center font-mono text-theme-gold">Ҷумъа</td>
                      <td className="p-3.5 text-center font-mono">09:00 – 12:00<br />14:00 – 17:00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Exact Notes from Image */}
              <div className="p-4 rounded-2xl bg-theme-bg/80 border border-theme-border space-y-2 text-xs text-theme-textSec">
                <p className="font-mono text-[11px] leading-relaxed">
                  <strong className="text-theme-gold">Эзоҳ:</strong> Бақайдгирии муроҷиаткунандагон дар рӯзҳои сешанбе ва шанбе аз соати 8:00 то 10:00 бо пешниҳоди ҳуҷҷати тасдиқкунандаи шахсият ба роҳ монда мешавад.
                </p>
                <p className="font-mono text-[11px] leading-relaxed">
                  Назорат аз болои иҷрои Нақшаи мазкур ба зиммаи муовини Раиси Суди Олӣ - Раиси коллегияи ҳарбӣ Раҷабзода Ҳ.Н. ва сардори Раёсати баррасии муроҷиатҳои Суди Олӣ Абдуллоева Л. вогузор карда шавад.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-theme-gold/10 border border-theme-gold/30 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-theme-gold block mb-0.5">{language === 'tj' ? 'Қабули электронии шаҳрвандон' : language === 'en' ? 'Online Electronic Reception' : 'Электронная приёмная'}</span>
                  <span className="text-theme-textSec">{language === 'tj' ? 'Шумо инчунин метавонед ариза ё муроҷиати худро ба таври онлайн фиристед.' : language === 'en' ? 'You can submit electronic applications and appeals online 24/7.' : 'Вы можете направить обращение онлайн в круглосуточном режиме.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectTab('appeals')}
                  className="btn-primary text-xs shrink-0 ml-3"
                >
                  <Send size={12} />
                  <span>{language === 'tj' ? 'Муроҷиат' : language === 'en' ? 'Appeal' : 'Подать'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: Legislation Acts (Санадҳои Қонунгузорӣ) */}
          {activeTab === 'legislation' && (
            <div className="space-y-6">
              {/* Breadcrumb Header */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-theme-textMuted border-b border-theme-border/60 pb-3">
                <span className="hover:text-theme-gold cursor-pointer" onClick={() => onSelectTab('about')}>
                  {language === 'tj' ? 'Асосӣ' : language === 'en' ? 'Main' : 'Главная'}
                </span>
                <span>/</span>
                <span>{language === 'tj' ? 'Қонунгузорӣ' : language === 'en' ? 'Legislation' : 'Законодательство'}</span>
                <span>/</span>
                <span className="text-theme-gold font-semibold">
                  {language === 'tj' ? 'Санадҳои Қонунгузорӣ' : language === 'en' ? 'Legislative Acts' : 'Законодательные акты'}
                </span>
              </div>

              {/* Title Section */}
              <div className="border-l-2 border-theme-gold pl-4 py-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
                    {language === 'en' ? 'Legal Framework' : language === 'tj' ? 'Пояи қонунгузории ҶТ' : 'Законодательная база РТ'}
                  </span>
                  <h3 className="text-2xl font-medium text-theme-text tracking-tight mt-1">
                    {language === 'en' ? 'Legislative Acts of the Republic of Tajikistan' : language === 'tj' ? 'Санадҳои Қонунгузорӣ' : 'Законодательные акты Республики Таджикистан'}
                  </h3>
                </div>
                <div className="font-mono text-xs px-3 py-1.5 rounded-xl bg-theme-gold/10 border border-theme-gold/30 text-theme-gold shrink-0">
                  {language === 'tj' ? '24 Санади меъёрӣ' : language === 'en' ? '24 Legislative Acts' : '24 Нормативных акта'}
                </div>
              </div>

              {/* Search Bar inside Legislation */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-textMuted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'tj' ? 'Ҷустуҷӯи кодексҳо ва қонунҳо...' : language === 'en' ? 'Search codes and laws...' : 'Поиск кодексов и законов...'}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold font-mono transition-colors"
                />
              </div>

              {/* 24 Laws and Codes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {LEGISLATIVE_ACTS.filter((item) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    item.titleTj.toLowerCase().includes(query) ||
                    item.titleRu.toLowerCase().includes(query) ||
                    item.titleEn.toLowerCase().includes(query)
                  );
                }).map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-theme-surface/80 border border-theme-border hover:border-theme-gold hover:shadow-md transition-all duration-200 group flex items-start gap-3.5 cursor-pointer backdrop-blur-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-theme-gold/15 text-theme-gold border border-theme-gold/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:scale-105 group-hover:bg-theme-gold group-hover:text-black transition-all">
                      {act.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-theme-textMuted mb-1">
                        <span className="uppercase tracking-wider text-theme-gold">
                          {language === 'en' ? act.typeEn : language === 'tj' ? act.typeTj : act.typeRu}
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 size={11} />
                          <span>{act.status}</span>
                        </span>
                      </div>

                      <h4 className="font-serif font-semibold text-xs sm:text-sm text-theme-text leading-snug group-hover:text-theme-gold transition-colors">
                        {language === 'en' ? act.titleEn : language === 'tj' ? act.titleTj : act.titleRu}
                      </h4>
                    </div>

                    <ArrowUpRight size={14} className="text-theme-textMuted group-hover:text-theme-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                  </div>
                ))}
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
                {loadingActs ? (
                  <div className="text-center py-4 text-theme-textSec font-mono text-xs">Loading...</div>
                ) : filteredActs.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-theme-textMuted mb-1.5">
                      <span className="text-theme-gold font-semibold">
                        {act.doc_number || `#${act.id}`}
                      </span>
                      <span>{new Date(act.published_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm text-theme-text font-medium mb-2 group-hover:text-theme-gold font-sans">
                      {language === 'en' ? (act.title_en || act.title_ru) : language === 'tj' ? act.title_tj : act.title_ru}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-theme-textSec font-mono">
                      <span className="text-[11px] text-theme-textMuted uppercase">
                        {act.category}
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
                {loadingNews ? (
                  <div className="text-center py-4 text-theme-textSec font-mono text-xs col-span-2">Loading...</div>
                ) : news.length === 0 ? (
                  <div className="text-center py-4 text-theme-textSec font-mono text-xs col-span-2">No news found</div>
                ) : news.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-theme-textMuted mb-2">
                        <span className="flex items-center gap-1.5 text-theme-gold">
                          <Newspaper size={12} />
                          <span>МАТБУОТ</span>
                        </span>
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-medium text-theme-text mb-2 leading-snug">
                        {language === 'en' ? (item.title_en || item.title_ru) : language === 'tj' ? item.title_tj : item.title_ru}
                      </h4>
                      <p className="text-xs text-theme-textSec leading-relaxed">
                        {language === 'en' ? (item.excerpt_en || item.excerpt_ru) : language === 'tj' ? item.excerpt_tj : item.excerpt_ru}
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
                {loadingActs ? (
                  <div className="text-center py-4 text-theme-textSec font-mono text-xs col-span-2">Loading...</div>
                ) : acts.length === 0 ? (
                  <div className="text-center py-4 text-theme-textSec font-mono text-xs col-span-2">No documents found</div>
                ) : acts.slice(0, 8).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-theme-textMuted mb-1.5">
                        <span className="text-theme-gold">{doc.category}</span>
                        <span>DOCX</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-theme-text mb-2">
                        {language === 'en' ? (doc.title_en || doc.title_ru) : language === 'tj' ? doc.title_tj : doc.title_ru}
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
