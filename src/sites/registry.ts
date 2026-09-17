import { CourtSiteConfig } from './types';
import { dushanbeConfig } from './dushanbe';
import { sinoConfig } from './sino';

export const COURT_SITES: Record<string, CourtSiteConfig> = {
  dushanbe: dushanbeConfig,
  sino: sinoConfig,
};

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
const COURT_NAME_TO_SITE: Record<string, string> = {
  'Суд города Душанбе': 'dushanbe',
  'Суд района Сино': 'sino',
};

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
  if (court.nameRu && COURT_NAME_TO_SITE[court.nameRu]) return COURT_NAME_TO_SITE[court.nameRu];
  return courtSiteIdFor(court.domain);
};
