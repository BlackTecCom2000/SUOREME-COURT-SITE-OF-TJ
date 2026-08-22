export type Language = 'ru' | 'tj' | 'en';

export type CourtType = 'supreme' | 'regional' | 'city' | 'district' | 'military';
export type CourtStatus = 'online' | 'warning' | 'normal';
export type RegionId = 'dushanbe_rrp' | 'sugd' | 'khatlon' | 'gbao';

export interface CourtNodeData {
  id: string;
  nameRu: string;
  nameTj: string;
  nameEn?: string;
  shortNameRu?: string;
  shortNameTj?: string;
  shortNameEn?: string;
  regionId: RegionId;
  type: CourtType;
  domain: string;
  url: string;
  addressRu: string;
  addressTj: string;
  addressEn?: string;
  phone: string;
  email: string;
  status: CourtStatus;
  latestNewsRu?: string;
  latestNewsTj?: string;
  latestNewsEn?: string;
  latestNewsDate?: string;
  x?: number; // relative SVG coordinate percentage or offset
  y?: number;
}

export interface RegionCluster {
  id: RegionId;
  nameRu: string;
  nameTj: string;
  nameEn?: string;
  shortNameRu: string;
  shortNameTj: string;
  shortNameEn?: string;
  colorHex: string;
  colorGlow: string;
  accentClass: string;
  borderClass: string;
  textClass: string;
  bgGlowClass: string;
  courts: CourtNodeData[];
}

export interface SupportingInstitution {
  id: string;
  nameRu: string;
  nameTj: string;
  nameEn: string;
  roleRu: string;
  roleTj: string;
  roleEn: string;
  descriptionRu: string;
  descriptionTj: string;
  descriptionEn: string;
  position: 'left' | 'right';
}

export interface TreeRootFoundation {
  id: string;
  titleRu: string;
  titleTj: string;
  titleEn: string;
  subtitleRu: string;
  subtitleTj: string;
  subtitleEn: string;
}

export interface JudicialActItem {
  id: string;
  collegium: 'civil' | 'family' | 'criminal' | 'admin' | 'military' | 'economic';
  collegiumNameRu: string;
  collegiumNameTj: string;
  collegiumNameEn?: string;
  date: string;
  titleRu: string;
  titleTj: string;
  titleEn?: string;
  statusRu: string;
  statusTj: string;
  statusEn?: string;
}

export interface HearingItem {
  id: string;
  courtRu: string;
  courtTj: string;
  courtEn?: string;
  judgeRu: string;
  judgeTj: string;
  judgeEn?: string;
  date: string;
  time: string;
  categoryRu: string;
  categoryTj: string;
  categoryEn?: string;
  partiesRu: string;
  partiesTj: string;
  partiesEn?: string;
  room: string;
}

export interface NewsItem {
  id: string;
  date: string;
  titleRu: string;
  titleTj: string;
  titleEn?: string;
  summaryRu: string;
  summaryTj: string;
  summaryEn?: string;
  source: string;
  url: string;
}

export interface SampleDoc {
  id: string;
  titleRu: string;
  titleTj: string;
  titleEn?: string;
  categoryRu: string;
  categoryTj: string;
  categoryEn?: string;
  format: string;
  size: string;
}

// Visual and hierarchical regional sequence required by design blueprint:
// 1. ВМКБ (Cyan), 2. ХАТЛОН (Green), 3. СУҒД (Gold), 4. ДУШАНБЕ + РРП (Violet)
export const VISUAL_REGION_ORDER: RegionId[] = [
  'gbao',
  'khatlon',
  'sugd',
  'dushanbe_rrp',
];

export function getSortedRegionalClusters<T extends { id: RegionId }>(clusters: T[]): T[] {
  return [...clusters].sort((a, b) => {
    const idxA = VISUAL_REGION_ORDER.indexOf(a.id);
    const idxB = VISUAL_REGION_ORDER.indexOf(b.id);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}

// Localized helper functions
export function getCourtName(court: CourtNodeData, lang: Language): string {
  if (lang === 'en' && court.nameEn) return court.nameEn;
  if (lang === 'tj') return court.nameTj;
  return court.nameRu;
}

export function getCourtShortName(court: CourtNodeData, lang: Language): string {
  if (lang === 'en' && court.shortNameEn) return court.shortNameEn.toUpperCase();
  if (lang === 'tj' && court.shortNameTj) return court.shortNameTj.toUpperCase();
  if (lang === 'ru' && court.shortNameRu) return court.shortNameRu.toUpperCase();

  const name = lang === 'en' ? (court.nameEn || court.nameRu) : lang === 'tj' ? court.nameTj : court.nameRu;
  
  // Clean prefixes and boilerplate without truncation or ellipses
  let cleaned = name
    .replace(/^Военный суд гарнизона /i, 'ГАРНИЗОН ')
    .replace(/^Суди ҳарбии гарнизони /i, 'ГАРНИЗОНИ ')
    .replace(/^Military Court of /i, 'MILITARY ')
    .replace(/^Суд города /i, '')
    .replace(/^Суди шаҳри /i, '')
    .replace(/^City Court of /i, '')
    .replace(/^Суд района /i, '')
    .replace(/^Суди ноҳияи /i, '')
    .replace(/^District Court of /i, '')
    .replace(/^(Суд|Суди) /i, '')
    .replace(/ (суд|Court)$/i, '')
    .trim();

  // Standardize famous district names for compact institutional display
  cleaned = cleaned
    .replace(/Исмоили Сомони(и|й|ӣ)?/i, 'И. СОМОНИ')
    .replace(/Бобо(ҷ|дж)он Ғафуров/i, 'Б. ҒАФУРОВ')
    .replace(/Джаббор(а)? Расулов(а)?/i, 'Ҷ. РАСУЛОВ')
    .replace(/Ҷаббор(и)? Расулов/i, 'Ҷ. РАСУЛОВ')
    .replace(/Носир(и)? Хусрав/i, 'Н. ХУСРАВ')
    .replace(/(Шамсиддин(и)?|Ш\.) Шоҳин/i, 'Ш. ШОҲИН')
    .replace(/(Шамсиддин(а)?|Ш\.) Шохин/i, 'Ш. ШОҲИН')
    .replace(/Мир Сайид Алии Ҳамадонӣ/i, 'ҲАМАДОНӢ')
    .replace(/М\.С\.А\. Хамадони/i, 'ҲАМАДОНИ')
    .replace(/Абдураҳмон(и)? Ҷомӣ/i, 'А. ҶОМӢ')
    .replace(/А(бдурахмон)?\. Джоми/i, 'А. ҶОМИ')
    .replace(/Дж(алалиддин)?\. Балхи/i, 'Ҷ. БАЛХӢ')
    .replace(/Ҷ(алолиддин)?\. Балхӣ/i, 'Ҷ. БАЛХӢ')
    .replace(/Согдийской области/i, 'ВИЛОЯТИ СУҒД')
    .replace(/Хатлонской области/i, 'ВИЛОЯТИ ХАТЛОН')
    .replace(/Горно-Бадахшанской автономной области/i, 'СУДИ ВМКБ');

  return cleaned.toUpperCase();
}

export function getCourtAddress(court: CourtNodeData, lang: Language): string {
  if (lang === 'en' && court.addressEn) return court.addressEn;
  if (lang === 'tj') return court.addressTj;
  return court.addressRu;
}

export function getRegionName(cluster: RegionCluster, lang: Language): string {
  if (lang === 'en' && cluster.nameEn) return cluster.nameEn;
  if (lang === 'tj') return cluster.nameTj;
  return cluster.nameRu;
}

export function getRegionShortName(cluster: RegionCluster, lang: Language): string {
  if (lang === 'en' && cluster.shortNameEn) return cluster.shortNameEn;
  if (lang === 'tj') return cluster.shortNameTj;
  return cluster.shortNameRu;
}

// 1. Supporting Institutional Nodes near the Supreme Court
export const SUPPORTING_INSTITUTIONS: SupportingInstitution[] = [
  {
    id: 'council',
    nameRu: 'СОВЕТ СУДЕЙ',
    nameTj: 'ШӮРОИ СУДҲО',
    nameEn: 'COUNCIL OF JUDGES',
    roleRu: 'СТРАТЕГИЧЕСКОЕ ПЛАНИРОВАНИЕ И АНАЛИЗ',
    roleTj: 'БАНАҚШАГИРИИ СТРАТЕГӢ ВА ТАҲЛИЛ',
    roleEn: 'STRATEGIC PLANNING & ANALYSIS',
    descriptionRu: 'Орган судейского сообщества по укреплению независимости судей и этическим стандартам.',
    descriptionTj: 'Мақоми ҷомеаи судяҳо оид ба таҳкими мустақилияти судяҳо ва меъёрҳои одоб.',
    descriptionEn: 'Judicial community body for strengthening judicial independence and professional ethics.',
    position: 'left',
  },
  {
    id: 'administration',
    nameRu: 'АДМИНИСТРАТИВНОЕ УПРАВЛЕНИЕ',
    nameTj: 'РАЁСАТИ МАЪМУРИЯТ',
    nameEn: 'ADMINISTRATIVE DIRECTORATE',
    roleRu: 'АППАРАТНОЕ ОБЕСПЕЧЕНИЕ И ИНФРАСТРУКТУРА',
    roleTj: 'ИДОРАКУНИИ ДАСТГОҲ ВА ТАЪМИНОТ',
    roleEn: 'APPARATUS & INFRASTRUCTURE MANAGEMENT',
    descriptionRu: 'Организационное, материально-техническое и цифровое обеспечение деятельности судов.',
    descriptionTj: 'Таъминоти ташкилӣ, моддӣ-техникӣ ва рақамии фаъолияти судҳои ҷумҳурӣ.',
    descriptionEn: 'Organizational, logistical, and digital infrastructure support for all courts.',
    position: 'right',
  },
];

// 2. Foundational Roots for Tree Mode
export const TREE_ROOTS: TreeRootFoundation[] = [
  {
    id: 'const',
    titleRu: 'КОНСТИТУЦИЯ',
    titleTj: 'КОНСТИТУТСИЯ',
    titleEn: 'CONSTITUTION',
    subtitleRu: 'Высшая юридическая сила',
    subtitleTj: 'Эътибори олии ҳуқуқӣ',
    subtitleEn: 'Supreme Legal Authority',
  },
  {
    id: 'law',
    titleRu: 'ЗАКОН',
    titleTj: 'ҚОНУН',
    titleEn: 'THE LAW',
    subtitleRu: 'Верховенство права',
    subtitleTj: 'Волоияти ҳуқуқ',
    subtitleEn: 'Rule of Law',
  },
  {
    id: 'justice',
    titleRu: 'ПРАВОСУДИЕ',
    titleTj: 'АДОЛАТИ СУДӢ',
    titleEn: 'JUSTICE',
    subtitleRu: 'Беспристрастность и равенство',
    subtitleTj: 'Беғаразӣ ва баробарӣ',
    subtitleEn: 'Impartiality & Equality',
  },
  {
    id: 'human_rights',
    titleRu: 'ПРАВА ЧЕЛОВЕКА',
    titleTj: 'ҲУҚУҚИ ИНСОН',
    titleEn: 'HUMAN RIGHTS',
    subtitleRu: 'Высшая ценность общества',
    subtitleTj: 'Арзиши олии ҷомеа',
    subtitleEn: 'Supreme Value of Society',
  },
];

// 3. Central Supreme Court Node
export const SUPREME_COURT_NODE: CourtNodeData = {
  id: 'supreme-court',
  nameRu: 'ВЕРХОВНЫЙ СУД РЕСПУБЛИКИ ТАДЖИКИСТАН',
  nameTj: 'СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН',
  nameEn: 'SUPREME COURT OF THE REPUBLIC OF TAJIKISTAN',
  shortNameRu: 'Верховный суд РТ',
  shortNameTj: 'Суди Олии ҶТ',
  shortNameEn: 'Supreme Court of RT',
  regionId: 'dushanbe_rrp',
  type: 'supreme',
  domain: 'sud.tj',
  url: 'http://sud.tj',
  addressRu: 'г. Душанбе, ул. Шевченко, 55 (ул. Н. Карабаева, 17)',
  addressTj: 'ш. Душанбе, кӯчаи Шевченко, 55 (кӯчаи Н. Қарабоев, 17)',
  addressEn: 'Dushanbe, 55 Shevchenko St. (17 N. Karabaev St.)',
  phone: '+992 (37) 233-14-15',
  email: 'info@sud.tj',
  status: 'online',
  latestNewsRu: 'Постановление Пленума Верховного суда о соблюдении норм процессуального права',
  latestNewsTj: 'Қарори Пленуми Суди Олӣ доир ба риояи меъёрҳои ҳуқуқи мурофиавӣ',
  latestNewsDate: '18.08.2026',
};

// 4. Complete Regional Courts Clusters Data
export const RAW_REGIONAL_CLUSTERS: RegionCluster[] = [
  // 1. ВМКБ (GBAO) - Cyan / Blue
  {
    id: 'gbao',
    nameRu: 'Горно-Бадахшанская автономная область',
    nameTj: 'Вилояти Мухтори Кӯҳистони Бадахшон',
    shortNameRu: 'ВМКБ',
    shortNameTj: 'ВМКБ',
    colorHex: '#06b6d4',
    colorGlow: 'rgba(6, 182, 212, 0.4)',
    accentClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    textClass: 'text-cyan-300',
    bgGlowClass: 'bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    courts: [
      {
        id: 'vmkb-court',
        nameRu: 'Суд ГБАО',
        nameTj: 'Суди ВМКБ',
        shortNameRu: 'Суд ВМКБ',
        shortNameTj: 'Суди ВМКБ',
        regionId: 'gbao',
        type: 'regional',
        domain: 'vmkb.sud.tj',
        url: 'http://vmkb.sud.tj',
        addressRu: 'г. Хорог, ул. Ленина, 45',
        addressTj: 'ш. Хоруғ, кӯчаи Ленин, 45',
        phone: '+992 (3522) 2-24-10',
        email: 'vmkb@sud.tj',
        status: 'online',
        latestNewsRu: 'Итоги полугодия: обобщение рассмотрения гражданских споров',
        latestNewsTj: 'Ҷамъбасти нимсола: таҳлили баррасии баҳсҳои маданӣ',
        latestNewsDate: '15.08.2026',
      },
      {
        id: 'khorug-court',
        nameRu: 'Суд города Хорог',
        nameTj: 'Суди шаҳри Хоруғ',
        regionId: 'gbao',
        type: 'city',
        domain: 'khorug.sud.tj',
        url: 'http://khorug.sud.tj',
        addressRu: 'г. Хорог, ул. Шостемирова, 12',
        addressTj: 'ш. Хоруғ, кӯчаи Шоҳтемуров, 12',
        phone: '+992 (3522) 2-31-15',
        email: 'khorug@sud.tj',
        status: 'online',
      },
      {
        id: 'shugnon-court',
        nameRu: 'Суд Шугнанского района',
        nameTj: 'Суди ноҳияи Шуғнон',
        regionId: 'gbao',
        type: 'district',
        domain: 'shugnon.sud.tj',
        url: 'http://shugnon.sud.tj',
        addressRu: 'пгт. Вахдат, Шугнан',
        addressTj: 'шаҳраки Ваҳдат, Шуғнон',
        phone: '+992 (3522) 2-45-02',
        email: 'shugnon@sud.tj',
        status: 'normal',
      },
      {
        id: 'darvoz-court',
        nameRu: 'Суд Дарвазского района',
        nameTj: 'Суди ноҳияи Дарвоз',
        regionId: 'gbao',
        type: 'district',
        domain: 'darvoz.sud.tj',
        url: 'http://darvoz.sud.tj',
        addressRu: 'с. Калаи-Хумб, Дарваз',
        addressTj: 'деҳаи Қалъаи Хумб, Дарвоз',
        phone: '+992 (3552) 2-12-30',
        email: 'darvoz@sud.tj',
        status: 'online',
      },
      {
        id: 'vanj-court',
        nameRu: 'Суд Ванджского района',
        nameTj: 'Суди ноҳияи Ванҷ',
        regionId: 'gbao',
        type: 'district',
        domain: 'vanj.sud.tj',
        url: 'http://vanj.sud.tj',
        addressRu: 'пгт. Вандж',
        addressTj: 'шаҳраки Ванҷ',
        phone: '+992 (3551) 2-14-55',
        email: 'vanj@sud.tj',
        status: 'normal',
      },
      {
        id: 'rushon-court',
        nameRu: 'Суд Рушанского района',
        nameTj: 'Суди ноҳияи Рӯшон',
        regionId: 'gbao',
        type: 'district',
        domain: 'rushon.sud.tj',
        url: 'http://rushon.sud.tj',
        addressRu: 'с. Рушан',
        addressTj: 'деҳаи Рӯшон',
        phone: '+992 (3553) 2-11-20',
        email: 'rushon@sud.tj',
        status: 'normal',
      },
      {
        id: 'roshtkala-court',
        nameRu: 'Суд Рошткалинского района',
        nameTj: 'Суди ноҳияи Роштқалъа',
        regionId: 'gbao',
        type: 'district',
        domain: 'roshtkala.sud.tj',
        url: 'http://roshtkala.sud.tj',
        addressRu: 'с. Рошткала',
        addressTj: 'деҳаи Роштқалъа',
        phone: '+992 (3555) 2-18-09',
        email: 'roshtkala@sud.tj',
        status: 'normal',
      },
      {
        id: 'ishkoshim-court',
        nameRu: 'Суд Ишкашимского района',
        nameTj: 'Суди ноҳияи Ишкошим',
        regionId: 'gbao',
        type: 'district',
        domain: 'ishkoshim.sud.tj',
        url: 'http://ishkoshim.sud.tj',
        addressRu: 'пгт. Ишкашим',
        addressTj: 'шаҳраки Ишкошим',
        phone: '+992 (3557) 2-13-40',
        email: 'ishkoshim@sud.tj',
        status: 'normal',
      },
      {
        id: 'murgob-court',
        nameRu: 'Суд Мургабского района',
        nameTj: 'Суди ноҳияи Мурғоб',
        regionId: 'gbao',
        type: 'district',
        domain: 'murgob.sud.tj',
        url: 'http://murgob.sud.tj',
        addressRu: 'пгт. Мургаб, ул. Ленина, 5',
        addressTj: 'шаҳраки Мурғоб, кӯчаи Ленин, 5',
        phone: '+992 (3554) 2-12-01',
        email: 'murgob@sud.tj',
        status: 'normal',
      },
      {
        id: 'harbi-khorug',
        nameRu: 'Военный суд гарнизона Хорог',
        nameTj: 'Суди ҳарбии гарнизони Хоруғ',
        regionId: 'gbao',
        type: 'military',
        domain: 'harbikhorug.sud.tj',
        url: 'http://harbikhorug.sud.tj',
        addressRu: 'г. Хорог, военный городок',
        addressTj: 'ш. Хоруғ, шаҳраки ҳарбӣ',
        phone: '+992 (3522) 2-55-12',
        email: 'harbikhorug@sud.tj',
        status: 'online',
      },
    ],
  },

  // 2. Хатлон (Khatlon) - Emerald / Green
  {
    id: 'khatlon',
    nameRu: 'Хатлонская область',
    nameTj: 'Вилояти Хатлон',
    shortNameRu: 'Хатлон',
    shortNameTj: 'Хатлон',
    colorHex: '#10b981',
    colorGlow: 'rgba(16, 185, 129, 0.4)',
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    textClass: 'text-emerald-300',
    bgGlowClass: 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    courts: [
      {
        id: 'khatlon-court',
        nameRu: 'Суд Хатлонской области',
        nameTj: 'Суди вилояти Хатлон',
        regionId: 'khatlon',
        type: 'regional',
        domain: 'khatlon.sud.tj',
        url: 'http://khatlon.sud.tj',
        addressRu: 'г. Бохтар, ул. Вахдат, 28',
        addressTj: 'ш. Бохтар, кӯчаи Ваҳдат, 28',
        phone: '+992 (3222) 2-30-45',
        email: 'khatlon@sud.tj',
        status: 'online',
        latestNewsRu: 'Семинар по применению законодательства о земельных отношениях',
        latestNewsTj: 'Семинар оид ба татбиқи қонунгузории замин дар минтақа',
        latestNewsDate: '16.08.2026',
      },
      {
        id: 'bokhtar-court',
        nameRu: 'Суд города Бохтар',
        nameTj: 'Суди шаҳри Бохтар',
        regionId: 'khatlon',
        type: 'city',
        domain: 'bokhtar.sud.tj',
        url: 'http://bokhtar.sud.tj',
        addressRu: 'г. Бохтар, ул. Борбад, 10',
        addressTj: 'ш. Бохтар, кӯчаи Борбад, 10',
        phone: '+992 (3222) 2-22-19',
        email: 'bokhtar@sud.tj',
        status: 'online',
      },
      {
        id: 'kulob-court',
        nameRu: 'Суд города Куляб',
        nameTj: 'Суди шаҳри Кӯлоб',
        regionId: 'khatlon',
        type: 'city',
        domain: 'kulob.sud.tj',
        url: 'http://kulob.sud.tj',
        addressRu: 'г. Куляб, ул. И. Сомони, 34',
        addressTj: 'ш. Кӯлоб, кӯчаи И. Сомонӣ, 34',
        phone: '+992 (3322) 2-40-11',
        email: 'kulob@sud.tj',
        status: 'online',
      },
      {
        id: 'norak-court',
        nameRu: 'Суд города Нурек',
        nameTj: 'Суди шаҳри Норак',
        regionId: 'khatlon',
        type: 'city',
        domain: 'norak.sud.tj',
        url: 'http://norak.sud.tj',
        addressRu: 'г. Нурек, ул. Рудаки, 7',
        addressTj: 'ш. Норак, кӯчаи Рӯдакӣ, 7',
        phone: '+992 (3138) 2-18-20',
        email: 'norak@sud.tj',
        status: 'normal',
      },
      {
        id: 'levakant-court',
        nameRu: 'Суд города Левакант',
        nameTj: 'Суди шаҳри Левакант',
        regionId: 'khatlon',
        type: 'city',
        domain: 'levakant.sud.tj',
        url: 'http://levakant.sud.tj',
        addressRu: 'г. Левакант, ул. Дусти, 15',
        addressTj: 'ш. Левакант, кӯчаи Дӯстӣ, 15',
        phone: '+992 (3240) 2-15-08',
        email: 'levakant@sud.tj',
        status: 'normal',
      },
      {
        id: 'kushoniyon-court',
        nameRu: 'Суд района Кушониён',
        nameTj: 'Суди ноҳияи Кӯшониён',
        regionId: 'khatlon',
        type: 'district',
        domain: 'kushoniyon.sud.tj',
        url: 'http://kushoniyon.sud.tj',
        addressRu: 'пгт. И. Сомони, Кушониён',
        addressTj: 'шаҳраки И. Сомонӣ, Кӯшониён',
        phone: '+992 (3245) 2-11-04',
        email: 'kushoniyon@sud.tj',
        status: 'normal',
      },
      {
        id: 'yovon-court',
        nameRu: 'Суд Яванского района',
        nameTj: 'Суди ноҳияи Ёвон',
        regionId: 'khatlon',
        type: 'district',
        domain: 'yovon.sud.tj',
        url: 'http://yovon.sud.tj',
        addressRu: 'пгт. Яван, ул. Ленина, 22',
        addressTj: 'шаҳраки Ёвон, кӯчаи Ленин, 22',
        phone: '+992 (3141) 2-19-80',
        email: 'yovon@sud.tj',
        status: 'normal',
      },
      {
        id: 'vakhsh-court',
        nameRu: 'Суд Вахшского района',
        nameTj: 'Суди ноҳияи Вахш',
        regionId: 'khatlon',
        type: 'district',
        domain: 'vakhsh.sud.tj',
        url: 'http://vakhsh.sud.tj',
        addressRu: 'пгт. Вахш',
        addressTj: 'шаҳраки Вахш',
        phone: '+992 (3246) 2-13-14',
        email: 'vakhsh@sud.tj',
        status: 'normal',
      },
      {
        id: 'jbalkhi-court',
        nameRu: 'Суд района Дж. Балхи',
        nameTj: 'Суди ноҳияи Ҷ.Балхӣ',
        regionId: 'khatlon',
        type: 'district',
        domain: 'jbalkhi.sud.tj',
        url: 'http://jbalkhi.sud.tj',
        addressRu: 'пгт. Балх',
        addressTj: 'шаҳраки Балх',
        phone: '+992 (3241) 2-16-50',
        email: 'jbalkhi@sud.tj',
        status: 'normal',
      },
      {
        id: 'danghara-court',
        nameRu: 'Суд района Дангара',
        nameTj: 'Суди ноҳияи Данғара',
        regionId: 'khatlon',
        type: 'district',
        domain: 'danghara.sud.tj',
        url: 'http://danghara.sud.tj',
        addressRu: 'пгт. Дангара, ул. Маркази, 1',
        addressTj: 'шаҳраки Данғара, кӯчаи Марказӣ, 1',
        phone: '+992 (3312) 2-14-30',
        email: 'danghara@sud.tj',
        status: 'online',
      },
      {
        id: 'vose-court',
        nameRu: 'Суд Восейского района',
        nameTj: 'Суди ноҳияи Восеъ',
        regionId: 'khatlon',
        type: 'district',
        domain: 'vose.sud.tj',
        url: 'http://vose.sud.tj',
        addressRu: 'пгт. Восе',
        addressTj: 'шаҳраки Восеъ',
        phone: '+992 (3311) 2-20-15',
        email: 'vose@sud.tj',
        status: 'normal',
      },
      {
        id: 'farkhor-court',
        nameRu: 'Суд Фархорского района',
        nameTj: 'Суди ноҳияи Фархор',
        regionId: 'khatlon',
        type: 'district',
        domain: 'farkhor.sud.tj',
        url: 'http://farkhor.sud.tj',
        addressRu: 'пгт. Фархор',
        addressTj: 'шаҳраки Фархор',
        phone: '+992 (3316) 2-12-88',
        email: 'farkhor@sud.tj',
        status: 'normal',
      },
      {
        id: 'dusti-court',
        nameRu: 'Суд района Дусти',
        nameTj: 'Суди ноҳияи Дӯстӣ',
        regionId: 'khatlon',
        type: 'district',
        domain: 'dusti.sud.tj',
        url: 'http://dusti.sud.tj',
        addressRu: 'пгт. Джиликуль',
        addressTj: 'шаҳраки Ҷиликӯл',
        phone: '+992 (3249) 2-10-15',
        email: 'dusti@sud.tj',
        status: 'normal',
      },
      {
        id: 'panj-court',
        nameRu: 'Суд района Пяндж',
        nameTj: 'Суди ноҳияи Панҷ',
        regionId: 'khatlon',
        type: 'district',
        domain: 'panj.sud.tj',
        url: 'http://panj.sud.tj',
        addressRu: 'пгт. Пяндж',
        addressTj: 'шаҳраки Панҷ',
        phone: '+992 (3248) 2-15-40',
        email: 'panj@sud.tj',
        status: 'normal',
      },
      {
        id: 'jayhun-court',
        nameRu: 'Суд района Джайхун',
        nameTj: 'Суди ноҳияи Ҷайҳун',
        regionId: 'khatlon',
        type: 'district',
        domain: 'jayhun.sud.tj',
        url: 'http://jayhun.sud.tj',
        addressRu: 'пгт. Дусти',
        addressTj: 'шаҳраки Дӯстӣ',
        phone: '+992 (3247) 2-18-02',
        email: 'jayhun@sud.tj',
        status: 'normal',
      },
      {
        id: 'shahritus-court',
        nameRu: 'Суд Шахритусского района',
        nameTj: 'Суди ноҳияи Шаҳритус',
        regionId: 'khatlon',
        type: 'district',
        domain: 'shahritus.sud.tj',
        url: 'http://shahritus.sud.tj',
        addressRu: 'пгт. Шахритус',
        addressTj: 'шаҳраки Шаҳритус',
        phone: '+992 (3240) 2-19-10',
        email: 'shahritus@sud.tj',
        status: 'normal',
      },
      {
        id: 'qubodiyon-court',
        nameRu: 'Суд Кабадиянского района',
        nameTj: 'Суди ноҳияи Қубодиён',
        regionId: 'khatlon',
        type: 'district',
        domain: 'kubodiyon.sud.tj',
        url: 'http://kubodiyon.sud.tj',
        addressRu: 'пгт. Кабадиян',
        addressTj: 'шаҳраки Қубодиён',
        phone: '+992 (3251) 2-11-90',
        email: 'kubodiyon@sud.tj',
        status: 'normal',
      },
      {
        id: 'nkhusrav-court',
        nameRu: 'Суд района Носири Хусрав',
        nameTj: 'Суди ноҳияи Н.Хусрав',
        regionId: 'khatlon',
        type: 'district',
        domain: 'nkhusrav.sud.tj',
        url: 'http://nkhusrav.sud.tj',
        addressRu: 'с. Бахор',
        addressTj: 'деҳаи Баҳор',
        phone: '+992 (3252) 2-10-33',
        email: 'nkhusrav@sud.tj',
        status: 'normal',
      },
      {
        id: 'khuroson-court',
        nameRu: 'Суд Хуросонского района',
        nameTj: 'Суди ноҳияи Хуросон',
        regionId: 'khatlon',
        type: 'district',
        domain: 'khuroson.sud.tj',
        url: 'http://khuroson.sud.tj',
        addressRu: 'пгт. Обикиик',
        addressTj: 'шаҳраки Обикиик',
        phone: '+992 (3244) 2-14-50',
        email: 'khuroson@sud.tj',
        status: 'normal',
      },
      {
        id: 'ajomi-court',
        nameRu: 'Суд района А. Джоми',
        nameTj: 'Суди ноҳияи А.Ҷомӣ',
        regionId: 'khatlon',
        type: 'district',
        domain: 'ajomi.sud.tj',
        url: 'http://ajomi.sud.tj',
        addressRu: 'пгт. Куйбышевск',
        addressTj: 'шаҳраки Абдураҳмони Ҷомӣ',
        phone: '+992 (3242) 2-16-20',
        email: 'ajomi@sud.tj',
        status: 'normal',
      },
      {
        id: 'temurmalik-court',
        nameRu: 'Суд района Темурмалик',
        nameTj: 'Суди ноҳияи Темурмалик',
        regionId: 'khatlon',
        type: 'district',
        domain: 'temurmalik.sud.tj',
        url: 'http://temurmalik.sud.tj',
        addressRu: 'пгт. Советский',
        addressTj: 'шаҳраки Темурмалик',
        phone: '+992 (3315) 2-11-40',
        email: 'temurmalik@sud.tj',
        status: 'normal',
      },
      {
        id: 'shohin-court',
        nameRu: 'Суд района Ш. Шохин',
        nameTj: 'Суди ноҳияи Ш. Шоҳин',
        regionId: 'khatlon',
        type: 'district',
        domain: 'shohin.sud.tj',
        url: 'http://shohin.sud.tj',
        addressRu: 'пгт. Шуроабад',
        addressTj: 'шаҳраки Ш.Шоҳин',
        phone: '+992 (3314) 2-15-11',
        email: 'shohin@sud.tj',
        status: 'normal',
      },
      {
        id: 'khovaling-court',
        nameRu: 'Суд Ховалингского района',
        nameTj: 'Суди ноҳияи Ховалинг',
        regionId: 'khatlon',
        type: 'district',
        domain: 'khovaling.sud.tj',
        url: 'http://khovaling.sud.tj',
        addressRu: 'пгт. Ховалинг',
        addressTj: 'шаҳраки Ховалинг',
        phone: '+992 (3317) 2-13-70',
        email: 'khovaling@sud.tj',
        status: 'normal',
      },
      {
        id: 'baljuvon-court',
        nameRu: 'Суд Балджуванского района',
        nameTj: 'Суди ноҳияи Балҷувон',
        regionId: 'khatlon',
        type: 'district',
        domain: 'baljuvon.sud.tj',
        url: 'http://baljuvon.sud.tj',
        addressRu: 'с. Балджуван',
        addressTj: 'деҳаи Балҷувон',
        phone: '+992 (3318) 2-10-85',
        email: 'baljuvon@sud.tj',
        status: 'normal',
      },
      {
        id: 'hamadoni-court',
        nameRu: 'Суд района М.С.А. Хамадони',
        nameTj: 'Суди ноҳияи Мир Сайид Алии Ҳамадонӣ',
        regionId: 'khatlon',
        type: 'district',
        domain: 'hamadoni.sud.tj',
        url: 'http://hamadoni.sud.tj',
        addressRu: 'пгт. Московский',
        addressTj: 'шаҳраки Ҳамадонӣ',
        phone: '+992 (3313) 2-18-90',
        email: 'hamadoni@sud.tj',
        status: 'normal',
      },
      {
        id: 'muminobod-court',
        nameRu: 'Суд Муминабадского района',
        nameTj: 'Суди ноҳияи Муъминобод',
        regionId: 'khatlon',
        type: 'district',
        domain: 'muminobod.sud.tj',
        url: 'http://muminobod.sud.tj',
        addressRu: 'пгт. Муминабад',
        addressTj: 'шаҳраки Мӯъминобод',
        phone: '+992 (3319) 2-14-12',
        email: 'muminobod@sud.tj',
        status: 'normal',
      },
      {
        id: 'harbi-khatlon',
        nameRu: 'Военный суд гарнизона Хатлон',
        nameTj: 'Суди ҳарбии гарнизони Хатлон',
        regionId: 'khatlon',
        type: 'military',
        domain: 'harbikhatlon.sud.tj',
        url: 'http://harbikhatlon.sud.tj',
        addressRu: 'г. Бохтар, военный сектор',
        addressTj: 'ш. Бохтар, бахши ҳарбӣ',
        phone: '+992 (3222) 2-88-14',
        email: 'harbikhatlon@sud.tj',
        status: 'online',
      },
    ],
  },

  // 3. Суғд (Sughd) - Warm Gold / Amber
  {
    id: 'sugd',
    nameRu: 'Согдийская область',
    nameTj: 'Вилояти Суғд',
    shortNameRu: 'Суғд',
    shortNameTj: 'Суғд',
    colorHex: '#f59e0b',
    colorGlow: 'rgba(245, 158, 11, 0.4)',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    textClass: 'text-amber-300',
    bgGlowClass: 'bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    courts: [
      {
        id: 'sugd-court',
        nameRu: 'Суд Согдийской области',
        nameTj: 'Суди вилояти Суғд',
        regionId: 'sugd',
        type: 'regional',
        domain: 'sugd.sud.tj',
        url: 'http://sugd.sud.tj',
        addressRu: 'г. Худжанд, ул. К. Худжанди, 142',
        addressTj: 'ш. Хуҷанд, кӯчаи К. Хуҷандӣ, 142',
        phone: '+992 (3422) 6-40-15',
        email: 'sugd@sud.tj',
        status: 'online',
        latestNewsRu: 'Обобщение практики по рассмотрению споров в сфере внешнеэкономической деятельности',
        latestNewsTj: 'Таҳлили амалияи судӣ оид ба баҳсҳои соҳибкории беруна',
        latestNewsDate: '17.08.2026',
      },
      {
        id: 'khujand-court',
        nameRu: 'Суд города Худжанд',
        nameTj: 'Суди шаҳри Хуҷанд',
        regionId: 'sugd',
        type: 'city',
        domain: 'khujand.sud.tj',
        url: 'http://khujand.sud.tj',
        addressRu: 'г. Худжанд, пр. И. Сомони, 52',
        addressTj: 'ш. Хуҷанд, хиёбони И. Сомонӣ, 52',
        phone: '+992 (3422) 4-11-20',
        email: 'khujand@sud.tj',
        status: 'online',
      },
      {
        id: 'konibodom-court',
        nameRu: 'Суд города Канибадам',
        nameTj: 'Суди шаҳри Конибодом',
        regionId: 'sugd',
        type: 'city',
        domain: 'konibodom.sud.tj',
        url: 'http://konibodom.sud.tj',
        addressRu: 'г. Канибадам, ул. Ленина, 88',
        addressTj: 'ш. Конибодом, кӯчаи Ленин, 88',
        phone: '+992 (3467) 3-21-40',
        email: 'konibodom@sud.tj',
        status: 'online',
      },
      {
        id: 'isfara-court',
        nameRu: 'Суд города Исфара',
        nameTj: 'Суди шаҳри Исфара',
        regionId: 'sugd',
        type: 'city',
        domain: 'isfara.sud.tj',
        url: 'http://isfara.sud.tj',
        addressRu: 'г. Исфара, ул. Дусти, 14',
        addressTj: 'ш. Исфара, кӯчаи Дӯстӣ, 14',
        phone: '+992 (3462) 2-30-10',
        email: 'isfara@sud.tj',
        status: 'normal',
      },
      {
        id: 'istaravshan-court',
        nameRu: 'Суд города Истаравшан',
        nameTj: 'Суди шаҳри Истаравшан',
        regionId: 'sugd',
        type: 'city',
        domain: 'istaravshan.sud.tj',
        url: 'http://istaravshan.sud.tj',
        addressRu: 'г. Истаравшан, ул. Гулистон, 3',
        addressTj: 'ш. Истаравшан, кӯчаи Гулистон, 3',
        phone: '+992 (3454) 2-15-44',
        email: 'istaravshan@sud.tj',
        status: 'online',
      },
      {
        id: 'panjakent-court',
        nameRu: 'Суд города Пенджикент',
        nameTj: 'Суди шаҳри Панҷакент',
        regionId: 'sugd',
        type: 'city',
        domain: 'panjakent.sud.tj',
        url: 'http://panjakent.sud.tj',
        addressRu: 'г. Пенджикент, ул. Рудаки, 101',
        addressTj: 'ш. Панҷакент, кӯчаи Рӯдакӣ, 101',
        phone: '+992 (3475) 5-20-18',
        email: 'panjakent@sud.tj',
        status: 'normal',
      },
      {
        id: 'buston-court',
        nameRu: 'Суд города Бустон',
        nameTj: 'Суди шаҳри Бӯстон',
        regionId: 'sugd',
        type: 'city',
        domain: 'buston.sud.tj',
        url: 'http://buston.sud.tj',
        addressRu: 'г. Бустон, ул. Гагарина, 19',
        addressTj: 'ш. Бӯстон, кӯчаи Гагарин, 19',
        phone: '+992 (3445) 2-44-09',
        email: 'buston@sud.tj',
        status: 'normal',
      },
      {
        id: 'guliston-court',
        nameRu: 'Суд города Гулистон',
        nameTj: 'Суди шаҳри Гулистон',
        regionId: 'sugd',
        type: 'city',
        domain: 'guliston.sud.tj',
        url: 'http://guliston.sud.tj',
        addressRu: 'г. Гулистон, ул. Истиклол, 8',
        addressTj: 'ш. Гулистон, кӯчаи Истиқлол, 8',
        phone: '+992 (3443) 2-19-12',
        email: 'guliston@sud.tj',
        status: 'normal',
      },
      {
        id: 'istiqlol-court',
        nameRu: 'Суд города Истиклол',
        nameTj: 'Суди шаҳри Истиқлол',
        regionId: 'sugd',
        type: 'city',
        domain: 'istiqlol.sud.tj',
        url: 'http://istiqlol.sud.tj',
        addressRu: 'г. Истиклол, ул. Шахтёр, 2',
        addressTj: 'ш. Истиқлол, кӯчаи Шахтёр, 2',
        phone: '+992 (3447) 2-10-05',
        email: 'istiqlol@sud.tj',
        status: 'normal',
      },
      {
        id: 'bgafurov-court',
        nameRu: 'Суд Б. Гафуровского района',
        nameTj: 'Суди ноҳияи Б.Ғафуров',
        regionId: 'sugd',
        type: 'district',
        domain: 'bgafurov.sud.tj',
        url: 'http://bgafurov.sud.tj',
        addressRu: 'пгт. Гафуров, ул. Ленина, 33',
        addressTj: 'шаҳраки Ғафуров, кӯчаи Ленин, 33',
        phone: '+992 (3442) 2-33-01',
        email: 'bgafurov@sud.tj',
        status: 'online',
      },
      {
        id: 'jrasulov-court',
        nameRu: 'Суд района Дж. Расулова',
        nameTj: 'Суди ноҳияи Ҷ.Расулов',
        regionId: 'sugd',
        type: 'district',
        domain: 'jrasulov.sud.tj',
        url: 'http://jrasulov.sud.tj',
        addressRu: 'пгт. Пролетарск',
        addressTj: 'шаҳраки Пролетар',
        phone: '+992 (3455) 2-14-30',
        email: 'jrasulov@sud.tj',
        status: 'normal',
      },
      {
        id: 'spitamen-court',
        nameRu: 'Суд Спитаменского района',
        nameTj: 'Суди ноҳияи Спитамен',
        regionId: 'sugd',
        type: 'district',
        domain: 'spitamen.sud.tj',
        url: 'http://spitamen.sud.tj',
        addressRu: 'пгт. Навкат',
        addressTj: 'шаҳраки Навкат',
        phone: '+992 (3451) 2-18-40',
        email: 'spitamen@sud.tj',
        status: 'normal',
      },
      {
        id: 'zafarobod-court',
        nameRu: 'Суд Зафарабадского района',
        nameTj: 'Суди ноҳияи Зафаробод',
        regionId: 'sugd',
        type: 'district',
        domain: 'zafarobod.sud.tj',
        url: 'http://zafarobod.sud.tj',
        addressRu: 'пгт. Зафарабад',
        addressTj: 'шаҳраки Зафаробод',
        phone: '+992 (3452) 2-11-19',
        email: 'zafarobod@sud.tj',
        status: 'normal',
      },
      {
        id: 'mastchoh-court',
        nameRu: 'Суд Матчинского района',
        nameTj: 'Суди ноҳияи Мастчоҳ',
        regionId: 'sugd',
        type: 'district',
        domain: 'mastchoh.sud.tj',
        url: 'http://mastchoh.sud.tj',
        addressRu: 'пгт. Бустон, Матча',
        addressTj: 'шаҳраки Бӯстон, Мастчоҳ',
        phone: '+992 (3445) 2-12-88',
        email: 'mastchoh@sud.tj',
        status: 'normal',
      },
      {
        id: 'kmastchoh-court',
        nameRu: 'Суд Горно-Матчинского района',
        nameTj: 'Суди ноҳияи Кӯҳистони Мастчоҳ',
        regionId: 'sugd',
        type: 'district',
        domain: 'kmastchoh.sud.tj',
        url: 'http://kmastchoh.sud.tj',
        addressRu: 'с. Мехрон',
        addressTj: 'деҳаи Меҳрон',
        phone: '+992 (3445) 2-60-12',
        email: 'kmastchoh@sud.tj',
        status: 'normal',
      },
      {
        id: 'asht-court',
        nameRu: 'Суд Аштского района',
        nameTj: 'Суди ноҳияи Ашт',
        regionId: 'sugd',
        type: 'district',
        domain: 'asht.sud.tj',
        url: 'http://asht.sud.tj',
        addressRu: 'пгт. Шайдон',
        addressTj: 'шаҳраки Шайдон',
        phone: '+992 (3453) 2-15-90',
        email: 'asht@sud.tj',
        status: 'normal',
      },
      {
        id: 'shahriston-court',
        nameRu: 'Суд Шахристанского района',
        nameTj: 'Суди ноҳияи Шаҳристон',
        regionId: 'sugd',
        type: 'district',
        domain: 'shahriston.sud.tj',
        url: 'http://shahriston.sud.tj',
        addressRu: 'с. Шахристан',
        addressTj: 'деҳаи Шаҳристон',
        phone: '+992 (3456) 2-10-44',
        email: 'shahriston@sud.tj',
        status: 'normal',
      },
      {
        id: 'devashtich-court',
        nameRu: 'Суд района Деваштич',
        nameTj: 'Суди ноҳияи Деваштич',
        regionId: 'sugd',
        type: 'district',
        domain: 'devashtich.sud.tj',
        url: 'http://devashtich.sud.tj',
        addressRu: 'пгт. Гончи',
        addressTj: 'шаҳраки Ғончӣ',
        phone: '+992 (3464) 2-14-11',
        email: 'devashtich@sud.tj',
        status: 'normal',
      },
      {
        id: 'ayni-court',
        nameRu: 'Суд Айнинского района',
        nameTj: 'Суди ноҳияи Айнӣ',
        regionId: 'sugd',
        type: 'district',
        domain: 'ayni.sud.tj',
        url: 'http://ayni.sud.tj',
        addressRu: 'пгт. Айни',
        addressTj: 'шаҳраки Айнӣ',
        phone: '+992 (3479) 2-13-20',
        email: 'ayni@sud.tj',
        status: 'normal',
      },
      {
        id: 'harbi-khujand',
        nameRu: 'Военный суд гарнизона Худжанд',
        nameTj: 'Суди ҳарбии гарнизони Хуҷанд',
        regionId: 'sugd',
        type: 'military',
        domain: 'harbikhujand.sud.tj',
        url: 'http://harbikhujand.sud.tj',
        addressRu: 'г. Худжанд, военный сектор',
        addressTj: 'ш. Хуҷанд, бахши ҳарбӣ',
        phone: '+992 (3422) 5-18-09',
        email: 'harbikhujand@sud.tj',
        status: 'online',
      },
    ],
  },

  // 4. Душанбе + РРП (Dushanbe + RRP) - Violet / Magenta
  {
    id: 'dushanbe_rrp',
    nameRu: 'Город Душанбе и районы республиканского подчинения',
    nameTj: 'Шаҳри Душанбе ва ноҳияҳои тобеи ҷумҳурӣ',
    shortNameRu: 'Душанбе + РРП',
    shortNameTj: 'Душанбе + НТҶ',
    colorHex: '#a855f7',
    colorGlow: 'rgba(168, 85, 247, 0.4)',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    textClass: 'text-purple-300',
    bgGlowClass: 'bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    courts: [
      {
        id: 'dushanbe-court',
        nameRu: 'Суд города Душанбе',
        nameTj: 'Суди шаҳри Душанбе',
        regionId: 'dushanbe_rrp',
        type: 'regional',
        domain: 'dushanbe.sud.tj',
        url: 'http://dushanbe.sud.tj',
        addressRu: 'г. Душанбе, ул. Шероз, 11',
        addressTj: 'ш. Душанбе, кӯчаи Шероз, 11',
        phone: '+992 (37) 221-14-90',
        email: 'dushanbe@sud.tj',
        status: 'online',
        latestNewsRu: 'Цифровизация протоколов судебных заседаний в судах столицы',
        latestNewsTj: 'Рақамикунонии протоколҳои ҷаласаҳои судӣ дар пойтахт',
        latestNewsDate: '17.08.2026',
      },
      {
        id: 'isomoni-court',
        nameRu: 'Суд района Исмоили Сомони',
        nameTj: 'Суди ноҳияи Исмоили Сомонӣ',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'isomoni.sud.tj',
        url: 'http://isomoni.sud.tj',
        addressRu: 'г. Душанбе, ул. Бохтар, 37/1',
        addressTj: 'ш. Душанбе, кӯчаи Бохтар, 37/1',
        phone: '+992 (37) 227-89-10',
        email: 'isomoni@sud.tj',
        status: 'online',
      },
      {
        id: 'shohmansur-court',
        nameRu: 'Суд района Шохмансур',
        nameTj: 'Суди ноҳияи Шоҳмансур',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'shohmansur.sud.tj',
        url: 'http://shohmansur.sud.tj',
        addressRu: 'г. Душанбе, ул. Айни, 48',
        addressTj: 'ш. Душанбе, кӯчаи Айнӣ, 48',
        phone: '+992 (37) 223-45-67',
        email: 'shohmansur@sud.tj',
        status: 'online',
      },
      {
        id: 'sino-court',
        nameRu: 'Суд района Сино',
        nameTj: 'Суди ноҳияи Сино',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'sino.sud.tj',
        url: 'http://sino.sud.tj',
        addressRu: 'г. Душанбе, пр. Маяковского, 4',
        addressTj: 'ш. Душанбе, хиёбони Маяковский, 4',
        phone: '+992 (37) 235-80-12',
        email: 'sino@sud.tj',
        status: 'online',
      },
      {
        id: 'firdavsi-court',
        nameRu: 'Суд района Фирдавси',
        nameTj: 'Суди ноҳияи Фирдавсӣ',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'firdavsi.sud.tj',
        url: 'http://firdavsi.sud.tj',
        addressRu: 'г. Душанбе, ул. Н. Карабаева, 30',
        addressTj: 'ш. Душанбе, кӯчаи Н. Қарабоев, 30',
        phone: '+992 (37) 233-55-19',
        email: 'firdavsi@sud.tj',
        status: 'online',
      },
      {
        id: 'tursunzoda-court',
        nameRu: 'Суд города Турсунзаде',
        nameTj: 'Суди шаҳри Турсунзода',
        regionId: 'dushanbe_rrp',
        type: 'city',
        domain: 'tursunzoda.sud.tj',
        url: 'http://tursunzoda.sud.tj',
        addressRu: 'г. Турсунзаде, ул. Мира, 12',
        addressTj: 'ш. Турсунзода, кӯчаи Сулҳ, 12',
        phone: '+992 (3130) 2-25-10',
        email: 'tursunzoda@sud.tj',
        status: 'normal',
      },
      {
        id: 'vahdat-court',
        nameRu: 'Суд города Вахдат',
        nameTj: 'Суди шаҳри Ваҳдат',
        regionId: 'dushanbe_rrp',
        type: 'city',
        domain: 'vahdat.sud.tj',
        url: 'http://vahdat.sud.tj',
        addressRu: 'г. Вахдат, ул. И. Сомони, 25',
        addressTj: 'ш. Ваҳдат, кӯчаи И. Сомонӣ, 25',
        phone: '+992 (3636) 2-30-18',
        email: 'vahdat@sud.tj',
        status: 'online',
      },
      {
        id: 'hisor-court',
        nameRu: 'Суд города Гиссар',
        nameTj: 'Суди шаҳри Ҳисор',
        regionId: 'dushanbe_rrp',
        type: 'city',
        domain: 'hisor.sud.tj',
        url: 'http://hisor.sud.tj',
        addressRu: 'г. Гиссар, ул. Фирдавси, 5',
        addressTj: 'ш. Ҳисор, кӯчаи Фирдавсӣ, 5',
        phone: '+992 (3139) 2-15-40',
        email: 'hisor@sud.tj',
        status: 'normal',
      },
      {
        id: 'rogun-court',
        nameRu: 'Суд города Рогун',
        nameTj: 'Суди шаҳри Роғун',
        regionId: 'dushanbe_rrp',
        type: 'city',
        domain: 'rogun.sud.tj',
        url: 'http://rogun.sud.tj',
        addressRu: 'г. Рогун, ул. Сохтмончиён, 8',
        addressTj: 'ш. Роғун, кӯчаи Сохтмончиён, 8',
        phone: '+992 (3134) 2-12-05',
        email: 'rogun@sud.tj',
        status: 'normal',
      },
      {
        id: 'rudaki-court',
        nameRu: 'Суд района Рудаки',
        nameTj: 'Суди ноҳияи Рӯдакӣ',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'rudaki.sud.tj',
        url: 'http://rudaki.sud.tj',
        addressRu: 'пгт. Сомониен, ул. Рудаки, 18',
        addressTj: 'шаҳраки Сомониён, кӯчаи Рӯдакӣ, 18',
        phone: '+992 (3137) 2-19-90',
        email: 'rudaki@sud.tj',
        status: 'online',
      },
      {
        id: 'shahrinav-court',
        nameRu: 'Суд района Шахринав',
        nameTj: 'Суди ноҳияи Шаҳринав',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'shahrinav.sud.tj',
        url: 'http://shahrinav.sud.tj',
        addressRu: 'пгт. Шахринав',
        addressTj: 'шаҳраки Шаҳринав',
        phone: '+992 (3131) 2-14-11',
        email: 'shahrinav@sud.tj',
        status: 'normal',
      },
      {
        id: 'varzob-court',
        nameRu: 'Суд района Варзоб',
        nameTj: 'Суди ноҳияи Варзоб',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'varzob.sud.tj',
        url: 'http://varzob.sud.tj',
        addressRu: 'с. Варзоб',
        addressTj: 'деҳаи Варзоб',
        phone: '+992 (3153) 2-10-80',
        email: 'varzob@sud.tj',
        status: 'normal',
      },
      {
        id: 'fayzobod-court',
        nameRu: 'Суд района Файзабад',
        nameTj: 'Суди ноҳияи Файзобод',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'fayzobod.sud.tj',
        url: 'http://fayzobod.sud.tj',
        addressRu: 'пгт. Файзабад',
        addressTj: 'шаҳраки Файзобод',
        phone: '+992 (3143) 2-13-15',
        email: 'fayzobod@sud.tj',
        status: 'normal',
      },
      {
        id: 'rasht-court',
        nameRu: 'Суд Раштского района',
        nameTj: 'Суди ноҳияи Рашт',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'rasht.sud.tj',
        url: 'http://rasht.sud.tj',
        addressRu: 'пгт. Гарм, ул. И. Сомони, 10',
        addressTj: 'шаҳраки Ғарм, кӯчаи И. Сомонӣ, 10',
        phone: '+992 (3135) 2-16-70',
        email: 'rasht@sud.tj',
        status: 'normal',
      },
      {
        id: 'tojikobod-court',
        nameRu: 'Суд Таджикабадского района',
        nameTj: 'Суди ноҳияи Тоҷикобод',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'tojikobod.sud.tj',
        url: 'http://tojikobod.sud.tj',
        addressRu: 'пгт. Таджикабад',
        addressTj: 'шаҳраки Тоҷикобод',
        phone: '+992 (3154) 2-11-09',
        email: 'tojikobod@sud.tj',
        status: 'normal',
      },
      {
        id: 'nurobod-court',
        nameRu: 'Суд Нурабадского района',
        nameTj: 'Суди ноҳияи Нуробод',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'nurobod.sud.tj',
        url: 'http://nurobod.sud.tj',
        addressRu: 'пгт. Дарбанд',
        addressTj: 'шаҳраки Дарбанд',
        phone: '+992 (3133) 2-15-22',
        email: 'nurobod@sud.tj',
        status: 'normal',
      },
      {
        id: 'lakhsh-court',
        nameRu: 'Суд района Лахш',
        nameTj: 'Суди ноҳияи Лахш',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'lakhsh.sud.tj',
        url: 'http://lakhsh.sud.tj',
        addressRu: 'пгт. Вахдат, Лахш',
        addressTj: 'шаҳраки Ваҳдат, Лахш',
        phone: '+992 (3158) 2-12-40',
        email: 'lakhsh@sud.tj',
        status: 'normal',
      },
      {
        id: 'sangvor-court',
        nameRu: 'Суд Сангворского района',
        nameTj: 'Суди ноҳияи Сангвор',
        regionId: 'dushanbe_rrp',
        type: 'district',
        domain: 'sangvor.sud.tj',
        url: 'http://sangvor.sud.tj',
        addressRu: 'с. Тавильдара',
        addressTj: 'деҳаи Тавилдара',
        phone: '+992 (3156) 2-10-55',
        email: 'sangvor@sud.tj',
        status: 'normal',
      },
      {
        id: 'harbi-dushanbe',
        nameRu: 'Военный суд гарнизона Душанбе',
        nameTj: 'Суди ҳарбии гарнизони Душанбе',
        regionId: 'dushanbe_rrp',
        type: 'military',
        domain: 'harbidushanbe.sud.tj',
        url: 'http://harbidushanbe.sud.tj',
        addressRu: 'г. Душанбе, ул. Раджабова, 15',
        addressTj: 'ш. Душанбе, кӯчаи Раҷабовҳо, 15',
        phone: '+992 (37) 224-60-31',
        email: 'harbidushanbe@sud.tj',
        status: 'online',
      },
    ],
  },
];

// Guaranteed visual and hierarchical order: 1. Dushanbe+RRP, 2. Sughd, 3. Khatlon, 4. GBAO
export const REGIONAL_CLUSTERS: RegionCluster[] = getSortedRegionalClusters(RAW_REGIONAL_CLUSTERS);

// Helper to get all courts as flat array
export const ALL_COURTS: CourtNodeData[] = REGIONAL_CLUSTERS.flatMap((r) => r.courts);

// Legacy exports for compatibility
export const REGIONAL_COURTS = ALL_COURTS;
export const REGIONS = REGIONAL_CLUSTERS.map((r) => ({
  id: r.id,
  nameRu: r.nameRu,
  nameTj: r.nameTj,
}));

export const JUDICIAL_ACTS: JudicialActItem[] = [
  {
    id: 'ПР-2026/89',
    collegium: 'civil',
    collegiumNameRu: 'Судебная коллегия по гражданским делам',
    collegiumNameTj: 'Коллегияи судӣ оид ба парвандаҳои маданӣ',
    date: '14.08.2026',
    titleRu: 'Определение по кассационной жалобе о защите права собственности и возмещении убытков',
    titleTj: 'Таъинот оид ба шикояти кассатсионӣ доир ба ҳимояи ҳуқуқи моликият ва ҷуброни зарар',
    statusRu: 'Вступило в законную силу',
    statusTj: 'Эътибори қонунӣ пайдо кард',
  },
  {
    id: 'ОИ-2026/34',
    collegium: 'family',
    collegiumNameRu: 'Судебная коллегия по семейным делам',
    collegiumNameTj: 'Коллегияи судӣ оид ба парвандаҳои оилавӣ',
    date: '11.08.2026',
    titleRu: 'Постановление по спору о порядке воспитания несовершеннолетних детей и выплате алиментов',
    titleTj: 'Қарор оид ба баҳси тартиби тарбияи кӯдакони ноболиғ ва пардохти алимент',
    statusRu: 'Опубликовано',
    statusTj: 'Интишор ёфт',
  },
  {
    id: 'УД-2026/142',
    collegium: 'criminal',
    collegiumNameRu: 'Судебная коллегия по уголовным делам',
    collegiumNameTj: 'Коллегияи судӣ оид ба парвандаҳои ҷиноятӣ',
    date: '02.08.2026',
    titleRu: 'Постановление Президиума Верховного суда о соблюдении норм уголовно-процессуального законодательства',
    titleTj: 'Қарори Раёсати Суди Олӣ доир ба риояи меъёрҳои қонунгузории мурофиавии ҷиноятӣ',
    statusRu: 'Опубликовано',
    statusTj: 'Интишор ёфт',
  },
  {
    id: 'АД-2026/51',
    collegium: 'admin',
    collegiumNameRu: 'Судебная коллегия по административным правонарушениям',
    collegiumNameTj: 'Коллегияи судӣ оид ба ҳуқуқвайронкунии маъмурӣ',
    date: '30.07.2026',
    titleRu: 'Определение о прекращении производства по делу об административном правонарушении за отсутствием состава',
    titleTj: 'Таъинот оид ба қатъи пешбурди парвандаи ҳуқуқвайронкунии маъмурӣ бинобар набудани ҳайати ҳуқуқвайронкунӣ',
    statusRu: 'Вступило в законную силу',
    statusTj: 'Эътибори қонунӣ пайдо кард',
  },
  {
    id: 'ВД-2026/19',
    collegium: 'military',
    collegiumNameRu: 'Военная коллегия Верховного суда',
    collegiumNameTj: 'Коллегияи ҳарбии Суди Олӣ',
    date: '15.07.2026',
    titleRu: 'Апелляционное определение по вопросам воинской службы и социальной защиты военнослужащих',
    titleTj: 'Таъиноти апеллятсионӣ доир ба масъалаҳои хизмати ҳарбӣ ва ҳимояи иҷтимоии хизматчиёни ҳарбӣ',
    statusRu: 'Вступило в законную силу',
    statusTj: 'Эътибори қонунӣ пайдо кард',
  },
];

export const HEARINGS_SCHEDULE: HearingItem[] = [
  {
    id: '2-412/2026',
    courtRu: 'Верховный суд РТ — Гражданская коллегия',
    courtTj: 'Суди Олии ҶТ — Коллегияи маданӣ',
    judgeRu: 'Раджабзода С.Х.',
    judgeTj: 'Раҷабзода С.Ҳ.',
    date: '19.08.2026',
    time: '10:00',
    categoryRu: 'Защита имущественных прав',
    categoryTj: 'Ҳимояи ҳуқуқҳои молумулкӣ',
    partiesRu: 'Истец: ООО «Сомон-Строй» / Ответчик: Назаров Т.Д.',
    partiesTj: 'Даъвогар: ҶДММ «Сомон-Сохтмон» / Ҷавобгар: Назаров Т.Д.',
    room: 'Зал № 3 (Зали № 3)',
  },
  {
    id: '1-89/2026',
    courtRu: 'Суд района Сино г. Душанбе',
    courtTj: 'Суди ноҳияи Синои ш. Душанбе',
    judgeRu: 'Шамсуллозода А.М.',
    judgeTj: 'Шамсуллозода А.М.',
    date: '19.08.2026',
    time: '11:30',
    categoryRu: 'Семейный спор (Раздел имущества)',
    categoryTj: 'Баҳси оилавӣ (Тақсими молу мулк)',
    partiesRu: 'Истец: Каримова М. / Ответчик: Каримов Д.',
    partiesTj: 'Даъвогар: Каримова М. / Ҷавобгар: Каримов Д.',
    room: 'Зал № 1',
  },
  {
    id: '3-104/2026',
    courtRu: 'Суд Согдийской области',
    courtTj: 'Суди вилояти Суғд',
    judgeRu: 'Бобоев Ф.М.',
    judgeTj: 'Бобоев Ф.М.',
    date: '20.08.2026',
    time: '14:00',
    categoryRu: 'Экономический спор',
    categoryTj: 'Баҳси иқтисодӣ',
    partiesRu: 'АО «Худжанд-Текстиль» / Налоговая инспекция',
    partiesTj: 'ҶСК «Хуҷанд-Текстил» / Нозироти андоз',
    room: 'Зал № 4',
  },
  {
    id: 'В-12/2026',
    courtRu: 'Военный суд гарнизона Душанбе',
    courtTj: 'Суди ҳарбии гарнизони Душанбе',
    judgeRu: 'Подполковник юстиции Давлатзода И.',
    judgeTj: 'Подполковники адлия Давлатзода И.',
    date: '21.08.2026',
    time: '09:30',
    categoryRu: 'Воинское судопроизводство',
    categoryTj: 'Мурофиаи судии ҳарбӣ',
    partiesRu: 'Воинская часть № 0214 / Сафаров Б.',
    partiesTj: 'Қисми ҳарбии № 0214 / Сафаров Б.',
    room: 'Зал № 2',
  },
];

export const PRESS_NEWS: NewsItem[] = [
  {
    id: '4895',
    date: '18.08.2026',
    titleRu: 'Объявление: Порядок приема обращений граждан в электронной форме',
    titleTj: 'Эълон: Тартиби қабули муроҷиатҳои шаҳрвандон дар шакли электронӣ',
    summaryRu: 'Верховный суд разъясняет порядок подачи и регистрации электронных заявлений через единый портал sud.tj.',
    summaryTj: 'Суди Олӣ тартиби пешниҳод ва бақайдгирии аризаҳои электрониро тавассути сомонаи ягонаи sud.tj шарҳ медиҳад.',
    source: 'sud.tj',
    url: 'http://sud.tj/markazi-matbuot/khabarho/4895/',
  },
  {
    id: '4776',
    date: '15.08.2026',
    titleRu: 'Заседание Пленума Верховного суда Республики Таджикистан',
    titleTj: 'Ҷаласаи Пленуми Суди Олии Ҷумҳурии Тоҷикистон',
    summaryRu: 'Рассмотрены итоги обобщения судебной практики по применению норм семейного и жилищного законодательства.',
    summaryTj: 'Натиҷаҳои ҷамъбасти амалияи судӣ оид ба татбиқи меъёрҳои қонунгузории оилавӣ ва манзилӣ баррасӣ гардиданд.',
    source: 'sud.tj/plenum',
    url: 'http://sud.tj/markazi-matbuot/khabarho/4776/',
  },
  {
    id: '4889',
    date: '14.08.2026',
    titleRu: 'Обеспечение доступности правосудия для лиц с ограниченными возможностями',
    titleTj: 'Баррасии масъалаҳои дастрасии шахсони дорои маъюбият ба адолати судӣ',
    summaryRu: 'Внедрение цифровых инструментов и адаптивных интерфейсов в зданиях судов и на веб-порталах республики.',
    summaryTj: 'Ҷорӣ намудани воситаҳои рақамӣ ва интерфейсҳои мутобиқшуда дар биноҳои судҳо ва сомонаҳои ҷумҳурӣ.',
    source: 'sud.tj',
    url: 'http://sud.tj/markazi-matbuot/khabarho/4889/',
  },
  {
    id: '3617',
    date: '10.08.2026',
    titleRu: 'Выпуск официального издания Верховного суда «Мизони Қонун»',
    titleTj: 'Нашри нашрияи расмии Суди Олӣ таҳти унвони «Мизони Қонун»',
    summaryRu: 'Опубликованы аналитические статьи судей, обзоры кассационной практики и методические рекомендации.',
    summaryTj: 'Мақолаҳои таҳлилии судяҳо, шарҳҳои амалияи кассатсионӣ ва тавсияҳои методӣ нашр шуданд.',
    source: 'sud.tj/mizoni-qonun',
    url: 'http://sud.tj/markazi-matbuot/khabarho/3617/',
  },
];

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'doc-1',
    titleRu: 'Образец искового заявления о взыскании задолженности',
    titleTj: 'Намунаи аризаи даъвогӣ оид ба рӯёнидани қарз',
    categoryRu: 'Гражданские дела',
    categoryTj: 'Парвандаҳои маданӣ',
    format: 'DOCX / PDF',
    size: '42 KB',
  },
  {
    id: 'doc-2',
    titleRu: 'Образец кассационной жалобы на решение суда',
    titleTj: 'Намунаи шикояти кассатсионӣ нисбати ҳалномаи суд',
    categoryRu: 'Судебное обжалование',
    categoryTj: 'Шикоятҳои судӣ',
    format: 'DOCX / PDF',
    size: '38 KB',
  },
  {
    id: 'doc-3',
    titleRu: 'Образец ходатайства об отсрочке уплаты госпошлины',
    titleTj: 'Намунаи дархост барои мавқуф гузоштани пардохти боҷи давлатӣ',
    categoryRu: 'Процессуальные ходатайства',
    categoryTj: 'Дархостҳои мурофиавӣ',
    format: 'DOCX / PDF',
    size: '29 KB',
  },
  {
    id: 'doc-4',
    titleRu: 'Кодекс судейской этики Республики Таджикистан',
    titleTj: 'Кодекси одоби судяи Ҷумҳурии Тоҷикистон',
    categoryRu: 'Нормативные акты',
    categoryTj: 'Санадҳои меъёрӣ',
    format: 'PDF',
    size: '210 KB',
  },
];
