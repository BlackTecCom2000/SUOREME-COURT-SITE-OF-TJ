export interface HeroLang {
  name: string;
  title: string;
  years: string;
  excerpt: string;
  bio: string[];
  decree: string;
}

export interface Hero {
  id: string;
  portrait: string;
  initials: string;
  tj: HeroLang;
  ru: HeroLang;
  en: HeroLang;
}

const PORTRAIT = (id: string) => `/images/heroes/${id}.jpg`;

/**
 * Қаҳрамонони Тоҷикистон — Heroes of Tajikistan.
 * Tajik texts are the source of truth (provided verbatim); ru/en are
 * faithful translations. Portraits resolve to /images/heroes/<id>.jpg —
 * drop the six files there and they appear with zero code changes
 * (the component falls back to a gold monogram while a file is missing).
 */
export const HEROES: Hero[] = [
  {
    id: 'ayni',
    portrait: PORTRAIT('ayni'),
    initials: 'СА',
    tj: {
      name: 'Садриддин Айнӣ',
      title: 'Адиб, олим, асосгузори адабиёти муосири тоҷик',
      years: '1878 – 1954',
      excerpt:
        'Аввалин Президенти Академияи илмҳои Ҷумҳурии Тоҷикистон. Асарҳояш ба 29 забони хориҷӣ нашр шудаанд.',
      bio: [
        'Садриддин Айнӣ (1878 – 1954) — адиб, олим ва асосгузори адабиёти муосири тоҷик. Аввалин Президенти Академияи илмҳои Ҷумҳурии Тоҷикистон.',
        'Муаллифи асарҳои «Таърихи амирони манғитияи Бухоро», «Таърихи инқилоби фикрӣ дар Бухоро», «Намунаи адабиёти тоҷик», «Дохунда», «Ғуломон», «Ёддоштҳо» ва дигар асарҳо, ки ба 29 забони хориҷӣ нашр шудаанд.',
      ],
      decree:
        'Бо фармони Президенти Ҷумҳурии Тоҷикистон Эмомалӣ Раҳмон аз 08 сентябри соли 1997 ба асосгузори адабиёти муосири тоҷик Садриддин Айнӣ унвони олии «Қаҳрамони Тоҷикистон» дода шуд.',
    },
    ru: {
      name: 'Садриддин Айни',
      title: 'Писатель, учёный, основоположник современной таджикской литературы',
      years: '1878 – 1954',
      excerpt:
        'Первый президент Академии наук Республики Таджикистан. Его произведения переведены на 29 иностранных языков.',
      bio: [
        'Садриддин Айни (1878 – 1954) — писатель, учёный, основоположник современной таджикской литературы. Первый президент Академии наук Республики Таджикистан.',
        'Автор произведений «История мангытских эмиров Бухары», «История интеллектуальной революции в Бухаре», «Образцы таджикской литературы», «Дохунда», «Рабы», «Воспоминания» и других сочинений, переведённых на 29 иностранных языков.',
      ],
      decree:
        'Указом Президента Республики Таджикистан Эмомали Рахмона от 8 сентября 1997 года основоположнику современной таджикской литературы Садриддину Айни присвоено высшее звание «Герой Таджикистана».',
    },
    en: {
      name: 'Sadriddin Ayni',
      title: 'Writer, scholar, founder of modern Tajik literature',
      years: '1878 – 1954',
      excerpt:
        'First President of the Academy of Sciences of the Republic of Tajikistan. His works are translated into 29 foreign languages.',
      bio: [
        'Sadriddin Ayni (1878 – 1954) was a writer, scholar and the founder of modern Tajik literature. He served as the first President of the Academy of Sciences of the Republic of Tajikistan.',
        'He authored “History of the Manghit Emirs of Bukhara”, “History of the Intellectual Revolution in Bukhara”, “Samples of Tajik Literature”, “Dokhunda”, “The Slaves”, “Memoirs” and other works translated into 29 foreign languages.',
      ],
      decree:
        'By Decree of the President of the Republic of Tajikistan Emomali Rahmon of 8 September 1997, Sadriddin Ayni was awarded the supreme title “Hero of Tajikistan”.',
    },
  },
  {
    id: 'gafurov',
    portrait: PORTRAIT('gafurov'),
    initials: 'БҒ',
    tj: {
      name: 'Бобоҷон Ғафуров',
      title: 'Олим, академик, муаллифи китоби оламшумули «Тоҷикон»',
      years: '1909 – 1977',
      excerpt:
        'Муаллифи китоби «Тоҷикон» ва зиёда аз 300 асару мақолаҳо. Солҳои 1956 – 1977 — сарвари Пажуҳишгоҳи шарқшиносии ИҶШС.',
      bio: [
        'Бобоҷон Ғафуров (1909 – 1977) — олим, академики Академияи Илмҳои ИҶШС, арбоби ҳизбӣ ва давлатӣ, муаллифи китоби оламшумули «Тоҷикон» ва зиёда аз 300 асару мақолаҳо.',
        'Солҳои 1944 – 1946 котиби дуюм, солҳои 1946 – 1956 котиби якуми КМ Ҳизби коммунистии Тоҷикистон, солҳои 1956 – 1977 сарвари Пажуҳишгоҳи шарқшиносии ИҶШС.',
      ],
      decree:
        'Бо фармони Президенти Ҷумҳурии Тоҷикистон Эмомалӣ Раҳмон аз 08 сентябри соли 1997 ба таърихшинос ва шарқшиноси шинохтаи тоҷик, академик, муаллифи китоби «Тоҷикон» Бобоҷон Ғафуров унвони олии «Қаҳрамони Тоҷикистон» дода шуд.',
    },
    ru: {
      name: 'Бободжан Гафуров',
      title: 'Учёный, академик, автор всемирно известной книги «Таджики»',
      years: '1909 – 1977',
      excerpt:
        'Автор книги «Таджики» и более 300 трудов и статей. В 1956 – 1977 годах — директор Института востоковедения АН СССР.',
      bio: [
        'Бободжан Гафуров (1909 – 1977) — учёный, академик Академии наук СССР, партийный и государственный деятель, автор всемирно известной книги «Таджики» и более 300 трудов и статей.',
        'В 1944 – 1946 годах — второй секретарь, в 1946 – 1956 годах — первый секретарь ЦК Компартии Таджикистана; в 1956 – 1977 годах — директор Института востоковедения АН СССР.',
      ],
      decree:
        'Указом Президента Республики Таджикистан Эмомали Рахмона от 8 сентября 1997 года известному таджикскому историку и востоковеду, академику, автору книги «Таджики» Бободжану Гафурову присвоено высшее звание «Герой Таджикистана».',
    },
    en: {
      name: 'Bobojon Gafurov',
      title: 'Scholar, academician, author of the world-renowned “The Tajiks”',
      years: '1909 – 1977',
      excerpt:
        'Author of “The Tajiks” and over 300 works and articles. In 1956 – 1977, Director of the Institute of Oriental Studies of the USSR Academy of Sciences.',
      bio: [
        'Bobojon Gafurov (1909 – 1977) was a scholar, Academician of the USSR Academy of Sciences, party and state figure, and author of the world-renowned book “The Tajiks” and over 300 works and articles.',
        'In 1944 – 1946 he was Second Secretary and in 1946 – 1956 First Secretary of the Central Committee of the Communist Party of Tajikistan; in 1956 – 1977 he headed the Institute of Oriental Studies of the USSR Academy of Sciences.',
      ],
      decree:
        'By Decree of the President of the Republic of Tajikistan Emomali Rahmon of 8 September 1997, Bobojon Gafurov was awarded the supreme title “Hero of Tajikistan”.',
    },
  },
  {
    id: 'tursunzoda',
    portrait: PORTRAIT('tursunzoda'),
    initials: 'МТ',
    tj: {
      name: 'Мирзо Турсунзода',
      title: 'Шоири халқӣ, раиси Иттифоқи нависандагони Тоҷикистон',
      years: '1911 – 1977',
      excerpt:
        'Қаҳрамони меҳнати сотсиалистӣ. Барандаи ҷоизаҳои давлатии ИҶШС, ҶШС Тоҷикистон ва ҷоизаи байналмилалии ба номи Ҷ. Неҳру (1967).',
      bio: [
        'Мирзо Турсунзода (1911 – 1977) — шоири халқӣ, раиси Иттифоқи нависандагони Тоҷикистон, Қаҳрамони меҳнати сотсиалистӣ, Раиси Кумитаи якдилии халқҳои Осиё ва Африқо.',
        'Барои достонҳои «Қиссаи Ҳиндустон» (1948), «Ҳасани аробакаш», «Чароғи абадӣ», «Садои Осиё» (1960), «Ҷони ширин» (1963) бо ҷоизаҳои давлатии ИҶШС, ҶШС Тоҷикистон ва ҷоизаи байналмилалии ба номи Ҷ. Неҳру (1967) сарфароз шуда буд.',
      ],
      decree:
        'Бо фармони Президенти Ҷумҳурии Тоҷикистон Эмомалӣ Раҳмон аз 07 майи соли 2001 ба шоири халқии Тоҷикистон, ходими намоёни ҷамъиятӣ Мирзо Турсунзода унвони олии «Қаҳрамони Тоҷикистон» дода шуд.',
    },
    ru: {
      name: 'Мирзо Турсунзаде',
      title: 'Народный поэт, председатель Союза писателей Таджикистана',
      years: '1911 – 1977',
      excerpt:
        'Герой Социалистического Труда. Лауреат госпремий СССР и Таджикской ССР, международной премии им. Дж. Неру (1967).',
      bio: [
        'Мирзо Турсунзаде (1911 – 1977) — народный поэт, председатель Союза писателей Таджикистана, Герой Социалистического Труда, председатель Комитета солидарности народов Азии и Африки.',
        'За поэмы «Сказание об Индии» (1948), «Хасани-аробакаш», «Вечный светильник», «Голос Азии» (1960), «Душа милая» (1963) удостоен государственных премий СССР и Таджикской ССР, а также международной премии имени Дж. Неру (1967).',
      ],
      decree:
        'Указом Президента Республики Таджикистан Эмомали Рахмона от 7 мая 2001 года народному поэту Таджикистана, видному общественному деятелю Мирзо Турсунзаде присвоено высшее звание «Герой Таджикистана».',
    },
    en: {
      name: 'Mirzo Tursunzoda',
      title: 'People’s Poet, Chairman of the Union of Writers of Tajikistan',
      years: '1911 – 1977',
      excerpt:
        'Hero of Socialist Labour. Laureate of USSR and Tajik SSR state prizes and the international Jawaharlal Nehru Award (1967).',
      bio: [
        'Mirzo Tursunzoda (1911 – 1977) was the People’s Poet, Chairman of the Union of Writers of Tajikistan, Hero of Socialist Labour, and Chairman of the Afro-Asian People’s Solidarity Committee.',
        'His poems “Tale of India” (1948), “Hasani the Cart-Driver”, “The Eternal Lamp”, “Voice of Asia” (1960) and “Sweet Soul” (1963) earned him USSR and Tajik SSR state prizes and the international Jawaharlal Nehru Award (1967).',
      ],
      decree:
        'By Decree of the President of the Republic of Tajikistan Emomali Rahmon of 7 May 2001, Mirzo Tursunzoda was awarded the supreme title “Hero of Tajikistan”.',
    },
  },
  {
    id: 'rahmon',
    portrait: PORTRAIT('rahmon'),
    initials: 'ЭР',
    tj: {
      name: 'Эмомалӣ Раҳмон',
      title: 'Президенти Ҷумҳурии Тоҷикистон. Асосгузори сулҳу ваҳдати миллӣ — Пешвои миллат',
      years: '',
      excerpt:
        '19 ноябри соли 1992 раиси Шӯрои Олии Ҷумҳурии Тоҷикистон; солҳои 1994, 1999, 2006 ва 2013 Президенти Ҷумҳурии Тоҷикистон интихоб гардидаст.',
      bio: [
        'Эмомалӣ Раҳмон — Президенти Ҷумҳурии Тоҷикистон. 19 ноябри соли 1992 дар иҷлосияи XVI Шӯрои Олии Ҷумҳурии Тоҷикистон раиси Шӯрои Олии Ҷумҳурии Тоҷикистон, 6 ноябри соли 1994 бори аввал, солҳои 1999, 2006 ва 2013 Президенти Ҷумҳурии Тоҷикистон интихоб гардидаст.',
        'Асосгузори сулҳу ваҳдати миллӣ — Пешвои миллат.',
      ],
      decree:
        'Бо қарори Маҷлиси Олии Ҷумҳурии Тоҷикистон 11 декабри соли 1999 барои мустаҳкам намудани давлатдории соҳибистиқлол ва пойдории сулҳ дар Ҷумҳурии Тоҷикистон бо унвони олии «Қаҳрамони Тоҷикистон» мукофотонида шудааст.',
    },
    ru: {
      name: 'Эмомали Рахмон',
      title: 'Президент Республики Таджикистан. Основатель мира и национального единства — Лидер нации',
      years: '',
      excerpt:
        '19 ноября 1992 года — Председатель Верховного Совета РТ; в 1994, 1999, 2006 и 2013 годах избран Президентом Республики Таджикистан.',
      bio: [
        'Эмомали Рахмон — Президент Республики Таджикистан. 19 ноября 1992 года на XVI сессии Верховного Совета Республики Таджикистан избран Председателем Верховного Совета; 6 ноября 1994 года впервые, а в 1999, 2006 и 2013 годах — Президентом Республики Таджикистан.',
        'Основатель мира и национального единства — Лидер нации.',
      ],
      decree:
        'Постановлением Маджлиси Оли Республики Таджикистан от 11 декабря 1999 года за укрепление независимой государственности и установление мира в Республике Таджикистан награждён высшим званием «Герой Таджикистана».',
    },
    en: {
      name: 'Emomali Rahmon',
      title: 'President of the Republic of Tajikistan. Founder of peace and national unity — Leader of the Nation',
      years: '',
      excerpt:
        'On 19 November 1992 elected Chairman of the Supreme Council; in 1994, 1999, 2006 and 2013 elected President of the Republic of Tajikistan.',
      bio: [
        'Emomali Rahmon is the President of the Republic of Tajikistan. On 19 November 1992, at the 16th session of the Supreme Council, he was elected its Chairman; on 6 November 1994 he was first elected President, and re-elected in 1999, 2006 and 2013.',
        'Founder of peace and national unity — Leader of the Nation.',
      ],
      decree:
        'By Resolution of the Majlisi Oli of the Republic of Tajikistan of 11 December 1999, for strengthening independent statehood and establishing peace, he was awarded the supreme title “Hero of Tajikistan”.',
    },
  },
  {
    id: 'makhsum',
    portrait: PORTRAIT('makhsum'),
    initials: 'НМ',
    tj: {
      name: 'Нусратулло Махсум',
      title: 'Ходими давлатӣ ва ҳизбӣ',
      years: '1881 – 1938',
      excerpt:
        'Солҳои 1924 – 1926 раиси Кумитаи инқилобии ҶМШС Тоҷикистон, солҳои 1926 – 1933 раиси Кумитаи Иҷроияи Марказии ҶШС Тоҷикистон.',
      bio: [
        'Нусратулло Махсум (Лутфуллоев) (1881 – 1938) — ходими давлатӣ ва ҳизбӣ. Солҳои 1924 – 1926 раиси Кумитаи инқилобии ҶМШС Тоҷикистон, солҳои 1926 – 1933 раиси Кумитаи Иҷроияи Марказии ҶШС Тоҷикистон.',
      ],
      decree:
        'Бо фармони Президенти Ҷумҳурии Тоҷикистон аз 27 июни соли 2006 ба фарзанди барӯманди халқи тоҷик Нусратулло Махсум унвони олии «Қаҳрамони Тоҷикистон» дода шудааст.',
    },
    ru: {
      name: 'Нусратулло Махсум',
      title: 'Государственный и партийный деятель',
      years: '1881 – 1938',
      excerpt:
        'В 1924 – 1926 годах — председатель Ревкома Таджикской АССР, в 1926 – 1933 годах — председатель ЦИК Таджикской ССР.',
      bio: [
        'Нусратулло Махсум (Лутфуллоев) (1881 – 1938) — государственный и партийный деятель. В 1924 – 1926 годах — председатель Революционного комитета Таджикской АССР, в 1926 – 1933 годах — председатель Центрального Исполнительного Комитета Таджикской ССР.',
      ],
      decree:
        'Указом Президента Республики Таджикистан от 27 июня 2006 года славному сыну таджикского народа Нусратулло Махсуму присвоено высшее звание «Герой Таджикистана».',
    },
    en: {
      name: 'Nusratullo Makhsum',
      title: 'Statesman and party figure',
      years: '1881 – 1938',
      excerpt:
        'In 1924 – 1926 Chairman of the Revolutionary Committee of the Tajik ASSR; in 1926 – 1933 Chairman of the Central Executive Committee of the Tajik SSR.',
      bio: [
        'Nusratullo Makhsum (Lutfulloyev) (1881 – 1938) was a state and party figure. In 1924 – 1926 he chaired the Revolutionary Committee of the Tajik ASSR, and in 1926 – 1933 the Central Executive Committee of the Tajik SSR.',
      ],
      decree:
        'By Decree of the President of the Republic of Tajikistan of 27 June 2006, Nusratullo Makhsum was awarded the supreme title “Hero of Tajikistan”.',
    },
  },
  {
    id: 'shotemur',
    portrait: PORTRAIT('shotemur'),
    initials: 'ШШ',
    tj: {
      name: 'Шириншоҳ Шоҳтемур',
      title: 'Ходими давлатӣ ва ҳизбӣ',
      years: '1899 – 1937',
      excerpt:
        'Солҳои 1929 – 1931 котиби Ҳизби коммунистии ҶШС Тоҷикистон, солҳои 1933 – 1937 Раиси Кумитаи Иҷроияи Марказии ҶШС Тоҷикистон.',
      bio: [
        'Шириншоҳ Шоҳтемур (1899 – 1937) — ходими давлатӣ ва ҳизбӣ. Солҳои 1929 – 1931 котиби Ҳизби коммунистии ҶШС Тоҷикистон, солҳои 1933 – 1937 Раиси Кумитаи Иҷроияи Марказии ҶШС Тоҷикистон.',
      ],
      decree:
        'Бо фармони Президенти Ҷумҳурии Тоҷикистон аз 27 июни соли 2006 ба фарзанди барӯманди халқи тоҷик Шириншоҳ Шоҳтемур унвони олии «Қаҳрамони Тоҷикистон» дода шудааст.',
    },
    ru: {
      name: 'Шириншо Шотемур',
      title: 'Государственный и партийный деятель',
      years: '1899 – 1937',
      excerpt:
        'В 1929 – 1931 годах — секретарь Компартии Таджикской ССР, в 1933 – 1937 годах — Председатель ЦИК Таджикской ССР.',
      bio: [
        'Шириншо Шотемур (1899 – 1937) — государственный и партийный деятель. В 1929 – 1931 годах — секретарь Коммунистической партии Таджикской ССР, в 1933 – 1937 годах — Председатель Центрального Исполнительного Комитета Таджикской ССР.',
      ],
      decree:
        'Указом Президента Республики Таджикистан от 27 июня 2006 года славному сыну таджикского народа Шириншо Шотемуру присвоено высшее звание «Герой Таджикистана».',
    },
    en: {
      name: 'Shirinsho Shotemur',
      title: 'Statesman and party figure',
      years: '1899 – 1937',
      excerpt:
        'In 1929 – 1931 Secretary of the Communist Party of the Tajik SSR; in 1933 – 1937 Chairman of the Central Executive Committee of the Tajik SSR.',
      bio: [
        'Shirinsho Shotemur (1899 – 1937) was a state and party figure. In 1929 – 1931 he served as Secretary of the Communist Party of the Tajik SSR, and in 1933 – 1937 as Chairman of its Central Executive Committee.',
      ],
      decree:
        'By Decree of the President of the Republic of Tajikistan of 27 June 2006, Shirinsho Shotemur was awarded the supreme title “Hero of Tajikistan”.',
    },
  },
];
