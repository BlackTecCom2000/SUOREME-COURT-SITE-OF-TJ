import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';


export const DEFAULT_LEADERS = [
  {
    id: 1,
    name_tj: 'Мирзозода Рустам Пираҳмад',
    name_ru: 'Мирзозода Рустам Пирахмад',
    name_en: 'Mirzozoda Rustam Pirahmad',
    title_tj: 'Раиси Суди Олӣ',
    title_ru: 'Председатель Верховного суда',
    title_en: 'Chief Justice of the Supreme Court',
    bio_tj: 'Роҳбарии умумии фаъолияти Суди Олӣ, раёсати Пленум ва Раёсати Суди Олии Ҷумҳурии Тоҷикистон, назорати иҷрои қонунҳо ва ташкили фаъолияти ҳокимияти судӣ.',
    bio_ru: 'Общее руководство деятельностью Верховного суда, председательствование на заседаниях Пленума и Президиума Верховного суда Республики Таджикистан.',
    bio_en: 'Overall leadership of the Supreme Court, presiding over Plenum and Presidium sessions, and judicial administration of the Republic of Tajikistan.',
    image_url: '',
    initials: 'МР',
  },
  {
    id: 2,
    name_tj: 'Лутфуллозода Шавкат',
    name_ru: 'Лутфуллозода Шавкат',
    name_en: 'Lutfullozoda Shavkat',
    title_tj: 'Муовини якуми Раис',
    title_ru: 'Первый заместитель Председателя',
    title_en: 'First Deputy Chief Justice',
    bio_tj: 'Ҳамоҳангсозии фаъолияти коллегияҳои судӣ, назорати ташкили мурофиаҳои судӣ ва иҷрои қарорҳои дастурии Пленуми Суди Олӣ.',
    bio_ru: 'Координация работы судебных коллегий и надзор за надлежащим отправлением правосудия.',
    bio_en: 'Coordination of specialized collegiums, supervisory audits, and procedural compliance.',
    image_url: '',
    initials: 'ЛШ',
  },
  {
    id: 3,
    name_tj: 'Тағозода Абдуқаҳҳор Саидмурод',
    name_ru: 'Тагозода Абдукаххор Саидмурод',
    name_en: 'Tagozoda Abdukahhor Saidmurod',
    title_tj: 'Муовини Раис',
    title_ru: 'Заместитель Председателя',
    title_en: 'Deputy Chief Justice',
    bio_tj: 'Роҳбарӣ ва назорат аз болои баррасии парвандаҳои маданӣ ва оилавӣ дар зинаҳои аввал, кассатсионӣ ва назоратӣ.',
    bio_ru: 'Руководство и надзор за рассмотрением гражданских и семейных дел в первой, кассационной и надзорной инстанциях.',
    bio_en: 'Leadership and oversight of civil and family cases across first-instance, cassation, and supervisory reviews.',
    image_url: '',
    initials: 'ТА',
  },
  {
    id: 4,
    name_tj: 'Раҷабзода Ҳотам Назар',
    name_ru: 'Раджабзода Хотам Назар',
    name_en: 'Rajabzoda Hotam Nazar',
    title_tj: 'Муовини Раис - Раиси коллегияи ҳарбӣ',
    title_ru: 'Заместитель Председателя - Председатель военной коллегии',
    title_en: 'Deputy Chief Justice - Chairman of the Military Collegium',
    bio_tj: 'Роҳбарии коллегияи ҳарбӣ, назорати фаъолияти судҳои ҳарбии гарнизонҳо ва ташкили қабули шаҳрвандон.',
    bio_ru: 'Руководство военной коллегией, надзор за деятельностью военных судов гарнизонов и организация приёма граждан.',
    bio_en: 'Leadership of the military collegium, oversight of garrison military courts, and coordination of citizen reception schedule.',
    image_url: '',
    initials: 'РҲ',
  },
];

export const LeadershipPage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(language === 'en' ? 'Court Leadership' : language === 'tj' ? 'Роҳбарияти суд' : 'Руководство суда');
  const [leaders, setLeaders] = React.useState<any[]>(DEFAULT_LEADERS);

  React.useEffect(() => {
    fetch('/api/leadership')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLeaders(data);
        }
      })
      .catch(() => {
        setLeaders(DEFAULT_LEADERS);
      });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 sm:px-12 lg:px-24 bg-theme-bg text-theme-text overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-theme-gold/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        <Breadcrumbs
          items={[{ label: language === 'en' ? 'Leadership' : language === 'tj' ? 'Роҳбарият' : 'Руководство' }]}
        />
        <header className="border-b border-theme-border/30 pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-theme-gold shadow-[0_0_15px_rgba(202,138,4,0.6)] animate-pulse" />
            <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">
              {language === 'en' ? 'Leadership' : language === 'tj' ? 'Роҳбарият' : 'Руководство'}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl font-serif text-theme-text font-bold tracking-tight"
          >
            {language === 'en' ? 'Leadership of the Supreme Court' : language === 'tj' ? 'Роҳбарияти Суди Олӣ' : 'Руководство Верховного суда'}
          </motion.h1>
        </header>

        <section className="space-y-12">
          {leaders.map((leader, index) => (
            <motion.div 
              key={leader.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 + (index * 0.15) }}
              whileHover={{ scale: 1.01 }}
              className="relative group p-[1px] rounded-3xl bg-gradient-to-br from-theme-gold/30 via-theme-border/20 to-transparent overflow-hidden"
            >
              {/* Spotlight effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-theme-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex flex-col md:flex-row gap-10 p-8 sm:p-10 content-card relative z-10 h-full">
                
                <div className="w-56 h-72 sm:w-64 sm:h-80 glass glass-card flex items-center justify-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-3">
                    <span className="font-serif font-bold text-theme-gold text-5xl">{leader.initials || 'РО'}</span>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-theme-textMuted">СУДИ ОЛӢ</span>
                  </div>
                </div>
                
                <div className="space-y-6 flex-1 pt-4">
                  <div>
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                      className="text-3xl sm:text-4xl font-medium text-theme-text"
                    >
                      {language === 'en' ? leader.name_en : language === 'tj' ? leader.name_tj : leader.name_ru}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                      className="text-theme-gold font-mono text-sm uppercase mt-3 tracking-wider flex items-center gap-2"
                    >
                      <span className="w-8 h-[1px] bg-theme-gold/50" />
                      {language === 'en' ? leader.title_en : language === 'tj' ? leader.title_tj : leader.title_ru}
                    </motion.p>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 + (index * 0.1) }}
                    className="pt-4 border-t border-theme-border/20"
                  >
                    <p className="text-base text-theme-textSec leading-relaxed font-light">
                      {language === 'en' ? leader.bio_en || 'Biography not available.' : language === 'tj' ? leader.bio_tj || 'Маълумотнома дастрас нест.' : leader.bio_ru || 'Биография не указана.'}
                    </p>
                  </motion.div>
                </div>

              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
};


