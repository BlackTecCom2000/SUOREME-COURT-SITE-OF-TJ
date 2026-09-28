export interface Slider3DSlide {
  id: number | string;
  titleTj: string;
  titleRu: string;
  titleEn?: string;
  summaryTj: string;
  summaryRu: string;
  summaryEn?: string;
  categoryTj?: string;
  categoryRu?: string;
  categoryEn?: string;
  imageUrl: string;
  linkUrl?: string;
  dateText?: string;
  sortOrder: number;
  isActive: boolean | number;
  createdAt?: string;
  updatedAt?: string;
}

export type SliderSourceMode = 'custom' | 'news' | 'featured' | 'hybrid';
export type SliderCardTheme = 'glass' | 'dark' | 'solid' | 'gold_bordered' | 'cyber';
export type SliderGlowIntensity = 'none' | 'soft' | 'medium' | 'strong';

export interface Slider3DConfig {
  // Source & Content mode
  sourceMode: SliderSourceMode;
  maxSlides: number;

  // Behavior
  autoplay: boolean;
  interval: number; // in seconds
  pauseOnHover: boolean;
  tiltEnabled: boolean;
  dragEnabled: boolean;
  infiniteLoop: boolean;

  // Header & UI Elements
  showBadge: boolean;
  badgeTextTj: string;
  badgeTextRu: string;
  badgeTextEn: string;
  showCounter: boolean;
  showPlayPause: boolean;
  showArrows: boolean;
  showDots: boolean;
  showReadMore: boolean;
  readMoreTextTj: string;
  readMoreTextRu: string;
  readMoreTextEn: string;
  showAllNews: boolean;
  allNewsTextTj: string;
  allNewsTextRu: string;
  allNewsTextEn: string;

  // 3D Geometry & Dimensions
  perspective: number; // px, e.g. 1200
  stageHeight: number; // px, e.g. 400
  cardWidth: number; // px, e.g. 660
  cardHeight: number; // px, e.g. 370
  cardRadius: number; // px, e.g. 24
  sideOffsetX: number; // px, e.g. 280
  sideOffsetZ: number; // px, e.g. -120
  sideRotateY: number; // deg, e.g. 18
  sideScale: number; // e.g. 0.85
  sideOpacity: number; // e.g. 0.45

  // Visual Styling & Design
  cardTheme: SliderCardTheme;
  activeBorderColor: string; // e.g. '#dfbe7e'
  glowIntensity: SliderGlowIntensity;
  glowColor: string; // e.g. 'rgba(223, 190, 126, 0.6)'
  imageOverlayOpacity: number; // 0 - 100 (%)
  bgBlur: number; // px
  containerBackground: 'glass' | 'card' | 'transparent';
}

export const DEFAULT_SLIDER_3D_CONFIG: Slider3DConfig = {
  sourceMode: 'hybrid',
  maxSlides: 10,

  autoplay: true,
  interval: 6,
  pauseOnHover: true,
  tiltEnabled: true,
  dragEnabled: true,
  infiniteLoop: true,

  showBadge: true,
  badgeTextTj: 'ХАБАРҲОИ АСОСӢ // 3D КАРУСЕЛ',
  badgeTextRu: 'ГЛАВНЫЕ НОВОСТИ // 3D СЛАЙДЕР',
  badgeTextEn: 'FEATURED NEWS // 3D SLIDER',
  showCounter: true,
  showPlayPause: true,
  showArrows: true,
  showDots: true,
  showReadMore: true,
  readMoreTextTj: 'Муфассал хондан',
  readMoreTextRu: 'Читать подробнее',
  readMoreTextEn: 'Read Full Story',
  showAllNews: true,
  allNewsTextTj: 'Ҳамаи хабарҳо',
  allNewsTextRu: 'Все новости',
  allNewsTextEn: 'All News',

  perspective: 1200,
  stageHeight: 400,
  cardWidth: 660,
  cardHeight: 370,
  cardRadius: 24,
  sideOffsetX: 280,
  sideOffsetZ: -120,
  sideRotateY: 18,
  sideScale: 0.85,
  sideOpacity: 0.45,

  cardTheme: 'glass',
  activeBorderColor: '#dfbe7e',
  glowIntensity: 'medium',
  glowColor: 'rgba(223, 190, 126, 0.6)',
  imageOverlayOpacity: 60,
  bgBlur: 16,
  containerBackground: 'glass',
};

export const DEFAULT_SLIDER_3D_SLIDES: Slider3DSlide[] = [
  {
    id: 1,
    titleTj: 'Тартиби қабули муроҷиатҳои шаҳрвандон дар шакли электронӣ тавассути сомонаи суд.тҷ',
    titleRu: 'Порядок приёма обращений граждан в электронной форме через единый портал sud.tj',
    titleEn: 'Procedure for Receiving Citizen Appeals Electronically via sud.tj Portal',
    summaryTj: 'Суди Олии Ҷумҳурии Тоҷикистон дастури навро оид ба пешниҳоди аризаҳои электронӣ ва бақайдгирии фаврӣ нашр намуд.',
    summaryRu: 'Верховный суд Республики Таджикистан опубликовал обновленный регламент подачи электронных исковых заявлений.',
    summaryEn: 'The Supreme Court published updated guidelines on electronic court claim submissions and instant digital registration.',
    categoryTj: 'СУДИ ЭЛЕКТРОНӢ',
    categoryRu: 'ЭЛЕКТРОННЫЙ СУД',
    categoryEn: 'E-JUSTICE',
    imageUrl: '/supreme-court-night.jpg',
    linkUrl: '/appeals',
    dateText: '18.08.2026',
    sortOrder: 1,
    isActive: 1,
  },
  {
    id: 2,
    titleTj: 'Ҷаласаи Пленуми Суди Олии Ҷумҳурии Тоҷикистон оид ба ҷамъбасти амалияи судӣ',
    titleRu: 'Заседание Пленума Верховного суда Республики Таджикистан по обобщению судебной практики',
    titleEn: 'Plenum Session of the Supreme Court on Summary of Judicial Practice',
    summaryTj: 'Дар ҷаласа натиҷаҳои ҷамъбасти амалияи судӣ оид ба татбиқи меъёрҳои қонунгузории оилавӣ ва манзилӣ баррасӣ гардиданд.',
    summaryRu: 'Рассмотрены итоги обобщения судебной практики по применению норм семейного и жилищного законодательства.',
    summaryEn: 'The session reviewed the consolidation of judicial practice regarding family and housing legislation standards.',
    categoryTj: 'ПЛЕНУМИ СУДИ ОЛӢ',
    categoryRu: 'ПЛЕНУМ ВЕРХОВНОГО СУДА',
    categoryEn: 'SUPREME COURT PLENUM',
    imageUrl: '/supreme-court-day.jpg',
    linkUrl: '/acts',
    dateText: '15.08.2026',
    sortOrder: 2,
    isActive: 1,
  },
  {
    id: 3,
    titleTj: 'Баррасии масъалаҳои дастрасии шахсони дорои маъюбият ба адолати судӣ ва инфрасохтори рақамӣ',
    titleRu: 'Обеспечение доступности правосудия для лиц с инвалидностью и цифровая инфраструктура',
    titleEn: 'Ensuring Equal Access to Justice for Persons with Disabilities and Digital Infrastructure',
    summaryTj: 'Ҷорӣ намудани воситаҳои рақамӣ ва интерфейсҳои мутобиқшуда дар биноҳои судҳо ва сомонаҳои расмӣ баррасӣ шуд.',
    summaryRu: 'Внедрение цифровых инструментов и адаптивных интерфейсов в зданиях судов и на веб-порталах республики.',
    summaryEn: 'Implementation of accessible digital portals and assistive judicial technologies across court branches.',
    categoryTj: 'ДАСТРАСИИ СУДӢ',
    categoryRu: 'ДОСТУПНОСТЬ ПРАВОСУДИЯ',
    categoryEn: 'ACCESS TO JUSTICE',
    imageUrl: '/themis-background.jpg',
    linkUrl: '/news',
    dateText: '14.08.2026',
    sortOrder: 3,
    isActive: 1,
  },
  {
    id: 4,
    titleTj: 'Нашри шумораи нави нашрияи расмии Суди Олии ҶТ таҳти унвони «Мизони Қонун»',
    titleRu: 'Выпуск официального издания Верховного суда «Мизони Қонун»',
    titleEn: 'Release of Supreme Court Official Journal "Mizoni Qonun"',
    summaryTj: 'Дар нашри нав мақолаҳои таҳлилии судяҳо, шарҳҳои амалияи кассатсионӣ ва тавсияҳои методӣ нашр гардиданд.',
    summaryRu: 'Опубликованы аналитические статьи судей, обзоры кассационной практики и методические рекомендации.',
    summaryEn: 'Published analytical judicial articles, cassation reviews, and methodical recommendations for legal practice.',
    categoryTj: 'МАТБУОТИ СУДӢ',
    categoryRu: 'СУДЕБНАЯ ПЕЧАТЬ',
    categoryEn: 'JUDICIAL PRESS',
    imageUrl: '/themis-light-background.jpg',
    linkUrl: '/news',
    dateText: '10.08.2026',
    sortOrder: 4,
    isActive: 1,
  },
];
