import { CourtSiteConfig } from './types';
import { dushanbeConfig } from './dushanbe';
import { sinoConfig } from './sino';
import { buildCourtSites } from './courts';

// One site per district/city court, generated from the public court tree.
// Hand-written configs are spread last so they win on id collisions (sino).
const generatedSites = buildCourtSites();

export const COURT_SITES: Record<string, CourtSiteConfig> = {
  ...generatedSites,
  dushanbe: dushanbeConfig,
  sino: sinoConfig,
};

export const COURT_SITE_IDS: string[] = Object.keys(COURT_SITES);

export const hasCourtSite = (id: string): boolean => Boolean(COURT_SITES[id]);
export const getCourtSite = (id: string): CourtSiteConfig | null => COURT_SITES[id] || null;
// Resolve a working internal site id from a court domain/URL (e.g. 'dushanbe.sud.tj' -> 'dushanbe')
export const courtSiteIdFor = (domain?: string | null): string | null => {
  if (!domain) return null;
  const host = domain
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split('.')[0]
    .toLowerCase();
  return host && hasCourtSite(host) ? host : null;
};

// Static + CMS identifiers of courts that have a working internal site
const COURT_ID_TO_SITE: Record<string, string> = {
  'dushanbe-court': 'dushanbe',
  'sino-court': 'sino',
  '59': 'dushanbe',
  '62': 'sino',
};

// Court names differ slightly between the CMS and the public court tree
// (e.g. "Сомонӣ" vs "Сомони"), so match on a folded form of the name.
const nameKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ӣ/g, 'и')
    .replace(/ӯ/g, 'у')
    .replace(/ҳ/g, 'х')
    .replace(/қ/g, 'к')
    .replace(/ғ/g, 'г');

const COURT_NAME_TO_SITE: Record<string, string> = {
  'Суд города Душанбе': 'dushanbe',
  'Суд района Сино': 'sino',
};
for (const cfg of Object.values(generatedSites)) {
  COURT_NAME_TO_SITE[nameKey(cfg.courtNameRu)] = cfg.id;
  COURT_NAME_TO_SITE[nameKey(cfg.name.ru)] = cfg.id;
}
for (const cfg of [dushanbeConfig, sinoConfig]) {
  COURT_NAME_TO_SITE[nameKey(cfg.courtNameRu)] = cfg.id;
  COURT_NAME_TO_SITE[nameKey(cfg.name.ru)] = cfg.id;
}

export const courtSiteIdForCourt = (court?: {
  id?: string | number | null;
  nameRu?: string | null;
  domain?: string | null;
} | null): string | null => {
  if (!court) return null;
  if (court.id != null) {
    const byId = COURT_ID_TO_SITE[String(court.id)];
    if (byId) return byId;
  }
  if (court.nameRu) {
    const byName = COURT_NAME_TO_SITE[nameKey(court.nameRu)];
    if (byName) return byName;
  }
  return courtSiteIdFor(court.domain);
};
