import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Building, 
  UserCheck, 
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Reveal } from '../Reveal';

export interface CaseRecord {
  id: string;
  caseNumber: string;
  category: 'civil' | 'criminal' | 'admin' | 'family' | 'economic';
  categoryRu: string;
  categoryTj: string;
  categoryEn: string;
  courtRu: string;
  courtTj: string;
  courtEn: string;
  judgeRu: string;
  judgeTj: string;
  judgeEn: string;
  partiesRu: string;
  partiesTj: string;
  partiesEn: string;
  status: 'registered' | 'assigned' | 'hearing_scheduled' | 'decision_rendered' | 'appealed' | 'archived';
  statusRu: string;
  statusTj: string;
  statusEn: string;
  registrationDate: string;
  nextHearingDate?: string;
  summaryRu: string;
  summaryTj: string;
  summaryEn: string;
}

export const MOCK_CASES: CaseRecord[] = [
  {
    id: 'case-01',
    caseNumber: '01-1234/26',
    category: 'civil',
    categoryRu: 'Гражданское судопроизводство',
    categoryTj: 'Мурофиаи судии гражданӣ',
    categoryEn: 'Civil Proceedings',
    courtRu: 'Верховный суд Республики Таджикистан',
    courtTj: 'Суди Олии Ҷумҳурии Тоҷикистон',
    courtEn: 'Supreme Court of the Republic of Tajikistan',
    judgeRu: 'Раҳмонзода С. А.',
    judgeTj: 'Раҳмонзода С. А.',
    judgeEn: 'Rahmonzoda S. A.',
    partiesRu: 'Истец: ООО «Сомон Строй» • Ответчик: ОАО «Таджикгидро»',
    partiesTj: 'Даъвогар: ҶДММ «Сомон Сохтмон» • Ҷавобгар: ҶСК «Тоҷикгидро»',
    partiesEn: 'Plaintiff: "Somon Stroy" LLC • Defendant: "Tajikhydro" OJSC',
    status: 'hearing_scheduled',
    statusRu: 'Назначено судебное заседание',
    statusTj: 'Маҷлиси судӣ таъин шудааст',
    statusEn: 'Hearing Scheduled',
    registrationDate: '12.02.2026',
    nextHearingDate: '15.09.2026 • 10:00',
    summaryRu: 'Спор о ненадлежащем исполнении условий государственного строительного контракта.',
    summaryTj: 'Баҳс оид ба иҷрои номатлуби шартҳои шартномаи давлатии сохтмонӣ.',
    summaryEn: 'Dispute concerning breach of state infrastructure construction agreement.',
  },
  {
    id: 'case-02',
    caseNumber: '02-481/26',
    category: 'economic',
    categoryRu: 'Экономический спор',
    categoryTj: 'Баҳси иқтисодӣ',
    categoryEn: 'Commercial Dispute',
    courtRu: 'Высший экономический суд РТ',
    courtTj: 'Суди Олии иқтисодии ҶТ',
    courtEn: 'High Economic Court of RT',
    judgeRu: 'Исмоилов Д. К.',
    judgeTj: 'Исмоилов Д. К.',
    judgeEn: 'Ismoilov D. K.',
    partiesRu: 'Истец: ЗАО «Хуҷанд Трейд» • Ответчик: Налоговый комитет',
    partiesTj: 'Даъвогар: ҶСП «Хуҷанд Трейд» • Ҷавобгар: Кумитаи андоз',
    partiesEn: 'Plaintiff: "Khujand Trade" CJSC • Defendant: Tax Committee',
    status: 'decision_rendered',
    statusRu: 'Решение вынесено',
    statusTj: 'Ҳалнома қабул гардид',
    statusEn: 'Decision Rendered',
    registrationDate: '18.01.2026',
    nextHearingDate: '—',
    summaryRu: 'Признание недействительным акта налоговой проверки в части начисления пени.',
    summaryTj: 'Беэътибор донистани санади санҷиши андозӣ дар қисми ҳисобкунии ҷарима.',
    summaryEn: 'Invalidation of tax audit penalties assessment on imported logistics goods.',
  },
  {
    id: 'case-03',
    caseNumber: '03-912/26',
    category: 'family',
    categoryRu: 'Семейное право',
    categoryTj: 'Ҳуқуқи оилавӣ',
    categoryEn: 'Family Law',
    courtRu: 'Суд района Исмоили Сомони г. Душанбе',
    courtTj: 'Суди ноҳияи Исмоили Сомонии ш. Душанбе',
    courtEn: 'Ismoili Somoni District Court, Dushanbe',
    judgeRu: 'Саидзода Н. Б.',
    judgeTj: 'Саидзода Н. Б.',
    judgeEn: 'Saidzoda N. B.',
    partiesRu: 'Истец: Шарипова М. • Ответчик: Шарипов Ф.',
    partiesTj: 'Даъвогар: Шарипова М. • Ҷавобгар: Шарипов Ф.',
    partiesEn: 'Plaintiff: Sharipova M. • Defendant: Sharipov F.',
    status: 'assigned',
    statusRu: 'Принято к производству',
    statusTj: 'Ба истеҳсолот қабул шудааст',
    statusEn: 'Case Admitted',
    registrationDate: '04.03.2026',
    nextHearingDate: '22.09.2026 • 14:30',
    summaryRu: 'Определение порядка участия в воспитании детей и раздел совместно нажитого имущества.',
    summaryTj: 'Муайян намудани тартиби иштирок дар тарбияи кӯдакон ва тақсими молу мулки муштарак.',
    summaryEn: 'Child custody schedule determination and marital property settlement.',
  },
  {
    id: 'case-04',
    caseNumber: '04-105/26',
    category: 'admin',
    categoryRu: 'Административное судопроизводство',
    categoryTj: 'Мурофиаи маъмурӣ',
    categoryEn: 'Administrative Dispute',
    courtRu: 'Суд города Худжанд',
    courtTj: 'Суди шаҳри Хуҷанд',
    courtEn: 'Khujand City Court',
    judgeRu: 'Бобоев Т. М.',
    judgeTj: 'Бобоев Т. М.',
    judgeEn: 'Boboev T. M.',
    partiesRu: 'Заявитель: Асадуллоев О. • Заинтересованное лицо: Хукумат г. Худжанда',
    partiesTj: 'Аризадиҳанда: Асадуллоев О. • Шахси манфиатдор: Ҳукумати ш. Хуҷанд',
    partiesEn: 'Applicant: Asadulloev O. • Respondent: Hukumat of Khujand',
    status: 'registered',
    statusRu: 'Зарегистрировано в канцелярии',
    statusTj: 'Дар канселярия ба қайд гирифта шуд',
    statusEn: 'Registered',
    registrationDate: '10.03.2026',
    nextHearingDate: 'Ожидается назначение',
    summaryRu: 'Обжалование постановления органа исполнительной власти по земельному сервитуту.',
    summaryTj: 'Шикоят аз болои қарори мақомоти иҷроияи ҳокимият оид ба сервитути замин.',
    summaryEn: 'Administrative review of municipal zoning easement determination.',
  },
];

interface CaseSearchEngineProps {
  onSelectCase: (caseItem: CaseRecord) => void;
}

export const CaseSearchEngine: React.FC<CaseSearchEngineProps> = ({ onSelectCase }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCases = useMemo(() => {
    return MOCK_CASES.filter((c) => {
      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
      
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCategory && matchStatus;

      const matchNum = c.caseNumber.toLowerCase().includes(query);
      const matchParties = 
        c.partiesRu.toLowerCase().includes(query) ||
        c.partiesTj.toLowerCase().includes(query) ||
        c.partiesEn.toLowerCase().includes(query);
      const matchCourt = 
        c.courtRu.toLowerCase().includes(query) ||
        c.courtTj.toLowerCase().includes(query) ||
        c.courtEn.toLowerCase().includes(query);
      const matchJudge = 
        c.judgeRu.toLowerCase().includes(query) ||
        c.judgeTj.toLowerCase().includes(query) ||
        c.judgeEn.toLowerCase().includes(query);

      return matchCategory && matchStatus && (matchNum || matchParties || matchCourt || matchJudge);
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  const getStatusColor = (status: CaseRecord['status']) => {
    switch (status) {
      case 'registered': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'assigned': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'hearing_scheduled': return 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse';
      case 'decision_rendered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-theme-bg text-theme-textMuted border-theme-border';
    }
  };

  return (
    <section id="case-search" className="relative py-12 sm:py-16 px-4 sm:px-8 md:px-12 site-container select-none">
      <div className="glass glass-panel p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-theme-gold/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <Reveal delay={50}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-theme-gold mb-2 uppercase tracking-wider">
                <Search size={14} />
                <span>
                  {language === 'tj' ? 'ФЕҲРИСТИ МУТТАТҲИДИ СУДӢ' : language === 'en' ? 'UNIVERSAL SEARCH' : 'ЕДИНЫЙ РЕЕСТР ДЕЛ'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-theme-text tracking-tight">
                {language === 'tj' ? 'Ҷустуҷӯи парвандаи судӣ' : language === 'en' ? 'Find Court Case' : 'Найти судебное дело'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-theme-textMuted max-w-md">
              {language === 'tj'
                ? 'Ҷустуҷӯ аз рӯи рақами парванда, иштирокчӣ, номи суд ё судя дар тамоми ҷумҳурӣ'
                : language === 'en'
                ? 'Search by Case ID, litigant name, court instance or presiding judge across Tajikistan'
                : 'Поиск по номеру дела, участнику процесса, наименованию суда или судье'}
            </p>
          </div>
        </Reveal>

        {/* Main Search Input Bar */}
        <div className="relative mb-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-textMuted" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'tj'
                    ? 'Рақами парванда (01-1234/26) / Иштирокчӣ / Суд / Судя...'
                    : language === 'en'
                    ? 'Case ID (01-1234/26) / Party / Court / Judge...'
                    : 'Номер дела (01-1234/26) / Участник / Суд / Судья...'
                }
                className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-2xl bg-theme-bg/80 border border-theme-border text-theme-text placeholder:text-theme-textMuted text-sm font-sans focus:outline-none focus:border-theme-gold focus:ring-2 focus:ring-theme-gold/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-theme-textMuted hover:text-theme-text"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 sm:h-14 px-4 sm:px-5 rounded-2xl border flex items-center gap-2 font-mono text-xs transition-all ${
                  showFilters || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'bg-theme-gold/15 border-theme-gold text-theme-gold font-bold'
                    : 'bg-theme-bg/80 border-theme-border text-theme-textSec hover:border-theme-borderHover hover:text-theme-text'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span>{language === 'tj' ? 'Филтрҳо' : language === 'en' ? 'Filters' : 'Фильтры'}</span>
                {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-theme-gold" />
                )}
              </button>

              <button
                type="button"
                className="btn-primary h-12 sm:h-14 px-6 shrink-0"
              >
                <span>{language === 'tj' ? 'Ҷустуҷӯ' : language === 'en' ? 'Search' : 'Найти'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6 pt-2 pb-1 border-b border-theme-border/40"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-3 pb-4">
                {/* Category */}
                <div>
                  <label className="block font-mono text-[10px] uppercase text-theme-textMuted mb-1.5">
                    {language === 'tj' ? 'Категорияи парванда' : language === 'en' ? 'Category' : 'Категория дела'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs focus:outline-none focus:border-theme-gold"
                  >
                    <option value="all">{language === 'tj' ? 'Ҳамаи категорияҳо' : language === 'en' ? 'All categories' : 'Все категории'}</option>
                    <option value="civil">{language === 'tj' ? 'Гражданӣ' : language === 'en' ? 'Civil' : 'Гражданское'}</option>
                    <option value="economic">{language === 'tj' ? 'Иқтисодӣ' : language === 'en' ? 'Commercial' : 'Экономическое'}</option>
                    <option value="family">{language === 'tj' ? 'Оилавӣ' : language === 'en' ? 'Family' : 'Семейное'}</option>
                    <option value="admin">{language === 'tj' ? 'Маъмурӣ' : language === 'en' ? 'Administrative' : 'Административное'}</option>
                    <option value="criminal">{language === 'tj' ? 'Ҷиноятӣ' : language === 'en' ? 'Criminal' : 'Уголовное'}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-mono text-[10px] uppercase text-theme-textMuted mb-1.5">
                    {language === 'tj' ? 'Ҳолати мурофиа' : language === 'en' ? 'Status' : 'Статус производства'}
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs focus:outline-none focus:border-theme-gold"
                  >
                    <option value="all">{language === 'tj' ? 'Ҳамаи ҳолатҳо' : language === 'en' ? 'All statuses' : 'Все статусы'}</option>
                    <option value="registered">{language === 'tj' ? 'Бақайдгирифта' : language === 'en' ? 'Registered' : 'Зарегистрировано'}</option>
                    <option value="assigned">{language === 'tj' ? 'Дар баррасӣ' : language === 'en' ? 'Admitted' : 'В производстве'}</option>
                    <option value="hearing_scheduled">{language === 'tj' ? 'Маҷлис таъин шуд' : language === 'en' ? 'Hearing Scheduled' : 'Назначено заседание'}</option>
                    <option value="decision_rendered">{language === 'tj' ? 'Ҳалнома қабул шуд' : language === 'en' ? 'Decision Rendered' : 'Решение вынесено'}</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full h-10 px-3 rounded-xl border border-theme-border bg-theme-bg/60 hover:bg-theme-surface text-theme-textSec flex items-center justify-center gap-1.5 font-mono text-xs transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>{language === 'tj' ? 'Тозакунӣ' : language === 'en' ? 'Reset Filters' : 'Сбросить фильтры'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results List */}
        <div className="mt-6 space-y-3.5">
          <div className="flex items-center justify-between font-mono text-xs text-theme-textMuted px-1 mb-2">
            <span>
              {language === 'tj' ? `Ёфт шуд: ${filteredCases.length}` : language === 'en' ? `Results found: ${filteredCases.length}` : `Найдено записей: ${filteredCases.length}`}
            </span>
            <span
              className="text-[11px] text-theme-gold"
              title={
                language === 'tj'
                  ? 'Маълумоти намоишӣ, на феҳристи воқеӣ'
                  : language === 'en'
                    ? 'Demo dataset, not the live registry'
                    : 'Демо-данные, а не живой реестр'
              }
            >
              SUD.TJ // DEMO LEDGER
            </span>
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-theme-border bg-theme-bg/40 text-theme-textMuted text-xs font-mono">
              {language === 'tj' 
                ? 'Парванда бо ин нишондодҳо ёфт нашуд. Лутфан дархостро дақиқ намоед.' 
                : language === 'en'
                ? 'No cases found matching your criteria. Try adjusting your query or filters.'
                : 'По вашему запросу судебных дел не найдено. Уточните критерии поиска.'}
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <motion.div
                key={caseItem.id}
                whileHover={{ scale: 1.006 }}
                onClick={() => onSelectCase(caseItem)}
                className="p-4 sm:p-5 rounded-2xl border border-theme-border/60 bg-theme-bg/60 hover:bg-theme-surfaceHover hover:border-theme-borderHover transition-all duration-200 cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-theme-text bg-theme-surface px-2.5 py-0.5 rounded-lg border border-theme-border">
                      {caseItem.caseNumber}
                    </span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(caseItem.status)}`}>
                      {language === 'tj' ? caseItem.statusTj : language === 'en' ? caseItem.statusEn : caseItem.statusRu}
                    </span>
                    <span className="font-mono text-[10px] text-theme-textMuted">
                      {caseItem.registrationDate}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-theme-text group-hover:text-theme-gold transition-colors truncate mb-1">
                    {language === 'tj' ? caseItem.partiesTj : language === 'en' ? caseItem.partiesEn : caseItem.partiesRu}
                  </h4>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-theme-textSec">
                    <span className="flex items-center gap-1">
                      <Building size={12} className="text-theme-gold" />
                      <span className="truncate max-w-xs">{language === 'tj' ? caseItem.courtTj : language === 'en' ? caseItem.courtEn : caseItem.courtRu}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck size={12} className="text-theme-gold" />
                      <span>{language === 'tj' ? caseItem.judgeTj : language === 'en' ? caseItem.judgeEn : caseItem.judgeRu}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-theme-border/40">
                  {caseItem.nextHearingDate && caseItem.nextHearingDate !== '—' && (
                    <div className="text-left md:text-right mb-1">
                      <div className="font-mono text-[10px] text-theme-textMuted uppercase">
                        {language === 'tj' ? 'Маҷлиси навбатӣ' : language === 'en' ? 'Next Session' : 'Следующее заседание'}
                      </div>
                      <div className="font-mono text-xs font-semibold text-theme-gold">
                        {caseItem.nextHearingDate}
                      </div>
                    </div>
                  )}
                  <div className="btn-outline text-xs group-hover:border-theme-gold group-hover:text-theme-gold">
                    <span>{language === 'tj' ? 'Муфассал' : language === 'en' ? 'View Case' : 'Открыть дело'}</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
