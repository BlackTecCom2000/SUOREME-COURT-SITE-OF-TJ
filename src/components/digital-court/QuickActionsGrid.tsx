import React from 'react';
import { motion } from 'motion/react';
import { 
  FileEdit, 
  FileWarning, 
  Search, 
  BookOpen, 
  Calculator, 
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Reveal } from '../Reveal';

interface QuickActionsGridProps {
  onAction: (actionKey: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onAction }) => {
  const { language } = useLanguage();

  const actions = [
    {
      id: 'file_claim',
      titleTj: 'Пешниҳоди ариза',
      titleRu: 'Подать заявление',
      titleEn: 'File a Claim',
      descTj: 'Аризаи даъвогӣ, илтимоснома ва ҳуҷҷатҳо ба суди дахлдор',
      descRu: 'Исковые заявления, ходатайства и обращения в суд первой инстанции',
      descEn: 'File claims, petitions and formal applications to court',
      icon: FileEdit,
      badge: 'ONLINE',
      color: 'text-sky-400',
      bgGlow: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
    },
    {
      id: 'file_appeal',
      titleTj: 'Пешниҳоди шикоят',
      titleRu: 'Подать жалобу',
      titleEn: 'File an Appeal',
      descTj: 'Шикояти апеллятсионӣ ва кассатсионӣ аз болои санадҳои судӣ',
      descRu: 'Апелляционные и кассационные жалобы на решения судов',
      descEn: 'Appellate and cassation appeals against court rulings',
      icon: FileWarning,
      badge: 'APPELLATE',
      color: 'text-amber-400',
      bgGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    },
    {
      id: 'track_case',
      titleTj: 'Санҷиши парванда',
      titleRu: 'Проверить дело',
      titleEn: 'Track Case Status',
      descTj: 'Пайгирии ҳаракати парванда ва таъини маҷлисҳо бо рақами УИН',
      descRu: 'Мониторинг движения дела, даты заседаний и процессуальных сроков',
      descEn: 'Live tracking of proceedings, hearings and procedural deadlines',
      icon: Search,
      badge: 'LIVE STATUS',
      color: 'text-emerald-400',
      bgGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    },
    {
      id: 'acts_bank',
      titleTj: 'Санадҳои судӣ',
      titleRu: 'Найти судебный акт',
      titleEn: 'Find Court Act',
      descTj: 'Бонки кушодаи санадҳои судии эътибори қонунӣ пайдокарда',
      descRu: 'Банк опубликованных решений, определений и постановлений',
      descEn: 'Public repository of verified rulings and judgments',
      icon: BookOpen,
      badge: 'REPOSITORY',
      color: 'text-indigo-400',
      bgGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    },
    {
      id: 'calc_duty',
      titleTj: 'Боҷи давлатӣ',
      titleRu: 'Оплатить пошлину',
      titleEn: 'State Duty Calculator',
      descTj: 'Ҳисобкунии худкор ва супоридани боҷи давлатӣ бо реквизитҳо',
      descRu: 'Онлайн калькулятор государственной пошлины и формирование квитанции',
      descEn: 'Automated state court fee calculator and payment receipt',
      icon: Calculator,
      badge: 'PAYMENT',
      color: 'text-rose-400',
      bgGlow: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
    },
    {
      id: 'reception',
      titleTj: 'Қабули шаҳрвандон',
      titleRu: 'Приём граждан',
      titleEn: 'Citizen Reception',
      descTj: 'Ҷадвали қабули шахсӣ аз ҷониби роҳбарияти Суди Олӣ',
      descRu: 'График личного приёма граждан руководством Верховного суда',
      descEn: 'Official leadership reception timetable and online booking',
      icon: BookOpen,
      badge: 'SCHEDULE',
      color: 'text-teal-400',
      bgGlow: 'hover:border-teal-500/50 hover:shadow-teal-500/10',
    },
  ];

  const getTitle = (a: (typeof actions)[0]) => {
    if (language === 'tj') return a.titleTj;
    if (language === 'en') return a.titleEn;
    return a.titleRu;
  };

  const getDesc = (a: (typeof actions)[0]) => {
    if (language === 'tj') return a.descTj;
    if (language === 'en') return a.descEn;
    return a.descRu;
  };

  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-8 md:px-12 site-container select-none">
      <Reveal delay={50}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-theme-gold mb-2 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-gold" />
              <span>
                {language === 'tj' ? 'ХИЗМАТРАСОНИҲОИ ФАВРӢ' : language === 'en' ? 'RAPID ACTIONS' : 'БЫСТРЫЕ ДЕЙСТВИЯ'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-theme-text tracking-tight">
              {language === 'tj' ? 'Шумо чӣ кор кардан мехоҳед?' : language === 'en' ? 'What would you like to do?' : 'Что вы хотите сделать?'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-theme-textMuted max-w-md">
            {language === 'tj' 
              ? 'Дастрасии фаврӣ ба ҳамаи амалиётҳои асосии низоми электронии судии Тоҷикистон' 
              : language === 'en'
              ? 'Instant direct access to primary procedural workflows of the e-Justice system'
              : 'Прямой доступ к ключевым процессуальным действиям цифровой судебной платформы'}
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Reveal key={action.id} delay={100 + idx * 50}>
              <motion.button
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAction(action.id)}
                className={`w-full text-left p-5 sm:p-6 glass glass-card transition-all duration-300 flex flex-col justify-between min-h-[170px] group ${action.bgGlow}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="p-2.5 rounded-xl bg-theme-bg border border-theme-border/80 text-theme-text group-hover:scale-110 transition-transform">
                      <Icon size={20} className={action.color} />
                    </div>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-theme-border bg-theme-bg/60 text-theme-textMuted uppercase tracking-wider">
                      {action.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-theme-text group-hover:text-theme-gold transition-colors mb-1.5">
                    {getTitle(action)}
                  </h3>

                  <p className="text-xs text-theme-textSec line-clamp-2 leading-relaxed">
                    {getDesc(action)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-theme-border/40 flex items-center justify-between font-mono text-[11px] text-theme-textMuted group-hover:text-theme-text">
                  <span>SUD.TJ // ACTION</span>
                  <div className="flex items-center gap-1 text-theme-gold group-hover:translate-x-1 transition-transform">
                    <span>{language === 'tj' ? 'Иҷро кардан' : language === 'en' ? 'Execute' : 'Перейти'}</span>
                    <ArrowUpRight size={13} />
                  </div>
                </div>
              </motion.button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
