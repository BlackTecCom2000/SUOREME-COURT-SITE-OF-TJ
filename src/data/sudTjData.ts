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
  domain?: string;
  url?: string;
  addressRu?: string;
  addressTj?: string;
  addressEn?: string;
  phone?: string;
  email?: string;
  status?: CourtStatus;
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
  url?: string;
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


      },
      {
        id: 'khorug-court',
        nameRu: 'Суд города Хорог',
        nameTj: 'Суди шаҳри Хоруғ',
        regionId: 'gbao',
        type: 'city',

      },
      {
        id: 'shugnon-court',
        nameRu: 'Суд Шугнанского района',
        nameTj: 'Суди ноҳияи Шуғнон',
        regionId: 'gbao',
        type: 'district',

      },
      {
        id: 'darvoz-court',
        nameRu: 'Суд Дарвазского района',
        nameTj: 'Суди ноҳияи Дарвоз',
        regionId: 'gbao',
        type: 'district',

      },
      {
        id: 'vanj-court',
        nameRu: 'Суд Ванджского района',
        nameTj: 'Суди ноҳияи Ванҷ',
        regionId: 'gbao',
        type: 'district',

      },
      {
        id: 'rushon-court',
        nameRu: 'Суд Рушанского района',
        nameTj: 'Суди ноҳияи Рӯшон',
        regionId: 'gbao',
        type: 'district',

      },
      {
        id: 'roshtkala-court',
        nameRu: 'Суд Рошткалинского района',
        nameTj: 'Суди ноҳияи Роштқалъа',
        regionId: 'gbao',
        type: 'district',

      },
      {
        id: 'ishkoshim-court',
        nameRu: 'Суд Ишкашимского района',
        nameTj: 'Суди ноҳияи Ишкошим',
        regionId: 'gbao',
        type: 'district',

      },
      {
        id: 'murgob-court',
        nameRu: 'Суд Мургабского района',
        nameTj: 'Суди ноҳияи Мурғоб',
        regionId: 'gbao',
        type: 'district',

      },
      {
        id: 'harbi-khorug',
        nameRu: 'Военный суд гарнизона Хорог',
        nameTj: 'Суди ҳарбии гарнизони Хоруғ',
        regionId: 'gbao',
        type: 'military',

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


      },
      {
        id: 'bokhtar-court',
        nameRu: 'Суд города Бохтар',
        nameTj: 'Суди шаҳри Бохтар',
        regionId: 'khatlon',
        type: 'city',

      },
      {
        id: 'kulob-court',
        nameRu: 'Суд города Куляб',
        nameTj: 'Суди шаҳри Кӯлоб',
        regionId: 'khatlon',
        type: 'city',

      },
      {
        id: 'norak-court',
        nameRu: 'Суд города Нурек',
        nameTj: 'Суди шаҳри Норак',
        regionId: 'khatlon',
        type: 'city',

      },
      {
        id: 'levakant-court',
        nameRu: 'Суд города Левакант',
        nameTj: 'Суди шаҳри Левакант',
        regionId: 'khatlon',
        type: 'city',

      },
      {
        id: 'kushoniyon-court',
        nameRu: 'Суд района Кушониён',
        nameTj: 'Суди ноҳияи Кӯшониён',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'yovon-court',
        nameRu: 'Суд Яванского района',
        nameTj: 'Суди ноҳияи Ёвон',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'vakhsh-court',
        nameRu: 'Суд Вахшского района',
        nameTj: 'Суди ноҳияи Вахш',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'jbalkhi-court',
        nameRu: 'Суд района Дж. Балхи',
        nameTj: 'Суди ноҳияи Ҷ.Балхӣ',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'danghara-court',
        nameRu: 'Суд района Дангара',
        nameTj: 'Суди ноҳияи Данғара',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'vose-court',
        nameRu: 'Суд Восейского района',
        nameTj: 'Суди ноҳияи Восеъ',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'farkhor-court',
        nameRu: 'Суд Фархорского района',
        nameTj: 'Суди ноҳияи Фархор',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'dusti-court',
        nameRu: 'Суд района Дусти',
        nameTj: 'Суди ноҳияи Дӯстӣ',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'panj-court',
        nameRu: 'Суд района Пяндж',
        nameTj: 'Суди ноҳияи Панҷ',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'jayhun-court',
        nameRu: 'Суд района Джайхун',
        nameTj: 'Суди ноҳияи Ҷайҳун',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'shahritus-court',
        nameRu: 'Суд Шахритусского района',
        nameTj: 'Суди ноҳияи Шаҳритус',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'qubodiyon-court',
        nameRu: 'Суд Кабадиянского района',
        nameTj: 'Суди ноҳияи Қубодиён',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'nkhusrav-court',
        nameRu: 'Суд района Носири Хусрав',
        nameTj: 'Суди ноҳияи Н.Хусрав',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'khuroson-court',
        nameRu: 'Суд Хуросонского района',
        nameTj: 'Суди ноҳияи Хуросон',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'ajomi-court',
        nameRu: 'Суд района А. Джоми',
        nameTj: 'Суди ноҳияи А.Ҷомӣ',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'temurmalik-court',
        nameRu: 'Суд района Темурмалик',
        nameTj: 'Суди ноҳияи Темурмалик',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'shohin-court',
        nameRu: 'Суд района Ш. Шохин',
        nameTj: 'Суди ноҳияи Ш. Шоҳин',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'khovaling-court',
        nameRu: 'Суд Ховалингского района',
        nameTj: 'Суди ноҳияи Ховалинг',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'baljuvon-court',
        nameRu: 'Суд Балджуванского района',
        nameTj: 'Суди ноҳияи Балҷувон',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'hamadoni-court',
        nameRu: 'Суд района М.С.А. Хамадони',
        nameTj: 'Суди ноҳияи Мир Сайид Алии Ҳамадонӣ',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'muminobod-court',
        nameRu: 'Суд Муминабадского района',
        nameTj: 'Суди ноҳияи Муъминобод',
        regionId: 'khatlon',
        type: 'district',

      },
      {
        id: 'harbi-khatlon',
        nameRu: 'Военный суд гарнизона Хатлон',
        nameTj: 'Суди ҳарбии гарнизони Хатлон',
        regionId: 'khatlon',
        type: 'military',

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


      },
      {
        id: 'khujand-court',
        nameRu: 'Суд города Худжанд',
        nameTj: 'Суди шаҳри Хуҷанд',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'konibodom-court',
        nameRu: 'Суд города Канибадам',
        nameTj: 'Суди шаҳри Конибодом',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'isfara-court',
        nameRu: 'Суд города Исфара',
        nameTj: 'Суди шаҳри Исфара',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'istaravshan-court',
        nameRu: 'Суд города Истаравшан',
        nameTj: 'Суди шаҳри Истаравшан',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'panjakent-court',
        nameRu: 'Суд города Пенджикент',
        nameTj: 'Суди шаҳри Панҷакент',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'buston-court',
        nameRu: 'Суд города Бустон',
        nameTj: 'Суди шаҳри Бӯстон',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'guliston-court',
        nameRu: 'Суд города Гулистон',
        nameTj: 'Суди шаҳри Гулистон',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'istiqlol-court',
        nameRu: 'Суд города Истиклол',
        nameTj: 'Суди шаҳри Истиқлол',
        regionId: 'sugd',
        type: 'city',

      },
      {
        id: 'bgafurov-court',
        nameRu: 'Суд Б. Гафуровского района',
        nameTj: 'Суди ноҳияи Б.Ғафуров',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'jrasulov-court',
        nameRu: 'Суд района Дж. Расулова',
        nameTj: 'Суди ноҳияи Ҷ.Расулов',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'spitamen-court',
        nameRu: 'Суд Спитаменского района',
        nameTj: 'Суди ноҳияи Спитамен',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'zafarobod-court',
        nameRu: 'Суд Зафарабадского района',
        nameTj: 'Суди ноҳияи Зафаробод',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'mastchoh-court',
        nameRu: 'Суд Матчинского района',
        nameTj: 'Суди ноҳияи Мастчоҳ',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'kmastchoh-court',
        nameRu: 'Суд Горно-Матчинского района',
        nameTj: 'Суди ноҳияи Кӯҳистони Мастчоҳ',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'asht-court',
        nameRu: 'Суд Аштского района',
        nameTj: 'Суди ноҳияи Ашт',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'shahriston-court',
        nameRu: 'Суд Шахристанского района',
        nameTj: 'Суди ноҳияи Шаҳристон',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'devashtich-court',
        nameRu: 'Суд района Деваштич',
        nameTj: 'Суди ноҳияи Деваштич',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'ayni-court',
        nameRu: 'Суд Айнинского района',
        nameTj: 'Суди ноҳияи Айнӣ',
        regionId: 'sugd',
        type: 'district',

      },
      {
        id: 'harbi-khujand',
        nameRu: 'Военный суд гарнизона Худжанд',
        nameTj: 'Суди ҳарбии гарнизони Хуҷанд',
        regionId: 'sugd',
        type: 'military',

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


      },
      {
        id: 'isomoni-court',
        nameRu: 'Суд района Исмоили Сомони',
        nameTj: 'Суди ноҳияи Исмоили Сомонӣ',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'shohmansur-court',
        nameRu: 'Суд района Шохмансур',
        nameTj: 'Суди ноҳияи Шоҳмансур',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'sino-court',
        nameRu: 'Суд района Сино',
        nameTj: 'Суди ноҳияи Сино',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'firdavsi-court',
        nameRu: 'Суд района Фирдавси',
        nameTj: 'Суди ноҳияи Фирдавсӣ',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'tursunzoda-court',
        nameRu: 'Суд города Турсунзаде',
        nameTj: 'Суди шаҳри Турсунзода',
        regionId: 'dushanbe_rrp',
        type: 'city',

      },
      {
        id: 'vahdat-court',
        nameRu: 'Суд города Вахдат',
        nameTj: 'Суди шаҳри Ваҳдат',
        regionId: 'dushanbe_rrp',
        type: 'city',

      },
      {
        id: 'hisor-court',
        nameRu: 'Суд города Гиссар',
        nameTj: 'Суди шаҳри Ҳисор',
        regionId: 'dushanbe_rrp',
        type: 'city',

      },
      {
        id: 'rogun-court',
        nameRu: 'Суд города Рогун',
        nameTj: 'Суди шаҳри Роғун',
        regionId: 'dushanbe_rrp',
        type: 'city',

      },
      {
        id: 'rudaki-court',
        nameRu: 'Суд района Рудаки',
        nameTj: 'Суди ноҳияи Рӯдакӣ',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'shahrinav-court',
        nameRu: 'Суд района Шахринав',
        nameTj: 'Суди ноҳияи Шаҳринав',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'varzob-court',
        nameRu: 'Суд района Варзоб',
        nameTj: 'Суди ноҳияи Варзоб',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'fayzobod-court',
        nameRu: 'Суд района Файзабад',
        nameTj: 'Суди ноҳияи Файзобод',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'rasht-court',
        nameRu: 'Суд Раштского района',
        nameTj: 'Суди ноҳияи Рашт',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'tojikobod-court',
        nameRu: 'Суд Таджикабадского района',
        nameTj: 'Суди ноҳияи Тоҷикобод',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'nurobod-court',
        nameRu: 'Суд Нурабадского района',
        nameTj: 'Суди ноҳияи Нуробод',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'lakhsh-court',
        nameRu: 'Суд района Лахш',
        nameTj: 'Суди ноҳияи Лахш',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'sangvor-court',
        nameRu: 'Суд Сангворского района',
        nameTj: 'Суди ноҳияи Сангвор',
        regionId: 'dushanbe_rrp',
        type: 'district',

      },
      {
        id: 'harbi-dushanbe',
        nameRu: 'Военный суд гарнизона Душанбе',
        nameTj: 'Суди ҳарбии гарнизони Душанбе',
        regionId: 'dushanbe_rrp',
        type: 'military',

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

  },
  {
    id: '4776',
    date: '15.08.2026',
    titleRu: 'Заседание Пленума Верховного суда Республики Таджикистан',
    titleTj: 'Ҷаласаи Пленуми Суди Олии Ҷумҳурии Тоҷикистон',
    summaryRu: 'Рассмотрены итоги обобщения судебной практики по применению норм семейного и жилищного законодательства.',
    summaryTj: 'Натиҷаҳои ҷамъбасти амалияи судӣ оид ба татбиқи меъёрҳои қонунгузории оилавӣ ва манзилӣ баррасӣ гардиданд.',
    source: 'sud.tj/plenum',

  },
  {
    id: '4889',
    date: '14.08.2026',
    titleRu: 'Обеспечение доступности правосудия для лиц с ограниченными возможностями',
    titleTj: 'Баррасии масъалаҳои дастрасии шахсони дорои маъюбият ба адолати судӣ',
    summaryRu: 'Внедрение цифровых инструментов и адаптивных интерфейсов в зданиях судов и на веб-порталах республики.',
    summaryTj: 'Ҷорӣ намудани воситаҳои рақамӣ ва интерфейсҳои мутобиқшуда дар биноҳои судҳо ва сомонаҳои ҷумҳурӣ.',
    source: 'sud.tj',

  },
  {
    id: '3617',
    date: '10.08.2026',
    titleRu: 'Выпуск официального издания Верховного суда «Мизони Қонун»',
    titleTj: 'Нашри нашрияи расмии Суди Олӣ таҳти унвони «Мизони Қонун»',
    summaryRu: 'Опубликованы аналитические статьи судей, обзоры кассационной практики и методические рекомендации.',
    summaryTj: 'Мақолаҳои таҳлилии судяҳо, шарҳҳои амалияи кассатсионӣ ва тавсияҳои методӣ нашр шуданд.',
    source: 'sud.tj/mizoni-qonun',

  },
];

export interface AnnouncementItem {
  id: string;
  titleTj: string;
  titleRu: string;
  titleEn?: string;
  date: string;
  url?: string;
}

export const OFFICIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    titleTj: 'НАТИҶАИ ОЗМУН',
    titleRu: 'Результаты конкурса на замещение вакантных должностей',
    titleEn: 'Results of the Civil Service Competition',
    date: '17.06.2026',
  },
  {
    id: 'ann-2',
    titleTj: 'ОЗМУН БАРОИ ИШҒОЛИ МАНСАБҲОИ ХОЛИИ МАЪМУРИИ ХИЗМАТИ ДАВЛАТӢ',
    titleRu: 'Конкурс на замещение вакантных административных должностей государственной службы',
    titleEn: 'Competition for Vacant Administrative Civil Service Positions',
    date: '14.04.2026',
  },
  {
    id: 'ann-3',
    titleTj: 'НАТИҶАИ ОЗМУН',
    titleRu: 'Результаты отборочного конкурса',
    titleEn: 'Civil Service Selection Results',
    date: '19.08.2025',
  },
  {
    id: 'ann-4',
    titleTj: 'Суди Олӣ барои ишғоли мансабҳои холии маъмурии хизмати давлатӣ дар дастгоҳи Суди Олӣ, Маркази таълимии судяҳои назди Суди Олӣ, дастгоҳҳои судҳои ВМКБ, вилоятҳои Суғду Хатлон, шаҳри Душанбе ва шаҳру ноҳияҳои тобеи ҷумҳурӣ озмун эълон менамояд.',
    titleRu: 'Верховный суд объявляет конкурс на замещение вакантных должностей государственной службы в аппаратах судов республики.',
    titleEn: 'Supreme Court announces public vacancy competition across regional court administrative offices.',
    date: '22.05.2025',
  },
  {
    id: 'ann-5',
    titleTj: 'РӮЙХАТИ РАСМИИ СОМОНА ВА ПОЧТАҲОИ ЭЛЕКТРОНИИ СУДҲОИ ҶУМҲУРӢ',
    titleRu: 'Официальный реестр веб-сайтов и адресов электронной почты судов Республики Таджикистан',
    titleEn: 'Official Directory of Websites and Emails of Courts of the Republic',
    date: '12.03.2025',
  },
  {
    id: 'ann-6',
    titleTj: 'НАТИҶАИ ОЗМУН БАРОИ ИШҒОЛИ МАНСАБҲОИ ХОЛИИ МАЪМУРИИ ХИЗМАТИ ДАВЛАТӢ ДАР ДАСТГОҲИ СУДИ ОЛӢ, МАРКАЗИ ТАЪЛИМИИ СУДЯҲОИ НАЗДИ СУДИ ОЛӢ, ДАСТГОҲҲОИ СУДИ ВМКБ, ВИЛОЯТҲОИ СУҒДУ ХАТЛОН, ШАҲРИ ДУШАНБЕ ВА ШАҲРУ НОҲИЯҲОИ ТОБЕИ ҶУМҲУРӢ',
    titleRu: 'Итоги конкурса на замещение вакантных должностей государственной службы в судебных органах РТ',
    titleEn: 'Results of the civil service competition for administrative positions in the court system of RT',
    date: '24.09.2024',
  },
];

export interface RegionalNewsItem {
  id: string;
  titleTj: string;
  titleRu: string;
  titleEn?: string;
  courtDomain: string;
  region: 'dushanbe' | 'ntj' | 'sugd' | 'khatlon' | 'vmkb';
  date: string;
  url?: string;
}

export const REGIONAL_COURT_NEWS: RegionalNewsItem[] = [
  {
    id: 'rn-1',
    titleTj: 'ВОЛОИЯТИ ҚОНУН-КАФИЛИ СУБОТ ВА АДОЛАТИ ИҶТИМОӢ',
    titleRu: 'Верховенство закона — гарант стабильности и социальной справедливости',
    titleEn: 'Rule of Law — Guarantee of Stability and Social Justice',
    courtDomain: 'firdavsi.sud.tj',
    region: 'dushanbe',
    date: '12.08.2026',
  },
  {
    id: 'rn-2',
    titleTj: '35 СОЛИ ИСТИҚЛОЛИЯТИ ДАВЛАТӢ: ДАСТОВАРДИ МИЛЛӢ ВА МАСЪУЛИЯТИ ТАЪРИХӢ',
    titleRu: '35 лет государственной независимости: национальные достижения и историческая ответственность',
    titleEn: '35 Years of Independence: National Achievements and Historic Responsibility',
    courtDomain: 'dushanbe.sud.tj',
    region: 'dushanbe',
    date: '12.08.2026',
  },
  {
    id: 'rn-3',
    titleTj: 'ЭМОМАЛӢ РАҲМОН ВА ТАШАББУСҲОИ ҶАҲОНИИ СУЛҲОФАР: ДАҲСОЛАИ БАЙНАЛМИЛАЛИИ ТАҲКИМИ СУЛҲ БА ХОТИРИ НАСЛҲОИ ОЯНДА — ИБТИКОРИ НАВИ ТОҶИКИСТОН ДАР АРСАИ ҶАҲОНӢ',
    titleRu: 'Эмомали Рахмон и глобальные мирные инициативы: Международное десятилетие укрепления мира',
    titleEn: 'Emomali Rahmon and Global Peace Initiatives: International Decade for Peace',
    courtDomain: 'dushanbe.sud.tj',
    region: 'dushanbe',
    date: '11.08.2026',
  },
  {
    id: 'rn-4',
    titleTj: '«Истиқлол пояи давлатдорӣ, сулҳ кафили пешрафт, созандагӣ заминаи шукуфоии Ватан»',
    titleRu: '«Независимость — оплот государственности, мир — гарантия прогресса»',
    titleEn: '«Independence — the foundation of statehood, peace — the guarantee of progress»',
    courtDomain: 'sino.sud.tj',
    region: 'dushanbe',
    date: '10.08.2026',
  },
  {
    id: 'rn-5',
    titleTj: '«Ҷашни 35-солагии Истиқлоли давлатии Ҷумҳурии Тоҷикистон рамзи давлатдории миллӣ, созандагӣ ва рушди устувор»',
    titleRu: '«Празднование 35-летия Государственной независимости Республики Таджикистан»',
    titleEn: '«Celebration of the 35th Anniversary of State Independence of RT»',
    courtDomain: 'sino.sud.tj',
    region: 'dushanbe',
    date: '10.08.2026',
  },
  {
    id: 'rn-6',
    titleTj: 'Рӯйхати парвандаҳои таъингардида аз ҷониби муовини раиси суд подполковники адлия Шамсуллозода А.М.',
    titleRu: 'Список дел, назначенных к слушанию заместителем председателя военного суда',
    titleEn: 'Schedule of Court Hearings Appointed by Deputy Military Court President',
    courtDomain: 'harbidushanbe.sud.tj',
    region: 'dushanbe',
    date: '10.08.2026',
  },
  {
    id: 'rn-7',
    titleTj: 'РӮЙХАТИ ПАРВАНДАҲОИ ДАР ДАВОМИ ҲАФТА АЗ 10.08.2026 СОЛ ТО 14.08.2026 СОЛ ТАЪИН КАРДАШУДА',
    titleRu: 'Реестр судебных дел, назначенных на период с 10.08.2026 по 14.08.2026',
    titleEn: 'List of Cases Scheduled for Hearing from 10.08.2026 to 14.08.2026',
    courtDomain: 'sino.sud.tj',
    region: 'dushanbe',
    date: '09.08.2026',
  },
  {
    id: 'rn-8',
    titleTj: 'Судяҳои суди ноҳияи Сино бо кормандони КВД нақлиёти махсуси партовҳои сахти маишӣ вохӯрии судманд баргузор намуданд',
    titleRu: 'Судьи суда района Сино провели праворазъяснительную встречу с трудовым коллективом',
    titleEn: 'Judges of Sino District Court Held a Legal Awareness Meeting',
    courtDomain: 'sino.sud.tj',
    region: 'dushanbe',
    date: '05.08.2026',
  },
  {
    id: 'rn-9',
    titleTj: 'Рушди низоми судӣ дар давраи Истиқлолияти давлатии Ҷумҳурии Тоҷикистон: дастовардҳо, мушкилот ва дурнамои такмил',
    titleRu: 'Развитие судебной системы в период государственной независимости РТ',
    titleEn: 'Development of the Judicial System during the Period of Independence',
    courtDomain: 'sino.sud.tj',
    region: 'dushanbe',
    date: '04.08.2026',
  },
  {
    id: 'rn-10',
    titleTj: '35-солагии Истиқлолияти давлатии Ҷумҳурии Тоҷикистон заминаи ҳуқуқии давлатдории миллӣ ва кафили рушди устувор',
    titleRu: '35-летие Государственной независимости РТ — правовой фундамент устойчивого развития',
    titleEn: '35th Anniversary of State Independence — Legal Foundation of Progress',
    courtDomain: 'sino.sud.tj',
    region: 'dushanbe',
    date: '04.08.2026',
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

export interface LegislativeAct {
  id: number;
  titleTj: string;
  titleRu: string;
  titleEn: string;
  type: 'constitution' | 'constitutional_law' | 'code' | 'law';
  typeTj: string;
  typeRu: string;
  typeEn: string;

  url?: string;
}

export const LEGISLATIVE_ACTS: LegislativeAct[] = [
  {
    id: 1,
    titleTj: 'Конститутсияи Ҷумҳурии Тоҷикистон',
    titleRu: 'Конституция Республики Таджикистан',
    titleEn: 'Constitution of the Republic of Tajikistan',
    type: 'constitution',
    typeTj: 'Қонуни асосӣ',
    typeRu: 'Основной закон',
    typeEn: 'Fundamental Law',

  },
  {
    id: 2,
    titleTj: 'Қонуни конститутсионии ҶТ «Дар бораи Судҳои Ҷумҳурии Тоҷикистон»',
    titleRu: 'Конституционный Закон РТ «О Судах Республики Таджикистан»',
    titleEn: 'Constitutional Law of RT "On Courts of the Republic of Tajikistan"',
    type: 'constitutional_law',
    typeTj: 'Қонуни конститутсионӣ',
    typeRu: 'Конституционный закон',
    typeEn: 'Constitutional Law',

  },
  {
    id: 3,
    titleTj: 'Қонуни ҶТ «Дар бораи дастрасӣ ба иттилоот оид ба фаъолияти Судҳо»',
    titleRu: 'Закон РТ «О доступе к информации о деятельности Судов»',
    titleEn: 'Law of RT "On Access to Information on Court Activities"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 4,
    titleTj: 'Кодекси мадании Ҷумҳурии Тоҷикистон',
    titleRu: 'Гражданский кодекс Республики Таджикистан',
    titleEn: 'Civil Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 5,
    titleTj: 'Кодекси мурофиавии мадании Ҷумҳурии Тоҷикистон',
    titleRu: 'Гражданский процессуальный кодекс Республики Таджикистан',
    titleEn: 'Civil Procedure Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 6,
    titleTj: 'Кодекси расмиёти маъмурии Ҷумҳурии Тоҷикистон',
    titleRu: 'Кодекс об административных процедурах Республики Таджикистан',
    titleEn: 'Administrative Procedures Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 7,
    titleTj: 'Кодекси манзили Ҷумҳурии Тоҷикистон',
    titleRu: 'Жилищный кодекс Республики Таджикистан',
    titleEn: 'Housing Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 8,
    titleTj: 'Кодекси оилаи Ҷумҳурии Тоҷикистон',
    titleRu: 'Семейный кодекс Республики Таджикистан',
    titleEn: 'Family Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 9,
    titleTj: 'Кодекси замини Ҷумҳурии Тоҷикистон',
    titleRu: 'Земельный кодекс Республики Таджикистан',
    titleEn: 'Land Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 10,
    titleTj: 'Кодекси ҷиноятии Ҷумҳурии Тоҷикистон',
    titleRu: 'Уголовный кодекс Республики Таджикистан',
    titleEn: 'Criminal Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 11,
    titleTj: 'Кодекси мурофиавии ҷиноятии Ҷумҳурии Тоҷикистон',
    titleRu: 'Уголовно-процессуальный кодекс Республики Таджикистан',
    titleEn: 'Criminal Procedure Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 12,
    titleTj: 'Кодекси иҷрои ҷазои ҷиноятии Ҷумҳурии Тоҷикистон',
    titleRu: 'Кодекс исполнения уголовных наказаний Республики Таджикистан',
    titleEn: 'Penal Enforcement Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 13,
    titleTj: 'Қонуни ҶТ «Дар бораи тартиб ва шароити дар ҳабс нигоҳ доштани гумонбаршуда, айбдоршаванда ва судшаванда»',
    titleRu: 'Закон РТ «О порядке и условиях содержания под стражей подозреваемых, обвиняемых и подсудимых»',
    titleEn: 'Law of RT "On Procedure and Conditions of Detention of Suspects, Accused and Defendants"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 14,
    titleTj: 'Кодекси ҳуқуқвайронкунии маъмурии Ҷумҳурии Тоҷикистон',
    titleRu: 'Кодекс об административных правонарушениях Республики Таджикистан',
    titleEn: 'Code of Administrative Offences of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 15,
    titleTj: 'Кодекси мурофиаи ҳуқуқвайронкунии маъмурии Ҷумҳурии Тоҷикистон',
    titleRu: 'Процессуальный кодекс об административных правонарушениях Республики Таджикистан',
    titleEn: 'Procedural Code of Administrative Offences of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 16,
    titleTj: 'Кодекси меҳнати Ҷумҳурии Тоҷикистон',
    titleRu: 'Трудовой кодекс Республики Таджикистан',
    titleEn: 'Labour Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 17,
    titleTj: 'Кодекси мурофиавии иқтисодии Ҷумҳурии Тоҷикистон',
    titleRu: 'Экономический процессуальный кодекс Республики Таджикистан',
    titleEn: 'Economic Procedure Code of the Republic of Tajikistan',
    type: 'code',
    typeTj: 'Кодекс',
    typeRu: 'Кодекс',
    typeEn: 'Code',

  },
  {
    id: 18,
    titleTj: 'Қонуни Ҷумҳурии Тоҷикистон «Дар бораи истеҳсолоти иҷро»',
    titleRu: 'Закон Республики Таджикистан «Об исполнительном производстве»',
    titleEn: 'Law of the Republic of Tajikistan "On Enforcement Proceedings"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 19,
    titleTj: 'Қонуни Ҷумҳурии Тоҷикистон «Дар бораи санадҳои меъёрии ҳуқуқӣ»',
    titleRu: 'Закон Республики Таджикистан «О нормативных правовых актах»',
    titleEn: 'Law of the Republic of Tajikistan "On Normative Legal Acts"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 20,
    titleTj: 'Қонуни Ҷумҳурии Тоҷикистон «Дар бораи шартномаҳои байналмилалии Ҷумҳурии Тоҷикистон»',
    titleRu: 'Закон Республики Таджикистан «О международных договорах Республики Таджикистан»',
    titleEn: 'Law of the Republic of Tajikistan "On International Treaties of the Republic of Tajikistan"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 21,
    titleTj: 'Қонуни Ҷумҳурии Тоҷикистон «Дар бораи масъулияти падару модар дар таълиму тарбияи кӯдак»',
    titleRu: 'Закон Республики Таджикистан «Об ответственности родителей за обучение и воспитание детей»',
    titleEn: 'Law of the Republic of Tajikistan "On Parental Responsibility for Education and Upbringing of Children"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 22,
    titleTj: 'Қонуни Ҷумҳурии Тоҷикистон «Дар бораи танзими анъана ва ҷашну маросим дар Ҷумҳурии Тоҷикистон»',
    titleRu: 'Закон Республики Таджикистан «Об упорядочении традиций, торжеств и обрядов в Республике Таджикистан»',
    titleEn: 'Law of the Republic of Tajikistan "On Regulation of Traditions, Celebrations and Ceremonies"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 23,
    titleTj: 'Қонуни Ҷумҳурии Тоҷикистон «Дар бораи муроҷиатҳои шахсони воқеӣ ва ҳуқуқӣ»',
    titleRu: 'Закон Республики Таджикистан «Об обращениях физических и юридических лиц»',
    titleEn: 'Law of the Republic of Tajikistan "On Appeals of Natural and Legal Persons"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
  {
    id: 24,
    titleTj: 'Қонуни Ҷумҳурии Тоҷикистон «Дар бораи хизмати давлатӣ»',
    titleRu: 'Закон Республики Таджикистан «О государственной службе»',
    titleEn: 'Law of the Republic of Tajikistan "On Civil Service"',
    type: 'law',
    typeTj: 'Қонуни ҶТ',
    typeRu: 'Закон РТ',
    typeEn: 'Law of RT',

  },
];
