import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('data/sudtj.sqlite');
const db = new Database(dbPath);

console.log('Cleaning up database texts and test records...');

// 1. Delete junk / test rows
const deleted = db.prepare(`
  DELETE FROM content 
  WHERE title_ru LIKE '%test%' 
     OR title_ru LIKE '%E2E%' 
     OR title_ru LIKE '%???%'
     OR title_ru LIKE '%snake%'
     OR title_ru LIKE '%Scope%'
`).run();
console.log('Deleted junk rows:', deleted.changes);

// 2. Fix all-caps titles in content
const updates = [
  { id: 1, tj: 'Вокуниши Суди Олӣ вобаста ба навори дар шабакаҳои иҷтимоӣ нашршуда', ru: 'Реакция Верховного суда относительно видеозаписи в социальных сетях' },
  { id: 2, tj: 'Иштирок дар чорабинӣ ҷиҳати таъмини иҷрои барномаҳои давлатӣ', ru: 'Участие в мероприятии по обеспечению реализации государственных программ' },
  { id: 3, tj: 'Раванди ободонӣ ва фаъолияти суди шаҳри Ваҳдат', ru: 'Ход благоустройства и деятельность суда города Вахдат' },
  { id: 4, tj: 'Озмун барои ишғоли мансабҳои холии маъмурии хизмати давлатӣ', ru: 'Конкурс на замещение вакантных административных должностей государственной службы' },
  { id: 5, tj: 'Натиҷаи озмуни ишғоли мансабҳои холии хизмати давлатӣ', ru: 'Итоги конкурса на замещение вакантных должностей государственной службы' },
  { id: 6, tj: 'Рӯйхати расмии сомона ва почтаҳои электронии судҳои ҷумҳурӣ', ru: 'Официальный перечень сайтов и электронных адресов судов республики' },
  { id: 34, tj: 'Маҷлиси назоратии ҳафтаина дар Суди Олии Ҷумҳурии Тоҷикистон', ru: 'Еженедельное контрольное совещание в Верховном суде Республики Таджикистан' },
  { id: 35, tj: 'Омодагӣ ба ҷаласаи Шӯрои раисони судҳои олии давлатҳои иштирокдори ИДМ', ru: 'Подготовка к заседанию Совета председателей верховных судов государств СНГ' },
  { id: 36, tj: 'Семинари омӯзишӣ оид ба рушди малакаҳои рақамии судяҳо', ru: 'Обучающий семинар по развитию цифровых навыков судей' },
  { id: 37, tj: 'Истиқлолияти давлатӣ — заминаи таҳкими давлатдории миллӣ ва рушди ҳокимияти судӣ', ru: 'Государственная независимость — основа укрепления национальной государственности и развития судебной власти' },
];

for (const u of updates) {
  db.prepare('UPDATE content SET title_tj = ?, title_ru = ? WHERE id = ?').run(u.tj, u.ru, u.id);
}

// 3. Ensure slider_3d_slides table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS slider_3d_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_tj TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT,
    summary_tj TEXT,
    summary_ru TEXT,
    summary_en TEXT,
    category_tj TEXT,
    category_ru TEXT,
    category_en TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    date_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const sc = db.prepare('SELECT count(*) as c FROM slider_3d_slides').get();
if (sc.c === 0) {
  const ins = db.prepare(`
    INSERT INTO slider_3d_slides (title_tj, title_ru, title_en, summary_tj, summary_ru, summary_en, category_tj, category_ru, category_en, image_url, link_url, date_text, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  ins.run(
    'Тартиби қабули муроҷиатҳои шаҳрвандон дар шакли электронӣ тавассути сомонаи суд.тҷ',
    'Порядок приёма обращений граждан в электронной форме через единый портал sud.tj',
    'Procedure for Receiving Citizen Appeals Electronically via sud.tj Portal',
    'Суди Олии Ҷумҳурии Тоҷикистон дастури навро оид ба пешниҳоди аризаҳои электронӣ ва бақайдгирии фаврӣ нашр намуд.',
    'Верховный суд Республики Таджикистан опубликовал обновленный регламент подачи электронных исковых заявлений.',
    'The Supreme Court published updated guidelines on electronic court claim submissions and instant digital registration.',
    'СУДИ ЭЛЕКТРОНӢ',
    'ЭЛЕКТРОННЫЙ СУД',
    'E-JUSTICE',
    '/supreme-court-night.jpg',
    '/appeals',
    '18.08.2026',
    1,
    1
  );
  ins.run(
    'Ҷаласаи Пленуми Суди Олии Ҷумҳурии Тоҷикистон оид ба ҷамъбасти амалияи судӣ',
    'Заседание Пленума Верховного суда Республики Таджикистан по обобщению судебной практики',
    'Plenum Session of the Supreme Court on Summary of Judicial Practice',
    'Дар ҷаласа натиҷаҳои ҷамъбасти амалияи судӣ оид ба татбиқи меъёрҳои қонунгузории оилавӣ ва манзилӣ баррасӣ гардиданд.',
    'Рассмотрены итоги обобщения судебной практики по применению норм семейного и жилищного законодательства.',
    'The session reviewed the consolidation of judicial practice regarding family and housing legislation standards.',
    'ПЛЕНУМИ СУДИ ОЛӢ',
    'ПЛЕНУМ ВЕРХОВНОГО СУДА',
    'SUPREME COURT PLENUM',
    '/supreme-court-day.jpg',
    '/acts',
    '15.08.2026',
    2,
    1
  );
  ins.run(
    'Баррасии масъалаҳои дастрасии шахсони дорои маъюбият ба адолати судӣ ва инфрасохтори рақамӣ',
    'Обеспечение доступности правосудия для лиц с инвалидностью и цифровая инфраструктура',
    'Ensuring Equal Access to Justice for Persons with Disabilities and Digital Infrastructure',
    'Ҷорӣ намудани воситаҳои рақамӣ ва интерфейсҳои мутобиқшуда дар биноҳои судҳо ва сомонаҳои расмӣ баррасӣ шуд.',
    'Внедрение цифровых инструментов и адаптивных интерфейсов в зданиях судов и на веб-порталах республики.',
    'Implementation of accessible digital portals and assistive judicial technologies across court branches.',
    'ДАСТРАСИИ СУДӢ',
    'ДОСТУПНОСТЬ ПРАВОСУДИЯ',
    'ACCESS TO JUSTICE',
    '/themis-background.jpg',
    '/news',
    '14.08.2026',
    3,
    1
  );
  ins.run(
    'Нашри шумораи нави нашрияи расмии Суди Олии ҶТ таҳти унвони «Мизони Қонун»',
    'Выпуск официального издания Верховного суда «Мизони Қонун»',
    'Release of Supreme Court Official Journal "Mizoni Qonun"',
    'Дар нашри нав мақолаҳои таҳлилии судяҳо, шарҳҳои амалияи кассатсионӣ ва тавсияҳои методӣ нашр гардиданд.',
    'Опубликованы аналитические статьи судей, обзоры кассационной практики и методические рекомендации.',
    'Published analytical judicial articles, cassation reviews, and methodical recommendations for legal practice.',
    'МАТБУОТИ СУДӢ',
    'СУДЕБНАЯ ПЕЧАТЬ',
    'JUDICIAL PRESS',
    '/themis-light-background.jpg',
    '/news',
    '10.08.2026',
    4,
    1
  );
} else {
  db.prepare('UPDATE slider_3d_slides SET title_tj = ?, title_ru = ? WHERE id = 1').run(
    'Тартиби қабули муроҷиатҳои шаҳрвандон дар шакли электронӣ тавассути сомонаи суд.тҷ',
    'Порядок приёма обращений граждан в электронной форме через единый портал sud.tj'
  );
  db.prepare('UPDATE slider_3d_slides SET title_tj = ?, title_ru = ? WHERE id = 2').run(
    'Ҷаласаи Пленуми Суди Олии Ҷумҳурии Тоҷикистон оид ба ҷамъбасти амалияи судӣ',
    'Заседание Пленума Верховного суда Республики Таджикистан по обобщению судебной практики'
  );
  db.prepare('UPDATE slider_3d_slides SET title_tj = ?, title_ru = ? WHERE id = 3').run(
    'Баррасии масъалаҳои дастрасии шахсони дорои маъюбият ба адолати судӣ ва инфрасохтори рақамӣ',
    'Обеспечение доступности правосудия для лиц с инвалидностью и цифровая инфраструктура'
  );
  db.prepare('UPDATE slider_3d_slides SET title_tj = ?, title_ru = ? WHERE id = 4').run(
    'Нашри шумораи нави нашрияи расмии Суди Олии ҶТ таҳти унвони «Мизони Қонун»',
    'Выпуск официального издания Верховного суда «Мизони Қонун»'
  );
}

// 4. Update slider 3d config in settings to boost readability
const cfg = {
  sourceMode: 'hybrid',
  maxSlides: 10,
  autoplay: true,
  interval: 7,
  pauseOnHover: true,
  tiltEnabled: true,
  dragEnabled: true,
  infiniteLoop: true,
  showBadge: true,
  badgeTextTj: 'Хабарҳои асосӣ // 3D Карусел',
  badgeTextRu: 'Главные новости // 3D Слайдер',
  badgeTextEn: 'Featured News // 3D Slider',
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
  stageHeight: 410,
  cardWidth: 680,
  cardHeight: 380,
  cardRadius: 24,
  sideOffsetX: 290,
  sideOffsetZ: -110,
  sideRotateY: 16,
  sideScale: 0.88,
  sideOpacity: 0.70, // Raised from 0.45 to 0.70 for clear legibility!
  cardTheme: 'glass',
  activeBorderColor: '#dfbe7e',
  glowIntensity: 'medium',
  glowColor: 'rgba(223, 190, 126, 0.55)',
  imageOverlayOpacity: 65,
  bgBlur: 16,
  containerBackground: 'glass'
};

db.prepare(`
  INSERT INTO settings(key, value) VALUES('slider_3d_config', ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`).run(JSON.stringify(cfg));

console.log('Database readability cleanup complete!');
