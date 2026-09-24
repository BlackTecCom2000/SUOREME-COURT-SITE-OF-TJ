import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Users, 
  Scale, 
  Shield, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Search, 
  ChevronRight, 
  Sparkles,
  Building2,
  Mail,
  Award,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export interface StructureEntity {
  id: string;
  category: 'leadership' | 'central_organs' | 'collegiums' | 'apparatus' | 'secretariats';
  titleTj: string;
  titleRu: string;
  titleEn: string;
  subtitleTj: string;
  subtitleRu: string;
  subtitleEn: string;
  leaderTj?: string;
  leaderRu?: string;
  leaderEn?: string;
  descTj: string;
  descRu: string;
  descEn: string;
  judgesCount?: number;
  departmentsCount?: number;
  icon: any;
  code: string;
  badges?: string[];
  duties?: string[];
}

export const SUPREME_COURT_STRUCTURE_DATA: StructureEntity[] = [
  // 1. Leadership Core
  {
    id: 'chief_justice',
    category: 'leadership',
    titleTj: 'Раиси Суди Олии Ҷумҳурии Тоҷикистон',
    titleRu: 'Председатель Верховного Суда Республики Таджикистан',
    titleEn: 'Chief Justice of the Supreme Court of Tajikistan',
    subtitleTj: 'Роҳбарии олии ҳокимияти судӣ ва раёсати Пленум',
    subtitleRu: 'Высшее руководство судебной властью и председательство в Пленуме',
    subtitleEn: 'Supreme Judicial Leadership & Presiding Officer of the Plenum',
    leaderTj: 'Мирзозода Рустам Пираҳмад',
    leaderRu: 'Мирзозода Рустам Пирахмад',
    leaderEn: 'Mirzozoda Rustam Pirahmad',
    descTj: 'Роҳбарии умумии ташкили фаъолияти судҳои ҷумҳурӣ, таъмини мустақилияти судяҳо, назорати судии санадҳо ва намояндагии ҳокимияти судӣ дар сатҳи байналмилалӣ.',
    descRu: 'Общее руководство судебной системой Таджикистана, созыв и ведение заседаний Пленума и Президиума, обеспечение независимости судей.',
    descEn: 'Supreme management of judicial organs across Tajikistan, presiding over the Plenum and Presidium, and constitutional representation.',
    judgesCount: 1,
    icon: Landmark,
    code: 'LEADER-01',
    badges: ['КОНСТИТУТСИОНӢ', 'МАҚОМИ ОЛӢ'],
    duties: [
      'Даъват ва раёсати маҷлисҳои Пленум ва Раёсат',
      'Тақсими вазифаҳо байни муовинони Раис',
      'Намояндагӣ дар муносибатҳои давлатӣ ва байналмилалӣ',
      'Таъмини риояи саривақтии адолати судӣ'
    ]
  },
  {
    id: 'first_deputy',
    category: 'leadership',
    titleTj: 'Муовини якуми Раиси Суди Олӣ',
    titleRu: 'Первый заместитель Председателя Верховного Суда',
    titleEn: 'First Deputy Chief Justice',
    subtitleTj: 'Ҳамоҳангсозии фаъолияти коллегияҳо ва назорат',
    subtitleRu: 'Координация судебных коллегий и надзорная деятельность',
    subtitleEn: 'Coordination of Judicial Collegiums & Supervisory Audits',
    leaderTj: 'Лутфуллозода Шавкат',
    leaderRu: 'Лутфуллозода Шавкат',
    leaderEn: 'Lutfullozoda Shavkat',
    descTj: 'Иҷрои вазифаҳои Раис дар ҳолати набудани ӯ, роҳбарии фаъолияти ташкили баррасии парвандаҳои ҷиноятӣ ва назорати риояи қонуният дар мурофиаҳо.',
    descRu: 'Исполнение обязанностей Председателя в его отсутствие, координация работы уголовной и надзорной коллегий.',
    descEn: 'Acting Chief Justice during absences, oversight of criminal jurisprudence and supervisory case flows.',
    judgesCount: 1,
    icon: Award,
    code: 'LEADER-02',
    badges: ['НАЗОРАТӢ', 'РОҲБАРИЯТ']
  },
  {
    id: 'deputy_civil',
    category: 'leadership',
    titleTj: 'Муовини Раиси Суди Олӣ',
    titleRu: 'Заместитель Председателя Верховного Суда',
    titleEn: 'Deputy Chief Justice',
    subtitleTj: 'Роҳбарии соҳаи баҳсҳои маданӣ ва оилавӣ',
    subtitleRu: 'Кураторство гражданского и семейного судопроизводства',
    subtitleEn: 'Oversight of Civil & Family Jurisdictions',
    leaderTj: 'Тағозода Абдуқаҳҳор Саидмурод',
    leaderRu: 'Тагозода Абдукаххор Саидмурод',
    leaderEn: 'Tagozoda Abdukahhor Saidmurod',
    descTj: 'Ҳамоҳангсозӣ ва назорати фаъолияти коллегияҳои судӣ оид ба парвандаҳои маданӣ ва оилавӣ, баррасии шикоятҳои назоратӣ ва муроҷиатҳои шаҳрвандон.',
    descRu: 'Руководство и контроль за надлежащим рассмотрением гражданских, семейных споров и анализом судебной практики.',
    descEn: 'Direction of civil and family dispute resolutions, appeals management and legal synthesis.',
    judgesCount: 1,
    icon: Users,
    code: 'LEADER-03',
    badges: ['МАДАНӢ', 'ОИЛАВӢ']
  },
  {
    id: 'deputy_military',
    category: 'leadership',
    titleTj: 'Муовини Раис — Раиси коллегияи ҳарбӣ',
    titleRu: 'Заместитель Председателя — Председатель военной коллегии',
    titleEn: 'Deputy Chief Justice — Chairman of the Military Collegium',
    subtitleTj: 'Роҳбарии адлияи ҳарбӣ ва судҳои гарнизонҳо',
    subtitleRu: 'Руководство военной юстицией и гарнизонными судами',
    subtitleEn: 'Military Justice Leadership & Garrison Courts Oversight',
    leaderTj: 'Раҷабзода Ҳотам Назар',
    leaderRu: 'Раджабзода Хотам Назар',
    leaderEn: 'Rajabzoda Hotam Nazar',
    descTj: 'Роҳбарии мустақими коллегияи ҳарбии Суди Олӣ, назорат ва ҳамоҳангсозии фаъолияти судҳои ҳарбии гарнизонҳои Ҷумҳурии Тоҷикистон.',
    descRu: 'Непосредственное руководство военной коллегией, надзор за деятельностью военных судов гарнизонов республики.',
    descEn: 'Direct command of the Military Collegium, garrison military tribunal coordination and armed forces legal disputes.',
    judgesCount: 1,
    icon: Shield,
    code: 'LEADER-04',
    badges: ['ҲАРБӢ', 'ГАРНИЗОНҲО']
  },

  // 2. Central Organs
  {
    id: 'plenum',
    category: 'central_organs',
    titleTj: 'Пленуми Суди Олии Ҷумҳурии Тоҷикистон',
    titleRu: 'Пленум Верховного Суда Республики Таджикистан',
    titleEn: 'Plenum of the Supreme Court of Tajikistan',
    subtitleTj: 'Мақоми олии дастурдиҳанда ва ҷамъбасти амалия',
    subtitleRu: 'Высший руководящий орган судебной практики',
    subtitleEn: 'Supreme Interpretive & Regulatory Judicial Forum',
    leaderTj: 'Дар ҳайати ҳамаи судяҳои Суди Олӣ',
    leaderRu: 'В составе всех судей Верховного Суда',
    leaderEn: 'Composed of all Supreme Court Judges',
    descTj: 'Қабули қарорҳои дастурӣ оид ба татбиқи якхелаи қонунгузорӣ, пешниҳоди ташаббуси қонунгузорӣ ва тасдиқи сохтори коллегияҳои судӣ.',
    descRu: 'Принятие руководящих разъяснений по применению законодательства, законодательная инициатива и утверждение составов судебных органов.',
    descEn: 'Issuance of binding judicial precedents, legislative initiatives, and certification of specialized judicial benches.',
    judgesCount: 45,
    icon: BookOpen,
    code: 'ORGAN-PLENUM',
    badges: ['ҚАРОРҲОИ ДАСТУРӢ', 'САЛОҲИЯТИ ПУРРА'],
    duties: [
      'Баррасии маводҳои ҷамъбасти амалияи судӣ',
      'Додани тавзеҳот ба судҳо оид ба татбиқи қонунҳо',
      'Тасдиқи ҳайати коллегияҳои судии Суди Олӣ',
      'Баррасии пешниҳодҳои Раиси Суди Олӣ'
    ]
  },
  {
    id: 'presidium',
    category: 'central_organs',
    titleTj: 'Раёсати Суди Олӣ (Президиум)',
    titleRu: 'Президиум Верховного Суда',
    titleEn: 'Presidium of the Supreme Court',
    subtitleTj: 'Мақоми олии назорати судӣ ва ташкилӣ',
    subtitleRu: 'Орган надзорного и организационного руководства',
    subtitleEn: 'Supervisory & Executive Judicial Board',
    leaderTj: 'Раис: Мирзозода Р.П. (6 аъзои Раёсат)',
    leaderRu: 'Председатель: Мирзозода Р.П. (6 членов Президиума)',
    leaderEn: 'Chairman: Mirzozoda R.P. (6 Board Members)',
    descTj: 'Баррасии парвандаҳои судӣ бо тартиби назоратӣ аз рӯи эътирозҳои Раиси Суди Олӣ ва Прокурори генералӣ, ташкили кори дастгоҳ.',
    descRu: 'Рассмотрение судебных дел в порядке надзора по протестам Председателя и Генерального прокурора, координация работы палат.',
    descEn: 'Supervisory review of final judgments based on official petitions by the Chief Justice and Prosecutor General.',
    judgesCount: 7,
    icon: Layers,
    code: 'ORGAN-PRESIDIUM',
    badges: ['НАЗОРАТӢ', 'ҚАТЪӢ']
  },
  {
    id: 'training_center',
    category: 'central_organs',
    titleTj: 'Маркази таълимии судяҳо',
    titleRu: 'Учебный центр судей',
    titleEn: 'Judicial Training Center',
    subtitleTj: 'Такмили ихтисос ва омодасозии кадрҳои судӣ',
    subtitleRu: 'Повышение квалификации и переподготовка судейских кадров',
    subtitleEn: 'Professional Qualification & Judicial Academy',
    leaderTj: 'Директори Марказ',
    leaderRu: 'Директор Учебного центра',
    leaderEn: 'Director of Judicial Training',
    descTj: 'Ташкили курсҳои мунтазами бозомӯзӣ ва такмили ихтисоси судяҳо ва кормандони дастгоҳи судҳои Ҷумҳурии Тоҷикистон бо ҷалби технологияҳои рақамӣ.',
    descRu: 'Проведение образовательных программ, повышение квалификации действующих судей и работников аппаратов судов.',
    descEn: 'Execution of advanced legal curricula, continuing judicial education, and digital court skills certifications.',
    departmentsCount: 3,
    icon: GraduationCap,
    code: 'ORGAN-TRAINING',
    badges: ['ТАЪЛИМ', 'ИННОВАТСИЯ']
  },

  // 3. The 5 Judicial Collegiums
  {
    id: 'col_criminal',
    category: 'collegiums',
    titleTj: 'Коллегияи судӣ оид ба парвандаҳои ҷиноятӣ',
    titleRu: 'Судебная коллегия по уголовным делам',
    titleEn: 'Judicial Collegium for Criminal Cases',
    subtitleTj: 'Баррасии ҷиноятҳои махсусан вазнин ва шикоятҳои кассатсионӣ',
    subtitleRu: 'Рассмотрение особо тяжких преступлений и кассационных жалоб',
    subtitleEn: 'High-Level Criminal Trials, Cassation & Supervisory Reviews',
    leaderTj: 'Раиси коллегияи ҷиноятӣ',
    leaderRu: 'Председатель уголовной коллегии',
    leaderEn: 'Chairman of Criminal Collegium',
    descTj: 'Баррасии парвандаҳои ҷиноятии категорияи махсус дар зинаи аввал, санҷиши қонунияти ҳукмҳо бо тартиби кассатсионӣ ва назоратӣ.',
    descRu: 'Рассмотрение сложнейших уголовных дел первой инстанции, кассационный пересмотр приговоров нижестоящих судов.',
    descEn: 'Jurisdiction over major criminal offenses, appellate review of verdicts, and procedural legality audits.',
    judgesCount: 12,
    icon: Scale,
    code: 'COL-CRIMINAL',
    badges: ['ҶИНОЯТӢ', 'КАССАТСИЯ', 'НАЗОРАТ'],
    duties: [
      'Баррасии парвандаҳои ҷиноятии тобеияти Суди Олӣ',
      'Санҷиши шикояту эътирозҳои кассатсионӣ',
      'Таҳлили сабабҳои содиршавии ҷиноятҳо'
    ]
  },
  {
    id: 'col_civil',
    category: 'collegiums',
    titleTj: 'Коллегияи судӣ оид ба парвандаҳои маданӣ',
    titleRu: 'Судебная коллегия по гражданским делам',
    titleEn: 'Judicial Collegium for Civil Cases',
    subtitleTj: 'Баҳсҳои молумулкӣ, шартномавӣ ва ҳимояи ҳуқуқҳои конститутсионӣ',
    subtitleRu: 'Имущественные, договорные споры и защита прав граждан',
    subtitleEn: 'Property, Contractual & Constitutional Civil Disputes',
    leaderTj: 'Раиси коллегияи маданӣ',
    leaderRu: 'Председатель гражданской коллегии',
    leaderEn: 'Chairman of Civil Collegium',
    descTj: 'Ҳаллу фасли баҳсҳои мураккаби ҳуқуқии шаҳрвандон ва шахсони ҳуқуқӣ, ҳимояи ҳуқуқи моликият ва шартномаҳои калонҳаҷм.',
    descRu: 'Рассмотрение масштабных гражданских споров, защита права собственности, проверка решений судов первой инстанции.',
    descEn: 'Resolution of multi-tier civil litigation, protection of economic rights, and review of lower civil judgments.',
    judgesCount: 10,
    icon: Scale,
    code: 'COL-CIVIL',
    badges: ['МАДАНӢ', 'МОЛУМУЛК', 'ҲУҚУҚ']
  },
  {
    id: 'col_family',
    category: 'collegiums',
    titleTj: 'Коллегияи судӣ оид ба парвандаҳои оилавӣ',
    titleRu: 'Судебная коллегия по семейным делам',
    titleEn: 'Judicial Collegium for Family Cases',
    subtitleTj: 'Ҳимояи манфиатҳои кӯдак, модар ва муносибатҳои оилавӣ',
    subtitleRu: 'Защита интересов семьи, материнства и прав ребенка',
    subtitleEn: 'Protection of Family, Children Rights & Domestic Law',
    leaderTj: 'Раиси коллегияи оилавӣ',
    leaderRu: 'Председатель семейной коллегии',
    leaderEn: 'Chairman of Family Collegium',
    descTj: 'Баррасии баҳсҳои оилавӣ, тақсими молу мулки зану шавҳар, муайян намудани ҷои истиқомати фарзандон ва ситонидани алимент.',
    descRu: 'Специализированное рассмотрение семейных споров, вопросов опеки, алиментных обязательств и защиты прав несовершеннолетних.',
    descEn: 'Dedicated family dispute adjudications, custody determinations, support obligations, and youth welfare protection.',
    judgesCount: 6,
    icon: Users,
    code: 'COL-FAMILY',
    badges: ['ОИЛАВӢ', 'ҲИМОЯИ КӮДАК']
  },
  {
    id: 'col_admin',
    category: 'collegiums',
    titleTj: 'Коллегияи судӣ оид ба ҳуқуқвайронкунии маъмурӣ',
    titleRu: 'Судебная коллегия по административным правонарушениям',
    titleEn: 'Judicial Collegium for Administrative Offenses',
    subtitleTj: 'Назорати қарорҳои мақомоти давлатӣ ва парвандаҳои маъмурӣ',
    subtitleRu: 'Контроль актов госорганов и административные правонарушения',
    subtitleEn: 'Administrative Violations & State Action Judicial Reviews',
    leaderTj: 'Раиси коллегияи маъмурӣ',
    leaderRu: 'Председатель административной коллегии',
    leaderEn: 'Chairman of Administrative Collegium',
    descTj: 'Санҷиши қонунияти қарорҳои мақомоти ҳокимияти давлатӣ ва баррасии шикоятҳо оид ба парвандаҳои маъмурии мураккаб.',
    descRu: 'Судебный контроль за законностью актов должностных лиц и рассмотрение дел об административных правонарушениях.',
    descEn: 'Judicial audit of administrative actions, compliance verifications, and regulatory appeals.',
    judgesCount: 8,
    icon: Shield,
    code: 'COL-ADMIN',
    badges: ['МАЪМУРӢ', 'НАЗОРАТИ ДАВЛАТӢ']
  },
  {
    id: 'col_military',
    category: 'collegiums',
    titleTj: 'Коллегияи ҳарбии Суди Олӣ',
    titleRu: 'Военная коллегия Верховного Суда',
    titleEn: 'Military Collegium of the Supreme Court',
    subtitleTj: 'Адлия дар Қувваҳои Мусаллаҳ ва дигар воҳидҳои низомӣ',
    subtitleRu: 'Правосудие в Вооруженных Силах и воинских формированиях',
    subtitleEn: 'Military Justice & Armed Forces Legal Enforcement',
    leaderTj: 'Раҷабзода Ҳотам Назар',
    leaderRu: 'Раджабзода Хотам Назар',
    leaderEn: 'Rajabzoda Hotam Nazar',
    descTj: 'Баррасии парвандаҳои тобеияти судҳои ҳарбӣ, назорати судии фаъолияти судҳои ҳарбии гарнизонҳо ва ҳимояи ҳуқуқи хизматчиёни ҳарбӣ.',
    descRu: 'Отправление правосудия в отношении военнослужащих, руководство гарнизонными военными судами Республики Таджикистан.',
    descEn: 'Administration of military law, supervisory jurisdiction over regional garrison tribunals, and service personnel rights.',
    judgesCount: 6,
    icon: Shield,
    code: 'COL-MILITARY',
    badges: ['ҲАРБӢ', 'ГАРНИЗОНӢ']
  },

  // 4. Apparatus Directorates (8 Central Departments)
  {
    id: 'app_courts_org',
    category: 'apparatus',
    titleTj: 'Раёсати ташкили кори судҳо',
    titleRu: 'Управление организации работы судов',
    titleEn: 'Court Organization Directorate',
    subtitleTj: 'Таъминоти ташкилӣ ва инфрасохтории судҳои ҷумҳурӣ',
    subtitleRu: 'Организационное и инфраструктурное обеспечение судов',
    subtitleEn: 'Courts Infrastructure & Logistics Directorate',
    descTj: 'Ташкили фаъолияти моддӣ, техникӣ, бинокорӣ ва шароити кории тамоми судҳои поёнии шаҳру ноҳияҳои Тоҷикистон.',
    descRu: 'Обеспечение материально-технической базы, условий работы и оснащения судов всех инстанций.',
    descEn: 'Logistics, courtrooms technical readiness, and infrastructure provisioning across republican courts.',
    icon: Building2,
    code: 'APP-01'
  },
  {
    id: 'app_appeals',
    category: 'apparatus',
    titleTj: 'Раёсати баррасии муроҷиатҳо',
    titleRu: 'Управление рассмотрения обращений',
    titleEn: 'Citizen Appeals & Reception Directorate',
    subtitleTj: 'Қабули шаҳрвандон, аризаҳо ва муроҷиатҳои электронӣ',
    subtitleRu: 'Прием граждан, рассмотрение заявлений и онлайн-обращений',
    subtitleEn: 'Appeals Processing & Public Petitions Bureau',
    descTj: 'Бақайдгирӣ ва таҳлили муроҷиатҳои шаҳрвандон, ташкили ҷадвали қабули шахсии роҳбарият ва назорати иҷрои ҷавобҳо.',
    descRu: 'Регистрация, мониторинг и координация рассмотрения обращений граждан и юридических лиц.',
    descEn: 'Registration, routing, and timeline enforcement of citizen inquiries and public electronic submissions.',
    icon: Mail,
    code: 'APP-02'
  },
  {
    id: 'app_hr',
    category: 'apparatus',
    titleTj: 'Раёсати кадрҳо ва корҳои махсус',
    titleRu: 'Управление кадров и специальных работ',
    titleEn: 'Human Resources & Special Affairs Directorate',
    subtitleTj: 'Интихоби кадрҳо, парвандаҳои шахсӣ ва амнияти хизматӣ',
    subtitleRu: 'Подбор кадров, личные дела и служебная безопасность',
    subtitleEn: 'Judicial HR & Personnel Security Administration',
    descTj: 'Ташкили озмунҳо барои ишғоли мансабҳои давлатии хизмати судӣ, баҳисобгирии кадрҳо ва назорати интизоми меҳнатӣ.',
    descRu: 'Формирование судейского резерва, учет кадров и соблюдение государственной службы.',
    descEn: 'Personnel management, civil service recruitment, and judicial ethics compliance.',
    icon: Users,
    code: 'APP-03'
  },
  {
    id: 'app_records',
    category: 'apparatus',
    titleTj: 'Раёсати коргузорӣ ва назорат',
    titleRu: 'Управление делопроизводства и контроля',
    titleEn: 'Records Management & Procedural Control Directorate',
    subtitleTj: 'Гардиши ҳуҷҷатҳои электронӣ, назорати мӯҳлатҳо ва архив',
    subtitleRu: 'Электронный документооборот, контроль сроков и архив',
    subtitleEn: 'Electronic Document Flow & Archival Management',
    descTj: 'Баҳисобгирии даромад ва содироти санадҳо, назорати иҷрои супоришҳои роҳбарият ва нигаҳдории бойгонии марказӣ.',
    descRu: 'Обеспечение централизованного документооборота, ведение архива и контроль исполнения поручений.',
    descEn: 'Centralized registry, digital archival operations, and executive deadline auditing.',
    icon: FileText,
    code: 'APP-04'
  },
  {
    id: 'app_stats',
    category: 'apparatus',
    titleTj: 'Раёсати омор ва ҷамъбасти амалияи судӣ',
    titleRu: 'Управление статистики и обобщения судебной практики',
    titleEn: 'Statistics & Judicial Practice Analysis Directorate',
    subtitleTj: 'Таҳлили омории парвандаҳо ва омодасозии маърузаҳо барои Пленум',
    subtitleRu: 'Статистический анализ дел и подготовка материалов для Пленума',
    subtitleEn: 'Judicial Analytics & Statistical Research Division',
    descTj: 'Таҳлили рақамии сифати баррасии парвандаҳо дар ҳамаи судҳо ва омода намудани хулосаҳо барои қарорҳои дастурӣ.',
    descRu: 'Сбор судебной статистики по всей республике, аналитическая обработка и выявление правовых тенденций.',
    descEn: 'Nationwide statistical analysis, judicial data analytics, and interpretive support for the Supreme Plenum.',
    icon: BookOpen,
    code: 'APP-05'
  },
  {
    id: 'app_instances',
    category: 'apparatus',
    titleTj: 'Раёсати марҳилаҳои якум, кассатсионӣ ва назоратӣ',
    titleRu: 'Управление первой инстанции, кассации и надзора',
    titleEn: 'First Instance, Cassation & Supervisory Case Flow Directorate',
    subtitleTj: 'Таъминоти мурофиавии марҳилаҳои судии Суди Олӣ',
    subtitleRu: 'Процессуальное обеспечение всех стадий рассмотрения дел',
    subtitleEn: 'Procedural Caseflow Management Directorate',
    descTj: 'Ташкили ҷаласаҳои судӣ, даъвати иштирокчиёни мурофиа ва протоколсозии парвандаҳои дар баррасӣ буда.',
    descRu: 'Организационное и процессуальное сопровождение судебных заседаний в Верховном Суде.',
    descEn: 'Courtroom hearings coordination, summons administration, and transcript management.',
    icon: Scale,
    code: 'APP-06'
  },
  {
    id: 'app_finance',
    category: 'apparatus',
    titleTj: 'Раёсати банақшагирӣ, муҳосибот ва таъминот',
    titleRu: 'Управление планирования, бухгалтерии и снабжения',
    titleEn: 'Budget Planning, Accounting & Supply Directorate',
    subtitleTj: 'Банақшагирии буҷетӣ, пардохтҳо ва муҳосиботи давлатӣ',
    subtitleRu: 'Бюджетное планирование, финансовые расчеты и снабжение',
    subtitleEn: 'Fiscal Planning, Accounting & Procurement Division',
    descTj: 'Таъминоти молиявии низоми судии кишвар, банақшагирии хароҷот ва ҳисоботи муҳосиботии давлатӣ.',
    descRu: 'Финансовое обеспечение деятельности судов, бюджетный контроль и государственные закупки.',
    descEn: 'Fiscal administration, state budget planning, and procurement compliance.',
    icon: Building2,
    code: 'APP-07'
  },
  {
    id: 'app_international',
    category: 'apparatus',
    titleTj: 'Раёсати муносибатҳои байналмилалӣ ва меъёрӣ',
    titleRu: 'Управление международных связей и правового нормирования',
    titleEn: 'International Relations & Normative Legal Directorate',
    subtitleTj: 'Ҳамкориҳои байнидавлатӣ ва мутобиқати санадҳои байналмилалӣ',
    subtitleRu: 'Межгосударственное сотрудничество и правовая экспертиза',
    subtitleEn: 'International Legal Cooperation & Treaties Division',
    descTj: 'Ҳамкорӣ бо судҳои олии кишварҳои хориҷӣ, созмонҳои байналмилалӣ ва ташхиси лоиҳаҳои санадҳои меъёрии ҳуқуқӣ.',
    descRu: 'Взаимодействие с международными судебными инстанциями, подготовка двусторонних договоров о правовой помощи.',
    descEn: 'Bilateral legal treaties execution, international judicial forums representation, and draft bills review.',
    icon: Award,
    code: 'APP-08'
  }
];

interface SupremeCourtStructureHubProps {
  onOpenLeadershipModal?: () => void;
  onOpenPlenumModal?: () => void;
  onOpenReceptionModal?: () => void;
  onOpenCollegiumsModal?: () => void;
  onSelectEntity?: (entity: StructureEntity) => void;
}

export const SupremeCourtStructureHub: React.FC<SupremeCourtStructureHubProps> = ({
  onOpenLeadershipModal,
  onOpenPlenumModal,
  onOpenReceptionModal,
  onOpenCollegiumsModal,
  onSelectEntity,
}) => {
  const { language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Load dynamically from CMS storage if updated by admin
  const [entitiesList] = useState<StructureEntity[]>(() => {
    const saved = localStorage.getItem('sudtj_structure_cms_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SUPREME_COURT_STRUCTURE_DATA;
      }
    }
    return SUPREME_COURT_STRUCTURE_DATA;
  });

  const [selectedEntityId, setSelectedEntityId] = useState<string>('chief_justice');

  // Filtered dataset based on category & search term
  const filteredEntities = useMemo(() => {
    return entitiesList.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.titleTj.toLowerCase().includes(q) ||
        item.titleRu.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.leaderTj && item.leaderTj.toLowerCase().includes(q)) ||
        (item.leaderRu && item.leaderRu.toLowerCase().includes(q)) ||
        item.descTj.toLowerCase().includes(q) ||
        item.descRu.toLowerCase().includes(q)
      );
    });
  }, [entitiesList, activeCategory, searchQuery]);

  const selectedEntity = useMemo(() => {
    return (
      entitiesList.find((e) => e.id === selectedEntityId) ||
      entitiesList[0] ||
      SUPREME_COURT_STRUCTURE_DATA[0]
    );
  }, [entitiesList, selectedEntityId]);

  const getTitle = (item: StructureEntity) => {
    if (language === 'tj') return item.titleTj;
    if (language === 'en') return item.titleEn;
    return item.titleRu;
  };

  const getSubtitle = (item: StructureEntity) => {
    if (language === 'tj') return item.subtitleTj;
    if (language === 'en') return item.subtitleEn;
    return item.subtitleRu;
  };

  const getDesc = (item: StructureEntity) => {
    if (language === 'tj') return item.descTj;
    if (language === 'en') return item.descEn;
    return item.descRu;
  };

  const getLeader = (item: StructureEntity) => {
    if (!item.leaderTj) return null;
    if (language === 'tj') return item.leaderTj;
    if (language === 'en') return item.leaderEn || item.leaderRu;
    return item.leaderRu;
  };

  const categories = [
    { id: 'all', labelTj: 'Ҳамаи сохторҳо', labelRu: 'Все подразделения', labelEn: 'All Units' },
    { id: 'leadership', labelTj: 'Роҳбарият', labelRu: 'Руководство', labelEn: 'Leadership' },
    { id: 'central_organs', labelTj: 'Мақомоти марказӣ', labelRu: 'Центральные органы', labelEn: 'Central Organs' },
    { id: 'collegiums', labelTj: 'Ҳайатҳои судӣ (Коллегияҳо)', labelRu: 'Судебные коллегии', labelEn: 'Collegiums' },
    { id: 'apparatus', labelTj: 'Раёсатҳои Дастгоҳ', labelRu: 'Управления Аппарата', labelEn: 'Apparatus Directorates' },
  ];

  return (
    <div className="w-full space-y-6 text-theme-text select-none">
      
      {/* 1. Header with Search Bar and Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:content-card">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-theme-gold mb-1">
            <Sparkles size={14} />
            <span className="uppercase tracking-wider font-bold">
              {language === 'tj' ? 'СОХТОРИ РАСМИИ СУДИ ОЛӢ' : language === 'en' ? 'OFFICIAL STRUCTURE MATRIX' : 'ОФИЦИАЛЬНАЯ СТРУКТУРА'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-theme-text">
            {language === 'tj'
              ? 'Ҳайат ва Сохтори Суди Олии Ҷумҳурии Тоҷикистон'
              : language === 'en'
              ? 'Composition & Structure of the Supreme Court'
              : 'Состав и структура Верховного Суда Республики Таджикистан'}
          </h2>
          <p className="text-xs sm:text-sm text-theme-textSec mt-1">
            {language === 'tj'
              ? 'Маълумоти пурра оид ба роҳбарият, ҳайатҳои тахассусии судӣ, Раёсат, Пленум ва сохтори Дастгоҳ.'
              : language === 'en'
              ? 'Comprehensive institutional directory of Supreme Court leadership, specialized benches, and directorates.'
              : 'Структура, коллегии, руководство и организационные подразделения Верховного Суда.'}
          </p>
        </div>

        {/* Search input with live filter */}
        <div className="relative min-w-[280px] sm:min-w-[340px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-gold" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'tj'
                ? 'Ҷустуҷӯ аз рӯи номи шуъба, роҳбар ё вазифа...'
                : language === 'en'
                ? 'Search unit, leader, or jurisdiction...'
                : 'Поиск подразделения, руководителя, коллегии...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-theme-bg/80 border border-theme-border text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-theme-gold transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-theme-textMuted hover:text-theme-gold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-mono font-medium transition-all whitespace-nowrap border shadow-sm ${
              activeCategory === cat.id
                ? 'border-theme-gold bg-theme-gold text-black font-bold shadow-theme-gold/20 scale-102'
                : 'border-theme-border bg-[var(--glass-surface)] text-theme-textSec hover:border-theme-gold/50 hover:text-theme-text'
            }`}
          >
            {language === 'tj' ? cat.labelTj : language === 'en' ? cat.labelEn : cat.labelRu}
          </button>
        ))}
      </div>

      {/* 3. Main Split View: Left Interactive Grid ➔ Right Dynamic Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Cards Grid */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-theme-textMuted px-1">
            <span>
              {language === 'tj' ? `ЁФТ ШУД: ${filteredEntities.length} ВОҲИД` : language === 'en' ? `FOUND: ${filteredEntities.length} UNITS` : `НАЙДЕНО: ${filteredEntities.length} ПОДРАЗДЕЛЕНИЙ`}
            </span>
            <span className="text-theme-gold font-bold">↻ ИНТИХОБ НАМОЕД</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredEntities.map((entity) => {
              const isSelected = selectedEntityId === entity.id;
              const IconComp = entity.icon || Landmark;

              return (
                <div
                  key={entity.id}
                  onClick={() => {
                    setSelectedEntityId(entity.id);
                    onSelectEntity?.(entity);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEntityId(entity.id);
                    }
                  }}
                  className={`p-4 glass glass-card transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden ${
                    isSelected
                      ? 'border-theme-gold bg-theme-gold/15 shadow-md shadow-theme-gold/15 scale-[1.01]'
                      : 'border-theme-border bg-[var(--glass-surface)] hover:border-theme-gold/50'
                  }`}
                >
                  {/* Subtle active gold accent bar on left */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-theme-gold" />
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className={`p-2 rounded-xl border ${
                        isSelected 
                          ? 'border-theme-gold bg-theme-gold/20 text-theme-gold' 
                          : 'border-theme-border bg-theme-bg text-theme-textSec group-hover:text-theme-gold'
                      }`}>
                        <IconComp size={16} />
                      </div>
                      <span className="font-mono text-[10px] text-theme-gold font-bold">
                        {entity.code}
                      </span>
                    </div>

                    <h4 className={`font-serif font-bold text-xs sm:text-sm leading-snug line-clamp-2 mb-1 ${
                      isSelected ? 'text-theme-text font-black' : 'text-theme-text group-hover:text-theme-gold'
                    }`}>
                      {getTitle(entity)}
                    </h4>

                    <p className="text-[11px] text-theme-textSec line-clamp-2 leading-relaxed">
                      {getSubtitle(entity)}
                    </p>
                  </div>

                  {/* Metadata pill row */}
                  <div className="pt-3 mt-2 border-t border-theme-border/50 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-theme-textMuted truncate max-w-[150px]">
                      {getLeader(entity) || (language === 'tj' ? 'Дастгоҳ' : 'Аппарат')}
                    </span>
                    <span className="text-theme-gold flex items-center gap-1 font-bold">
                      <span>{isSelected ? 'ФАЪОЛ' : 'ТАФСИЛОТ'}</span>
                      <ChevronRight size={12} className={isSelected ? 'translate-x-0.5' : 'group-hover:translate-x-1 transition-transform'} />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredEntities.length === 0 && (
              <div className="col-span-full p-8 text-center rounded-2xl border border-dashed border-theme-border text-theme-textMuted font-mono text-xs">
                {language === 'tj' ? 'Ҳеҷ як сохтор бо ин дархост ёфт нашуд' : 'Ничего не найдено по вашему запросу'}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Detailed Comprehensive Information Panel */}
        <div className="lg:col-span-5 sticky top-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEntity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 glass glass-panel border-theme-gold/40 space-y-5"
            >
              {/* Header of Detail Card */}
              <div className="border-b border-theme-border pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] text-theme-gold uppercase tracking-widest font-bold">
                    {selectedEntity.code} // {selectedEntity.category.toUpperCase()}
                  </span>
                  {selectedEntity.badges && selectedEntity.badges.length > 0 && (
                    <div className="flex items-center gap-1">
                      {selectedEntity.badges.map((b, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-theme-gold/15 border border-theme-gold/30 text-[9px] font-mono text-theme-gold">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-theme-text leading-tight">
                  {getTitle(selectedEntity)}
                </h3>
                <p className="text-xs text-theme-gold font-medium mt-1 font-mono">
                  {getSubtitle(selectedEntity)}
                </p>
              </div>

              {/* Leader info banner if available */}
              {getLeader(selectedEntity) && (
                <div className="p-3.5 glass glass-chip flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-theme-textMuted uppercase block">
                      {language === 'tj' ? 'Роҳбар / Раис:' : language === 'en' ? 'Presiding Officer / Head:' : 'Руководитель / Председатель:'}
                    </span>
                    <span className="font-serif font-bold text-sm text-theme-text mt-0.5 block">
                      {getLeader(selectedEntity)}
                    </span>
                  </div>
                  {selectedEntity.category === 'leadership' && onOpenLeadershipModal && (
                    <button
                      type="button"
                      onClick={onOpenLeadershipModal}
                      className="px-3 py-1.5 rounded-xl border border-theme-gold/40 bg-theme-gold/10 text-theme-gold hover:bg-theme-gold hover:text-black font-mono text-[11px] font-bold transition-colors"
                    >
                      {language === 'tj' ? 'Тарҷумаи ҳол' : 'Биография'}
                    </button>
                  )}
                </div>
              )}

              {/* Full Description */}
              <div>
                <span className="text-[10px] font-mono text-theme-textMuted uppercase tracking-wider block mb-1.5 font-semibold">
                  {language === 'tj' ? 'ТАВСИФИ ФАЪОЛИЯТ ВА ВАКОЛАТҲО' : 'ОПИСАНИЕ И ПОЛНОМОЧИЯ'}
                </span>
                <p className="text-xs sm:text-sm text-theme-text leading-relaxed bg-theme-bg/40 p-4 rounded-2xl border border-theme-border/60">
                  {getDesc(selectedEntity)}
                </p>
              </div>

              {/* Key Duties / Functions list */}
              {selectedEntity.duties && selectedEntity.duties.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-theme-textMuted uppercase tracking-wider block mb-2 font-semibold">
                    {language === 'tj' ? 'ВАЗИФАҲОИ АСОСӢ:' : 'ОСНОВНЫЕ ЗАДАЧИ:'}
                  </span>
                  <div className="space-y-1.5">
                    {selectedEntity.duties.map((duty, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-theme-textSec">
                        <span className="text-theme-gold font-bold shrink-0">•</span>
                        <span>{duty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-theme-border/60 flex items-center gap-2 font-mono text-xs">
                {selectedEntity.category === 'collegiums' && onOpenCollegiumsModal && (
                  <button
                    type="button"
                    onClick={onOpenCollegiumsModal}
                    className="flex-1 py-2.5 rounded-2xl bg-theme-gold text-black font-bold uppercase tracking-wider hover:brightness-110 transition-all text-center"
                  >
                    {language === 'tj' ? 'Ҳайати судяҳои коллегия' : 'Состав судей коллегии'}
                  </button>
                )}
                {selectedEntity.id === 'plenum' && onOpenPlenumModal && (
                  <button
                    type="button"
                    onClick={onOpenPlenumModal}
                    className="flex-1 py-2.5 rounded-2xl bg-theme-gold text-black font-bold uppercase tracking-wider hover:brightness-110 transition-all text-center"
                  >
                    {language === 'tj' ? 'Қарорҳои Пленум' : 'Постановления Пленума'}
                  </button>
                )}
                {selectedEntity.id === 'app_appeals' && onOpenReceptionModal && (
                  <button
                    type="button"
                    onClick={onOpenReceptionModal}
                    className="flex-1 py-2.5 rounded-2xl bg-theme-gold text-black font-bold uppercase tracking-wider hover:brightness-110 transition-all text-center"
                  >
                    {language === 'tj' ? 'Ҷадвали қабули шаҳрвандон' : 'График приема граждан'}
                  </button>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
