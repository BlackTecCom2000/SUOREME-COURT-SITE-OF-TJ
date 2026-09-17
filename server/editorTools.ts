// Helpers for the content editors: server-side translation (Google gtx, no keys)
// and a template-based "magic" judicial press composer (works fully offline).
export type TriLang = 'tj' | 'ru' | 'en';

const LANG_ALIAS: Record<string, string> = { tj: 'tg', ru: 'ru', en: 'en' };

const splitSentences = (text: string, maxLen = 900): string[] => {
  const parts = String(text || '').split(/(?<=[.!?…\n])\s+/);
  const chunks: string[] = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + ' ' + p).trim().length > maxLen && cur) { chunks.push(cur.trim()); cur = p; }
    else cur = (cur + ' ' + p).trim();
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.length ? chunks : [text];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gtxChunk(text: string, from: string, to: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + encodeURIComponent(from) + '&tl=' + encodeURIComponent(to) + '&dt=t&q=' + encodeURIComponent(text);
  let lastErr = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await sleep(800 * attempt);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (res.ok) {
      const data = await res.json() as any;
      if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('translate bad response');
      return data[0].map((seg: any) => (typeof seg[0] === 'string' ? seg[0] : '')).join('');
    }
    lastErr = 'translate upstream ' + res.status;
    if (res.status !== 429 && res.status !== 503) break;
  }
  throw new Error(lastErr);
}

async function myMemoryChunk(text: string, from: string, to: string): Promise<string> {
  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + encodeURIComponent(from + '|' + to);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  if (!res.ok) throw new Error('mymemory upstream ' + res.status);
  const data = await res.json() as any;
  const t = data?.responseData?.translatedText;
  if (!t || data?.responseStatus !== 200) throw new Error('mymemory: ' + (data?.responseDetails || data?.responseStatus || 'bad response'));
  return t;
}

export async function translateText(text: string, from: string, to: string): Promise<string> {
  const src = LANG_ALIAS[from] || from;
  const dst = LANG_ALIAS[to] || to;
  if (!text || !text.trim()) return '';
  if (src === dst) return text;
  const chunks = splitSentences(text);
  const hasLetters = /[a-zа-яёҷӣӯҳғқ]/i.test(text);
  try {
    const out: string[] = [];
    for (const chunk of chunks) {
      out.push(await gtxChunk(chunk, src, dst));
    }
    const joined = out.join(' ');
    // Google sometimes answers 200 with the input echoed back when throttling
    if (hasLetters && joined.trim() === text.trim()) throw new Error('translate echo - upstream throttled');
    return joined;
  } catch (e) {
    // Fallback provider (MyMemory) when Google throttles server-side requests
    const out: string[] = [];
    for (const chunk of chunks) {
      await sleep(400);
      out.push(await myMemoryChunk(chunk, src, dst));
    }
    return out.join(' ');
  }
}

export function detectLang(text: string): TriLang {
  const s = String(text || '');
  if (/[ҷӣӯҳғқ]/i.test(s)) return 'tj';
  if (/[а-яё]/i.test(s)) return 'ru';
  if (/[a-z]/i.test(s) && !/[а-яёҷӣӯҳғқ]/i.test(s)) return 'en';
  return 'ru';
}

export interface MagicResult {
  title: string;
  excerpt: string;
  body: string;
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const cleanWS = (s: string) => String(s || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

export type MagicMode = 'improve' | 'formal' | 'shorten' | 'expand' | 'rewrite' | 'official';
export type MagicLength = 'short' | 'medium' | 'full';

export interface MagicOptions {
  pubType?: string;
  length?: MagicLength;
  context?: string;
  variant?: number;
}

const firstSentence = (s: string) => {
  const m = String(s || '').match(/^[^.!?…\n]+[.!?…]?/);
  return (m ? m[0] : String(s || '')).trim();
};

const atBoundary = (s: string, max: number) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'), cut.lastIndexOf('\n'));
  return (last > max * 0.4 ? cut.slice(0, last + 1) : cut).trim();
};

// Neutral institutional expansion banks (no invented persons, dates or figures)
const EXPAND_BANK: Record<TriLang, string[]> = {
  tj: [
    'Дар идомаи чорабинӣ иштирокчиён атрофи масъалаҳои рӯзнома табодули афкор намуда, пешниҳодҳои мушаххасро ҷиҳати беҳтар намудани фаъолият иброз доштанд.',
    'Таъкид гардид, ки татбиқи пайгиронаи чораҳои пешбинишуда ба таҳкими қонуният, баланд бардоштани эътимоди шаҳрвандон ба адолати судӣ ва таъмини шаффофияти фаъолият мусоидат хоҳад кард.',
  ],
  ru: [
    'В продолжение мероприятия участники обменялись мнениями по вопросам повестки и высказали конкретные предложения по совершенствованию работы.',
    'Было подчеркнуто, что последовательная реализация намеченных мер будет способствовать укреплению законности, повышению доверия граждан к правосудию и обеспечению открытости деятельности.',
  ],
  en: [
    'During the event, participants exchanged views on the agenda items and put forward concrete proposals for improving the work.',
    'It was emphasized that consistent implementation of the outlined measures will help strengthen the rule of law, increase public trust in justice and ensure transparency.',
  ],
};

const LEADS: Record<TriLang, string[]> = {
  tj: [
    'Чорабинӣ дар фазои тантанавӣ бо иштироки судяҳо ва кормандони дастгоҳи суд баргузор гардид.',
    'Бо иштироки фаъоли судяҳо ва кормандони дастгоҳи суд чорабинии тантанавӣ доир гардид.',
  ],
  ru: [
    'Мероприятие прошло в торжественной обстановке с участием судей и работников аппарата суда.',
    'При активном участии судей и работников аппарата суда состоялось торжественное мероприятие.',
  ],
  en: [
    'The event was held in a solemn atmosphere with the participation of judges and court staff.',
    'With the active participation of judges and court staff, a ceremonial event took place.',
  ],
};

const SYNONYMS: Array<[RegExp, string[]]> = [
  [/\bмероприятие\b/gi, ['событие', 'встреча']],
  [/\bсостоялось\b/gi, ['прошло', 'проведено']],
  [/\bчорабинӣ\b/gi, ['вохӯрӣ', 'маҷлис']],
  [/\bбаргузор гардид\b/gi, ['доир гардид', 'барпо гардид']],
  [/\bevent\b/gi, ['meeting', 'gathering']],
  [/\bheld\b/gi, ['conducted', 'organized']],
];

export function magicTransform(textRaw: string, lang: TriLang, mode: MagicMode, variant = 0): MagicResult {
  const paras = cleanWS(textRaw).split(/\n+/).map((p) => cap(p.replace(/\s+/g, ' '))).filter(Boolean);
  const joined = paras.join(' ');
  const title = firstSentence(joined).replace(/[.!?…]+$/, '').slice(0, 140) || magicGenerate('новость', lang).title;
  if (mode === 'shorten') {
    const short = atBoundary(joined, 400);
    return { title: title.slice(0, 90), excerpt: atBoundary(joined, 220), body: short };
  }
  if (mode === 'expand') {
    const bank = EXPAND_BANK[lang];
    const extra = [bank[variant % bank.length], bank[(variant + 1) % bank.length]];
    const body = [...paras, ...extra].join('\n\n');
    return { title, excerpt: firstSentence(joined).slice(0, 220), body };
  }
  if (mode === 'rewrite') {
    let out = joined;
    SYNONYMS.forEach(([re, alts], i) => {
      out = out.replace(re, alts[(variant + i) % alts.length]);
    });
    const outParas = cleanWS(out).split(/\n+/).filter(Boolean);
    return { title: firstSentence(out).replace(/[.!?…]+$/, '').slice(0, 140), excerpt: firstSentence(out).slice(0, 220), body: outParas.join('\n\n') };
  }
  // formal / official: normalize + elevate register + ensure formal closing
  const formalClose =
    lang === 'tj'
      ? 'Чорабинӣ дар рӯҳияи созанда ва ҳамдигарфаҳмӣ ба анҷом расид.'
      : lang === 'en'
      ? 'The event concluded in a constructive atmosphere of mutual understanding.'
      : 'Мероприятие завершилось в конструктивной атмосфере взаимопонимания.';
  const hasClose = paras.length > 0 && /анҷом расид|завершилось|concluded/i.test(paras[paras.length - 1]);
  const body = [...paras, ...(hasClose || paras.length === 0 ? [] : [formalClose])].join('\n\n');
  const prefix =
    mode === 'official'
      ? lang === 'tj' ? 'Иттилоияи расмӣ. ' : lang === 'en' ? 'Official statement. ' : 'Официальное сообщение. '
      : '';
  return { title: prefix + title, excerpt: prefix + firstSentence(joined).slice(0, 220), body };
}

export function magicGenerate(topicRaw: string, lang: TriLang, opts: MagicOptions = {}): MagicResult {
  const topic = cleanWS(topicRaw).replace(/\s+/g, ' ');
  const T = cap(topic);
  const variant = opts.variant || 0;
  const extraCtx = opts.context && cleanWS(opts.context) ? '\n\n' + cleanWS(opts.context) : '';
  const build = (lead: string, core: string[]): MagicResult => {
    const paras = opts.length === 'short' ? [lead] : opts.length === 'full' ? [lead, ...core, ...EXPAND_BANK[lang]] : [lead, ...core];
    const body = paras.join('\n\n') + extraCtx;
    return { title: T, excerpt: lead, body };
  };
  if (lang === 'tj') {
    return build(T + '. ' + LEADS.tj[variant % LEADS.tj.length], [
      'Дар рафти чорабинӣ масъалаҳои мубрами фаъолияти судӣ, таҳкими қонуният ва ҳифзи ҳуқуқу озодиҳои шаҳрвандон баррасӣ шуданд. Иштирокчиён нақши мақомоти судиро дар таъмини адолати судӣ ва эътимоди ҷомеа ба суд таъкид намуданд.',
      'Роҳбарияти суд зимни суханронӣ қайд намуд, ки фаъолияти минбаъдаи суд ба баланд бардоштани сифати баррасии парвандаҳо, риояи дақиқи меъёрҳои қонунгузорӣ ва таҳкими тартиботи ҳуқуқӣ равона карда мешавад.',
      'Дар фарҷоми чорабинӣ вазифаҳои мушаххас барои давраи оянда муайян гардида, ба масъалаҳои ташкилию амалӣ дастуру супоришҳои дахлдор дода шуданд.',
    ]);
  }
  if (lang === 'en') {
    return build(T + '. ' + LEADS.en[variant % LEADS.en.length], [
      'The meeting addressed pressing issues of judicial activity, strengthening the rule of law and protecting the rights and freedoms of citizens. Participants emphasized the role of the judiciary in ensuring fair justice and public trust in the courts.',
      'The court leadership noted that future work will focus on improving the quality of case consideration, strict compliance with legislation and strengthening legal order.',
      'In conclusion, specific tasks for the upcoming period were set and relevant instructions on organizational and practical matters were given.',
    ]);
  }
  return build(T + '. ' + LEADS.ru[variant % LEADS.ru.length], [
    'В ходе встречи рассмотрены актуальные вопросы судебной деятельности, укрепления законности и защиты прав и свобод граждан. Участники подчеркнули роль судебных органов в обеспечении справедливого правосудия и доверия общества к суду.',
    'Руководство суда отметило, что дальнейшая работа будет направлена на повышение качества рассмотрения дел, точное соблюдение норм законодательства и укрепление правопорядка.',
    'В завершение определены конкретные задачи на предстоящий период, даны соответствующие поручения по организационным и практическим вопросам.',
  ]);
}

export function magicImprove(textRaw: string, lang: TriLang): MagicResult {
  const paras = cleanWS(textRaw).split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const fixed = paras.map((p) => cap(p.replace(/\s+/g, ' ')));
  const first = fixed[0] || '';
  const title = first.replace(/[.!?…]+$/, '').slice(0, 140) || (lang === 'tj' ? 'Хабар' : lang === 'en' ? 'News' : 'Новость');
  const excerpt = first.slice(0, 220);
  const closing =
    lang === 'tj'
      ? 'Чорабинӣ дар рӯҳияи созанда ва ҳамдигарфаҳмӣ ба анҷом расид.'
      : lang === 'en'
      ? 'The event concluded in a constructive atmosphere of mutual understanding.'
      : 'Мероприятие завершилось в конструктивной атмосфере взаимопонимания.';
  const body = (fixed.length < 2 ? [...fixed, closing] : fixed).join('\n\n');
  return { title, excerpt, body };
}
