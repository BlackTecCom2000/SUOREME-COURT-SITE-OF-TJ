export interface TriText {
  tj: string;
  ru: string;
  en: string;
}

export interface CourtLeader {
  name: TriText;
  title: TriText;
}

export interface ReceptionRow {
  name: TriText;
  title: TriText;
  days: TriText;
  time: TriText;
}

export interface CourtContacts {
  address: TriText;
  email: string;
  phones: string[];
}

export interface LegislationLink {
  url: string;
  title: TriText;
}

export interface CourtSiteConfig {
  id: string;
  region: string;
  courtNameRu: string;
  name: TriText;
  shortName: TriText;
  cityLine: TriText;
  about: TriText;
  contacts: CourtContacts;
  externalUrl: string;
  leadership: CourtLeader[];
  receptionSchedule: ReceptionRow[];
  receptionNote: TriText;
}

export type Lang = "tj" | "ru" | "en";

export const pickTri = (t: TriText, lang: string): string => (lang === "en" ? t.en : lang === "tj" ? t.tj : t.ru);
