import { RAW_REGIONAL_CLUSTERS } from '../data/sudTjData';
import { CourtSiteConfig, TriText } from './types';

/**
 * Court sites generated from the public court tree.
 *
 * The Sino court layout is the template; every district ("ноҳия") and city
 * ("шаҳр") court gets the same site with its own identity. Regional courts
 * ("вилоят"), garrison/military courts and the Supreme Court are deliberately
 * excluded, and the two hand-written configs (dushanbe, sino) always win over
 * a generated one with the same id.
 *
 * No officials, phone numbers or addresses are invented here. Missing contact
 * data simply stays empty and the page hides those blocks until the record is
 * filled in the admin (courts / leadership tables).
 */

const REGION_LINE: Record<string, TriText> = {
  dushanbe_rrp: { tj: 'ш. Душанбе', ru: 'г. Душанбе', en: 'Dushanbe' },
  sugd: { tj: 'Вилояти Суғд', ru: 'Согдийская область', en: 'Sughd Region' },
  khatlon: { tj: 'Вилояти Хатлон', ru: 'Хатлонская область', en: 'Khatlon Region' },
  gbao: { tj: 'ВМКБ', ru: 'ГБАО', en: 'GBAO' },
};

const ROMAN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'gh', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
  з: 'z', и: 'i', ӣ: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n',
  о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ӯ: 'u', ф: 'f', х: 'kh',
  ҳ: 'h', ц: 'ts', ч: 'ch', ҷ: 'j', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
};

const romanize = (value: string): string =>
  value
    .toLowerCase()
    .split('')
    .map((ch) => (ch in ROMAN ? ROMAN[ch] : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());

const englishName = (nameTj: string, nameRu: string, type: 'city' | 'district', explicit?: string) => {
  if (explicit) return explicit;
  const district = /^Суди ноҳияи (.+)$/.exec(nameTj);
  if (district) return `${romanize(district[1])} District Court`;
  const city = /^Суди шаҳри (.+)$/.exec(nameTj);
  if (city) return `${romanize(city[1])} City Court`;
  return romanize(nameRu.replace(/^Суд\s+/i, '') + (type === 'city' ? ' City Court' : ' District Court'));
};

const emptyTri: TriText = { tj: '', ru: '', en: '' };

export const buildCourtSites = (): Record<string, CourtSiteConfig> => {
  const sites: Record<string, CourtSiteConfig> = {};

  for (const cluster of RAW_REGIONAL_CLUSTERS) {
    const cityLine = REGION_LINE[cluster.id] ?? {
      tj: cluster.shortNameTj,
      ru: cluster.shortNameRu,
      en: cluster.shortNameEn || cluster.shortNameRu,
    };

    for (const node of cluster.courts) {
      if (node.type !== 'city' && node.type !== 'district') continue;

      const id = node.id.replace(/-court$/, '');
      const en = englishName(node.nameTj, node.nameRu, node.type, node.nameEn);

      const about: TriText =
        node.type === 'city'
          ? {
              tj: `${node.nameTj} парвандаҳои маданӣ, оилавӣ, ҷиноятӣ, ҳуқуқвайронкунии маъмурӣ ва меҳнатиро дар ҳудуди шаҳр баррасӣ менамояд.`,
              ru: `${node.nameRu} рассматривает гражданские, семейные, уголовные дела, дела об административных правонарушениях и трудовые споры на территории города.`,
              en: `${en} hears civil, family, criminal, administrative-offence and labour cases within the city.`,
            }
          : {
              tj: `${node.nameTj} парвандаҳои маданӣ, оилавӣ, ҷиноятӣ, ҳуқуқвайронкунии маъмурӣ ва меҳнатиро дар ҳудуди ноҳия баррасӣ менамояд.`,
              ru: `${node.nameRu} рассматривает гражданские, семейные, уголовные дела, дела об административных правонарушениях и трудовые споры на территории района.`,
              en: `${en} hears civil, family, criminal, administrative-offence and labour cases within the district.`,
            };

      sites[id] = {
        id,
        region: cluster.id,
        courtNameRu: node.nameRu,
        name: { tj: node.nameTj, ru: node.nameRu, en },
        shortName: {
          tj: node.shortNameTj || node.nameTj,
          ru: node.shortNameRu || node.nameRu,
          en: node.shortNameEn || en,
        },
        cityLine,
        about,
        contacts: {
          address:
            node.addressRu || node.addressTj || node.addressEn
              ? {
                  tj: node.addressTj || node.addressRu || '',
                  ru: node.addressRu || node.addressTj || '',
                  en: node.addressEn || node.addressRu || '',
                }
              : emptyTri,
          email: node.email || '',
          phones: node.phone ? [node.phone] : [],
        },
        externalUrl: node.url || '',
        leadership: [],
        receptionSchedule: [],
        receptionNote: {
          tj: 'Ҷадвали қабули шаҳрвандон дар ҳоли аниқкунӣ аст. Муроҷиатҳо тавассути интернет-қабулгоҳ қабул карда мешаванд.',
          ru: 'График приёма граждан уточняется. Обращения принимаются через интернет-приёмную.',
          en: 'The citizen reception schedule is being updated. Appeals are accepted through the online reception desk.',
        },
      };
    }
  }

  return sites;
};
